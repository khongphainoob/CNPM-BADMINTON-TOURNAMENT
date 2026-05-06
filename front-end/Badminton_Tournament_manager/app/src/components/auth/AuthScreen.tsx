import { useState } from 'react'
import { ShuttleMark } from '../referee/shared'
import Icon from '../shared/Icon'
import { TOURNAMENT } from '../../data/legacy'

type LoginFn = (cred: string, pass: string) => { ok: boolean; error?: string }
type RegisterFn = (data: { name: string; email: string; phone?: string; password: string; requestedRole: string }) => { ok: boolean; error?: string }

type Props = { onLogin: LoginFn; onRegister: RegisterFn }

export default function AuthScreen({ onLogin, onRegister }: Props) {
  const [screen, setScreen] = useState<'login' | 'signup'>('login')
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'grid', gridTemplateColumns: '40% 60%',
      background: 'var(--paper)',
      zIndex: 9000,
    }}>
      <BrandPanel />
      <div style={{ overflowY: 'auto', background: 'var(--paper)' }}>
        {screen === 'login'
          ? <LoginPanel onLogin={onLogin} onGoSignup={() => setScreen('signup')} />
          : <SignupPanel onRegister={onRegister} onGoLogin={() => setScreen('login')} />
        }
      </div>
    </div>
  )
}

function BrandPanel() {
  return (
    <div style={{
      background: 'var(--ink)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '48px 44px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShuttleMark size={24} light />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Shuttle<span style={{ color: 'var(--accent)' }}>·</span>Ops
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'oklch(0.7 0.01 250)', marginTop: 3, textTransform: 'uppercase' }}>
            Tournament Operations Platform
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 48, lineHeight: 1, textTransform: 'uppercase', marginBottom: 16 }}>
          {TOURNAMENT.name}
        </div>
        <div style={{ fontSize: 13, color: 'oklch(0.7 0.01 250)', lineHeight: 1.6 }}>
          <div>{TOURNAMENT.venue}</div>
          <div>{TOURNAMENT.start} — {TOURNAMENT.end}</div>
          <div style={{ marginTop: 12, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'oklch(0.55 0.01 250)' }}>
            {TOURNAMENT.id}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'oklch(0.4 0.01 250)', lineHeight: 1.6 }}>
        Nền tảng quản lý thi đấu cầu lông chuyên nghiệp.<br />
        Dành cho Ban tổ chức, Trọng tài và Vận động viên.
      </div>
    </div>
  )
}

type FieldProps = {
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  autoComplete?: string
  error?: string
}

function Field({ label, type = 'text', value, onChange, placeholder, autoComplete, error }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete}
        style={{
          padding: '10px 12px', borderRadius: 6,
          border: error ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
          background: 'var(--paper)', color: 'var(--ink)',
          fontSize: 14, fontFamily: 'var(--font-sans)',
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--ink)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--accent)' : 'var(--line)' }}
      />
      {error && <span style={{ fontSize: 11.5, color: 'var(--accent)' }}>{error}</span>}
    </div>
  )
}

type LoginPanelProps = { onLogin: LoginFn; onGoSignup: () => void }

