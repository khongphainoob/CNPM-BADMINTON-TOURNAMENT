import React, { useState, useEffect } from 'react'
import { competitionApi, participationApi } from '../../data/api'
import { useStore } from '../../data/store'
import { CATEGORIES } from '../../data/constants'
import { btnPrimary } from '../../components/shared/tokens'
import { useToast } from '../../components/shared/Toast'

export function BracketView() {
  const { tournament } = useStore()
  const { toast } = useToast()
  
  const [activeCat, setActiveCat] = useState('MS')
  const [matches, setMatches] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'auto'|'manual'>('auto')
  const [participants, setParticipants] = useState<any[]>([])
  const [selectedP1, setSelectedP1] = useState<any>(null)
  const [selectedP2, setSelectedP2] = useState<any>(null)

  // Assuming `tournament` object has `events` or we need to fetch them
  useEffect(() => {
    if (tournament?.events) {
      setEvents(tournament.events)
      if (tournament.events.length > 0 && !tournament.events.find((e: any) => e.categoryCode === activeCat)) {
        setActiveCat(tournament.events[0].categoryCode)
      }
    }
  }, [tournament])

  const activeEvent = events?.find(e => e.categoryCode === activeCat || e.category_code === activeCat)

  const fetchMatches = async () => {
    if (!activeEvent?.id) return
    setLoading(true)
    try {
      const res = await competitionApi.listMatches({ eventId: activeEvent.id })
      setMatches(res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
    if (activeEvent?.id) {
      participationApi.listParticipants(activeEvent.id, { limit: 100 }).then(res => {
        // filter out those already in matches based on player_id
        const inMatchPlayerIds = new Set()
        matches.forEach(m => m.participants?.forEach((p: any) => {
          if (p.player?.id) inMatchPlayerIds.add(p.player.id)
        }))
        
        setParticipants(res.data.filter((p: any) => {
          const isPlayerInMatch = inMatchPlayerIds.has(p.player_id)
          const isPartnerInMatch = p.partner_id ? inMatchPlayerIds.has(p.partner_id) : false
          const isWithdrawn = p.status === 'withdrawn' || p.status === 'pending_partner'
          return !isPlayerInMatch && !isPartnerInMatch && !isWithdrawn
        }))
      })
    }
    setSelectedP1(null)
    setSelectedP2(null)
  }, [activeEvent?.id, mode, matches.length])

  const handleDraw = async () => {
    if (!activeEvent?.id) return
    try {
      setLoading(true)
      const res = await competitionApi.generateDraw(activeEvent.id)
      toast(`Đã tạo thành công ${res.matchesGenerated} trận đấu`)
      fetchMatches()
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi bốc thăm', 'error')
      setLoading(false)
    }
  }

  const handleManualPairing = async () => {
    if (!activeEvent?.id || !selectedP1 || !selectedP2) return
    try {
      setLoading(true)
      // 1. Create match
      const match = await competitionApi.createMatch({ eventId: activeEvent.id, round: 'Round 1' })
      
      // 2. Add participants on side A
      await competitionApi.addParticipant(match.id, { playerId: selectedP1.player_id, side: 'A', seed: selectedP1.seed || undefined })
      if (selectedP1.partner_id) {
        await competitionApi.addParticipant(match.id, { playerId: selectedP1.partner_id, side: 'A', seed: selectedP1.seed || undefined })
      }
      
      // 3. Add participants on side B
      await competitionApi.addParticipant(match.id, { playerId: selectedP2.player_id, side: 'B', seed: selectedP2.seed || undefined })
      if (selectedP2.partner_id) {
        await competitionApi.addParticipant(match.id, { playerId: selectedP2.partner_id, side: 'B', seed: selectedP2.seed || undefined })
      }
      
      toast('Ghép cặp thành công')
      setSelectedP1(null)
      setSelectedP2(null)
      fetchMatches()
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi ghép cặp', 'error')
      setLoading(false)
    }
  }

  const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 220 }

  const MatchCard = ({ match, ns, live }: { match?: any, ns?: [string, string]; live?: boolean }) => {
    let scoreA = ''
    let scoreB = ''
    let setsDetails = ''
    let winner: 'A' | 'B' | null = null

    // If we have a real match object from API
    if (match) {
      const sideAPlayers = match.participants?.filter((p: any) => p.side === 'A') || []
      const sideBPlayers = match.participants?.filter((p: any) => p.side === 'B') || []
      const p1Name = sideAPlayers.length > 0
        ? sideAPlayers.map((p: any) => p.player?.name || p.player_name || 'TBD').join(' & ')
        : (match.status === 'completed' && match.winner_side === 'B' ? 'BYE' : 'TBD')
      const p2Name = sideBPlayers.length > 0
        ? sideBPlayers.map((p: any) => p.player?.name || p.player_name || 'TBD').join(' & ')
        : (match.status === 'completed' && match.winner_side === 'A' ? 'BYE' : 'TBD')
      ns = [p1Name, p2Name]
      live = match.status === 'live'
      winner = match.winner_side

      if (match.sets && match.sets.length > 0) {
        let setsWonA = 0
        let setsWonB = 0
        match.sets.forEach((s: any) => {
          if (s.winner === 'A') setsWonA++
          else if (s.winner === 'B') setsWonB++
        })

        setsDetails = match.sets.map((s: any) => `${s.score_a}-${s.score_b}`).join(' | ')

        if (match.status === 'completed') {
          scoreA = String(setsWonA)
          scoreB = String(setsWonB)
        } else if (match.status === 'live') {
          const currentSet = match.sets[match.sets.length - 1]
          scoreA = `${setsWonA} (${currentSet.score_a})`
          scoreB = `${setsWonB} (${currentSet.score_b})`
        }
      }
    } else if (!ns) {
      ns = ['TBD', 'TBD']
    }

    const isWinnerA = winner === 'A'
    const isWinnerB = winner === 'B'

    return (
      <div 
        title={setsDetails ? `Tỷ số các set: ${setsDetails}` : undefined}
        style={{ 
          background: 'var(--paper)', 
          border: '1px solid ' + (live ? 'var(--accent)' : 'var(--line)'), 
          borderRadius: 8, 
          padding: '10px 12px', 
          fontSize: 12.5, 
          position: 'relative', 
          boxShadow: live ? '0 0 0 3px oklch(0.94 0.04 25)' : '0 2px 4px rgba(0,0,0,0.02)',
          minWidth: 200,
          transition: 'all 0.2s ease',
          cursor: match ? 'pointer' : 'default'
        }}
      >
        {live && <span className="pill live" style={{ position: 'absolute', top: -8, right: 8, fontSize: 9.5, padding: '1px 6px' }}><span className="dot live-dot"/>LIVE</span>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', color: isWinnerB ? 'var(--ink-3)' : 'var(--ink)' }}>
          <span style={{ fontWeight: isWinnerA ? 700 : 500 }}>{ns[0]}</span>
          {scoreA && <span className="mono" style={{ fontWeight: isWinnerA ? 700 : 400, marginLeft: 8, fontSize: 12 }}>{scoreA}</span>}
        </div>
        <div style={{ borderTop: '1px solid var(--line-2)' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', color: isWinnerA ? 'var(--ink-3)' : 'var(--ink)' }}>
          <span style={{ fontWeight: isWinnerB ? 700 : 500 }}>{ns[1]}</span>
          {scoreB && <span className="mono" style={{ fontWeight: isWinnerB ? 700 : 400, marginLeft: 8, fontSize: 12 }}>{scoreB}</span>}
        </div>
        {setsDetails && (
          <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4, borderTop: '1px dashed var(--line-2)', paddingTop: 4, textAlign: 'center' }}>
            {setsDetails}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div>
          <div className="caps">Sơ đồ thi đấu</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
            {CATEGORIES[activeCat]} · Nhánh đấu loại
          </h1>
          <div style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 4, display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" checked={mode === 'auto'} onChange={() => setMode('auto')} />
              Bốc thăm ngẫu nhiên
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" checked={mode === 'manual'} onChange={() => setMode('manual')} />
              Ghép cặp thủ công
            </label>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 6 }}>
          {events?.map(e => {
            const k = e.categoryCode || e.category_code
            return (
              <button key={k} onClick={() => setActiveCat(k)} style={{ padding: '6px 11px', borderRadius: 6, border: '1px solid ' + (activeCat === k ? 'var(--ink)' : 'var(--line)'), background: activeCat === k ? 'var(--ink)' : 'var(--paper)', color: activeCat === k ? 'white' : 'var(--ink-2)', fontSize: 12, cursor: 'pointer' }}>{CATEGORIES[k] || k}</button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, padding: 24, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflowX: 'auto', minHeight: 400 }}>
        {loading ? (
          <div style={{ margin: 'auto', color: 'var(--ink-2)' }}>Đang tải sơ đồ...</div>
        ) : mode === 'manual' ? (
          <div style={{ display: 'flex', width: '100%', gap: 32 }}>
            <div style={{ flex: 1, borderRight: '1px solid var(--line)', paddingRight: 32 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Danh sách VĐV chờ ghép cặp</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }} className="no-scrollbar">
                {participants.length === 0 ? <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>Không có VĐV nào đang chờ.</div> : null}
                {participants.map(p => {
                  const isSelected = selectedP1?.id === p.id || selectedP2?.id === p.id
                  const displayName = p.partner_name ? `${p.player_name} & ${p.partner_name}` : p.player_name
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        if (isSelected) {
                          if (selectedP1?.id === p.id) setSelectedP1(null)
                          if (selectedP2?.id === p.id) setSelectedP2(null)
                        } else {
                          if (!selectedP1) setSelectedP1(p)
                          else if (!selectedP2) setSelectedP2(p)
                          else { setSelectedP1(p); setSelectedP2(null) }
                        }
                      }}
                      style={{ 
                        padding: '10px 16px', border: '1px solid ' + (isSelected ? 'var(--accent)' : 'var(--line)'), 
                        borderRadius: 8, cursor: 'pointer', background: isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--paper-2)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--accent)' : 'var(--ink)' }}>{displayName}</span>
                      {isSelected && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'white', padding: '2px 6px', borderRadius: 10 }}>{selectedP1?.id === p.id ? 'A' : 'B'}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--paper-2)', border: '1px dashed var(--line-2)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 300, textAlign: 'center' }}>
                <h3 style={{ fontSize: 15, color: 'var(--ink-2)', marginBottom: 24 }}>Trận đấu mới</h3>
                <div style={{ padding: 12, border: '1px solid var(--line)', borderRadius: 8, background: 'var(--paper)', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: selectedP1 ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {selectedP1 ? (selectedP1.partner_name ? `${selectedP1.player_name} & ${selectedP1.partner_name}` : selectedP1.player_name) : 'Chọn VĐV A'}
                </div>
                <div style={{ margin: '16px 0', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>VS</div>
                <div style={{ padding: 12, border: '1px solid var(--line)', borderRadius: 8, background: 'var(--paper)', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: selectedP2 ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {selectedP2 ? (selectedP2.partner_name ? `${selectedP2.player_name} & ${selectedP2.partner_name}` : selectedP2.player_name) : 'Chọn VĐV B'}
                </div>
                <button 
                  disabled={!selectedP1 || !selectedP2} 
                  onClick={handleManualPairing}
                  style={{ ...btnPrimary, width: '100%', marginTop: 32, opacity: (!selectedP1 || !selectedP2) ? 0.5 : 1 }}
                >
                  Tạo trận đấu
                </button>
              </div>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 32, padding: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--ink-2)' }}>Chưa có lịch thi đấu cho nội dung này.</div>
              {participants.length > 0 && (
                <div style={{ marginBottom: 24, fontSize: 15, fontWeight: 500 }}>
                  Có <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{participants.length}</span> VĐV/Đội hợp lệ đang chờ bốc thăm.
                </div>
              )}
              <button style={btnPrimary} disabled={participants.length === 0} onClick={handleDraw}>Tạo bốc thăm ngẫu nhiên</button>
            </div>
            {participants.length > 0 && (
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--ink)' }}>Danh sách tham gia</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {participants.map(p => {
                    const displayName = p.partner_name ? `${p.player_name} & ${p.partner_name}` : p.player_name
                    return (
                      <div key={p.id} style={{ padding: '12px 16px', background: 'var(--paper-2)', borderRadius: 8, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{displayName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {(() => {
              const roundsMap: Record<string, any[]> = {}
              matches.forEach(m => {
                const r = m.round || 'Vòng Bảng'
                if (!roundsMap[r]) roundsMap[r] = []
                roundsMap[r].push(m)
              })
              
              const roundOrder = ['Vòng 64', 'Vòng 32', 'Vòng 16', 'Tứ kết', 'Bán kết', 'Chung kết', 'Vòng Bảng']
              const sortedRounds = Object.keys(roundsMap).sort((a, b) => {
                const idxA = roundOrder.indexOf(a)
                const idxB = roundOrder.indexOf(b)
                if (idxA !== -1 && idxB !== -1) return idxA - idxB
                if (idxA !== -1) return -1
                if (idxB !== -1) return 1
                return a.localeCompare(b)
              })

              return sortedRounds.map(rName => {
                const roundMatches = [...roundsMap[rName]].sort((a, b) => {
                  return (a.code || '').localeCompare(b.code || '')
                })
                return (
                  <div key={rName} style={col}>
                    <div className="caps" style={{ textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>{rName}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'space-around', height: '100%' }}>
                      {roundMatches.map(m => <MatchCard key={m.id} match={m} />)}
                    </div>
                  </div>
                )
              })
            })()}
          </>
        )}
      </div>
    </div>
  )
}
