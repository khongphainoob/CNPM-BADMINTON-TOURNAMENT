import { query } from '../../config/db.js';

export async function listItems({ limit = 20, offset = 0 } = {}) {
  const [itemsResult, totalResult] = await Promise.all([
    query(
      'SELECT id, name, created_at FROM your_table ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    ),
    query('SELECT COUNT(*)::int AS total FROM your_table')
  ]);

  return {
    items: itemsResult.rows,
    total: Number(totalResult.rows[0]?.total || 0)
  };
}

export async function fetchItemById(id) {
  const result = await query(
    'SELECT id, name, created_at FROM your_table WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export async function insertItem({ name }) {
  const result = await query(
    'INSERT INTO your_table (name) VALUES ($1) RETURNING id, name, created_at',
    [name]
  );
  return result.rows[0];
}

export async function updateItemById(id, { name }) {
  const result = await query(
    'UPDATE your_table SET name = $1 WHERE id = $2 RETURNING id, name, created_at',
    [name, id]
  );
  return result.rows[0];
}

export async function deleteItemById(id) {
  const result = await query('DELETE FROM your_table WHERE id = $1 RETURNING id', [id]);
  return Boolean(result.rows[0]);
}
