import {
  listNews, createNews, updateNews,
  listInventory, updateInventory, issueInventory,
  listActivityLog, listReportTemplates,
  getLeaderboardStats
} from './reporting.service.js';
import { success, created, successList } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export function getHealth(_req, res) {
  res.json({ module: 'reporting', status: 'ok' });
}

// ─── Leaderboard ────────────────────────────────────

export async function getLeaderboard(req, res, next) {
  try {
    const { eventId, categoryCode } = req.query;
    return success(res, await getLeaderboardStats({ eventId, categoryCode }));
  } catch (e) { return next(e); }
}

// ─── News ───────────────────────────────────────────

export async function getNews(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await listNews({ tournamentId: req.query.tournamentId, page, limit });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

export async function postNews(req, res, next) {
  try { return created(res, await createNews(req.body, req.user?.id)); }
  catch (e) { return next(e); }
}

export async function putNews(req, res, next) {
  try { return success(res, await updateNews(req.params.id, req.body)); }
  catch (e) { return next(e); }
}

// ─── Inventory ──────────────────────────────────────

export async function getInventory(_req, res, next) {
  try { return success(res, await listInventory()); }
  catch (e) { return next(e); }
}

export async function postInventory(req, res, next) {
  try {
    const { createInventoryItem } = await import('./reporting.service.js');
    return created(res, await createInventoryItem(req.body));
  } catch (e) { return next(e); }
}

export async function putInventory(req, res, next) {
  try { return success(res, await updateInventory(req.params.sku, req.body)); }
  catch (e) { return next(e); }
}

export async function postIssueInventory(req, res, next) {
  try { return success(res, await issueInventory(req.params.sku, req.body, req.user?.id)); }
  catch (e) { return next(e); }
}

// ─── Activity Log ───────────────────────────────────

export async function getActivityLog(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await listActivityLog({ actorId: req.query.actorId, targetType: req.query.targetType, page, limit });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

// ─── Templates ──────────────────────────────────────

export async function getTemplates(_req, res, next) {
  try { return success(res, await listReportTemplates()); }
  catch (e) { return next(e); }
}