function LoginPanel({ onLogin, onGoSignup }: LoginPanelProps) {
  const [cred, setCred] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cred.trim() || !pass.trim()) { setError('Vui lòng nhập đầy đủ thông tin.'); return }
    setLoading(true)
    setTimeout(() => {
      const result = onLogin(cred, pass)
      setLoading(false)
      if (!result.ok) {
        if (result.error === 'pending') setPending(true)
        else setError(result.error ?? 'Lỗi không xác định.')
      }
    }, 300)
  }

  if (pending) return <PendingPanel onBack={() => setPending(false)} />

  const demos = [
    { label: 'Admin',    cred: 'admin@shuttleops.vn',        pass: 'admin123', color: 'oklch(0.62 0.12 25)' },
    { label: 'BTC',      cred: 'phamlam@shuttleops.vn',      pass: 'btc123',   color: 'oklch(0.55 0.12 230)' },
    { label: 'Trọng tài',cred: 'lequanghuy@shuttleops.vn',   pass: 'ref123',   color: 'oklch(0.52 0.10 160)' },
    { label: 'VĐV',      cred: 'nguyenhaidang@shuttleops.vn',pass: 'vdv123',   color: 'oklch(0.55 0.10 70)' },
    { label: 'Khán giả', cred: 'khangía@shuttleops.vn',      pass: 'fan123',   color: 'oklch(0.58 0.10 300)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      <div style={{ padding: '48px 52px 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 6 }}>
            Đăng nhập
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>Email hoặc số điện thoại + mật khẩu</div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 6, background: 'oklch(0.97 0.02 25)', color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Email / Số điện thoại" value={cred}
            onChange={e => { setCred(e.target.value); setError('') }}
            placeholder="email@example.com hoặc 09xxxxxxxx" autoComplete="username" />
          <Field label="Mật khẩu" type="password" value={pass}
            onChange={e => { setPass(e.target.value); setError('') }}
            placeholder="••••••••" autoComplete="current-password" />
          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '12px', borderRadius: 6,
            background: loading ? 'var(--line)' : 'var(--ink)',
            color: 'white', fontFamily: 'var(--font-sans)',
            fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer',
            letterSpacing: '0.02em',
          }}>
            {loading ? 'Đang xác thực…' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-2)' }}>
          Chưa có tài khoản?{' '}
          <button onClick={onGoSignup} style={{ border: 'none', background: 'transparent', color: 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Đăng ký
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 52px 36px' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10, fontWeight: 600 }}>
          Tài khoản demo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {demos.map(d => (
            <button key={d.label} onClick={() => { setCred(d.cred); setPass(d.pass); setError('') }}
              style={{
                padding: '8px 10px', borderRadius: 5, border: '1px solid var(--line)',
                background: 'var(--paper-2)', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: d.color, flexShrink: 0 }} />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{d.label}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{d.pass}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

type SignupPanelProps = { onRegister: RegisterFn; onGoLogin: () => void }

function SignupPanel({ onRegister, onGoLogin }: SignupPanelProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')
  const [requestedRole, setRequestedRole] = useState('athlete')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Vui lòng nhập họ tên.'
    if (!email.trim() || !email.includes('@')) e.email = 'Email không hợp lệ.'
    if (!pass || pass.length < 6) e.pass = 'Mật khẩu tối thiểu 6 ký tự.'
    return e
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setTimeout(() => {
      const result = onRegister({ name, email, phone, password: pass, requestedRole })
      setLoading(false)
      if (!result.ok) setErrors({ email: result.error ?? 'Lỗi không xác định.' })
      else setDone(true)
    }, 300)
  }

  const roleOpts = [
    { id: 'btc',     label: 'Ban tổ chức', sub: 'Cần phê duyệt từ Admin' },
    { id: 'athlete', label: 'VĐV / HLV',   sub: 'Cần phê duyệt từ BTC' },
  ]

  if (done) return (
    <div style={{ padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 99, background: 'oklch(0.92 0.06 160)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={22} color="oklch(0.45 0.14 160)" />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', marginBottom: 8 }}>
          Đăng ký thành công!
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          Tài khoản của bạn đang chờ phê duyệt.{' '}
          {requestedRole === 'btc' ? 'Admin hệ thống' : 'Ban tổ chức'} sẽ xem xét và thông báo kết quả qua email.
        </div>
      </div>
      <button onClick={onGoLogin} style={{ padding: '11px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'transparent', color: 'var(--ink)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
        Quay lại đăng nhập
      </button>
    </div>
  )

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

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 8 }}>
            Vai trò
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {roleOpts.map(r => (
              <button key={r.id} type="button" onClick={() => setRequestedRole(r.id)} style={{
                flex: 1, padding: '10px 12px', borderRadius: 6, textAlign: 'left',
                border: requestedRole === r.id ? '1.5px solid var(--ink)' : '1.5px solid var(--line)',
                background: requestedRole === r.id ? 'var(--paper-2)' : 'var(--paper)',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.label}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{r.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <Field label="Họ và tên" value={name}
          onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
          placeholder="Nguyễn Văn A" error={errors.name} autoComplete="name" />
        <Field label="Email" type="email" value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
          placeholder="email@example.com" error={errors.email} autoComplete="email" />
        <Field label="Số điện thoại (tuỳ chọn)" value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="09xxxxxxxx" autoComplete="tel" />
        <Field label="Mật khẩu" type="password" value={pass}
          onChange={e => { setPass(e.target.value); setErrors(p => ({ ...p, pass: '' })) }}
          placeholder="Tối thiểu 6 ký tự" error={errors.pass} autoComplete="new-password" />

        <button type="submit" disabled={loading} style={{
          marginTop: 4, padding: '12px', borderRadius: 6,
          background: loading ? 'var(--line)' : 'var(--ink)',
          color: 'white', fontFamily: 'var(--font-sans)',
          fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer',
        }}>
          {loading ? 'Đang xử lý…' : 'Gửi đăng ký'}
        </button>
      </form>
    </div>
  )
}

function PendingPanel({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 99, background: 'oklch(0.95 0.06 70)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="clock" size={22} color="oklch(0.52 0.14 70)" />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, textTransform: 'uppercase', marginBottom: 8 }}>
          Đang chờ duyệt
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          Tài khoản của bạn đã được đăng ký và đang chờ phê duyệt. Vui lòng kiểm tra email sau khi được duyệt.
        </div>
      </div>
      <button onClick={onBack} style={{ padding: '11px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'transparent', color: 'var(--ink)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
        Quay lại
      </button>
    </div>
  )
}
