const db = require('../../config/db');
const User = require('../../models/User');
const { hashPassword } = require('../../utils/auth.utils');

const listManagers = async (req, res, next) => {
  try {
    const managers = await User.list({ role: 'business_manager' });
    const [assignments] = await db.query(
      `SELECT ma.*, c.name AS category_name
       FROM manager_assignments ma
       LEFT JOIN categories c ON c.id = ma.category_id`
    );
    const byManager = {};
    for (const row of assignments) {
      if (!byManager[row.manager_id]) {
        byManager[row.manager_id] = [];
      }
      byManager[row.manager_id].push(row);
    }
    const data = managers.map((manager) => ({
      ...manager,
      assignments: byManager[manager.id] || [],
    }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const createManager = async (req, res, next) => {
  try {
    const { name, email, phone, password, region, category_id: categoryId } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await hashPassword(password);
    const id = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: 'business_manager',
    });
    if (region || categoryId) {
      await db.query(
        'INSERT INTO manager_assignments (manager_id, region, category_id) VALUES (?, ?, ?)',
        [id, region || null, categoryId || null]
      );
    }
    const manager = await User.findById(id);
    const [assignments] = await db.query(
      'SELECT * FROM manager_assignments WHERE manager_id = ?',
      [id]
    );
    res.status(201).json({
      message: 'Manager created',
      data: { ...manager, assignments },
    });
  } catch (err) {
    next(err);
  }
};

const updateManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, status, region, category_id: categoryId, password } = req.body;
    const manager = await User.findById(id);
    if (!manager || manager.role !== 'business_manager') {
      return res.status(404).json({ message: 'Manager not found' });
    }
    await db.query(
      `UPDATE users SET
         name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [name || null, phone || null, status || null, id]
    );
    if (password) {
      const hashed = await hashPassword(password);
      await User.updatePassword(id, hashed);
    }
    if (region !== undefined || categoryId !== undefined) {
      const [existing] = await db.query(
        'SELECT id FROM manager_assignments WHERE manager_id = ? LIMIT 1',
        [id]
      );
      if (existing.length > 0) {
        await db.query(
          `UPDATE manager_assignments SET
             region = COALESCE(?, region),
             category_id = COALESCE(?, category_id)
           WHERE manager_id = ?`,
          [
            region !== undefined ? region : null,
            categoryId !== undefined ? categoryId : null,
            id,
          ]
        );
      } else {
        await db.query(
          'INSERT INTO manager_assignments (manager_id, region, category_id) VALUES (?, ?, ?)',
          [id, region || null, categoryId || null]
        );
      }
    }
    const updated = await User.findById(id);
    const [assignments] = await db.query(
      'SELECT * FROM manager_assignments WHERE manager_id = ?',
      [id]
    );
    res.json({
      message: 'Manager updated',
      data: { ...updated, assignments },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listManagers,
  createManager,
  updateManager,
};
