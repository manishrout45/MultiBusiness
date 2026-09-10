const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');

const createThread = async (req, res, next) => {
  try {
    const businessId = req.body.businessId != null ? Number(req.body.businessId) : null;
    const subject = String(req.body.subject || 'Support chat').slice(0, 200);
    const message = String(req.body.message || req.body.body || '').trim();
    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    if (businessId) {
      const [biz] = await db.query(
        `SELECT id, owner_id, business_name FROM businesses WHERE id = ? AND status = 'approved'`,
        [businessId]
      );
      if (!biz[0]) return res.status(404).json({ message: 'Business not found' });

      const [result] = await db.query(
        `INSERT INTO chat_threads (customer_id, business_id, subject, last_message_at)
         VALUES (?, ?, ?, NOW())`,
        [req.user.id, businessId, subject]
      );
      await db.query(
        `INSERT INTO chat_messages (thread_id, sender_id, body) VALUES (?, ?, ?)`,
        [result.insertId, req.user.id, message.slice(0, 4000)]
      );
      await createNotification({
        userId: biz[0].owner_id,
        title: 'New chat message',
        message: `Customer messaged ${biz[0].business_name}`,
        type: 'system',
        link: `/vendor/chat/${result.insertId}`,
      });
      return res.status(201).json({ message: 'Chat started', data: { id: result.insertId } });
    }

    const [result] = await db.query(
      `INSERT INTO chat_threads (customer_id, business_id, subject, last_message_at)
       VALUES (?, NULL, ?, NOW())`,
      [req.user.id, subject]
    );
    await db.query(`INSERT INTO chat_messages (thread_id, sender_id, body) VALUES (?, ?, ?)`, [
      result.insertId,
      req.user.id,
      message.slice(0, 4000),
    ]);
    res.status(201).json({ message: 'Support chat started', data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
};

const listThreads = async (req, res, next) => {
  try {
    const role = req.user.role;
    let rows;
    if (role === 'customer') {
      [rows] = await db.query(
        `SELECT t.*, b.business_name
         FROM chat_threads t
         LEFT JOIN businesses b ON b.id = t.business_id
         WHERE t.customer_id = ?
         ORDER BY COALESCE(t.last_message_at, t.created_at) DESC`,
        [req.user.id]
      );
    } else if (role === 'vendor') {
      [rows] = await db.query(
        `SELECT t.*, u.name AS customer_name, b.business_name
         FROM chat_threads t
         JOIN businesses b ON b.id = t.business_id
         JOIN users u ON u.id = t.customer_id
         WHERE b.owner_id = ?
         ORDER BY COALESCE(t.last_message_at, t.created_at) DESC`,
        [req.user.id]
      );
    } else {
      [rows] = await db.query(
        `SELECT t.*, u.name AS customer_name, b.business_name
         FROM chat_threads t
         JOIN users u ON u.id = t.customer_id
         LEFT JOIN businesses b ON b.id = t.business_id
         WHERE t.business_id IS NULL OR t.assignee_id = ?
         ORDER BY COALESCE(t.last_message_at, t.created_at) DESC
         LIMIT 100`,
        [req.user.id]
      );
    }
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getThread = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [threads] = await db.query(`SELECT * FROM chat_threads WHERE id = ?`, [id]);
    const thread = threads[0];
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    const allowed = await canAccessThread(req.user, thread);
    if (!allowed) return res.status(403).json({ message: 'Not allowed' });

    const [messages] = await db.query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM chat_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.thread_id = ?
       ORDER BY m.created_at ASC`,
      [id]
    );
    res.json({ data: { ...thread, messages } });
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = String(req.body.message || req.body.body || '').trim();
    if (!body) return res.status(400).json({ message: 'message is required' });

    const [threads] = await db.query(`SELECT * FROM chat_threads WHERE id = ?`, [id]);
    const thread = threads[0];
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.status === 'closed') {
      return res.status(400).json({ message: 'This chat is closed' });
    }

    const allowed = await canAccessThread(req.user, thread);
    if (!allowed) return res.status(403).json({ message: 'Not allowed' });

    const [result] = await db.query(
      `INSERT INTO chat_messages (thread_id, sender_id, body) VALUES (?, ?, ?)`,
      [id, req.user.id, body.slice(0, 4000)]
    );
    await db.query(`UPDATE chat_threads SET last_message_at = NOW() WHERE id = ?`, [id]);

    // notify the other party
    if (req.user.id === thread.customer_id && thread.business_id) {
      const [biz] = await db.query('SELECT owner_id FROM businesses WHERE id = ?', [
        thread.business_id,
      ]);
      if (biz[0]) {
        await createNotification({
          userId: biz[0].owner_id,
          title: 'New chat message',
          message: body.slice(0, 120),
          type: 'system',
          link: `/vendor/chat/${id}`,
        });
      }
    } else if (thread.customer_id !== req.user.id) {
      await createNotification({
        userId: thread.customer_id,
        title: 'New chat reply',
        message: body.slice(0, 120),
        type: 'system',
        link: `/chat/${id}`,
      });
    }

    const [rows] = await db.query('SELECT * FROM chat_messages WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Sent', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

async function canAccessThread(user, thread) {
  if (user.role === 'super_admin' || user.role === 'business_manager') return true;
  if (Number(user.id) === Number(thread.customer_id)) return true;
  if (user.role === 'vendor' && thread.business_id) {
    const [biz] = await db.query('SELECT owner_id FROM businesses WHERE id = ?', [
      thread.business_id,
    ]);
    return biz[0] && Number(biz[0].owner_id) === Number(user.id);
  }
  return false;
}

module.exports = {
  createThread,
  listThreads,
  getThread,
  sendMessage,
};
