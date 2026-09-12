const pool = require('../config/db');

function toPublicMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

async function createMessage(req, res) {
  const { name, email, message } = req.body;

  const result = await pool.query(
    `INSERT INTO contact_messages (name, email, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, email, message]
  );

  res.status(201).json({ message: toPublicMessage(result.rows[0]) });
}

async function listMessages(req, res) {
  const { unread } = req.query;
  const where = unread === 'true' ? 'WHERE is_read = false' : '';

  const result = await pool.query(
    `SELECT * FROM contact_messages ${where} ORDER BY created_at DESC`
  );
  res.json({ messages: result.rows.map(toPublicMessage) });
}

async function markRead(req, res) {
  const result = await pool.query(
    `UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *`,
    [req.params.id]
  );

  const row = result.rows[0];
  if (!row) {
    return res.status(404).json({ error: 'Message not found.' });
  }
  res.json({ message: toPublicMessage(row) });
}

async function deleteMessage(req, res) {
  const result = await pool.query(
    `DELETE FROM contact_messages WHERE id = $1 RETURNING id`,
    [req.params.id]
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Message not found.' });
  }
  res.status(204).send();
}

module.exports = { createMessage, listMessages, markRead, deleteMessage };