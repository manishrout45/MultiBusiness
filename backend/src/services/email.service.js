// Email service — stub (logs in development; wire SMTP later)
const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[email] to=${to} subject=${subject}`);
  }
  return { accepted: true, to, subject, text, html };
};

module.exports = { sendEmail };
