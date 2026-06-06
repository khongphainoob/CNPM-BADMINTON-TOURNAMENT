import {
  listNotifications, getUnreadCount, markAsRead,
  createNotification, listTemplates
} from './notification.service.js';
import { success, created, successList } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export function getHealth(_req, res) {
  res.json({ module: 'notification', status: 'ok' });
}

export async function getMyNotifications(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await listNotifications(req.user.id, { status: req.query.status, page, limit });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

export async function getMyUnreadCount(req, res, next) {
  try {
    const count = await getUnreadCount(req.user.id);
    return success(res, { count });
  } catch (e) { return next(e); }
}

export async function patchRead(req, res, next) {
  try {
    const notif = await markAsRead(req.params.id, req.user.id);
    return success(res, notif);
  } catch (e) { return next(e); }
}

export async function postNotification(req, res, next) {
  try {
    return created(res, await createNotification(req.body));
  } catch (e) { return next(e); }
}

export async function getTemplates(_req, res, next) {
  try {
    return success(res, await listTemplates());
  } catch (e) { return next(e); }
}
