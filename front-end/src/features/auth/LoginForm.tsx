import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Icon from '../../components/shared/Icon'

const loginSchema = z.object({
  credential: z.string().min(1, 'Vui lòng nhập Email hoặc Số điện thoại')
    .refine(val => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      const isPhone = /^(0[3-9]\d{8})$/.test(val)
      return isEmail || isPhone
    }, 'Email không hợp lệ hoặc sai định dạng số điện thoại (10 số, bắt đầu bằng 03-09)'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  remember: z.boolean().optional(),
  requireOtp: z.boolean().optional()
})

type LoginData = z.infer<typeof loginSchema>

type Props = {
  onLogin: (cred: string, pass: string) => void
  onGoSignup: () => void
  onNeedOtp: (cred: string) => void
  loading: boolean
  error?: string
}

export default function LoginForm({ onLogin, onGoSignup, onNeedOtp, loading, error }: Props) {
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false, requireOtp: false }
  })

  const onSubmit = (data: LoginData) => {
    if (data.requireOtp) {
      onNeedOtp(data.credential)
    } else {
      onLogin(data.credential, data.password)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      <div style={{ padding: '48px 52px 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 6 }}>
            Đăng nhập
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>Hệ thống quản lý giải đấu ShuttleOps</div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 6, background: 'oklch(0.97 0.02 25)', color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>Email / Số điện thoại *</label>
            <input
              {...register('credential')}
              placeholder="email@example.com hoặc 09xxxxxxxx"
              style={{
                padding: '10px 12px', borderRadius: 6,
                border: errors.credential ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
                background: 'var(--paper)', color: 'var(--ink)', fontSize: 14, outline: 'none'
              }}
            />
            {errors.credential && <span style={{ fontSize: 11.5, color: 'var(--accent)' }}>{errors.credential.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>Mật khẩu *</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 36px 10px 12px', borderRadius: 6, boxSizing: 'border-box',
                  border: errors.password ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
                  background: 'var(--paper)', color: 'var(--ink)', fontSize: 14, outline: 'none'
                }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 10, top: 10, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-3)'
              }}>
                <Icon name={showPass ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>
            {errors.password && <span style={{ fontSize: 11.5, color: 'var(--accent)' }}>{errors.password.message}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" {...register('remember')} />
              Ghi nhớ đăng nhập
            </label>
            <button type="button" style={{ border: 'none', background: 'transparent', color: 'var(--ink)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              Quên mật khẩu?
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" {...register('requireOtp')} />
            Yêu cầu xác thực OTP
          </label>

          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '12px', borderRadius: 6,
            background: loading ? 'var(--line)' : 'var(--ink)',
            color: 'white', fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer',
          }}>
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-2)' }}>
          Chưa có tài khoản?{' '}
          <button onClick={onGoSignup} style={{ border: 'none', background: 'transparent', color: 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  )
}
