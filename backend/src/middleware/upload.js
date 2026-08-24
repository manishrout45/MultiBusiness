const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const config = require('../config/constants');
const { configureCloudinary } = require('../config/cloudinary');
const { assertDigitalOceanConfigured } = require('../config/digitalocean');

/**
 * Resolve public URL from multer file object after cloud upload.
 * Cloudinary (multer-storage-cloudinary): file.path is the secure HTTPS URL.
 */
function getUploadedFileUrl(file) {
  if (!file) return null;
  return file.path || file.secure_url || file.location || file.url || null;
}

function createCloudinaryStorage() {
  const cloudinary = configureCloudinary();

  return new CloudinaryStorage({
    cloudinary,
    params: async (req) => {
      const folder = req.uploadFolder || 'products';
      return {
        folder: `marketplace/${folder}`,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm'],
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      };
    },
  });
}

/**
 * DigitalOcean Spaces — switch with STORAGE_PROVIDER=digitalocean after deploy.
 * Install then wire: npm install @aws-sdk/client-s3 multer-s3
 */
function createDigitalOceanStorage() {
  assertDigitalOceanConfigured();
  throw new Error(
    'STORAGE_PROVIDER=digitalocean is reserved for post-deploy. ' +
      'Install @aws-sdk/client-s3 and multer-s3, then implement Spaces storage in middleware/upload.js.'
  );
}

function createStorage() {
  const provider = (process.env.STORAGE_PROVIDER || 'cloudinary').toLowerCase();

  if (provider === 'digitalocean' || provider === 'do' || provider === 'spaces') {
    return createDigitalOceanStorage();
  }

  if (provider === 'cloudinary') {
    return createCloudinaryStorage();
  }

  throw new Error(
    `Unsupported STORAGE_PROVIDER="${provider}". Use "cloudinary" (now) or "digitalocean" (after deploy).`
  );
}

let multerUpload;

function getMulterUpload() {
  if (!multerUpload) {
    multerUpload = multer({
      storage: createStorage(),
      limits: { fileSize: config.maxFileSize },
      fileFilter: (_req, file, cb) => {
        const allowed = /^(image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm))$/i;
        if (allowed.test(file.mimetype)) {
          cb(null, true);
          return;
        }
        cb(new Error('Only image and video uploads are allowed'));
      },
    });
  }
  return multerUpload;
}

/** Drop-in multer API used by routes (lazy-inits Cloudinary / DO storage). */
const upload = {
  single: (field) => (req, res, next) => getMulterUpload().single(field)(req, res, next),
  array: (field, maxCount) => (req, res, next) =>
    getMulterUpload().array(field, maxCount)(req, res, next),
  fields: (fields) => (req, res, next) => getMulterUpload().fields(fields)(req, res, next),
};

module.exports = { upload, getUploadedFileUrl };
