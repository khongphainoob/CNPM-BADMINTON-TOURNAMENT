
import Icon from '../shared/Icon'
import { useAuth } from '../../data/auth'

export default function UserProfileView() {
  const { session } = useAuth()
  
  const displayName = session?.name || 'Tài khoản ẩn danh'
  const email = session?.email || 'N/A'
  
  return (
    <div style={{ padding: '40px 48px', maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink)' }}>
            Hồ sơ cá nhân
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
            Quản lý thông tin cá nhân và lịch sử thi đấu
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'oklch(0.96 0.01 260)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={48} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{displayName}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 12 }}>{email}</div>
            <span style={{ padding: '4px 10px', background: 'oklch(0.95 0.08 140)', color: 'oklch(0.42 0.14 160)', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              Vai trò: {session?.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8, textTransform: 'uppercase' }}>Họ và tên</label>
            <input type="text" value={displayName} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, boxSizing: 'border-box' }} readOnly />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8, textTransform: 'uppercase' }}>Email liên hệ</label>
            <input type="text" value={email} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, boxSizing: 'border-box' }} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}
