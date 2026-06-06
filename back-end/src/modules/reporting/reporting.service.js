import { query, getClient } from '../../config/db.js';
import { AppError } from '../../middleware/error.js';

// ─── Leaderboard ────────────────────────────────────

export async function getLeaderboardStats({ eventId, categoryCode } = {}) {
  // Compute leaderboard based on matches
  let filter = 'm.status = \'completed\'';
  const params = [];
  let idx = 1;

  if (eventId) {
    filter += ` AND m.event_id = $${idx++}`;
    params.push(eventId);
  }
  if (categoryCode) {
    filter += ` AND e.category_code = $${idx++}`;
    params.push(categoryCode);
  }

  const querySql = `
    WITH match_stats AS (
      SELECT
        p.id AS player_id,
        p.name, p.code, p.tier,
        c.name AS club_name,
        mp.side,
        m.winner_side,
        (SELECT COALESCE(SUM(score_a), 0) FROM match_sets ms WHERE ms.match_id = m.id) AS total_score_a,
        (SELECT COALESCE(SUM(score_b), 0) FROM match_sets ms WHERE ms.match_id = m.id) AS total_score_b
      FROM match_participants mp
      JOIN matches m ON m.id = mp.match_id
      JOIN events e ON e.id = m.event_id
      JOIN players p ON p.id = mp.player_id
      LEFT JOIN clubs c ON c.id = p.club_id
      WHERE ${filter}
    )
    SELECT
      player_id AS id, name, code, tier, club_name AS club,
      COUNT(*) AS matches_played,
      SUM(CASE WHEN side = winner_side THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN side != winner_side THEN 1 ELSE 0 END) AS losses,
      SUM(CASE WHEN side = 'A' THEN total_score_a ELSE total_score_b END) AS points_won,
      SUM(CASE WHEN side = 'A' THEN total_score_b ELSE total_score_a END) AS points_lost,
      (SUM(CASE WHEN side = 'A' THEN total_score_a ELSE total_score_b END) - SUM(CASE WHEN side = 'A' THEN total_score_b ELSE total_score_a END)) AS points_diff
    FROM match_stats
    GROUP BY player_id, name, code, tier, club_name
    ORDER BY wins DESC, points_diff DESC, matches_played ASC
  `;

  const result = await query(querySql, params);
  
  // Calculate PTS based on wins and tier
  const ranked = result.rows.map((r, index) => {
    // Arbitrary PTS formula for mock replacement
    const pts = (r.wins * 100) + (r.points_diff * 5) + (r.tier === 'A' ? 500 : r.tier === 'B' ? 300 : 100);
    return {
      rank: index + 1,
      id: r.id,
      name: r.name,
      code: r.code,
      tier: r.tier || 'C',
      club: r.club || '',
      played: parseInt(r.matches_played),
      wins: parseInt(r.wins),
      losses: parseInt(r.losses),
      pts: pts,
      chg: 0 // Mock change
    };
  });

  return ranked;
}

// ─── News ───────────────────────────────────────────

export async function listNews({ tournamentId, page = 1, limit = 20 } = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (tournamentId) {
    conditions.push(`n.tournament_id = $${idx++}`);
    params.push(tournamentId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows, count] = await Promise.all([
    query(
      `SELECT n.*, u.name AS author_name, t.name AS tournament_name
         FROM news n
         LEFT JOIN users u ON u.id = n.created_by
         LEFT JOIN tournaments t ON t.id = n.tournament_id
        ${where}
        ORDER BY n.published_at DESC NULLS LAST
        LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*)::int AS total FROM news n ${where}`, params)
  ]);

  return { items: rows.rows, total: count.rows[0]?.total || 0 };
}

export async function createNews({ tournamentId, title, body, tag, slug, thumbnailUrl, status }, userId) {
  try {
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS slug VARCHAR(255)`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(1024)`);
    await query(`ALTER TABLE news ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'draft'`);
  } catch (e) { /* ignore */ }

  const result = await query(
    `INSERT INTO news (tournament_id, title, body, tag, slug, thumbnail_url, status, created_by, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     RETURNING *`,
    [tournamentId || null, title, body, tag || null, slug || null, thumbnailUrl || null, status || 'draft', userId || null]
  );
  return result.rows[0];
}

