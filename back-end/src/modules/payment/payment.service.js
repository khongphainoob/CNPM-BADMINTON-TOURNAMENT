import { query, getClient } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

export async function listPayments({ userId, status, page = 1, limit = 20 } = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (userId) {
    conditions.push(`p.user_id = $${idx++}`);
    params.push(userId);
  }
  if (status) {
    conditions.push(`p.status = $${idx++}`);
    params.push(status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows, countResult] = await Promise.all([
    query(
      `SELECT p.id, p.code, p.amount, p.purpose, p.status, p.created_at, p.paid_at, p.budget_line_id,
              u.id AS user_id, u.name AS user_name, u.email AS user_email,
              ep.id AS participant_id, e.label AS event_label
         FROM payments p
         LEFT JOIN users u ON u.id = p.user_id
         LEFT JOIN event_participants ep ON ep.id = p.event_participant_id
         LEFT JOIN events e ON e.id = ep.event_id
        ${where}
        ORDER BY p.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*)::int AS total FROM payments p ${where}`, params)
  ]);

  return { items: rows.rows, total: countResult.rows[0]?.total || 0 };
}

export async function getPaymentById(id) {
  const result = await query(
    `SELECT p.*, u.name AS user_name, u.email AS user_email
       FROM payments p
       LEFT JOIN users u ON u.id = p.user_id
      WHERE p.id = $1`,
    [id]
  );
  const payment = result.rows[0];
  if (!payment) return null;

  const txns = await query(
    'SELECT * FROM payment_transactions WHERE payment_id = $1 ORDER BY created_at DESC',
    [id]
  );

  return { ...payment, transactions: txns.rows };
}

export async function createPayment({ userId, eventParticipantId, amount, purpose, code }) {
  const result = await query(
    `INSERT INTO payments (code, user_id, event_participant_id, amount, purpose, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [
      code || `PAY-${Date.now()}`,
      userId || null,
      eventParticipantId || null,
      amount,
      purpose
    ]
  );
  return result.rows[0];
}

export async function updatePaymentStatus(id, status) {
  const result = await query(
    `UPDATE payments SET status = $1::payment_status_t, paid_at = CASE WHEN $1::text = 'paid' THEN now() ELSE paid_at END
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!result.rows[0]) throw new AppError(404, 'Payment not found', 'NOT_FOUND');
  return result.rows[0];
}

export async function recordTransaction(paymentId, { gateway, gatewayTxnId, amount, status }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const payment = await client.query('SELECT status FROM payments WHERE id = $1', [paymentId]);
    if (!payment.rows[0]) throw new AppError(404, 'Payment not found', 'NOT_FOUND');

    const txnResult = await client.query(
      `INSERT INTO payment_transactions (payment_id, gateway, gateway_txn_id, amount, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [paymentId, gateway, gatewayTxnId, amount, status]
    );

    if (status === 'success') {
      await client.query(
        `UPDATE payments SET status = 'paid', paid_at = now() WHERE id = $1`,
        [paymentId]
      );
    }

    await client.query('COMMIT');
    return txnResult.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function createExpense({ desc, invoice, amount, date, method, budgetLineId, status }) {
  // Automatically add columns if they don't exist to support expenses without manual DB migration
  try {
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS budget_line_id VARCHAR(32)`);
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS note TEXT`);
  } catch (e) { /* ignore */ }

  const result = await query(
    `INSERT INTO payments (code, amount, purpose, status, budget_line_id, note)
     VALUES ($1, $2, 'other', $3, $4, $5)
     RETURNING *`,
    [
      `EXP-${Date.now().toString().slice(-8)}`,
      -Math.abs(amount), // store as negative
      status || 'paid',
      budgetLineId,
      desc + (invoice ? ` | HD: ${invoice}` : '')
    ]
  );
  return result.rows[0];
}

export async function getRevenueStats() {
  try {
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS budget_line_id VARCHAR(32)`);
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS note TEXT`);
  } catch (e) { /* ignore */ }

  const result = await query(`
    SELECT purpose, COUNT(*)::int AS count, SUM(amount)::bigint AS total_amount
      FROM payments
     WHERE status = 'paid'
     GROUP BY purpose
  `);
  
  const expensesResult = await query(`
    SELECT budget_line_id, SUM(ABS(amount))::bigint AS spent
      FROM payments
     WHERE amount < 0 AND status IN ('paid', 'pending')
     GROUP BY budget_line_id
  `);

  return {
    revenue: result.rows,
    expenses: expensesResult.rows
  };
}
