const db = require('../../config/db');
const { notifyUsersByRoles } = require('../../services/notification.service');

const ALLOWED_TYPES = new Set(['product', 'business', 'user', 'review']);

const createReport = async (req, res, next) => {
  try {
    const targetType = String(req.body.targetType || req.body.target_type || '').toLowerCase();
    const targetId = Number(req.body.targetId || req.body.target_id);
    const reason = String(req.body.reason || '').trim().slice(0, 100);
    const details = req.body.details ? String(req.body.details).slice(0, 2000) : null;

    if (!ALLOWED_TYPES.has(targetType) || !targetId) {
      return res.status(400).json({
        message: 'targetType (product|business|user|review) and targetId are required',
      });
    }
    if (!reason) {
      return res.status(400).json({ message: 'reason is required' });
    }

    const [result] = await db.query(
      `INSERT INTO content_reports (reporter_id, target_type, target_id, reason, details)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, targetType, targetId, reason, details]
    );

    await notifyUsersByRoles({
      roles: ['super_admin', 'business_manager'],
      title: 'New content report',
      message: `${targetType} #${targetId}: ${reason}`,
      type: 'system',
      link: '/admin/dashboard#moderation',
    });

    const [rows] = await db.query('SELECT * FROM content_reports WHERE id = ?', [
      result.insertId,
    ]);
    res.status(201).json({ message: 'Report submitted', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const listMyReports = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM content_reports WHERE reporter_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, listMyReports };
