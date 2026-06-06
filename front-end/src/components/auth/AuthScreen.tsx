import { useState } from 'react'
import { ShuttleMark } from '../../components/referee/shared'
import { useStore } from '../../data/store'
import LoginForm from '../../features/auth/LoginForm'
import RegisterForm from '../../features/auth/RegisterForm'
import OtpForm from '../../features/auth/OtpForm'

type LoginFn = (cred: string, pass: string) => Promise<{ ok: boolean; error?: string }>
type RegisterFn = (data: { name: string; email: string; phone?: string; password: string; role: string }) => Promise<{ ok: boolean; error?: string }>

type Props = { onLogin: LoginFn; onRegister: RegisterFn }

export default function AuthScreen({ onLogin, onRegister }: Props) {
  const [screen, setScreen] = useState<'login' | 'signup' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpTarget, setOtpTarget] = useState('')
  const [otpPassword, setOtpPassword] = useState('')

  const handleLogin = async (cred: string, pass: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await onLogin(cred, pass)
      setLoading(false)
      if (!result.ok) {
        if (result.error === 'pending') {
          if (screen === 'otp') {
            setError('Đã xác thực OTP! Tài khoản của bạn đang chờ Admin phê duyệt.')
          } else {
            setOtpTarget(cred)
            setOtpPassword(pass)
            setScreen('otp')
          }
        } else {
          setError(result.error ?? 'Lỗi không xác định.')
        }
      }
    } catch (err) {
      setLoading(false)
      setError('Lỗi kết nối máy chủ.')
    }
  }

  const handleRegister = async (data: any) => {
    setLoading(true)
    setError('')
    try {
      const result = await onRegister({ 
        name: data.name, 
        email: data.email, 
        phone: data.phone, 
        password: data.password, 
        role: data.role 
      })
      setLoading(false)
      if (!result.ok) {
        setError(result.error ?? 'Lỗi không xác định.')
      } else {
        setOtpTarget(data.email)
        setOtpPassword(data.password)
        setScreen('otp')
      }
    } catch (err) {
      setLoading(false)
      setError('Lỗi kết nối máy chủ.')
    }
  }

  const handleVerifyOtp = (otp: string) => {
    setLoading(true)
    setError('')
    setTimeout(() => {
      // simulate api
      if (otp === '123456') {
        handleLogin(otpTarget, otpPassword || 'admin123') // use handleLogin to properly manage loading state
      } else {
        setLoading(false)
        setError('Mã OTP không đúng (Mẹo: dùng 123456)')
      }
    }, 500)
  }

  const handleNeedOtp = (cred: string) => {
    setOtpTarget(cred)
    setScreen('otp')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'grid', gridTemplateColumns: '40% 60%',
      background: 'var(--paper)',
      zIndex: 9000,
    }}>
      <BrandPanel />
      <div style={{ overflowY: 'auto', background: 'var(--paper)' }}>
        {screen === 'login' && (
          <LoginForm 
            onLogin={handleLogin} 
            onGoSignup={() => { setScreen('signup'); setError('') }} 
            onNeedOtp={handleNeedOtp}
            loading={loading} error={error} 
          />
        )}
        {screen === 'signup' && (
          <RegisterForm 
            onRegister={handleRegister} 
            onGoLogin={() => { setScreen('login'); setError('') }} 
            loading={loading} error={error} 
          />
        )}
        {screen === 'otp' && (
          <OtpForm
            credential={otpTarget}
            onVerify={handleVerifyOtp}
            onResend={() => setError('')}
            onBack={() => { setScreen('login'); setError('') }}
            loading={loading} error={error}
          />
        )}
      </div>
    </div>
  )
}

function BrandPanel() {
  const tournament = useStore(state => state.tournament)
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
          {tournament?.name || 'Loading...'}
        </div>
        <div style={{ fontSize: 13, color: 'oklch(0.7 0.01 250)', lineHeight: 1.6 }}>
          <div>{tournament?.venue}</div>
          <div>{tournament?.start} — {tournament?.end}</div>
          <div style={{ marginTop: 12, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'oklch(0.55 0.01 250)' }}>
            {tournament?.id}
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
