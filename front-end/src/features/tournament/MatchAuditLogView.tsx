import { useState, useEffect } from 'react'
import Icon from '../../components/shared/Icon'
import { competitionApi } from '../../data/api'
import { useStore } from '../../data/store'

export default function MatchAuditLogView() {
  const activeTournamentId = useStore(state => state.activeTournamentId)
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string>('')
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filterSet, setFilterSet] = useState('all')
  const [filterSide, setFilterSide] = useState('all')

  // Fetch matches of active tournament
  useEffect(() => {
    if (!activeTournamentId) return
    competitionApi.listMatches({ tournament_id: activeTournamentId, limit: 100 })
      .then(res => {
        const list = res.data || []
        setMatches(list)
        if (list.length > 0) {
          setSelectedMatchId(String(list[0].id))
        }
      })
      .catch(console.error)
  }, [activeTournamentId])

  // Fetch score events when selected match changes
  useEffect(() => {
    if (!selectedMatchId) return
    setLoading(true)
    competitionApi.getScoreEvents(selectedMatchId)
      .then(res => {
        setLogs(res || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedMatchId])

  const selectedMatch = matches.find(m => String(m.id) === selectedMatchId)

  // Map database logs to UI structure
  const mappedLogs = logs.map(log => {
    const scoreAfterA = log.scorer === 'A' ? log.prev_score_a + 1 : log.prev_score_a
    const scoreAfterB = log.scorer === 'B' ? log.prev_score_b + 1 : log.prev_score_b
    
    return {
      id: `EV-${log.id}`,
      matchId: log.match_id,
      set: log.set_no,
      side: log.scorer,
      scoreBefore: `${log.prev_score_a} - ${log.prev_score_b}`,
      scoreAfter: `${scoreAfterA} - ${scoreAfterB}`,
      serveBefore: log.prev_serving,
      serveAfter: log.scorer, // serving side transitions to scorer
      time: new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      referee: selectedMatch?.referee_name || 'Trọng tài',
      offline: false, // system events
      undone: false
    }
  })

  const filteredLogs = mappedLogs.filter(log => {
    if (filterSet !== 'all' && log.set.toString() !== filterSet) return false
    if (filterSide !== 'all' && log.side !== filterSide) return false
    return true
  })

  const handleExportCSV = () => {
    if (logs.length === 0) return
    const headers = 'ID,Match ID,Set,Scorer,Prev Score A,Prev Score B,Prev Serving,Time\n'
    const rows = logs.map(l => `${l.id},${l.match_id},${l.set_no},${l.scorer},${l.prev_score_a},${l.prev_score_b},${l.prev_serving},${l.created_at}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Match_Score_Logs_${selectedMatchId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            Lịch sử Ghi điểm (Audit Log)
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            BM19 & BM22 - Giám sát tính toàn vẹn của dữ liệu trận đấu
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Chọn trận đấu</span>
            <select 
              value={selectedMatchId} 
              onChange={e => setSelectedMatchId(e.target.value)} 
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13, minWidth: 220 }}
            >
              {matches.length === 0 && <option value="">-- Chưa có trận đấu --</option>}
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  Trận #{m.id} - {m.round} ({m.event_label || m.category_code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Ván</span>
            <select value={filterSet} onChange={e => setFilterSet(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13 }}>
              <option value="all">Tất cả</option>
              <option value="1">Set 1</option>
              <option value="2">Set 2</option>
              <option value="3">Set 3</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>Bên ghi điểm</span>
            <select value={filterSide} onChange={e => setFilterSide(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13 }}>
              <option value="all">Tất cả</option>
              <option value="A">Bên A</option>
              <option value="B">Bên B</option>
            </select>
          </div>

          <button 
            onClick={handleExportCSV} 
            disabled={logs.length === 0} 
            style={{ 
              alignSelf: 'flex-end', padding: '9px 16px', borderRadius: 6, border: 'none', 
              background: logs.length === 0 ? 'var(--line)' : 'var(--ink)', 
              color: logs.length === 0 ? 'var(--ink-3)' : 'white', 
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, 
              cursor: logs.length === 0 ? 'default' : 'pointer' 
            }}
          >
            <Icon name="dl" size={14} /> Xuất CSV
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Mã / Trận</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Set</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Chi tiết ghi điểm</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Trạng thái giao cầu</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Trọng tài / Thời gian</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Hệ thống</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>Đang tải dữ liệu log...</td>
                </tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--line-2)', opacity: log.undone ? 0.5 : 1, textDecoration: log.undone ? 'line-through' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="mono" style={{ fontWeight: 600 }}>{log.id}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Trận #{log.matchId}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>{log.set}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '2px 6px', background: log.side === 'A' ? 'var(--court-soft)' : 'var(--accent-soft)', color: log.side === 'A' ? 'oklch(0.38 0.14 148)' : 'var(--accent)', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>+1 {log.side}</span>
                      <span className="mono">{log.scoreBefore} → <strong>{log.scoreAfter}</strong></span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span className="mono" style={{ color: 'var(--ink-2)' }}>{log.serveBefore} → {log.serveAfter}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{log.referee}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{log.time}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      {log.offline && <span style={{ padding: '2px 6px', background: 'var(--amber-soft)', color: 'var(--amber)', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Offline Sync</span>}
                      {log.undone && <span style={{ padding: '2px 6px', background: 'var(--line)', color: 'var(--ink-2)', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Undo</span>}
                      {!log.offline && !log.undone && <span style={{ padding: '2px 6px', background: 'var(--court-soft)', color: 'var(--court)', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Online</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>Không có dữ liệu log cho trận đấu này</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
