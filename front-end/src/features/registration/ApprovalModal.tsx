import { useState } from 'react'
import Icon from '../../components/shared/Icon'

// ---- BM14: Registration Approval Form ----

type Registration = {
  id: string
  athleteName: string
  eventName: string
  cccd: string
  status: 'pending' | 'approved' | 'rejected' | 'supplement_required'
  submittedAt: string
}

type Props = {
  registration: Registration
  currentUser: string
  onSave: (decision: 'approve' | 'reject' | 'request_supplement', reason?: string) => void
  onClose: () => void
  loading?: boolean
}

export default function ApprovalModal({ registration, currentUser, onSave, onClose, loading }: Props) {
  const [decision, setDecision] = useState<'approve' | 'reject' | 'request_supplement' | null>(null)
  const [reason, setReason] = useState('')

  const isReasonRequired = decision === 'reject' || decision === 'request_supplement'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!decision) return
    if (isReasonRequired && !reason.trim()) {
      alert('Vui lòng nhập lý do')
      return
    }
    onSave(decision, reason)
  }

  const DECISION_OPTS = [
    { id: 'approve', label: 'Phê duyệt', color: 'oklch(0.42 0.14 160)', bg: 'oklch(0.93 0.06 160)' },
    { id: 'request_supplement', label: 'Yêu cầu bổ sung', color: 'oklch(0.48 0.14 70)', bg: 'oklch(0.95 0.06 70)' },
    { id: 'reject', label: 'Từ chối', color: 'oklch(0.50 0.16 25)', bg: 'oklch(0.96 0.04 25)' }
  ] as const

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--paper)', borderRadius: 12, width: 500, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Duyệt hồ sơ (BM14)</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, fontSize: 13, background: 'var(--paper-2)', padding: 16, borderRadius: 8 }}>
            <div style={{ color: 'var(--ink-3)', fontWeight: 500 }}>Mã hồ sơ:</div>
            <div className="mono" style={{ fontWeight: 600 }}>{registration.id}</div>
            
            <div style={{ color: 'var(--ink-3)', fontWeight: 500 }}>Vận động viên:</div>
            <div style={{ fontWeight: 600 }}>{registration.athleteName} <span style={{ color: 'var(--ink-3)' }}>({registration.cccd})</span></div>
            
            <div style={{ color: 'var(--ink-3)', fontWeight: 500 }}>Hạng mục:</div>
            <div style={{ fontWeight: 600 }}>{registration.eventName}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Quyết định duyệt *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {DECISION_OPTS.map(opt => (
                <button
                  key={opt.id} type="button" onClick={() => setDecision(opt.id)}
                  style={{
                    padding: '10px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    borderColor: decision === opt.id ? opt.color : 'var(--line)',
                    background: decision === opt.id ? opt.bg : 'var(--paper)',
                    color: decision === opt.id ? opt.color : 'var(--ink-2)'
                  }}
                >
                  <Icon name={opt.id === 'approve' ? 'check-circle' : opt.id === 'reject' ? 'x-circle' : 'alert-circle'} size={20} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {decision && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, animation: 'fadeIn 0.2s' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>
                Lý do {isReasonRequired && <span style={{ color: 'var(--accent)' }}>* (Bắt buộc)</span>}
              </label>
              <textarea 
                value={reason} onChange={e => setReason(e.target.value)} 
                rows={3} 
                style={{
                  padding: '10px 12px', borderRadius: 6,
                  border: (isReasonRequired && !reason.trim()) ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
                  background: 'var(--paper)', color: 'var(--ink)', fontSize: 13, outline: 'none', resize: 'none'
                }} 
                placeholder={isReasonRequired ? 'Nhập lý do...' : 'Ghi chú thêm (không bắt buộc)'}
              />
              {isReasonRequired && (
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Hệ thống sẽ gửi email tự động kèm lý do này cho VĐV.</div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Người duyệt: <strong>{currentUser}</strong></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button type="submit" disabled={!decision || loading || (isReasonRequired && !reason.trim())} style={{ 
                padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, 
                cursor: (!decision || loading || (isReasonRequired && !reason.trim())) ? 'default' : 'pointer',
                opacity: (!decision || loading || (isReasonRequired && !reason.trim())) ? 0.5 : 1 
              }}>
                {loading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
