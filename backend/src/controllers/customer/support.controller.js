const db = require('../../config/db');

const createTicket = async (req, res, next) => {
  try {
    const { subject, message, priority } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'subject and message are required' });
    }
    const allowedPriorities = ['low', 'medium', 'high'];
    const ticketPriority = allowedPriorities.includes(priority) ? priority : 'medium';

    const [result] = await db.query(
      `INSERT INTO support_tickets (user_id, subject, message, priority, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [req.user.id, subject, message, ticketPriority]
    );

    const [rows] = await db.query('SELECT * FROM support_tickets WHERE id = ?', [
      result.insertId,
    ]);
    res.status(201).json({ message: 'Support ticket created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const listTickets = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM support_tickets
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  listTickets,
};
