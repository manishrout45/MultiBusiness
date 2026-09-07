const nodemailer = require('nodemailer');

let transporterPromise = null;

function getEmailProvider() {
  const explicit = String(process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
  if (explicit) return explicit;
  if (process.env.RESEND_API_KEY && String(process.env.RESEND_API_KEY).trim()) {
    return 'resend';
  }
  return 'smtp';
}

function isEmailConfigured() {
  const provider = getEmailProvider();
  if (provider === 'resend') {
    return Boolean(String(process.env.RESEND_API_KEY || '').trim());
  }
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD
  );
}

async function getTransporter() {
  if (!isEmailConfigured() || getEmailProvider() === 'resend') return null;
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_PORT || '587') === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporterPromise;
}

async function sendViaResend({ to, subject, text, html, from }) {
  const { Resend } = require('resend');
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text: text || undefined,
    html: html || undefined,
  });
  if (error) {
    const message = error.message || JSON.stringify(error);
    throw new Error(`Resend error: ${message}`);
  }
  return data;
}

const sendEmail = async ({ to, subject, text, html }) => {
  const from =
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    'LocalMart <onboarding@resend.dev>';

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[email:dev] to=${to} subject=${subject}`);
      if (text) console.log(`[email:dev] ${text.slice(0, 240)}`);
    }
    return { accepted: true, to, subject, via: 'console' };
  }

  const provider = getEmailProvider();

  if (provider === 'resend') {
    const data = await sendViaResend({ to, subject, text, html, from });
    return {
      accepted: true,
      to,
      subject,
      via: 'resend',
      messageId: data?.id || null,
    };
  }

  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  });

  return {
    accepted: true,
    to,
    subject,
    via: 'smtp',
    messageId: info.messageId,
  };
};

module.exports = { sendEmail, isEmailConfigured, getEmailProvider };
