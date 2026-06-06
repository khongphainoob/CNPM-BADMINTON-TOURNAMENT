import { useState } from 'react'
import Icon from '../../components/shared/Icon'

// ---- BM9: Receive Registration Form ----

type RegistrationInfo = {
  id: string
  athleteName: string
  teamName: string
  eventName: string
}

type Props = {
  registration: RegistrationInfo
  currentUser: string
  onSave: (status: 'complete' | 'incomplete', notes: string) => void
  onClose: () => void
  loading?: boolean
}

export default function ReceiveRegistrationModal({ registration, currentUser, onSave, onClose, loading }: Props) {
  const [status, setStatus] = useState<'complete' | 'incomplete' | null>(null)
  const [notes, setNotes] = useState('')

  const isNotesRequired = status === 'incomplete'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!status) return
    if (isNotesRequired && !notes.trim()) {
      alert('Vui lòng ghi chú rõ giấy tờ còn thiếu')
      return
    }
    onSave(status, notes)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--paper)', borderRadius: 12, width: 500, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Tiếp nhận hồ sơ (BM9)</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, fontSize: 13, background: 'var(--paper-2)', padding: 16, borderRadius: 8 }}>
            <div style={{ color: 'var(--ink-3)', fontWeight: 500 }}>Mã hồ sơ:</div>
            <div className="mono" style={{ fontWeight: 600 }}>{registration.id}</div>
            
            <div style={{ color: 'var(--ink-3)', fontWeight: 500 }}>Vận động viên:</div>
            <div style={{ fontWeight: 600 }}>{registration.athleteName}</div>

            <div style={{ color: 'var(--ink-3)', fontWeight: 500 }}>CLB / Đoàn:</div>
            <div style={{ fontWeight: 600 }}>{registration.teamName}</div>
            
            <div style={{ color: 'var(--ink-3)', fontWeight: 500 }}>Hạng mục:</div>
            <div style={{ fontWeight: 600 }}>{registration.eventName}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Tình trạng hồ sơ ban đầu *</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: status === 'complete' ? '1.5px solid oklch(0.42 0.14 160)' : '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', background: status === 'complete' ? 'oklch(0.93 0.06 160)' : 'var(--paper)' }}>
                <input type="radio" name="status" checked={status === 'complete'} onChange={() => setStatus('complete')} style={{ margin: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: status === 'complete' ? 'oklch(0.42 0.14 160)' : 'var(--ink)' }}>Đầy đủ (Complete)</div>
                </div>
                <Icon name="check-circle" size={18} color={status === 'complete' ? 'oklch(0.42 0.14 160)' : 'var(--line)'} />
              </label>

              <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px', border: status === 'incomplete' ? '1.5px solid var(--amber)' : '1px solid var(--line)', borderRadius: 8, cursor: 'pointer', background: status === 'incomplete' ? 'oklch(0.97 0.05 80)' : 'var(--paper)' }}>
                <input type="radio" name="status" checked={status === 'incomplete'} onChange={() => setStatus('incomplete')} style={{ margin: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: status === 'incomplete' ? 'var(--amber)' : 'var(--ink)' }}>Thiếu giấy tờ</div>
                </div>
                <Icon name="alert-triangle" size={18} color={status === 'incomplete' ? 'var(--amber)' : 'var(--line)'} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>
              Ghi chú {isNotesRequired && <span style={{ color: 'var(--accent)' }}>* (Bắt buộc ghi rõ giấy tờ thiếu)</span>}
            </label>
            <textarea 
              value={notes} onChange={e => setNotes(e.target.value)} 
              rows={3} 
              style={{
                padding: '10px 12px', borderRadius: 6,
                border: (isNotesRequired && !notes.trim()) ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
                background: 'var(--paper)', color: 'var(--ink)', fontSize: 13, outline: 'none', resize: 'none'
              }} 
              placeholder={isNotesRequired ? 'Ví dụ: Thiếu CCCD photo, Giấy khám sức khoẻ...' : 'Nhập ghi chú thêm...'}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Người tiếp nhận: <strong>{currentUser}</strong></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button type="submit" disabled={!status || loading || (isNotesRequired && !notes.trim())} style={{ 
                padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, 
                cursor: (!status || loading || (isNotesRequired && !notes.trim())) ? 'default' : 'pointer',
                opacity: (!status || loading || (isNotesRequired && !notes.trim())) ? 0.5 : 1 
              }}>
                {loading ? 'Đang lưu...' : 'Xác nhận tiếp nhận'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
