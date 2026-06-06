import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  name: z.string().min(1, 'Họ tên không được để trống'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'btc', 'referee', 'athlete', 'spectator']).optional()
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email/SĐT không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự')
});

export const approveUserSchema = z.object({
  roleCode: z.enum(['admin', 'btc', 'referee', 'athlete', 'spectator'])
});

export const changeRoleSchema = z.object({
  roleCode: z.enum(['admin', 'btc', 'referee', 'athlete', 'spectator'])
});
