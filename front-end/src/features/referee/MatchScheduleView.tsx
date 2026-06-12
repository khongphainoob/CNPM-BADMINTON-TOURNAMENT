import { useState, useEffect } from 'react'
import Icon from '../../components/shared/Icon'
import MatchAssignmentModal from './MatchAssignmentModal'
import { useStore, fetchMatches } from '../../data/store'
import { competitionApi } from '../../data/api'
import { useToast } from '../../components/shared/Toast'

export default function MatchScheduleView() {
  const { toast } = useToast()
  const [assignMatch, setAssignMatch] = useState<any>(null)
  const { upcomingMatches, courts } = useStore()
  const activeCourts = courts.map(c => `Sân ${c.id}`)

  useEffect(() => {
    fetchMatches()
    const interval = setInterval(() => {
      fetchMatches()
    }, 10000) // 10s auto-refresh
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            Điều phối Lịch thi đấu
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            Quản lý và gán trọng tài cho các trận đấu (BM18 & BM16)
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <Icon name="calendar" size={14} style={{ marginRight: 6 }} /> Chọn ngày
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', flex: 1, paddingBottom: 16 }}>
        {activeCourts.map(court => {
          const matches = upcomingMatches.filter(m => `Sân ${m.court}` === court)
          return (
            <div key={court} style={{ minWidth: 320, background: 'var(--paper-2)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{court}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{matches.length} trận</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matches.map(m => (
                  <div key={m.id} style={{ 
                    background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ 
                      padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'white', display: 'flex', justifyContent: 'space-between',
                      background: 'var(--ink-2)'
                    }}>
                      <span>{m.t} · {m.cat} {m.round}</span>
                    </div>
                    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{m.a} vs {m.b}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                        <div style={{ fontSize: 12, color: m.umpire ? 'var(--ink)' : 'var(--ink-3)', fontWeight: m.umpire ? 600 : 400 }}>
                          <Icon name="user" size={12} style={{ marginRight: 4 }} />
                          {m.umpire || 'Chưa có TT'}
                        </div>
                        <button
                          onClick={() => setAssignMatch(m)}
                          style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: m.umpire ? 'var(--paper-2)' : 'var(--ink)', color: m.umpire ? 'var(--ink)' : 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {m.umpire ? 'Đổi TT' : 'Gán TT'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {matches.length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, border: '1px dashed var(--line-2)', borderRadius: 8 }}>
                    Trống lịch
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {assignMatch && (
        <MatchAssignmentModal 
          matchId={assignMatch.id}
          currentRefereeId={assignMatch.refereeId}
          matchDetails={{
            title: `${assignMatch.cat} - ${assignMatch.round}`,
            date: 'Hôm nay',
            time: assignMatch.t,
            court: `Sân ${assignMatch.court}`,
            playersClubs: [assignMatch.a, assignMatch.b]
          }}
          onClose={() => setAssignMatch(null)}
          onSave={async (data) => {
            try {
              await competitionApi.updateMatch(data.matchId, { refereeId: Number(data.refereeId) })
              toast('Đã lưu phân công trọng tài!', 'success')
              await fetchMatches()
            } catch (e: any) {
              toast(e.response?.data?.error?.message || 'Lỗi lưu phân công', 'error')
            }
            setAssignMatch(null)
          }}
        />
      )}
    </div>
  )
}
