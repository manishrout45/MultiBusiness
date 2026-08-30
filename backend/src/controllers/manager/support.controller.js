const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');

const listTickets = async (req, res, next) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT st.*,
             u.name AS user_name,
             u.email AS user_email,
             a.name AS assigned_to_name
      FROM support_tickets st
      JOIN users u ON u.id = st.user_id
      LEFT JOIN users a ON a.id = st.assigned_to
    `;
    const params = [];
    if (status) {
      sql += ' WHERE st.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY st.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const status = req.body.status;
    const assignedTo = req.body.assigned_to ?? req.body.assignedTo;
    const allowed = ['open', 'in_progress', 'resolved', 'closed'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const [rows] = await db.query('SELECT * FROM support_tickets WHERE id = ?', [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const nextAssignee = assignedTo !== undefined ? assignedTo : rows[0].assigned_to;

    await db.query(
      'UPDATE support_tickets SET status = ?, assigned_to = ? WHERE id = ?',
      [status, nextAssignee, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM support_tickets WHERE id = ?', [
      req.params.id,
    ]);

    await createNotification({
      userId: rows[0].user_id,
      title: 'Support ticket updated',
      message: `Your ticket "${rows[0].subject}" is now ${status}.`,
      type: 'support',
      link: `/support/${rows[0].id}`,
    });

    res.json({ message: 'Ticket updated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listTickets,
  updateTicket,
};
