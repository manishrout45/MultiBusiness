const db = require('../config/db');
const config = require('../config/constants');

const calculateCommission = (orderAmount, rate = config.defaultCommissionRate) => {
  const commission = (Number(orderAmount) * Number(rate)) / 100;
  return {
    orderAmount: Number(orderAmount),
    rate: Number(rate),
    commissionAmount: Math.round(commission * 100) / 100,
    vendorAmount: Math.round((orderAmount - commission) * 100) / 100,
  };
};

/**
 * Resolve commission rate: business override → category → global → env default.
 */
const resolveCommissionRate = async (businessId) => {
  const [businessRows] = await db.query(
    'SELECT id, category_id FROM businesses WHERE id = ? LIMIT 1',
    [businessId]
  );
  const business = businessRows[0];
  if (!business) {
    return config.defaultCommissionRate;
  }

  const [businessRate] = await db.query(
    `SELECT rate FROM commission_settings
     WHERE business_id = ?
     ORDER BY id DESC LIMIT 1`,
    [business.id]
  );
  if (businessRate[0]) {
    return Number(businessRate[0].rate);
  }

  if (business.category_id) {
    const [categoryRate] = await db.query(
      `SELECT rate FROM commission_settings
       WHERE category_id = ? AND business_id IS NULL
       ORDER BY id DESC LIMIT 1`,
      [business.category_id]
    );
    if (categoryRate[0]) {
      return Number(categoryRate[0].rate);
    }
  }

  const [globalRate] = await db.query(
    `SELECT rate FROM commission_settings
     WHERE category_id IS NULL AND business_id IS NULL
     ORDER BY id DESC LIMIT 1`
  );
  if (globalRate[0]) {
    return Number(globalRate[0].rate);
  }

  return config.defaultCommissionRate;
};

const calculateCommissionForBusiness = async (orderAmount, businessId) => {
  const rate = await resolveCommissionRate(businessId);
  return calculateCommission(orderAmount, rate);
};

module.exports = {
  calculateCommission,
  resolveCommissionRate,
  calculateCommissionForBusiness,
};
