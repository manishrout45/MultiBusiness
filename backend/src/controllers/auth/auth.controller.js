const crypto = require('crypto');
const User = require('../../models/User');
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require('../../utils/auth.utils');
const { sendEmail } = require('../../services/email.service');
const { sendSMS } = require('../../services/sms.service');
const db = require('../../config/db');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safe } = user;
  return safe;
};

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const allowedRole = role === 'vendor' ? 'vendor' : 'customer';

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await hashPassword(password);
    const id = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: allowedRole,
    });

    await db.query('INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0)', [id]);

    const user = await User.findById(id);
    const token = generateToken({ id: user.id, role: user.role, email: user.email });

    await sendEmail({
      to: email,
      subject: 'Welcome to Multi-Business Marketplace',
      text: `Hi ${name}, your account has been created as ${allowedRole}.`,
      html: `<p>Hi ${name},</p><p>Your account has been created as <strong>${allowedRole}</strong>.</p>`,
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, role: user.role, email: user.email });

    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // Stub: accept any code in development
    await db.query('UPDATE users SET email_verified = 1 WHERE email = ?', [email]);
    res.json({ message: 'Email verified', verified: true, codeAccepted: code || 'dev' });
  } catch (err) {
    next(err);
  }
};

const verifyMobile = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone is required' });
    }
    await sendSMS({ to: phone, message: `Your verification code is ${code || '123456'}` });
    await db.query('UPDATE users SET phone_verified = 1 WHERE phone = ?', [phone]);
    res.json({ message: 'Mobile verified', verified: true });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await User.setResetToken(user.id, token, expires);

    await sendEmail({
      to: email,
      subject: 'Password Reset',
      text: `Use this token to reset your password: ${token}`,
      html: `<p>Reset token: <code>${token}</code></p><p>Valid for 1 hour.</p>`,
    });

    res.json({
      message: 'If that email exists, a reset link has been sent',
      ...(process.env.NODE_ENV === 'development' && { resetToken: token }),
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

module.exports = {
  register,
  login,
  verifyEmail,
  verifyMobile,
  forgotPassword,
  resetPassword,
  getProfile,
};
