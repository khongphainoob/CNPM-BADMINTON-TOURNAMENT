import {
  approveUser, changePassword, changeUserRole, getCurrentUser,
  listUsers, loginUser, registerUser, rejectUser
} from './auth.service.js';
import { success, created, successList } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export function getHealth(_req, res) {
  res.json({ module: 'auth', status: 'ok' });
}

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);
    return created(res, user);
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    return success(res, result);
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    return success(res, user);
  } catch (error) {
    return next(error);
  }
}

export async function changePass(req, res, next) {
  try {
    await changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
    return success(res, { message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    return next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { status, role } = req.query;
    const result = await listUsers({ page, limit, status, role });
    return successList(res, result, { page, limit });
  } catch (error) {
    return next(error);
  }
}

export async function approve(req, res, next) {
  try {
    const user = await approveUser(req.params.id, req.body.roleCode);
    return success(res, user);
  } catch (error) {
    return next(error);
  }
}

export async function reject(req, res, next) {
  try {
    const user = await rejectUser(req.params.id, req.body.note);
    return success(res, user);
  } catch (error) {
    return next(error);
  }
}

export async function changeRole(req, res, next) {
  try {
    const user = await changeUserRole(req.params.id, req.body.roleCode);
    return success(res, user);
  } catch (error) {
    return next(error);
  }
}
