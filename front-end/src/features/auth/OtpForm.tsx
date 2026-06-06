import { useState, useEffect, useRef } from 'react'
import Icon from '../../components/shared/Icon'

type Props = {
  credential: string
  onVerify: (otp: string) => void
  onResend: () => void
  onBack: () => void
  loading: boolean
  error?: string
}

export default function OtpForm({ credential, onVerify, onResend, onBack, loading, error }: Props) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [method, setMethod] = useState<'email' | 'sms'>('email')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [cooldown, setCooldown] = useState(0)
  const [attempts, setAttempts] = useState(5)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length === 6) {
      setAttempts(a => Math.max(0, a - 1))
      onVerify(code)
    }
  }

  const handleResend = () => {
    if (cooldown === 0) {
      setCooldown(60)
      onResend()
    }
  }

  const isExpired = timeLeft === 0
  const isLocked = attempts === 0
  const formatTime = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      <div style={{ padding: '48px 52px 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', color: 'var(--ink-2)', fontSize: 12.5, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16, alignSelf: 'flex-start' }}>
          <Icon name="arrow-left" size={13} /> Quay lại
        </button>
        
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 6 }}>
            Xác thực OTP
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            Mã OTP gồm 6 chữ số đã được gửi tới {method === 'email' ? 'email' : 'SĐT'} <br />
            <strong style={{ color: 'var(--ink)' }}>{credential}</strong>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 6, background: 'oklch(0.97 0.02 25)', color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
            {error}. Còn {attempts} lần thử.
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text" inputMode="numeric" pattern="[0-9]*"
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={isExpired || isLocked || loading}
              style={{
                width: 48, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 600,
                borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)',
                outline: 'none'
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, fontSize: 13, color: 'var(--ink-2)' }}>
          <div>Hiệu lực: <strong style={{ color: isExpired ? 'var(--accent)' : 'var(--court)' }}>{formatTime(timeLeft)}</strong></div>
          <div>Lần thử: <strong style={{ color: isLocked ? 'var(--accent)' : 'var(--ink)' }}>{attempts} / 5</strong></div>
        </div>

        <button onClick={handleVerify} disabled={otp.join('').length !== 6 || isExpired || isLocked || loading} style={{
          padding: '12px', borderRadius: 6,
          background: (otp.join('').length !== 6 || isExpired || isLocked || loading) ? 'var(--line)' : 'var(--ink)',
          color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 20
        }}>
          {loading ? 'Đang xác thực…' : 'Xác nhận'}
        </button>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 10 }}>Phương thức nhận OTP</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: method === 'email' ? '1.5px solid var(--ink)' : '1.5px solid var(--line)', borderRadius: 6, cursor: 'pointer', background: method==='email'?'var(--paper-2)':'var(--paper)' }}>
              <input type="radio" name="method" checked={method === 'email'} onChange={() => setMethod('email')} style={{ margin: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Email</span>
            </label>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: method === 'sms' ? '1.5px solid var(--ink)' : '1.5px solid var(--line)', borderRadius: 6, cursor: 'pointer', background: method==='sms'?'var(--paper-2)':'var(--paper)' }}>
              <input type="radio" name="method" checked={method === 'sms'} onChange={() => setMethod('sms')} style={{ margin: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>SMS</span>
            </label>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleResend} disabled={cooldown > 0} style={{ border: 'none', background: 'transparent', color: cooldown > 0 ? 'var(--ink-3)' : 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: cooldown > 0 ? 'default' : 'pointer', textDecoration: 'underline' }}>
              {cooldown > 0 ? `Gửi lại OTP (${cooldown}s)` : 'Gửi lại OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
