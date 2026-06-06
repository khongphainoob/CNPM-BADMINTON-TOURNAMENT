/**
 * Standardized API response helpers.
 * All responses follow the format: { data, meta? } or { error: { code, message, details? } }
 */

export function success(res, data, status = 200) {
  return res.status(status).json({ data });
}

export function successList(res, { items, total }, { page, limit }) {
  return res.json({
    data: items,
    meta: { page, limit, total }
  });
}

export function created(res, data) {
  return res.status(201).json({ data });
}

export function noContent(res) {
  return res.status(204).end();
}
