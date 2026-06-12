import { useState, useEffect } from 'react'
import { competitionApi, peopleApi } from '../../data/api'
import { useStore } from '../../data/store'
import { useAuth } from '../../data/auth'

export default function RefereeMatchList({ onSelect }: { onSelect: (m: any) => void }) {
  const activeTournamentId = useStore(state => state.activeTournamentId)
  const { session } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeTournamentId || !session?.userId) return
    setLoading(true)
    const load = async () => {
      // Map the logged-in user to their referee record
      const referees = await peopleApi.listReferees()
      const me = (referees || []).find((r: any) => String(r.user_id) === String(session.userId))
      if (!me) { setMatches([]); setLoading(false); return }
      // Fetch only matches assigned to this referee
      const res = await competitionApi.listMatches({
        status: 'upcoming',
        tournament_id: activeTournamentId,
        refereeId: me.id,
      })
      setMatches(res.data || [])
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [activeTournamentId, session?.userId])

  return (
    <div style={{ padding: '24px', background: 'var(--color-surface)', height: '100dvh', overflowY: 'auto', fontFamily: 'var(--font-body)' }}>


      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Trận đấu chờ điều hành</h2>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-ink-3)' }}>Đang tải danh sách trận đấu...</div>
      ) : matches.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'var(--color-surface-2)', borderRadius: 12, color: 'var(--color-ink-2)' }}>
          Không có trận nào đang chờ.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {matches.map(m => {
            const sideA = m.participants?.find((p: any) => p.side === 'A')?.player?.name || 'VĐV 1'
            const sideB = m.participants?.find((p: any) => p.side === 'B')?.player?.name || 'VĐV 2'
            return (
              <div key={m.id} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--color-border)', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12, color: 'var(--color-ink-3)' }}>
                  <span>Sân {m.court_label || '-'} · {m.event_label}</span>
                  <span>{new Date(m.scheduled_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{sideA}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-3)', margin: '8px 0' }}>VS</div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{sideB}</div>
                  </div>
                  <button onClick={() => onSelect(m)} style={{ background: 'var(--color-accent)', color: 'white', border: 0, padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    Vào sân
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
