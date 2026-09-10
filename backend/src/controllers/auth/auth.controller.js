const crypto = require('crypto');
const User = require('../../models/User');
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require('../../utils/auth.utils');
const { sendEmail, isEmailConfigured } = require('../../services/email.service');
const { sendSMS } = require('../../services/sms.service');
const { saveOtp, consumeOtp } = require('../../services/otp.service');
const {
  createOrRefreshSession,
  listActive,
  revokeBySessionId,
  revokeSessionRow,
  MAX_DEVICES,
} = require('../../services/session.service');
const db = require('../../config/db');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safe } = user;
  return safe;
};

const parseForce = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
  return false;
};

const clientMeta = (req) => {
  const ua = req.headers['user-agent'] || '';
  const ip = req.ip || req.headers['x-forwarded-for'] || null;
  let deviceId = req.body.deviceId || req.headers['x-device-id'];
  if (!deviceId) {
    // Postman / API tools: treat UA+IP as a stable device fingerprint
    deviceId = `api-${require('crypto')
      .createHash('sha256')
      .update(`${ua}|${ip || ''}`)
      .digest('hex')
      .slice(0, 24)}`;
  }
  return {
    deviceId,
    deviceLabel: req.body.deviceLabel || req.headers['x-device-label'] || 'API client',
    userAgent: ua || null,
    ip,
    force: parseForce(req.body.force),
  };
};

const issueAuth = async (req, res, user, message = 'Login successful') => {
  const meta = clientMeta(req);
  let session;
  try {
    session = await createOrRefreshSession({
      userId: user.id,
      deviceId: meta.deviceId,
      deviceLabel: meta.deviceLabel,
      userAgent: meta.userAgent,
      ip: meta.ip,
      force: meta.force,
    });
  } catch (err) {
    if (err.code === 'DEVICE_LIMIT') {
      return res.status(403).json({
        message: err.message,
        code: err.code,
        devices: err.devices,
        maxDevices: MAX_DEVICES(),
      });
    }
    throw err;
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    email: user.email,
    sid: session.sessionId,
  });

  return res.json({
    message: session.replacedOldest
      ? `${message} Oldest device session was signed out.`
      : message,
    token,
    user: sanitizeUser(user),
    session: {
      replacedOldest: session.replacedOldest,
      maxDevices: MAX_DEVICES(),
    },
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const allowedRole = role === 'vendor' ? 'vendor' : 'customer';
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const existing = await User.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        message: 'Email already registered. Sign in or reset your password.',
        code: 'EMAIL_EXISTS',
      });
    }

    const hashed = await hashPassword(password);
    const id = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashed,
      role: allowedRole,
    });

    await db.query('INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0)', [id]);
    await db.query('UPDATE users SET email_verified = 0 WHERE id = ?', [id]);

    const user = await User.findById(id);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await saveOtp({
      channel: 'email',
      destination: normalizedEmail,
      code,
      purpose: 'verify_email',
    });

    await sendEmail({
      to: normalizedEmail,
      subject: 'Verify your LocalMart email',
      text: `Hi ${name}, your verification code is ${code}. Valid for 5 minutes.`,
      html: `<p>Hi ${name},</p><p>Your verification code is <strong>${code}</strong>.</p><p>Valid for 5 minutes. You must verify before signing in.</p>`,
    });

    res.status(201).json({
      message:
        'Account created. Verify your email with the code we sent, then sign in.',
      user: sanitizeUser(user),
      needsEmailVerification: true,
      ...(!isEmailConfigured() ? { devOtp: code } : {}),
    });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Email already registered. Sign in or reset your password.',
        code: 'EMAIL_EXISTS',
      });
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Create an account first, then sign in.',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is not active. Contact support.',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({
        message: 'Incorrect password. Try again or reset your password.',
        code: 'INVALID_PASSWORD',
      });
    }

    const emailVerified =
      user.email_verified === 1 ||
      user.email_verified === true ||
      user.email_verified === '1';
    if (!emailVerified) {
      return res.status(403).json({
        message:
          'Email not verified. Enter the verification code sent to your email before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    return issueAuth(req, res, user, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(501).json({ message: 'Google sign-in is not configured' });
    }
    if (!idToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(verifyUrl);
    const payload = await response.json();

    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!response.ok || !audiences.includes(clientId) || !payload.email) {
      return res.status(401).json({
        message: payload.error_description || payload.error || 'Invalid Google sign-in',
      });
    }

    const verified = payload.email_verified === true || payload.email_verified === 'true';
    if (!verified) {
      return res.status(401).json({ message: 'Google email is not verified' });
    }

    let user = await User.findByEmail(payload.email);
    const picture = typeof payload.picture === 'string' ? payload.picture.slice(0, 500) : null;

    if (!user) {
      const hashed = await hashPassword(crypto.randomBytes(32).toString('hex'));
      const id = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        password: hashed,
        role: 'customer',
      });
      await db.query('UPDATE users SET email_verified = 1 WHERE id = ?', [id]);
      if (picture) {
        try {
          await User.updateProfile(id, { avatar: picture });
        } catch (_) {
          /* avatar column optional / length mismatch should not block login */
        }
      }
      await db.query('INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0)', [id]);
      user = await User.findById(id);
    } else if (picture || payload.name) {
      try {
        await User.updateProfile(user.id, {
          name: payload.name || user.name,
          avatar: picture || undefined,
        });
        await db.query('UPDATE users SET email_verified = 1 WHERE id = ?', [user.id]);
        user = await User.findById(user.id);
      } catch (_) {
        /* keep existing user if profile update fails */
      }
    } else {
      await db.query('UPDATE users SET email_verified = 1 WHERE id = ?', [user.id]);
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    return issueAuth(req, res, user, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }
    const result = await consumeOtp({
      channel: 'email',
      destination: email,
      code,
      purpose: 'verify_email',
    });
    if (!result.ok) {
      return res.status(401).json({
        message:
          result.reason === 'expired'
            ? 'Verification code expired'
            : 'Invalid verification code',
      });
    }
    await db.query('UPDATE users SET email_verified = 1 WHERE email = ?', [email]);
    res.json({ message: 'Email verified', verified: true });
  } catch (err) {
    next(err);
  }
};

