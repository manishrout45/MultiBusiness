// SMS service — stub (logs in development; wire gateway later)
const sendSMS = async ({ to, message }) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[sms] to=${to} message=${message}`);
  }
  return { accepted: true, to, message };
};

module.exports = { sendSMS };
