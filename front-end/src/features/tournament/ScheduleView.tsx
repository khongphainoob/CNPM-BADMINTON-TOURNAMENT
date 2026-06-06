import React, { useState, useEffect } from 'react'
import { competitionApi, tournamentApi } from '../../data/api'
import { useStore } from '../../data/store'
import { CATEGORIES } from '../../data/constants'
import Icon from '../../components/shared/Icon'
import Modal from '../../components/shared/Modal'
import { btnPrimary, btnGhost } from '../../components/shared/tokens'
import { useToast } from '../../components/shared/Toast'

export function ScheduleView() {
  const { tournament } = useStore()
  const { toast } = useToast()
  
  const [courts, setCourts] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [day, setDay] = useState(0)
  const [catFilter, setCatFilter] = useState<string>('all')
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [selectedCourt, setSelectedCourt] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState(60)
  
  // Generate list of dates from tournament start to end
  const dates = React.useMemo(() => {
    if (!tournament?.start || !tournament?.end) {
      const today = new Date()
      return [0, 1, 2].map(offset => {
        const d = new Date(today)
        d.setDate(d.getDate() + offset)
        return d
      })
    }
    const start = new Date(tournament.start)
    const end = new Date(tournament.end)
    const list: Date[] = []
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      const today = new Date()
      return [0, 1, 2].map(offset => {
        const d = new Date(today)
        d.setDate(d.getDate() + offset)
        return d
      })
    }
    
    const curr = new Date(start)
    while (curr <= end) {
      list.push(new Date(curr))
      curr.setDate(curr.getDate() + 1)
    }
    return list
  }, [tournament?.start, tournament?.end])

  const days = React.useMemo(() => {
    return dates.map((d, i) => {
      const formatted = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      return `Ngày ${i + 1} (${formatted})`
    })
  }, [dates])

  const slots = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

  const fetchData = async () => {
    if (!tournament?.id) return
    setLoading(true)
    try {
      const [cRes, mRes] = await Promise.all([
        tournamentApi.listCourts(tournament.id),
        competitionApi.listMatches()
      ])
      setCourts(cRes || [])
      setMatches(mRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tournament?.id])

  const handleOpenSchedule = (m: any) => {
    setSelectedMatch(m)
    setSelectedCourt(m.court_id || (courts.length > 0 ? courts[0].id : ''))
    // Basic format for datetime-local input: YYYY-MM-DDThh:mm
    const now = new Date()
    now.setMinutes(0, 0, 0)
    setScheduledAt(m.scheduled_at ? new Date(m.scheduled_at).toISOString().slice(0, 16) : now.toISOString().slice(0, 16))
    setEstimatedDuration(m.estimated_duration_mins || 60)
    setScheduleModalOpen(true)
  }

  const handleSaveSchedule = async () => {
    if (!selectedMatch || !selectedCourt || !scheduledAt) return
    try {
      await competitionApi.scheduleMatch(selectedMatch.id, {
        courtId: Number(selectedCourt),
        scheduledAt: new Date(scheduledAt).toISOString(),
        estimatedDurationMins: estimatedDuration
      })
      toast('Cập nhật lịch thi đấu thành công')
      setScheduleModalOpen(false)
      fetchData()
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi xếp lịch', 'error')
    }
  }

  const handleDragStart = (e: React.DragEvent, match: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ matchId: match.id, matchDuration: match.estimated_duration_mins || 60 }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = async (e: React.DragEvent, courtId: string | number, slotIndex: number) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (!dataStr) return
      const data = JSON.parse(dataStr)
      if (!data.matchId) return

      const timeStr = slots[slotIndex]
      const selectedDate = dates[day] || new Date()
      const now = new Date(selectedDate)
      const [hh, mm] = timeStr.split(':')
      now.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0)
      
      setLoading(true)
      await competitionApi.scheduleMatch(data.matchId, {
        courtId: Number(courtId),
        scheduledAt: now.toISOString(),
        estimatedDurationMins: data.matchDuration || 60
      })
      toast('Cập nhật lịch thi đấu thành công')
      fetchData()
    } catch (err: any) {
      toast(err.response?.data?.error?.message || 'Lỗi xếp lịch', 'error')
      setLoading(false)
    }
  }

  // Convert matches to blocks for the timeline (filtered by selected date)
  const selectedDate = dates[day]
  const blocks = matches.filter(m => {
    if (m.status === 'cancelled') return false
    if (!m.scheduled_at) return false
    const matchDate = new Date(m.scheduled_at)
    return selectedDate &&
           matchDate.getFullYear() === selectedDate.getFullYear() &&
           matchDate.getMonth() === selectedDate.getMonth() &&
           matchDate.getDate() === selectedDate.getDate()
  }).map(m => {
    let startIdx = 0
    if (m.scheduled_at) {
      const d = new Date(m.scheduled_at)
      startIdx = slots.findIndex(s => s.startsWith(d.getHours().toString().padStart(2, '0')))
      if (startIdx === -1) startIdx = 0
    }
    
    return {
      match: m,
      court: m.court_id,
      start: startIdx,
      span: (m.estimated_duration_mins || 60) / 60,
      cat: m.category_code,
      label: `${m.round} · #${m.id}`,
      status: m.status === 'completed' ? 'done' : m.status === 'live' ? 'live' : 'scheduled'
    }
  })

  const visibleBlocks = catFilter === 'all' ? blocks : blocks.filter(b => b.cat === catFilter)

  const colBg: Record<string, string> = {
    done: 'var(--paper-3)', live: 'var(--accent)', scheduled: 'var(--paper-2)',
    maintenance: 'repeating-linear-gradient(45deg, var(--paper-3) 0 6px, var(--paper-2) 6px 12px)',
  }

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      {scheduleModalOpen && (
        <Modal onClose={() => setScheduleModalOpen(false)}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Xếp lịch trận #{selectedMatch?.id}</h2>
          <div style={{ marginBottom: 12 }}>
            <label className="caps" style={{ display: 'block', marginBottom: 6 }}>Chọn Sân</label>
            <select className="input" value={selectedCourt} onChange={e => setSelectedCourt(e.target.value)}>
              {courts.map(c => <option key={c.id} value={c.id}>{c.label} ({c.floor})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="caps" style={{ display: 'block', marginBottom: 6 }}>Thời gian</label>
              <input type="datetime-local" className="input" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            </div>
            <div style={{ width: 120 }}>
              <label className="caps" style={{ display: 'block', marginBottom: 6 }}>Thời lượng (phút)</label>
              <input type="number" className="input" value={estimatedDuration} onChange={e => setEstimatedDuration(Number(e.target.value))} step="15" min="15" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button style={btnGhost} onClick={() => setScheduleModalOpen(false)}>Hủy</button>
            <button style={btnPrimary} onClick={handleSaveSchedule}>Lưu lịch</button>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="caps">Lịch thi đấu chi tiết</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
            Điều phối · {courts.length} sân · {matches.length} trận
          </h1>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 6 }}>
          <select className="input" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 'auto', padding: '6px 10px' }}>
            <option value="all">Tất cả hạng mục</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }} className="no-scrollbar">
        {days.map((d, i) => (
          <button key={d} onClick={() => setDay(i)} style={{
            padding: '7px 14px', borderRadius: 6,
            border: '1px solid ' + (day === i ? 'var(--ink)' : 'var(--line)'),
            background: day === i ? 'var(--ink)' : 'var(--paper)',
            color: day === i ? 'white' : 'var(--ink-2)', fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{d}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden' }}>
        {/* Unscheduled Matches Sidebar */}
        <div style={{ width: 260, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)', fontWeight: 600, fontSize: 13 }}>
            Trận chưa xếp lịch ({matches.filter(m => !m.court_id).length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matches.filter(m => !m.court_id).map(m => (
              <div 
                key={m.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, m)}
                onClick={() => handleOpenSchedule(m)} 
                style={{
                  background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px',
                  fontSize: 12, cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div className="caps" style={{ opacity: 0.7, fontSize: 10 }}>{m.category_code} · {m.round}</div>
                <div style={{ fontWeight: 500, marginTop: 4 }}>Trận #{m.id}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 4 }}>Kéo thả hoặc nhấp để xếp lịch</div>
              </div>
            ))}
            {matches.filter(m => !m.court_id).length === 0 && <div style={{ padding: 16, color: 'var(--ink-3)', textAlign: 'center', fontSize: 12 }}>Không có trận trống</div>}
          </div>
        </div>

        {/* Timeline Grid */}
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `90px repeat(${slots.length}, 1fr)`, borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
            <div/>
            {slots.map(s => (
              <div key={s} className="mono" style={{ padding: '6px 4px', fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center', borderLeft: '1px solid var(--line-2)' }}>{s}</div>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar">
            {courts.map(c => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: `90px repeat(${slots.length}, 1fr)`, borderBottom: '1px solid var(--line-2)', minHeight: 60, position: 'relative' }}>
                <div style={{ padding: '12px', fontSize: 12, fontWeight: 600, borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--paper-2)' }}>
                  <div>{c.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 400 }}>{c.floor}</div>
                </div>
                {slots.map((_, i) => (
                  <div 
                    key={i} 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, c.id, i)}
                    style={{ borderLeft: '1px solid var(--line-2)', transition: 'background 0.2s', cursor: 'crosshair' }}
                    className="drop-zone"
                  />
                ))}
                {c.status === 'maintenance' && (
                  <div style={{ position: 'absolute', left: 90, right: 0, top: 0, bottom: 0, background: colBg.maintenance, display: 'flex', alignItems: 'center', paddingLeft: 12, color: 'var(--ink-3)', fontSize: 11.5, fontStyle: 'italic' }}>
                    Bảo trì — không xếp lịch
                  </div>
                )}
                {visibleBlocks.filter(b => b.court === c.id).map((b, i) => {
                  const width = `calc((100% - 90px) / ${slots.length} * ${b.span})`
                  const left  = `calc(90px + (100% - 90px) / ${slots.length} * ${b.start})`
                  return (
                    <div key={i} onClick={() => handleOpenSchedule(b.match)} style={{
                      position: 'absolute', left, width, top: 5, bottom: 5,
                      background: colBg[b.status], color: b.status === 'live' ? 'white' : 'var(--ink)',
                      borderRadius: 4, padding: '6px 8px', fontSize: 11, cursor: 'pointer',
                      border: '1px solid var(--line)',
                      display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden',
                    }}>
                      <div className="mono" style={{ fontSize: 9.5, opacity: 0.75 }}>{b.cat}</div>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
