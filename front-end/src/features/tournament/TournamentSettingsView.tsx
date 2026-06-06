import { useState, useEffect } from 'react'
import TournamentForm from './TournamentForm'
import EventForm from './EventForm'
import FormatForm from './FormatForm'
import TournamentStatusModal from './TournamentStatusModal'
import { tournamentApi, competitionApi } from '../../data/api'
import { useStore } from '../../data/store'
import Icon from '../../components/shared/Icon'

export default function TournamentSettingsView() {
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'formats'>('info')
  const [tournament, setTournament] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [resetEventIds, setResetEventIds] = useState<string[]>([])
  
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [addingEvent, setAddingEvent] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  
  const activeTournamentId = useStore(state => state.activeTournamentId)
  
  const [loading, setLoading] = useState(true)

  const fetchTournament = async () => {
    if (!activeTournamentId) return
    setLoading(true)
    try {
      const res = await (tournamentApi as any).getById(activeTournamentId)
      if (res) setTournament(res)
      
      const evs = await tournamentApi.listEvents(activeTournamentId)
      if (evs) setEvents(evs)

      const mtResult = await competitionApi.listMatches({ tournament_id: activeTournamentId, limit: 100 })
      setMatches(mtResult.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournament()
  }, [])

  const handleSaveTournament = async (data: any) => {
    if (!activeTournamentId) return
    try {
      console.log('--- FORM SUBMIT DATA (BM10 - Update Tournament) ---')
      console.log(data)
      
      if (tournament) {
        const payload = {
          code: data.slug,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate
          // TODO: handle organizer, location, description if backend supports it
        }
        console.log('--- MAPPED PAYLOAD ---')
        console.log(payload)

        await (tournamentApi as any).update(activeTournamentId, payload)
        alert('Cập nhật thành công')
      } else {
        // create new
      }
      fetchTournament()
    } catch (e: any) {
      console.error('Lỗi cập nhật giải đấu:', e?.response?.data || e)
      alert('Lỗi cập nhật giải đấu')
    }
  }

  const handleSaveStatus = async (status: string, reason?: string) => {
    if (!activeTournamentId) return
    try {
      await (tournamentApi as any).changeStatus(activeTournamentId, status, reason)
      setStatusModalOpen(false)
      setTournament((prev: any) => prev ? { ...prev, status: status } : null)
    } catch (e) {
      alert('Lỗi cập nhật trạng thái')
    }
  }

  const handleSaveEvent = async (data: any) => {
    if (!activeTournamentId) return
    try {
      console.log('--- EVENT FORM SUBMIT DATA (BM7) ---')
      console.log(data)

      if (editingEvent) {
        await tournamentApi.updateEvent(activeTournamentId, editingEvent.id, data)
        alert('Cập nhật hạng mục thành công')
      } else {
        await tournamentApi.createEvent(activeTournamentId, data)
      }
      setAddingEvent(false)
      setEditingEvent(null)
      fetchTournament()
    } catch (e: any) {
      console.error('Lỗi lưu hạng mục:', e?.response?.data || e)
      alert('Lỗi lưu hạng mục')
    }
  }

  const handleSaveFormat = async (eventId: string, data: any) => {
    if (!activeTournamentId) return
    try {
      await tournamentApi.updateEvent(activeTournamentId, eventId, {
        maxSets: data.sets,
        pointsPerSet: data.pointsPerSet
      })
      alert('Lưu cấu hình thể thức thành công!')
      setResetEventIds(prev => prev.filter(id => id !== String(eventId)))
      fetchTournament()
    } catch (e: any) {
      console.error(e)
      alert('Lỗi lưu thể thức: ' + (e.response?.data?.error?.message || e.message))
    }
  }

  const handleGenerateBracket = async (eventId: string) => {
    try {
      await competitionApi.generateDraw(eventId)
      alert('Tạo sơ đồ thi đấu thành công!')
      setResetEventIds(prev => prev.filter(id => id !== String(eventId)))
      fetchTournament()
    } catch (e: any) {
      console.error(e)
      alert('Lỗi tạo sơ đồ: ' + (e.response?.data?.error?.message || e.message))
    }
  }

  if (loading) return <div style={{ padding: 24, color: 'var(--ink-2)' }}>Đang tải...</div>

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            Cấu hình giải đấu
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            Quản lý thông tin, hạng mục và thể thức thi đấu
          </div>
        </div>

        {tournament && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>Trạng thái:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: tournament.status === 'draft' ? 'var(--ink)' : 'oklch(0.42 0.14 160)' }}>
                {tournament.status === 'draft' ? 'Bản nháp' : tournament.status}
              </span>
            </div>
            <button onClick={() => setStatusModalOpen(true)} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Cập nhật trạng thái
            </button>
          </div>
        )}
      </div>

      {statusModalOpen && tournament && (
        <TournamentStatusModal
          tournament={tournament}
          currentUser="Ban tổ chức"
          onClose={() => setStatusModalOpen(false)}
          onSave={handleSaveStatus}
        />
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {[
          { id: 'info', label: 'Thông tin chung (BM10)' },
          { id: 'events', label: 'Hạng mục thi đấu (BM7)' },
          { id: 'formats', label: 'Thể thức (BM11)' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            color: activeTab === tab.id ? 'var(--ink)' : 'var(--ink-2)',
            borderBottom: activeTab === tab.id ? '2px solid var(--ink)' : '2px solid transparent',
            marginBottom: -1
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800 }}>
        {activeTab === 'info' && (
          <TournamentForm
            initialData={tournament}
            onSave={handleSaveTournament}
            onCancel={() => {}} // reload or ignore
          />
        )}

        {activeTab === 'events' && (
          <div>
            {!addingEvent && !editingEvent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setAddingEvent(true)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="plus" size={14} /> Thêm hạng mục
                  </button>
                </div>
                
                {events.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', background: 'var(--paper)', border: '1px dashed var(--line)', borderRadius: 8 }}>
                    Chưa có hạng mục thi đấu nào.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {events.map(ev => (
                      <div key={ev.id} style={{ padding: 16, borderRadius: 8, background: 'var(--paper)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{ev.label || ev.category_label}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>
                            {ev.content_type === 'singles' ? 'Đánh đơn' : ev.content_type === 'doubles' ? 'Đánh đôi' : 'Đôi nam nữ'} &middot; {ev.gender === 'male' || ev.gender === 'M' ? 'Nam' : ev.gender === 'female' || ev.gender === 'F' ? 'Nữ' : 'Hỗn hợp'} &middot; Tối đa {ev.max_participants} người
                          </div>
                        </div>
                        <button onClick={() => setEditingEvent(ev)} style={{ padding: '6px 12px', borderRadius: 5, border: '1px solid var(--line)', background: 'transparent', fontSize: 12, cursor: 'pointer' }}>
                          Sửa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EventForm
                initialData={editingEvent}
                tournamentName={tournament?.name}
                onSave={handleSaveEvent}
                onCancel={() => { setAddingEvent(false); setEditingEvent(null) }}
              />
            )}
          </div>
        )}

        {activeTab === 'formats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {events.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', background: 'var(--paper)', border: '1px dashed var(--line)', borderRadius: 8 }}>
                Vui lòng tạo hạng mục thi đấu trước khi cấu hình thể thức.
              </div>
            ) : (
              events.map(ev => {
                const isReset = resetEventIds.includes(String(ev.id))
                const eventMatches = matches.filter(m => String(m.event_id) === String(ev.id))
                const hasBracket = eventMatches.length > 0 && !isReset
                const status = (hasBracket && !isReset) ? 'confirmed' : 'draft'

                return (
                  <FormatForm
                    key={ev.id}
                    eventId={String(ev.id)}
                    eventName={ev.label || ev.category_label}
                    tournamentName={tournament?.name}
                    initialData={{
                      formatType: 'single_elimination',
                      sets: ev.max_sets || 3,
                      pointsPerSet: ev.points_per_set || 21
                    }}
                    status={status}
                    hasBracket={hasBracket}
                    onSaveDraft={(d) => handleSaveFormat(String(ev.id), d)}
                    onConfirm={(d) => handleSaveFormat(String(ev.id), d)}
                    onGenerateBracket={() => handleGenerateBracket(String(ev.id))}
                    onReset={() => setResetEventIds(prev => [...prev, String(ev.id)])}
                  />
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
