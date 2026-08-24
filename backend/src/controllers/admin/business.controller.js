const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');
const { setFeatured, setVerifiedBadge } = require('../../services/monetization.service');
const { logVendorApproval } = require('../../services/vendorApproval.service');

const listPending = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.name AS owner_name, u.email AS owner_email, c.name AS category_name
       FROM businesses b
       JOIN users u ON u.id = b.owner_id
       LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.status IN ('pending', 'recommended')
       ORDER BY b.created_at ASC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const listVendors = async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT b.*, u.name AS owner_name, u.email AS owner_email, c.name AS category_name
      FROM businesses b
      JOIN users u ON u.id = b.owner_id
      LEFT JOIN categories c ON c.id = b.category_id
      WHERE 1=1`;
    const params = [];
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY b.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getVendorDetails = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone,
              c.name AS category_name
       FROM businesses b
       JOIN users u ON u.id = b.owner_id
       LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.id = ?`,
      [req.params.id]
    );
    const business = rows[0];
    if (!business) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    const [approvals] = await db.query(
      `SELECT va.*, u.name AS action_by_name
       FROM vendor_approvals va
       LEFT JOIN users u ON u.id = va.action_by
       WHERE va.business_id = ?
       ORDER BY va.created_at DESC`,
      [business.id]
    );
    res.json({ data: { ...business, approvalHistory: approvals } });
  } catch (err) {
    next(err);
  }
};

const updateVendorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body.status;
    const rejectionReason = req.body.rejection_reason || req.body.reason || null;

    const allowed = ['pending', 'recommended', 'approved', 'rejected', 'suspended'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const [rows] = await db.query('SELECT * FROM businesses WHERE id = ?', [id]);
    const business = rows[0];
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const previousStatus = business.status;

    if (status === 'approved') {
      await db.query(
        `UPDATE businesses
         SET status = 'approved', approved_by = ?, rejection_reason = NULL
         WHERE id = ?`,
        [req.user.id, id]
      );
      await createNotification({
        userId: business.owner_id,
        title: 'Business approved',
        message: `${business.business_name} is now live on the marketplace.`,
        type: 'business',
        link: '/vendor/dashboard',
      });
    } else if (status === 'rejected') {
      await db.query(
        `UPDATE businesses SET status = 'rejected', rejection_reason = ? WHERE id = ?`,
        [rejectionReason, id]
      );
      await createNotification({
        userId: business.owner_id,
        title: 'Business rejected',
        message: rejectionReason || 'Your business registration was rejected.',
        type: 'business',
        link: '/vendor/profile',
      });
    } else {
      await db.query('UPDATE businesses SET status = ? WHERE id = ?', [status, id]);
    }

    await logVendorApproval({
      businessId: id,
      previousStatus,
      newStatus: status,
      actionBy: req.user.id,
      reason: rejectionReason,
    });

    try {
      await db.query(
        `UPDATE vendor_applications SET status = ?, rejection_reason = ? WHERE business_id = ?`,
        [status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending', rejectionReason, id]
      );
    } catch {
      // optional table
    }

    const [updated] = await db.query('SELECT * FROM businesses WHERE id = ?', [id]);
    res.json({ message: `Vendor status updated to ${status}`, data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const approveBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM businesses WHERE id = ?', [id]);
    const business = rows[0];
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    await db.query(
      `UPDATE businesses
       SET status = 'approved', approved_by = ?, rejection_reason = NULL
       WHERE id = ?`,
      [req.user.id, id]
    );
    await logVendorApproval({
      businessId: id,
      previousStatus: business.status,
      newStatus: 'approved',
      actionBy: req.user.id,
    });
    await createNotification({
      userId: business.owner_id,
      title: 'Business approved',
      message: `${business.business_name} is now live on the marketplace.`,
      type: 'business',
      link: '/vendor/profile',
    });
    const [updated] = await db.query('SELECT * FROM businesses WHERE id = ?', [id]);
    res.json({ message: 'Business approved', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const rejectBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rejectionReason = req.body.rejection_reason || req.body.reason || null;
    const [rows] = await db.query('SELECT * FROM businesses WHERE id = ?', [id]);
    const business = rows[0];
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    await db.query(
      `UPDATE businesses
       SET status = 'rejected', rejection_reason = ?
       WHERE id = ?`,
      [rejectionReason, id]
    );
    await logVendorApproval({
      businessId: id,
      previousStatus: business.status,
      newStatus: 'rejected',
      actionBy: req.user.id,
      reason: rejectionReason,
    });
    await createNotification({
      userId: business.owner_id,
      title: 'Business rejected',
      message: rejectionReason || 'Your business registration was rejected.',
      type: 'business',
      link: '/vendor/profile',
    });
    const [updated] = await db.query('SELECT * FROM businesses WHERE id = ?', [id]);
    res.json({ message: 'Business rejected', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const featureBusiness = async (req, res, next) => {
  try {
    const isFeatured = req.body.isFeatured !== false;
    await setFeatured(req.params.id, isFeatured);
    res.json({ message: isFeatured ? 'Business featured' : 'Featured removed' });
  } catch (err) {
    next(err);
  }
};

const verifyBusiness = async (req, res, next) => {
  try {
    const isVerified = req.body.isVerified !== false;
    await setVerifiedBadge(req.params.id, isVerified);
    res.json({ message: isVerified ? 'Verification badge granted' : 'Verification removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPending,
  listVendors,
  getVendorDetails,
  updateVendorStatus,
  approveBusiness,
  rejectBusiness,
  featureBusiness,
  verifyBusiness,
};
