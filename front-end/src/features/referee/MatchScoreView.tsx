import { useState, useEffect } from 'react'
import Icon from '../../components/shared/Icon'
import { useStore } from '../../data/store'
import { competitionApi } from '../../data/api'

type SetScore = { A: number, B: number }

type Props = {
  matchId: string
  court: string
  category: string
  round: string
  playerA: { name: string, club: string }
  playerB: { name: string, club: string }
  onClose: () => void
}

export default function MatchScoreView({ matchId, court, category, round, playerA, playerB, onClose }: Props) {
  const [status, setStatus] = useState<'upcoming' | 'live' | 'completed' | 'finished'>('upcoming')
  const [currentSet, setCurrentSet] = useState(0)
  const [sets, setSets] = useState<SetScore[]>([{ A: 0, B: 0 }])
  const [history, setHistory] = useState<SetScore[][]>([])
  const [loading, setLoading] = useState(true)

  const currentScore = sets[currentSet]

  const saveHistory = () => {
    setHistory([...history, JSON.parse(JSON.stringify(sets))])
  }

  useEffect(() => {
    const initMatch = async () => {
      try {
        const matchData = await competitionApi.getMatch(matchId)
        if (matchData) {
          setStatus(matchData.status)
          const dbSets = matchData.sets || []
          
          if (matchData.status === 'upcoming') {
            setSets([{ A: 0, B: 0 }])
            setCurrentSet(0)
          } else if (matchData.status === 'live') {
            const scoreEvents = await competitionApi.getScoreEvents(matchId)
            const activeSetNo = dbSets.length + 1
            const activeSetScoreA = scoreEvents.filter((e: any) => e.set_no === activeSetNo && e.scorer === 'A').length
            const activeSetScoreB = scoreEvents.filter((e: any) => e.set_no === activeSetNo && e.scorer === 'B').length
            
            const reconstructed: SetScore[] = dbSets.map((s: any) => ({ A: s.score_a, B: s.score_b }))
            reconstructed.push({ A: activeSetScoreA, B: activeSetScoreB })
            
            setSets(reconstructed)
            setCurrentSet(reconstructed.length - 1)
            
            // Reconstruct undo history for the active set
            let runA = 0
            let runB = 0
            const activeSetEvents = scoreEvents.filter((e: any) => e.set_no === activeSetNo)
            const histList: SetScore[][] = []
            
            // Seed base state (previous sets are complete, active set starts at 0, 0)
            const baseSets = dbSets.map((s: any) => ({ A: s.score_a, B: s.score_b }))
            baseSets.push({ A: 0, B: 0 })
            
            let currentTemp = JSON.parse(JSON.stringify(baseSets))
            for (const ev of activeSetEvents) {
              histList.push(JSON.parse(JSON.stringify(currentTemp)))
              if (ev.scorer === 'A') runA++
              else if (ev.scorer === 'B') runB++
              currentTemp[activeSetNo - 1] = { A: runA, B: runB }
            }
            setHistory(histList)
          } else if (matchData.status === 'completed' || matchData.status === 'finished') {
            const reconstructed: SetScore[] = dbSets.map((s: any) => ({ A: s.score_a, B: s.score_b }))
            if (reconstructed.length === 0) reconstructed.push({ A: 0, B: 0 })
            setSets(reconstructed)
            setCurrentSet(reconstructed.length - 1)
          }
        }
      } catch (e) {
        console.error('Lỗi tải thông tin trận đấu:', e)
      } finally {
        setLoading(false)
      }
    }
    initMatch()
  }, [matchId])

  const addScore = async (team: 'A' | 'B') => {
    if (status !== 'live') return
    const prevA = currentScore?.A || 0
    const prevB = currentScore?.B || 0
    const newA = team === 'A' ? prevA + 1 : prevA
    const newB = team === 'B' ? prevB + 1 : prevB
    
    // Check if it caused set end (standard BWF: 21 points, must lead by 2, max 30)
    const causedSetEnd = (newA >= 21 || newB >= 21) && Math.abs(newA - newB) >= 2 || newA === 30 || newB === 30

    try {
      await competitionApi.addScoreEvent(matchId, {
        setNo: currentSet + 1,
        scorer: team,
        prevScoreA: prevA,
        prevScoreB: prevB,
        prevServing: 'A',
        causedSetEnd
      })
      
      saveHistory()
      const newSets = [...sets]
      newSets[currentSet] = { A: newA, B: newB }
      setSets(newSets)
    } catch (e: any) {
      console.error('Lỗi cộng điểm:', e)
    }
  }

  const undo = async () => {
    if (history.length === 0 || status !== 'live') return
    try {
      await competitionApi.undoScore(matchId)
      const prev = history[history.length - 1]
      setSets(prev)
      setHistory(history.slice(0, -1))
    } catch (e: any) {
      console.error('Lỗi undo:', e)
    }
  }

  const endSet = async () => {
    if (status !== 'live') return
    try {
      await competitionApi.addSetScore(matchId, {
        setNo: currentSet + 1,
        scoreA: currentScore?.A || 0,
        scoreB: currentScore?.B || 0
      })

      // Best of 3 check
      if (currentSet < 2) {
        setCurrentSet(currentSet + 1)
        setSets([...sets, { A: 0, B: 0 }])
        setHistory([])
      } else {
        await competitionApi.completeMatch(matchId)
        setStatus('completed')
      }
    } catch (e: any) {
      console.error('Lỗi kết thúc set:', e)
    }
  }

  const endMatch = async () => {
    try {
      await competitionApi.addSetScore(matchId, {
        setNo: currentSet + 1,
        scoreA: currentScore?.A || 0,
        scoreB: currentScore?.B || 0
      })
      await competitionApi.completeMatch(matchId)
      setStatus('completed')
    } catch (e: any) {
      console.error('Lỗi kết thúc trận:', e)
    }
  }

  const startMatch = async () => {
    try {
      await competitionApi.startMatch(matchId)
      setStatus('live')
    } catch (e: any) {
      console.error('Lỗi bắt đầu trận đấu:', e)
    }
  }

  if (loading) return <div style={{ position: 'fixed', inset: 0, background: 'var(--paper)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', color: 'var(--ink-2)' }}>Đang tải trạng thái trận đấu...</div>

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--paper)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category} · {round} · Sân {court}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginTop: 4 }}>Trận {matchId}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, padding: 8, cursor: 'pointer', margin: -8 }}>✕</button>
      </div>

      {/* Info Bar */}
      <div style={{ background: 'var(--paper-2)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={14}/> {status === 'upcoming' ? 'Chưa bắt đầu' : status === 'live' ? 'Đang thi đấu' : 'Đã kết thúc'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="user" size={14}/> TT. Quang Huy</span>
        </div>
        {status === 'live' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={undo} disabled={history.length === 0} style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: history.length === 0 ? 'default' : 'pointer', opacity: history.length === 0 ? 0.5 : 1 }}>
              <Icon name="rotate-ccw" size={12}/> Undo
            </button>
          </div>
        )}
      </div>

      {/* Main Score Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Set indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '20px 0' }}>
          {sets.map((_, i) => (
            <div key={i} style={{ 
              padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700,
              background: i === currentSet ? 'var(--ink)' : 'var(--paper-2)',
              color: i === currentSet ? 'white' : 'var(--ink-3)',
              border: i === currentSet ? 'none' : '1px solid var(--line)'
            }}>
              SET {i + 1}
            </div>
          ))}
        </div>

        {/* Players & Scores */}
        <div style={{ flex: 1, display: 'flex', gap: 16, padding: '0 16px 16px' }}>
          {/* Player A */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--paper-2)', padding: '16px', borderRadius: 12, textAlign: 'center', borderBottom: '4px solid var(--court)' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{playerA.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{playerA.club}</div>
            </div>
            <button 
              onClick={() => addScore('A')}
              disabled={status !== 'live'}
              style={{ 
                flex: 1, borderRadius: 16, border: 'none', background: 'var(--court)', color: 'white', 
                fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 700, 
                cursor: status === 'live' ? 'pointer' : 'default', opacity: status === 'live' ? 1 : 0.5,
                boxShadow: '0 8px 0 oklch(0.3 0.1 160)'
              }}
            >
              {currentScore?.A || 0}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 24, color: 'var(--line-2)' }}>-</div>

          {/* Player B */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--paper-2)', padding: '16px', borderRadius: 12, textAlign: 'center', borderBottom: '4px solid var(--accent)' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{playerB.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{playerB.club}</div>
            </div>
            <button 
              onClick={() => addScore('B')}
              disabled={status !== 'live'}
              style={{ 
                flex: 1, borderRadius: 16, border: 'none', background: 'var(--accent)', color: 'white', 
                fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 700, 
                cursor: status === 'live' ? 'pointer' : 'default', opacity: status === 'live' ? 1 : 0.5,
                boxShadow: '0 8px 0 oklch(0.4 0.15 25)'
              }}
            >
              {currentScore?.B || 0}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--line)', background: 'var(--paper)', display: 'flex', gap: 12 }}>
        {status === 'upcoming' && (
          <button onClick={startMatch} style={{ flex: 1, padding: '20px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
            BẮT ĐẦU TRẬN ĐẤU
          </button>
        )}
        
        {status === 'live' && (
          <>
            <button onClick={endSet} style={{ flex: 1, padding: '20px', borderRadius: 12, border: '2px solid var(--ink)', background: 'var(--paper)', color: 'var(--ink)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              KẾT THÚC SET {currentSet + 1}
            </button>
            <button onClick={endMatch} style={{ flex: 1, padding: '20px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              KẾT THÚC TRẬN ĐẤU
            </button>
          </>
        )}

        {(status === 'finished' || status === 'completed') && (
          <div style={{ flex: 1, padding: '20px', borderRadius: 12, background: 'var(--paper-2)', color: 'var(--ink-2)', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
            TRẬN ĐẤU ĐÃ KẾT THÚC
          </div>
        )}
      </div>
    </div>
  )
}
