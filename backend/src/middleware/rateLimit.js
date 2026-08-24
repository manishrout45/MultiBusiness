const rateLimitMap = new Map();

const rateLimit = ({ windowMs = 60_000, max = 100 } = {}) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count += 1;
  rateLimitMap.set(key, entry);

  if (entry.count > max) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  next();
};

module.exports = { rateLimit };
