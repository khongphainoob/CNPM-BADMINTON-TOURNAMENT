import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Icon from '../../components/shared/Icon'

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên từ 2-100 ký tự').max(100, 'Họ tên từ 2-100 ký tự'),
  dob: z.string().refine(val => {
    if (!val) return false
    const age = new Date().getFullYear() - new Date(val).getFullYear()
    return age >= 10 && age <= 100
  }, 'Tuổi phải từ 10 đến 100'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0[3-9]\d{8})$/, 'Số điện thoại VN không hợp lệ').optional(),
  password: z.string().min(6, 'Tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'btc', 'referee', 'athlete', 'spectator'], { required_error: 'Vui lòng chọn vai trò' })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
})

type RegisterData = z.infer<typeof registerSchema>

type Props = {
  onRegister: (data: any) => void
  onGoLogin: () => void
  loading: boolean
  error?: string
}

export default function RegisterForm({ onRegister, onGoLogin, loading, error }: Props) {
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'athlete' },
    mode: 'onBlur'
  })

  const password = watch('password', '')
  
  // Calculate password strength
  const getStrength = (pass: string) => {
    let score = 0
    if (pass.length > 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/\d/.test(pass)) score++
    if (/[@$!%*?&]/.test(pass)) score++
    return score
  }
  const strength = getStrength(password)
  const strengthColor = strength === 0 ? 'var(--line)' : strength === 1 ? 'var(--accent)' : strength === 2 ? 'var(--amber)' : strength === 3 ? 'var(--court)' : 'oklch(0.6 0.15 150)'
  const strengthLabel = strength === 0 ? '' : strength === 1 ? 'Yếu' : strength === 2 ? 'Trung bình' : strength === 3 ? 'Mạnh' : 'Rất mạnh'

  return (
    <div style={{ padding: '36px 52px', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <button onClick={onGoLogin} style={{ border: 'none', background: 'transparent', color: 'var(--ink-2)', fontSize: 12.5, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
          <Icon name="arrow-left" size={13} /> Quay lại
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 6 }}>
          Đăng ký
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>Tạo tài khoản mới</div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 6, background: 'oklch(0.97 0.02 25)', color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onRegister)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Họ và tên *</label>
            <input {...register('name')} placeholder="Nguyễn Văn A" style={inputStyle(!!errors.name)} />
            {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Ngày sinh *</label>
            <input type="date" {...register('dob')} style={inputStyle(!!errors.dob)} />
            {errors.dob && <span style={errorStyle}>{errors.dob.message}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Email *</label>
            <input type="email" {...register('email')} placeholder="email@example.com" style={inputStyle(!!errors.email)} />
            {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số điện thoại *</label>
            <input type="tel" {...register('phone')} placeholder="09xxxxxxxx" style={inputStyle(!!errors.phone)} />
            {errors.phone && <span style={errorStyle}>{errors.phone.message}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Mật khẩu *</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} {...register('password')} placeholder="••••••••" style={{...inputStyle(!!errors.password), width: '100%', boxSizing: 'border-box'}} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: 10, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>
              <Icon name={showPass ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
          
          {password.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                {[1,2,3,4].map(lvl => (
                  <div key={lvl} style={{ height: 4, flex: 1, borderRadius: 2, background: strength >= lvl ? strengthColor : 'var(--line-2)' }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600, width: 70, textAlign: 'right' }}>{strengthLabel}</span>
            </div>
          )}
          {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Xác nhận mật khẩu *</label>
          <input type="password" {...register('confirmPassword')} placeholder="••••••••" style={inputStyle(!!errors.confirmPassword)} />
          {errors.confirmPassword && <span style={errorStyle}>{errors.confirmPassword.message}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Vai trò đăng ký *</label>
          <select {...register('role')} style={inputStyle(!!errors.role)}>
            <option value="athlete">Vận động viên / HLV</option>
            <option value="btc">Ban tổ chức</option>
            <option value="referee">Trọng tài</option>
            <option value="spectator">Khán giả</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span style={errorStyle}>{errors.role.message}</span>}
        </div>

        <button type="submit" disabled={loading} style={{
          marginTop: 10, padding: '12px', borderRadius: 6,
          background: loading ? 'var(--line)' : 'var(--ink)',
          color: 'white', fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer',
        }}>
          {loading ? 'Đang xử lý…' : 'Đăng ký'}
        </button>
      </form>
    </div>
  )
}

const inputStyle = (hasError: boolean) => ({
  padding: '10px 12px', borderRadius: 6,
  border: hasError ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
  background: 'var(--paper)', color: 'var(--ink)', fontSize: 14, outline: 'none'
})

const errorStyle = { fontSize: 11.5, color: 'var(--accent)' }
