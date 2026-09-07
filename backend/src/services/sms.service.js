// SMS service — logs in development; posts to SMS_API_URL when configured
const sendSMS = async ({ to, message }) => {
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const sender = process.env.SMS_SENDER_ID || 'LOCALMART';

  if (apiUrl && apiKey) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ to, message, sender }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'SMS gateway failed');
    }
    return { accepted: true, to, via: 'api' };
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[sms] to=${to} message=${message}`);
  }
  return { accepted: true, to, via: 'console', message };
};

module.exports = { sendSMS };
