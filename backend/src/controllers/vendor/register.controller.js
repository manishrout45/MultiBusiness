const db = require('../../config/db');
const User = require('../../models/User');
const Business = require('../../models/Business');
const { hashPassword, generateToken } = require('../../utils/auth.utils');
const { logVendorApproval } = require('../../services/vendorApproval.service');
const { getUploadedFileUrl } = require('../../middleware/upload');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safe } = user;
  return safe;
};

const pickRegistrationFields = (body) => ({
  businessName: body.business_name ?? body.businessName,
  ownerName: body.owner_name ?? body.ownerName ?? body.name,
  businessType: body.business_type ?? body.businessType ?? body.category,
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
});

const register = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const fields = pickRegistrationFields(req.body);
    const {
      name,
      email,
      phone: userPhone,
      password,
    } = req.body;

    if (!fields.businessName || !fields.businessType || !fields.address || !fields.city || !fields.phone) {
      return res.status(400).json({
        message: 'business_name, business_type, address, city, and phone are required',
      });
    }

    await connection.beginTransaction();

    let ownerId = req.user?.id;
    let token = null;
    let user = null;

    if (!ownerId) {
      if (!name || !email || !password) {
        await connection.rollback();
        return res.status(400).json({ message: 'name, email, and password are required for new accounts' });
      }

      const existing = await User.findByEmail(email);
      if (existing) {
        await connection.rollback();
        return res.status(409).json({ message: 'Email already registered. Sign in and submit your business application.' });
      }

      const hashed = await hashPassword(password);
      const [userResult] = await connection.query(
        `INSERT INTO users (name, email, phone, password, role, status)
         VALUES (?, ?, ?, ?, 'vendor', 'active')`,
        [name, email, userPhone || fields.phone, hashed]
      );
      ownerId = userResult.insertId;
      await connection.query('INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0)', [ownerId]);
      user = await User.findById(ownerId);
      token = generateToken({ id: user.id, role: user.role, email: user.email });
    } else if (req.user.role === 'super_admin' || req.user.role === 'business_manager') {
      await connection.rollback();
      return res.status(403).json({ message: 'Admin accounts cannot register as vendors' });
    } else {
      if (req.user.role === 'customer') {
        await connection.query(`UPDATE users SET role = 'vendor' WHERE id = ?`, [ownerId]);
      }
      user = await User.findById(ownerId);
      token = generateToken({ id: user.id, role: user.role, email: user.email });
    }

    const [existingBusiness] = await connection.query(
      'SELECT * FROM businesses WHERE owner_id = ?',
      [ownerId]
    );
    if (existingBusiness[0]) {
      await connection.rollback();
      return res.status(409).json({
        message: 'Business registration already submitted',
        data: existingBusiness[0],
      });
    }

    const logo = getUploadedFileUrl(req.files?.logo?.[0]) || req.body.logo || null;
    const cover = getUploadedFileUrl(req.files?.cover?.[0])
      || getUploadedFileUrl(req.files?.cover_image?.[0])
      || req.body.cover_image
      || req.body.coverImage
      || null;

    const slug = fields.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const [bizResult] = await connection.query(
      `INSERT INTO businesses
       (owner_id, business_name, business_type, category_id, description, logo, cover_image,
        address, city, state, pincode, phone, whatsapp, email, website, gst_number, slug, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        ownerId,
        fields.businessName,
        fields.businessType,
        fields.categoryId,
        fields.description,
        logo,
        cover,
        fields.address,
        fields.city,
        fields.state,
        fields.pincode,
        fields.phone,
        fields.whatsapp,
        fields.email || email || user?.email || null,
        fields.website,
        fields.gstNumber,
        slug,
      ]
    );

    const businessId = bizResult.insertId;

    await connection.commit();

    try {
      await db.query(
        `INSERT INTO vendor_applications
         (user_id, business_id, owner_name, business_name, email, phone, category, description,
          address, city, state, pincode, gst_number, logo, cover_image, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          ownerId,
          businessId,
          fields.ownerName || user?.name || fields.businessName,
          fields.businessName,
          fields.email || email || user?.email,
          fields.phone,
          fields.businessType,
          fields.description,
          fields.address,
          fields.city,
          fields.state,
          fields.pincode,
          fields.gstNumber,
          logo,
          cover,
        ]
      );
    } catch {
      // vendor_applications table may not exist until migration 002 is applied
    }

    await logVendorApproval({
      businessId,
      previousStatus: null,
      newStatus: 'pending',
      actionBy: ownerId,
      reason: 'Initial vendor registration',
    });

    const business = await Business.findById(businessId);

    res.status(201).json({
      message: 'Your business registration is under review.',
      token,
      user: sanitizeUser(user),
      data: business,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

module.exports = { register };
