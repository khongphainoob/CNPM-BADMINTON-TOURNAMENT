import { useState, useEffect } from 'react'
import { participationApi, tournamentApi } from '../../data/api'
import { useStore } from '../../data/store'
import Icon from '../../components/shared/Icon'
import { useToast } from '../../components/shared/Toast'
import { btnGhost } from '../../components/shared/tokens'
import { CATEGORIES } from '../../data/constants'

export default function EventParticipantsView() {
  const { tournament } = useStore()
  const { toast } = useToast()
  
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | number>('')
  
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Load events
  useEffect(() => {
    if (!tournament?.id) return
    tournamentApi.listEvents(tournament.id).then(res => {
      setEvents(res || [])
      if (res && res.length > 0) setSelectedEventId(res[0].id)
    }).catch(err => console.error(err))
  }, [tournament?.id])

  // Load participants for selected event
  useEffect(() => {
    if (!selectedEventId) {
      setParticipants([])
      return
    }
    setLoading(true)
    participationApi.listParticipants(selectedEventId, { limit: 200 })
      .then(res => {
        setParticipants(res.data || [])
      })
      .catch(err => {
        console.error(err)
        toast('Lỗi tải danh sách vận động viên', 'error')
      })
      .finally(() => setLoading(false))
  }, [selectedEventId])

  const selectedEvent = events.find(e => e.id === Number(selectedEventId)) || events.find(e => e.id === selectedEventId)
  const isDoubles = selectedEvent?.category_code?.includes('D') // e.g. MD, WD, XD

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* Event Selector */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {events.map(ev => {
          const isActive = String(ev.id) === String(selectedEventId)
          return (
            <button
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: isActive ? 'var(--ink)' : 'var(--line)',
                background: isActive ? 'var(--ink)' : 'var(--paper)',
                color: isActive ? 'white' : 'var(--ink-2)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <span className="mono" style={{ opacity: 0.7 }}>{ev.category_code}</span>
              {ev.label || CATEGORIES[ev.category_code]}
            </button>
          )
        })}
        {events.length === 0 && <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>Không có nội dung nào trong giải này.</div>}
      </div>

      {/* Participants List */}
      {selectedEventId && (
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper-2)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15 }}>Danh sách thi đấu</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                {participants.length} {isDoubles ? 'cặp/đội' : 'vận động viên'} đã đăng ký hợp lệ
              </div>
            </div>
            <div>
              <button style={{...btnGhost, fontSize: 12, padding: '6px 12px'}}>
                <Icon name="download" size={14} /> Xuất danh sách
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Đang tải...</div>
            ) : participants.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Chưa có đăng ký nào.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--paper-2)', position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--line-2)', fontWeight: 600, color: 'var(--ink-2)', width: 60 }}>#</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--line-2)', fontWeight: 600, color: 'var(--ink-2)' }}>Vận động viên 1</th>
                    {isDoubles && <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--line-2)', fontWeight: 600, color: 'var(--ink-2)' }}>Vận động viên 2</th>}
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--line-2)', fontWeight: 600, color: 'var(--ink-2)' }}>Câu lạc bộ</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--line-2)', fontWeight: 600, color: 'var(--ink-2)', width: 80 }}>Hạt giống</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--line-2)', fontWeight: 600, color: 'var(--ink-2)' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, index) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--ink-3)' }}>{index + 1}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500 }}>{p.player_name || 'Đang cập nhật'}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.player_code}</div>
                      </td>
                      {isDoubles && (
                        <td style={{ padding: '12px 16px' }}>
                          {p.partner_name ? (
                            <>
                              <div style={{ fontWeight: 500 }}>{p.partner_name}</div>
                              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.partner_code}</div>
                            </>
                          ) : (
                            <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>Không có</span>
                          )}
                        </td>
                      )}
                      <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>Đang cập nhật CLB</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {p.seed ? (
                          <span style={{ background: 'var(--paper-3)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{p.seed}</span>
                        ) : (
                          <span style={{ color: 'var(--line)' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button style={{ ...btnGhost, padding: '4px 8px', fontSize: 12 }}>Sửa hạt giống</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
