import {
  listPayments, getPaymentById, createPayment,
  updatePaymentStatus, recordTransaction, getRevenueStats
} from './payment.service.js';
import { success, created, successList } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export function getHealth(_req, res) {
  res.json({ module: 'payment', status: 'ok' });
}

export async function getPayments(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { userId, status } = req.query;
    const result = await listPayments({ userId, status, page, limit });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

export async function getMyPayments(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await listPayments({ userId: req.user.id, status: req.query.status, page, limit });
    return successList(res, result, { page, limit });
  } catch (e) { return next(e); }
}

export async function getPayment(req, res, next) {
  try {
    const p = await getPaymentById(req.params.id);
    if (!p) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } });
    return success(res, p);
  } catch (e) { return next(e); }
}

export async function postPayment(req, res, next) {
  try {
    return created(res, await createPayment(req.body));
  } catch (e) { return next(e); }
}

export async function patchStatus(req, res, next) {
  try {
    return success(res, await updatePaymentStatus(req.params.id, req.body.status));
  } catch (e) { return next(e); }
}

export async function postTransaction(req, res, next) {
  try {
    return created(res, await recordTransaction(req.params.id, req.body));
  } catch (e) { return next(e); }
}

export async function getStats(_req, res, next) {
  try {
    return success(res, await getRevenueStats());
  } catch (e) { return next(e); }
}

export async function postExpense(req, res, next) {
  try {
    const { createExpense } = await import('./payment.service.js');
    return created(res, await createExpense(req.body));
  } catch (e) { return next(e); }
}
