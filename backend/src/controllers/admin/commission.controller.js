const db = require('../../config/db');

const listCommissions = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT cs.*, c.name AS category_name, b.business_name
       FROM commission_settings cs
       LEFT JOIN categories c ON c.id = cs.category_id
       LEFT JOIN businesses b ON b.id = cs.business_id
       ORDER BY cs.id ASC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const updateCommission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rate } = req.body;
    const [rows] = await db.query(
      'SELECT * FROM commission_settings WHERE id = ?',
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Commission setting not found' });
    }
    await db.query('UPDATE commission_settings SET rate = ? WHERE id = ?', [
      rate,
      id,
    ]);
    const [updated] = await db.query(
      'SELECT * FROM commission_settings WHERE id = ?',
      [id]
    );
    res.json({ message: 'Commission updated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCommissions,
  updateCommission,
};
