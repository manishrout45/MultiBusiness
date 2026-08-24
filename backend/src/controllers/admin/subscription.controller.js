const db = require('../../config/db');

const listPlans = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM subscription_plans ORDER BY monthly_fee ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      monthly_fee: monthlyFee,
      yearly_fee: yearlyFee,
      features,
      max_products: maxProducts,
      is_active: isActive,
    } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM subscription_plans WHERE id = ?',
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    const featuresValue =
      features === undefined
        ? null
        : typeof features === 'string'
          ? features
          : JSON.stringify(features);

    await db.query(
      `UPDATE subscription_plans SET
         name = COALESCE(?, name),
         monthly_fee = COALESCE(?, monthly_fee),
         yearly_fee = COALESCE(?, yearly_fee),
         features = COALESCE(?, features),
         max_products = COALESCE(?, max_products),
         is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name || null,
        monthlyFee !== undefined ? monthlyFee : null,
        yearlyFee !== undefined ? yearlyFee : null,
        featuresValue,
        maxProducts !== undefined ? maxProducts : null,
        isActive !== undefined ? isActive : null,
        id,
      ]
    );

    const [updated] = await db.query(
      'SELECT * FROM subscription_plans WHERE id = ?',
      [id]
    );
    res.json({ message: 'Plan updated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPlans,
  updatePlan,
};
