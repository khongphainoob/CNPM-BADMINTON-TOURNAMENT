import { useState, useEffect } from 'react'
import { useStore } from '../../data/store'
import { CATEGORIES } from '../../data/constants'
import { useAuth } from '../../data/auth'
import { peopleApi, competitionApi } from '../../data/api'

export default function MyScheduleView() {
  const { session } = useAuth()
  const { upcomingMatches, activeTournamentId } = useStore()
  
  const [loading, setLoading] = useState(false)
  const [playerProfile, setPlayerProfile] = useState<any>(null)
  const [personalMatches, setPersonalMatches] = useState<any[]>([])

  // If role is athlete, fetch their profile and matches
  useEffect(() => {
    if (session?.role === 'athlete' && session?.userId) {
      setLoading(true)
      peopleApi.listPlayers({ userId: session.userId })
        .then(async (res) => {
          if (res.data && res.data.length > 0) {
            const player = res.data[0]
            setPlayerProfile(player)
            
            const matchesRes = await competitionApi.listMatches({ 
              playerId: player.id, 
              tournamentId: activeTournamentId || undefined,
              limit: 50 
            })
            setPersonalMatches(matchesRes.data || [])
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch athlete personal matches', err)
          setLoading(false)
        })
    }
  }, [session, activeTournamentId])

  const isAthlete = session?.role === 'athlete'
  const displayMatches = isAthlete ? personalMatches : upcomingMatches

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink)' }}>
            Lịch trình của tôi
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
            {isAthlete 
              ? `Danh sách các trận đấu sắp tới và đã thi đấu của VĐV ${playerProfile?.name || ''}`
              : 'Danh sách các trận đấu sắp tới bạn tham gia hoặc theo dõi'}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)' }}>
              {['Thời gian', 'Sân', 'Hạng mục', 'Vòng đấu', 'Trận đấu', 'Trạng thái'].map(h => (
                <th key={h} className="caps" style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  Đang tải lịch trình...
                </td>
              </tr>
            ) : displayMatches.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  Không có trận đấu nào.
                </td>
              </tr>
            ) : displayMatches.map((m, i) => {
              if (isAthlete) {
                // Personal match object format from backend API
                const sideA = (m.participants || []).filter((p: any) => p.side === 'A')
                const sideB = (m.participants || []).filter((p: any) => p.side === 'B')
                const pA = sideA.length > 0 ? sideA.map((p: any) => p.player?.name || p.player_name || 'TBD').join(' & ') : 'TBD'
                const pB = sideB.length > 0 ? sideB.map((p: any) => p.player?.name || p.player_name || 'TBD').join(' & ') : 'TBD'
                const courtNum = m.court_label?.replace('Sân ', '') || '-'
                const timeStr = m.scheduled_at 
                  ? new Date(m.scheduled_at).toLocaleString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) 
                  : '--:--'
                  
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line-2)' }}>
                    <td className="mono" style={{ padding: '16px 20px' }}>{timeStr}</td>
                    <td className="mono" style={{ padding: '16px 20px' }}>Sân {courtNum}</td>
                    <td style={{ padding: '16px 20px' }}>{CATEGORIES[m.category_code] || m.category_code}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--ink-2)' }}>{m.round}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 500 }}>
                      {pA} <span style={{ color: 'var(--ink-3)', margin: '0 8px' }}>vs</span> {pB}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`pill ${m.status === 'completed' ? 'ok' : m.status === 'live' ? 'live' : 'scheduled'}`}>
                        {m.status === 'completed' ? 'Hoàn thành' : m.status === 'live' ? 'Trực tiếp' : 'Lên lịch'}
                      </span>
                    </td>
                  </tr>
                )
              } else {
                // Upcoming match object format from store (spectator default)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line-2)' }}>
                    <td className="mono" style={{ padding: '16px 20px' }}>{m.t}</td>
                    <td className="mono" style={{ padding: '16px 20px' }}>Sân {m.court}</td>
                    <td style={{ padding: '16px 20px' }}>{CATEGORIES[m.cat] || m.cat}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--ink-2)' }}>{m.round}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 500 }}>
                      {m.a} <span style={{ color: 'var(--ink-3)', margin: '0 8px' }}>vs</span> {m.b}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="pill scheduled">Lên lịch</span>
                    </td>
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
