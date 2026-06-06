import { useState } from 'react'

// ---- BM12: Tournament Status Update Modal ----

const STATUS_MAP = {
  draft: { label: 'Bản nháp', color: 'var(--ink-2)', bg: 'var(--paper-2)' },
  open_registration: { label: 'Mở đăng ký', color: 'oklch(0.42 0.14 160)', bg: 'oklch(0.93 0.06 160)' },
  ongoing: { label: 'Đang thi đấu', color: 'oklch(0.45 0.14 250)', bg: 'oklch(0.95 0.04 250)' },
  finished: { label: 'Kết thúc', color: 'oklch(0.45 0.16 300)', bg: 'oklch(0.92 0.06 300)' },
  cancelled: { label: 'Đã huỷ', color: 'oklch(0.50 0.16 25)', bg: 'oklch(0.96 0.04 25)' }
}

type StatusType = keyof typeof STATUS_MAP

type Props = {
  tournament: { id: string | number; name: string; status: StatusType }
  currentUser: string
  onSave: (newStatus: StatusType, reason?: string) => void
  onClose: () => void
  loading?: boolean
}

export default function TournamentStatusModal({ tournament, currentUser, onSave, onClose, loading }: Props) {
  const [newStatus, setNewStatus] = useState<StatusType | ''>('')
  const [reason, setReason] = useState('')

  // State machine logic
  const getAvailableNextStates = (current: StatusType): StatusType[] => {
    const states: StatusType[] = []
    if (current === 'draft') states.push('open_registration')
    if (current === 'open_registration') states.push('ongoing')
    if (current === 'ongoing') states.push('finished')
    
    if (current !== 'cancelled' && current !== 'finished') {
      states.push('cancelled')
    }
    return states
  }

  const availableStates = getAvailableNextStates(tournament.status)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus) return
    if (newStatus === 'cancelled' && !reason.trim()) {
      alert('Vui lòng nhập lý do huỷ giải đấu')
      return
    }
    onSave(newStatus, reason)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--paper)', borderRadius: 12, width: 480, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Cập nhật trạng thái giải đấu</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 8, fontSize: 13 }}>
            <div style={{ color: 'var(--ink-2)' }}>Mã giải đấu:</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{tournament.id}</div>
            
            <div style={{ color: 'var(--ink-2)' }}>Tên giải đấu:</div>
            <div style={{ fontWeight: 600 }}>{tournament.name}</div>
            
            <div style={{ color: 'var(--ink-2)', marginTop: 4 }}>Trạng thái hiện tại:</div>
            <div>
              <span style={{ 
                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                color: STATUS_MAP[tournament.status].color, background: STATUS_MAP[tournament.status].bg 
              }}>
                {STATUS_MAP[tournament.status].label}
              </span>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Trạng thái chuyển sang *</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as StatusType)} style={inputStyle(false)}>
              <option value="" disabled>-- Chọn trạng thái tiếp theo --</option>
              {availableStates.map(st => (
                <option key={st} value={st}>{STATUS_MAP[st].label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>
              Lý do thay đổi {newStatus === 'cancelled' && <span style={{ color: 'var(--accent)' }}>* (Bắt buộc khi huỷ)</span>}
            </label>
            <textarea 
              value={reason} onChange={e => setReason(e.target.value)} 
              rows={3} style={{...inputStyle(newStatus === 'cancelled' && !reason.trim()), resize: 'none'}} 
              placeholder="Nhập lý do thay đổi..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Người thực hiện: <strong>{currentUser}</strong></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button type="submit" disabled={!newStatus || loading} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: (!newStatus || loading) ? 'default' : 'pointer', opacity: (!newStatus || loading) ? 0.5 : 1 }}>
                {loading ? 'Đang cập nhật...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputStyle = (error: boolean) => ({
  padding: '8px 12px', borderRadius: 6,
  border: error ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
  background: 'var(--paper)', color: 'var(--ink)', fontSize: 13, outline: 'none'
})
