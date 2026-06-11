import { useState, useMemo } from 'react'
import Icon from '../../components/shared/Icon'
import { useStore } from '../../data/store'
import { useAuth } from '../../data/auth'

// Removed Mock Data

type Props = {
  matchId: string
  matchDetails: {
    title: string
    date: string
    time: string
    court: string
    playersClubs: string[]
  }
  onClose: () => void
  onSave: (data: any) => void
}

export default function MatchAssignmentModal({ matchId, matchDetails, onClose, onSave }: Props) {
  const { session } = useAuth()
  const { referees } = useStore()
  const [refId, setRefId] = useState('')
  const [role, setRole] = useState('main_referee')
  const [status, setStatus] = useState('pending')
  const [notes, setNotes] = useState('')

  const selectedRef = useMemo(() => referees.find(r => r.id === refId), [refId, referees])

  // Validations
  const isOverload = selectedRef && selectedRef.today >= 4
  const isConflictClub = selectedRef && false // We don't have club mapping for referees in store yet
  
  // Fake validation for "Hoán đổi < 15 phút"
  const matchTime = new Date(`${matchDetails.date}T${matchDetails.time}`)
  const isTooLate = (matchTime.getTime() - new Date().getTime()) < 15 * 60 * 1000 && matchTime.getTime() > new Date().getTime()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRef) return
    onSave({
      matchId,
      refereeId: selectedRef.id,
      role,
      status,
      notes
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--paper)', borderRadius: 12, width: 600, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Phân công Trọng tài (BM16)</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Mã phân công: ASG-{Math.random().toString(36).substring(2,8).toUpperCase()}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--paper-2)', padding: 16, borderRadius: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Trận đấu</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{matchDetails.title}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Thời gian & Địa điểm</span>
              <span style={{ fontSize: 14 }}>{matchDetails.date} {matchDetails.time} · Sân {matchDetails.court}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Chọn Trọng tài *</label>
            <select 
              value={refId} onChange={e => setRefId(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
              required
            >
              <option value="">-- Nhập mã hoặc chọn Trọng tài --</option>
              {referees.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.id}) - {r.cert}</option>
              ))}
            </select>
          </div>

          {selectedRef && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 12px', background: 'var(--paper-2)', borderRadius: 6, flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Chứng chỉ</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedRef.cert}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--paper-2)', borderRadius: 6, flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Số trận đã phân hôm nay</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedRef.today}/4</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--paper-2)', borderRadius: 6, flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Đơn vị / CLB</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{(selectedRef as any).club || 'Trọng tài Liên đoàn'}</div>
              </div>
            </div>
          )}

          {/* Cảnh báo (Warnings) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isOverload && (
              <div style={{ padding: '10px 14px', background: 'var(--amber-soft)', color: 'var(--amber)', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alert-triangle" size={16} /> Trọng tài đã đạt giới hạn 4 trận/ngày.
              </div>
            )}
            {isConflictClub && (
              <div style={{ padding: '10px 14px', background: 'oklch(0.96 0.04 25)', color: 'var(--accent)', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alert-triangle" size={16} /> Cảnh báo: Trọng tài cùng đơn vị ({(selectedRef as any)?.club || 'Trọng tài Liên đoàn'}) với VĐV tham gia.
              </div>
            )}
            {isTooLate && (
              <div style={{ padding: '10px 14px', background: 'var(--amber-soft)', color: 'var(--amber)', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alert-triangle" size={16} /> Không thể hoán đổi trọng tài trong vòng 15 phút trước giờ thi đấu.
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Vai trò</label>
              <select 
                value={role} onChange={e => setRole(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
              >
                <option value="main_referee">Trọng tài chính (Main Referee)</option>
                <option value="line_judge">Trọng tài biên (Line Judge)</option>
                <option value="service_judge">Trọng tài giao cầu (Service Judge)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Trạng thái</label>
              <select 
                value={status} onChange={e => setStatus(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
              >
                <option value="pending">Chờ xác nhận (Pending)</option>
                <option value="approved">Đã duyệt (Approved)</option>
                <option value="cancelled">Huỷ (Cancelled)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Ghi chú</label>
            <textarea 
              value={notes} onChange={e => setNotes(e.target.value)} 
              rows={2} 
              style={{
                padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)',
                background: 'var(--paper)', color: 'var(--ink)', fontSize: 14, outline: 'none', resize: 'none'
              }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Người duyệt: <strong>{session?.name || 'Admin'}</strong></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button type="submit" disabled={!selectedRef || isTooLate} style={{ 
                padding: '8px 20px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, 
                cursor: (!selectedRef || isTooLate) ? 'default' : 'pointer',
                opacity: (!selectedRef || isTooLate) ? 0.5 : 1 
              }}>
                Lưu phân công
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
