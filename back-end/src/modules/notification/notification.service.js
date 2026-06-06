import { query } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

export async function listNotifications(userId, { status, page = 1, limit = 20 } = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (status) {
    conditions.push(`status = $${idx++}`);
    params.push(status);
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const [rows, countResult] = await Promise.all([
    query(
      `SELECT id, template_id, channel, subject, body, status, sent_at, read_at, meta
         FROM notifications
        WHERE ${where}
        ORDER BY created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*)::int AS total FROM notifications WHERE ${where}`, params)
  ]);

  return { items: rows.rows, total: countResult.rows[0]?.total || 0 };
}

export async function getUnreadCount(userId) {
  const result = await query(
    `SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1 AND status <> 'read'`,
    [userId]
  );
  return result.rows[0]?.total || 0;
}

export async function markAsRead(id, userId) {
  const result = await query(
    `UPDATE notifications SET status = 'read', read_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
  if (!result.rows[0]) throw new AppError(404, 'Notification not found', 'NOT_FOUND');
  return result.rows[0];
}

export async function createNotification({ userId, templateId, channel, subject, body, meta }) {
  const result = await query(
    `INSERT INTO notifications (user_id, template_id, channel, subject, body, status, sent_at, meta)
     VALUES ($1, $2, $3, $4, $5, 'sent', now(), $6)
     RETURNING *`,
    [userId, templateId || null, channel || 'in_app', subject, body, meta ? JSON.stringify(meta) : null]
  );
  return result.rows[0];
}

export async function listTemplates() {
  const result = await query('SELECT * FROM notification_templates ORDER BY code');
  return result.rows;
}
