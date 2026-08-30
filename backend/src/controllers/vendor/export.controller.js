const db = require('../../config/db');
const Business = require('../../models/Business');
const { calculateCommission } = require('../../services/commission.service');
const { toCsv } = require('../../utils/invoice');

const exportCustomers = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT
         u.id AS customer_id,
         u.name,
         u.email,
         u.phone,
         COUNT(o.id) AS order_count,
         COALESCE(SUM(o.total_amount), 0) AS total_spent,
         MAX(o.created_at) AS last_order_at
       FROM orders o
       JOIN users u ON u.id = o.customer_id
       WHERE o.business_id = ?
       GROUP BY u.id, u.name, u.email, u.phone
       ORDER BY total_spent DESC`,
      [business.id]
    );

    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      return res.send(toCsv(rows));
    }

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const exportSales = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT
         o.id,
         o.order_number,
         o.customer_id,
         u.name AS customer_name,
         u.email AS customer_email,
         o.total_amount,
         o.commission_amount,
         o.payment_method,
         o.payment_status,
         o.order_status,
         o.created_at
       FROM orders o
       JOIN users u ON u.id = o.customer_id
       WHERE o.business_id = ?
       ORDER BY o.created_at DESC`,
      [business.id]
    );

    const data = rows.map((row) => {
      const breakdown = calculateCommission(row.total_amount);
      return {
        ...row,
        vendor_amount: breakdown.vendorAmount,
      };
    });

    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sales.csv');
      return res.send(toCsv(data));
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  exportCustomers,
  exportSales,
};
