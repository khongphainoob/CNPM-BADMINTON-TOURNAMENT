import React, { useState, useEffect } from 'react'
import { useAuth } from '../../data/auth'
import { tournamentApi } from '../../data/api'
import Icon from '../../components/shared/Icon'

export default function SystemOverviewView() {
  const { session } = useAuth()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const params = session?.role === 'btc' ? { ownerId: session.userId } : undefined
        const res = await tournamentApi.list(params)
        setTournaments(res)
      } catch (err) {
        console.error('Failed to fetch tournaments', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [session])

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--ink-2)' }}>Đang tải dữ liệu tổng quan...</div>
  }

  // Calculate stats based on tournaments
  const totalTournaments = tournaments.length
  const liveCount = tournaments.filter(t => t.status === 'live').length
  const finishedCount = tournaments.filter(t => t.status === 'finished').length
  const upcomingCount = tournaments.filter(t => t.status === 'upcoming').length

  // Sort tournaments by start date for recent and upcoming
  const sortedTournaments = [...tournaments].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
  const recentTournaments = sortedTournaments.slice(0, 4)
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).slice(0, 3)

  // Current Date for Mini Calendar
  const today = new Date()
  const currentMonth = today.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  // Event days from actual tournaments in current month
  const currentMonthIdx = today.getMonth()
  const eventDays = tournaments.reduce((acc: number[], t) => {
    if (!t.start_date) return acc
    const start = new Date(t.start_date)
    const end = new Date(t.end_date || t.start_date)
    
    let curr = new Date(start)
    while (curr <= end) {
      if (curr.getMonth() === currentMonthIdx && !acc.includes(curr.getDate())) {
        acc.push(curr.getDate())
      }
      curr.setDate(curr.getDate() + 1)
    }
    return acc
  }, [])

  return (
    <div style={{ 
      padding: 32, 
      display: 'grid', 
      gridTemplateColumns: '7fr 3fr', 
      gap: 32,
      maxWidth: 1400,
      margin: '0 auto',
      height: '100%',
      overflowY: 'auto'
    }} className="no-scrollbar">
      
      {/* LEFT COLUMN: Main Stats & Recent Activity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Welcome Section */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
            Chào mừng trở lại, {session?.name || 
              (session?.role === 'btc' ? 'Ban tổ chức' : 
               session?.role === 'admin' ? 'Quản trị viên' : 
               session?.role === 'referee' ? 'Trọng tài' : 'Khán giả')}!
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.5, maxWidth: 600 }}>
            Đây là bảng điều khiển tổng quan dành cho {session?.role === 'btc' ? 'Ban Tổ Chức' : session?.role === 'admin' ? 'Quản trị hệ thống' : 'bạn'}. Tại đây bạn có thể theo dõi thống kê toàn cảnh, hoạt động giải đấu và lịch trình sắp diễn ra.
          </p>
        </div>

        {/* Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <StatCard title="Tổng số Giải" value={totalTournaments} icon="award" color="var(--accent)" />
          <StatCard title="Đang diễn ra" value={liveCount} icon="activity" color="#10b981" />
          <StatCard title="Sắp khởi tranh" value={upcomingCount} icon="calendar" color="#f59e0b" />
          <StatCard title="Đã hoàn tất" value={finishedCount} icon="check" color="var(--ink-3)" />
        </div>

        {/* Recent Activity */}
        <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Giải đấu gần đây</h2>
            <button style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Xem tất cả</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentTournaments.length === 0 ? (
              <div style={{ color: 'var(--ink-3)', fontSize: 14, fontStyle: 'italic' }}>Chưa có giải đấu nào.</div>
            ) : (
              recentTournaments.map(t => (
                <div key={t.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 16, padding: 16, 
                  background: 'var(--paper-2)', borderRadius: 12, border: '1px solid var(--line)' 
                }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 10, background: 'var(--paper)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--line)', color: 'var(--accent)'
                  }}>
                    <Icon name="award" size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15, marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="map-pin" size={12} /> {t.venue_name || 'Chưa cập nhật'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="calendar" size={12} /> {new Date(t.start_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                    background: t.status === 'live' ? 'rgba(16, 185, 129, 0.1)' : t.status === 'finished' ? 'var(--paper-3)' : 'rgba(245, 158, 11, 0.1)',
                    color: t.status === 'live' ? '#10b981' : t.status === 'finished' ? 'var(--ink-3)' : '#f59e0b',
                  }}>
                    {t.status === 'live' ? 'Đang diễn ra' : t.status === 'finished' ? 'Đã kết thúc' : 'Sắp diễn ra'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Calendar & Upcoming */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Mini Calendar Widget */}
        <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', textTransform: 'capitalize' }}>
              {currentMonth}
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--line)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="chevL" size={14} /></button>
              <button style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--line)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="chevR" size={14} /></button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 12 }}>
            <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 4px' }}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {calendarDays.map(day => {
              const isToday = day === today.getDate()
              const hasEvent = eventDays.includes(day)
              return (
                <div key={day} style={{ 
                  aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', fontSize: 13, fontWeight: isToday || hasEvent ? 700 : 500,
                  background: isToday ? 'var(--accent)' : hasEvent ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                  color: isToday ? 'white' : hasEvent ? 'var(--accent)' : 'var(--ink)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => !isToday && (e.currentTarget.style.background = 'var(--paper-3)')}
                onMouseLeave={e => !isToday && (e.currentTarget.style.background = hasEvent ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent')}
                >
                  {day}
                  {hasEvent && !isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: 2 }} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Tournaments Widget */}
        <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: 24, flex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 20 }}>Sắp Khởi Tranh</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcomingTournaments.length === 0 ? (
              <div style={{ color: 'var(--ink-3)', fontSize: 14, fontStyle: 'italic' }}>Không có giải đấu sắp tới.</div>
            ) : (
              upcomingTournaments.map((t, idx) => (
                <div key={t.id} style={{ display: 'flex', gap: 12, borderBottom: idx === upcomingTournaments.length - 1 ? 'none' : '1px solid var(--line)', paddingBottom: idx === upcomingTournaments.length - 1 ? 0 : 16 }}>
                  <div style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minWidth: 50, background: 'var(--paper-2)', borderRadius: 8, padding: '8px 4px', border: '1px solid var(--line)'
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>Tháng {new Date(t.start_date).getMonth() + 1}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{new Date(t.start_date).getDate()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.4 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{t.venue_name || 'Đang cập nhật'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
  return (
    <div style={{ background: 'var(--paper)', borderRadius: 16, border: '1px solid var(--line)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={16} stroke={2.5} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{title}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>{value}</div>
    </div>
  )
}
