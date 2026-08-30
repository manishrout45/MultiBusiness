// Commission calculation helpers
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

module.exports = { calculateCommission };
