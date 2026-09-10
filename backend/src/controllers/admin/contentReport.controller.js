const db = require('../../config/db');

const listReports = async (req, res, next) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT cr.*, u.name AS reporter_name, u.email AS reporter_email
      FROM content_reports cr
      JOIN users u ON u.id = cr.reporter_id
      WHERE 1=1`;
    const params = [];
    if (status) {
      sql += ' AND cr.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY cr.created_at DESC LIMIT 200';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body.status || '').toLowerCase();
    const allowed = ['open', 'reviewing', 'resolved', 'dismissed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }
    const note = req.body.resolutionNote || req.body.resolution_note || null;
    await db.query(
      `UPDATE content_reports
       SET status = ?, resolved_by = ?, resolution_note = ?
       WHERE id = ?`,
      [status, req.user.id, note, id]
    );
    const [rows] = await db.query('SELECT * FROM content_reports WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report updated', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { listReports, updateReport };
