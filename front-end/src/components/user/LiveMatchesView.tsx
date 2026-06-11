import { useEffect } from 'react'
import { useStore, fetchMatches } from '../../data/store'
import { CATEGORIES } from '../../data/constants'
import { socket } from '../../lib/socket'

export default function LiveMatchesView() {
  const { liveMatches, activeTournamentId } = useStore()

  useEffect(() => {
    // Fetch immediately
    fetchMatches(activeTournamentId || undefined)

    // Connect socket and listen
    socket.connect()
    
    const handleScoreUpdate = () => {
      fetchMatches(activeTournamentId || undefined)
    }

    socket.on('global-score-update', handleScoreUpdate)

    // Poll every 5 seconds as fallback
    const timer = setInterval(() => {
      fetchMatches(activeTournamentId || undefined)
    }, 5000)

    return () => {
      clearInterval(timer)
      socket.off('global-score-update', handleScoreUpdate)
      socket.disconnect()
    }
  }, [activeTournamentId])
  
  if (!liveMatches || liveMatches.length === 0) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', background: 'var(--paper)', border: '1px dashed var(--line)', borderRadius: 12 }}>
        <div style={{ marginBottom: 16, fontSize: 48 }}>🏸</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Không có trận đấu nào đang diễn ra</div>
        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-3)' }}>Vui lòng quay lại sau khi giải đấu bắt đầu.</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 48px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink)' }}>
            Trực tiếp
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
            Theo dõi tỷ số các trận đấu đang diễn ra theo thời gian thực
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
        {liveMatches.map(m => (
          <div key={m.id} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span className="pill live" style={{ fontSize: 11 }}><span className="dot live-dot" />LIVE</span>
              <span className="caps" style={{ fontSize: 12, fontWeight: 700 }}>{CATEGORIES[m.cat] || m.cat} · {m.round}</span>
              <div style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>Sân {m.court} · {m.elapsed}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{m.a.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{m.a.club || 'Tự do'}</div>
                  </div>
                </div>
                <div style={{ width: '100%', height: 1, background: 'var(--line)', margin: '12px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{m.b.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{m.b.club || 'Tự do'}</div>
                  </div>
                </div>
              </div>
              
              <div className="mono" style={{ display: 'flex', gap: 6 }}>
                {m.sets.map((s, i) => (
                  <div key={i} style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '8px 12px', borderRadius: 6, 
                    background: i === m.current ? 'var(--accent)' : 'var(--paper-2)', 
                    color: i === m.current ? 'white' : 'var(--ink)',
                    minWidth: 44,
                    border: i === m.current ? 'none' : '1px solid var(--line-2)'
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{s[0]}</div>
                    <div style={{ width: 16, height: 1, background: i === m.current ? 'rgba(255,255,255,0.3)' : 'var(--line)', margin: '8px 0' }} />
                    <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{s[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