export async function updateNews(id, data) {
  const allowed = { 
    title: 'title', body: 'body', tag: 'tag', tournamentId: 'tournament_id',
    slug: 'slug', thumbnailUrl: 'thumbnail_url', status: 'status' 
  };
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [jsKey, dbKey] of Object.entries(allowed)) {
    if (data[jsKey] !== undefined) {
      fields.push(`${dbKey} = $${idx++}`);
      values.push(data[jsKey]);
    }
  }

  if (fields.length === 0) throw new AppError(400, 'Không có dữ liệu', 'NO_DATA');
  values.push(id);

  const result = await query(
    `UPDATE news SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!result.rows[0]) throw new AppError(404, 'News not found', 'NOT_FOUND');
  return result.rows[0];
}

// ─── Inventory ──────────────────────────────────────

export async function listInventory() {
  const result = await query('SELECT * FROM inventory_items ORDER BY name');
  return result.rows;
}

export async function createInventoryItem({ sku, name, minStock, initialStock }) {
  const result = await query(
    `INSERT INTO inventory_items (sku, name, stock, min_stock)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sku, name, initialStock || 0, minStock || 0]
  );
  return result.rows[0];
}

export async function updateInventory(sku, { stock, minStock, issued }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(stock); }
  if (minStock !== undefined) { fields.push(`min_stock = $${idx++}`); values.push(minStock); }
  if (issued !== undefined) { fields.push(`issued = $${idx++}`); values.push(issued); }

  if (fields.length === 0) return true;
  values.push(sku);

  const result = await query(
    `UPDATE inventory_items SET ${fields.join(', ')} WHERE sku = $${idx} RETURNING *`,
    values
  );
  if (!result.rows[0]) throw new AppError(404, 'Item not found', 'NOT_FOUND');
  return result.rows[0];
}

export async function issueInventory(sku, { qty, matchId }, userId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const item = await client.query('SELECT stock FROM inventory_items WHERE sku = $1', [sku]);
    if (!item.rows[0]) throw new AppError(404, 'Item not found', 'NOT_FOUND');
    if (item.rows[0].stock < qty) throw new AppError(400, 'Tồn kho không đủ', 'INSUFFICIENT_STOCK');

    const result = await client.query(
      `UPDATE inventory_items
       SET stock = stock - $1, issued = issued + $1
       WHERE sku = $2 RETURNING *`,
      [qty, sku]
    );

    await client.query(
      `INSERT INTO activity_log (actor_user_id, action, target_type, target_id, message, meta)
       VALUES ($1, 'inventory.issue', 'inventory_item', $2, $3, $4)`,
      [
        userId || null,
        sku,
        `Xuất ${qty} ${result.rows[0].unit} ${result.rows[0].name}`,
        JSON.stringify({ qty, matchId })
      ]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ─── Activity Log ───────────────────────────────────

export async function listActivityLog({ actorId, targetType, page = 1, limit = 50 } = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (actorId) {
    conditions.push(`al.actor_user_id = $${idx++}`);
    params.push(actorId);
  }
  if (targetType) {
    conditions.push(`al.target_type = $${idx++}`);
    params.push(targetType);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows, count] = await Promise.all([
    query(
      `SELECT al.*, u.name AS actor_name, u.email AS actor_email
         FROM activity_log al
         LEFT JOIN users u ON u.id = al.actor_user_id
        ${where}
        ORDER BY al.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*)::int AS total FROM activity_log al ${where}`, params)
  ]);

  return { items: rows.rows, total: count.rows[0]?.total || 0 };
}

// ─── Report Templates ───────────────────────────────

export async function listReportTemplates() {
  const result = await query('SELECT id, code, title, description, params_schema FROM report_templates ORDER BY title');
  return result.rows;
}