const sendEmailOtp = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await saveOtp({
      channel: 'email',
      destination: email,
      code,
      purpose: 'verify_email',
    });
    await sendEmail({
      to: email,
      subject: 'Your LocalMart verification code',
      text: `Your verification code is ${code}. Valid for 5 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>Valid for 5 minutes.</p>`,
    });
    res.json({
      message: 'Verification code sent',
      ...(!isEmailConfigured() ? { devOtp: code } : {}),
    });
  } catch (err) {
    next(err);
  }
};

const verifyMobile = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || '').trim();
    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone and code are required' });
    }
    const result = await consumeOtp({
      channel: 'phone',
      destination: phone,
      code,
      purpose: 'verify_mobile',
    });
    if (!result.ok) {
      return res.status(401).json({
        message: result.reason === 'expired' ? 'OTP expired' : 'Invalid OTP',
      });
    }
    await db.query('UPDATE users SET phone_verified = 1 WHERE phone = ?', [phone]);
    res.json({ message: 'Mobile verified', verified: true });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Create an account first.',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    const emailVerified =
      user.email_verified === 1 ||
      user.email_verified === true ||
      user.email_verified === '1';
    if (!emailVerified) {
      return res.status(403).json({
        message: 'Verify your email first, then you can reset your password.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await User.setResetToken(user.id, token, expires);

    const frontend = String(process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
    const resetUrl = `${frontend}/reset-password?token=${encodeURIComponent(token)}`;
    const emailConfigured = require('../../services/email.service').isEmailConfigured();

    await sendEmail({
      to: email,
      subject: 'Reset your LocalMart password',
      text: `Reset your password: ${resetUrl}\nThis link is valid for 1 hour.`,
      html: `<p>Reset your LocalMart password using this link (valid 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({
      message: 'Password reset link sent to your email.',
      ...(!emailConfigured ? { resetUrl } : {}),
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashed = await hashPassword(password);
    await User.updatePassword(user.id, hashed);
    await User.clearResetToken(user.id);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user?.sid) {
      await revokeBySessionId(req.user.sid);
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

const listSessions = async (req, res, next) => {
  try {
    const sessions = await listActive(req.user.id);
    res.json({
      data: sessions.map((s) => ({
        id: s.id,
        deviceId: s.device_id,
        deviceLabel: s.device_label,
        userAgent: s.user_agent,
        lastSeenAt: s.last_seen_at,
        createdAt: s.created_at,
        current: s.session_id === req.user.sid,
      })),
      maxDevices: MAX_DEVICES(),
    });
  } catch (err) {
    next(err);
  }
};

const revokeSession = async (req, res, next) => {
  try {
    const sessionPk = Number(req.params.id);
    const sessions = await listActive(req.user.id);
    const target = sessions.find((s) => Number(s.id) === sessionPk);
    if (!target) {
      return res.status(404).json({ message: 'Session not found' });
    }
    await revokeSessionRow(target.id);
    res.json({ message: 'Device signed out' });
  } catch (err) {
    next(err);
  }
};

/** Normalize India-friendly phones to +91XXXXXXXXXX */
const normalizePhone = (raw) => {
  const cleaned = String(raw || '').trim();
  if (!cleaned) return '';
  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return '';
  // 10-digit local mobile
  if (digits.length === 10) return `+91${digits}`;
  // 91XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  // 0XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (cleaned.startsWith('+') && digits.length >= 10) return `+${digits}`;
  return `+${digits}`;
};

const sendPhoneOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }

    const purpose = req.body.purpose === 'verify_mobile' ? 'verify_mobile' : 'login';
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await saveOtp({ channel: 'phone', destination: phone, code, purpose });

    await sendSMS({
      to: phone,
      message: `Your LocalMart code is ${code}. Valid for 5 minutes.`,
    });

    const smsConfigured = Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY);
    res.json({
      message: 'OTP sent',
      phone,
      expiresIn: 300,
      ...(smsConfigured ? {} : { devOtp: code }),
    });
  } catch (err) {
    next(err);
  }
};

const verifyPhoneOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || req.body.otp || '')
      .replace(/\s+/g, '')
      .trim();
    if (!phone || !code) {
      return res.status(400).json({
        message: 'Phone and OTP are required (send JSON: { "phone", "code" })',
      });
    }

    const result = await consumeOtp({
      channel: 'phone',
      destination: phone,
      code,
      purpose: 'login',
    });
    if (!result.ok) {
      return res.status(401).json({
        message:
          result.reason === 'expired'
            ? 'OTP expired. Request a new code.'
            : 'Invalid OTP',
      });
    }

    let user = await User.findByPhone(phone);
    if (!user) {
      const email = `phone_${phone.replace(/\D/g, '')}@localmart.otp`;
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        user = existingEmail;
      } else {
        const hashed = await hashPassword(crypto.randomBytes(32).toString('hex'));
        const id = await User.create({
          name: `User ${phone.slice(-4)}`,
          email,
          phone,
          password: hashed,
          role: 'customer',
        });
        await db.query('UPDATE users SET phone_verified = 1 WHERE id = ?', [id]);
        await db.query('INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0)', [id]);
        user = await User.findById(id);
      }
    } else {
      await db.query('UPDATE users SET phone_verified = 1 WHERE id = ?', [user.id]);
      user = await User.findById(user.id);
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    return issueAuth(req, res, user, 'Login successful');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  verifyEmail,
  sendEmailOtp,
  verifyMobile,
  sendPhoneOtp,
  verifyPhoneOtp,
  forgotPassword,
  resetPassword,
  getProfile,
  logout,
  listSessions,
  revokeSession,
};
