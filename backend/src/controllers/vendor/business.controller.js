const db = require('../../config/db');
const Business = require('../../models/Business');
const { getUploadedFileUrl } = require('../../middleware/upload');

const pickProfileFields = (body) => {
  const workingHours = body.working_hours ?? body.workingHours;
  return {
    businessName: body.business_name ?? body.businessName,
    businessType: body.business_type ?? body.businessType,
    categoryId: body.category_id ?? body.categoryId ?? null,
    description: body.description ?? null,
    address: body.address,
    city: body.city,
    state: body.state ?? null,
    pincode: body.pincode ?? null,
    phone: body.phone,
    whatsapp: body.whatsapp ?? null,
    email: body.email ?? null,
    website: body.website ?? null,
    gstNumber: body.gst_number ?? body.gstNumber ?? null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    facebookUrl: body.facebook_url ?? body.facebookUrl ?? null,
    instagramUrl: body.instagram_url ?? body.instagramUrl ?? null,
    linkedinUrl: body.linkedin_url ?? body.linkedinUrl ?? null,
    youtubeUrl: body.youtube_url ?? body.youtubeUrl ?? null,
    twitterUrl: body.twitter_url ?? body.twitterUrl ?? null,
    workingHours: workingHours ?? null,
  };
};

/** Prefer Cloudinary URL from upload; fall back to explicit URL in body. */
const resolveUploadPath = (req, bodyKeys = []) => {
  const uploadedUrl = getUploadedFileUrl(req.file);
  if (uploadedUrl) return uploadedUrl;
  for (const key of bodyKeys) {
    if (req.body[key]) return req.body[key];
  }
  return null;
};

const getProfile = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }
    res.json({ data: business });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const fields = pickProfileFields(req.body);
    if (!fields.businessName || !fields.businessType || !fields.address || !fields.city || !fields.phone) {
      return res.status(400).json({ message: 'business_name, business_type, address, city, and phone are required' });
    }

    let business = await Business.findByOwner(req.user.id);
    if (!business) {
      const id = await Business.create({ ...fields, ownerId: req.user.id });
      business = await Business.findById(id);
      return res.status(201).json({ message: 'Business profile created', data: business });
    }

    await Business.update(business.id, fields);
    business = await Business.findById(business.id);
    res.json({ message: 'Business profile updated', data: business });
  } catch (err) {
    next(err);
  }
};

const uploadLogo = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const filePath = resolveUploadPath(req, ['path', 'logo', 'file_path']);
    if (!filePath) {
      return res.status(400).json({ message: 'Logo file or path is required' });
    }

    await db.query('UPDATE businesses SET logo = ? WHERE id = ?', [filePath, business.id]);
    const updated = await Business.findById(business.id);
    res.json({ message: 'Logo updated', data: updated });
  } catch (err) {
    next(err);
  }
};

const uploadCover = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const filePath = resolveUploadPath(req, ['path', 'cover_image', 'coverImage', 'file_path']);
    if (!filePath) {
      return res.status(400).json({ message: 'Cover image file or path is required' });
    }

    await db.query('UPDATE businesses SET cover_image = ? WHERE id = ?', [filePath, business.id]);
    const updated = await Business.findById(business.id);
    res.json({ message: 'Cover image updated', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadLogo,
  uploadCover,
};
