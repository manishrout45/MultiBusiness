const Business = require('../models/Business');

/** Vendor must have an approved business to access product management and similar features. */
const requireApprovedVendor = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found. Complete vendor registration first.' });
    }
    if (business.status !== 'approved') {
      return res.status(403).json({
        message: 'Vendor approval required before performing this action',
        status: business.status,
        rejectionReason: business.rejection_reason || null,
      });
    }
    req.business = business;
    next();
  } catch (err) {
    next(err);
  }
};

/** Attach business profile when present (any status). */
const attachBusiness = async (req, res, next) => {
  try {
    req.business = await Business.findByOwner(req.user.id);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireApprovedVendor, attachBusiness };
