/**
 * DigitalOcean Spaces (S3-compatible) — use after deploy.
 * Set STORAGE_PROVIDER=digitalocean and fill DO_SPACES_* env vars.
 *
 * Recommended packages when enabling:
 *   npm install @aws-sdk/client-s3 multer-s3
 */
function getDigitalOceanSpacesConfig() {
  return {
    endpoint: process.env.DO_SPACES_ENDPOINT || '',
    region: process.env.DO_SPACES_REGION || 'nyc3',
    bucket: process.env.DO_SPACES_BUCKET || '',
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
    cdnUrl: process.env.DO_SPACES_CDN_URL || '',
  };
}

function assertDigitalOceanConfigured() {
  const cfg = getDigitalOceanSpacesConfig();
  if (!cfg.endpoint || !cfg.bucket || !cfg.accessKeyId || !cfg.secretAccessKey) {
    throw new Error(
      'DigitalOcean Spaces is not configured. Set DO_SPACES_ENDPOINT, DO_SPACES_BUCKET, DO_SPACES_KEY, and DO_SPACES_SECRET.'
    );
  }
  return cfg;
}

module.exports = {
  getDigitalOceanSpacesConfig,
  assertDigitalOceanConfigured,
};
