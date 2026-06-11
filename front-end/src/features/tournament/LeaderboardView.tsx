import { useState, useEffect } from 'react'
import { CATEGORIES } from '../../data/constants'
import { reportingApi } from '../../data/api'

export default function LeaderboardView() {
  const [category, setCategory] = useState('MS')
  const [players, setPlayers] = useState<any[]>([])
  
  useEffect(() => {
    reportingApi.getLeaderboard({ categoryCode: category }).then(res => {
      setPlayers(res)
    }).catch(err => {
      console.error(err)
    })
  }, [category])
  
  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            Bảng Xếp Hạng (BM20)
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            Cập nhật realtime (Polling mỗi 3 giây)
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13 }}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: 'var(--paper-2)', borderRadius: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
            <div className="dot live-dot" /> LIVE
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: 60 }}>Hạng</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Vận động viên</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Đơn vị / CLB</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Trận</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Thắng - Thua</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Hiệu số Set</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Hiệu số Điểm</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>Tổng Điểm</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.rank <= 3 ? 'var(--ink)' : 'var(--paper-2)', color: p.rank <= 3 ? 'white' : 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 700, fontSize: 12 }}>
                    {p.rank}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{p.id}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>{p.club}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500 }}>{p.played}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ color: 'oklch(0.38 0.14 148)', fontWeight: 600 }}>{p.win}</span>
                  <span style={{ margin: '0 4px', opacity: 0.5 }}>-</span>
                  <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{p.lose}</span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ color: 'var(--ink)' }}>{p.setWin}</span>
                  <span style={{ margin: '0 4px', opacity: 0.5 }}>-</span>
                  <span style={{ color: 'var(--ink-2)' }}>{p.setLose}</span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500 }}>
                  {p.pointsDiff > 0 ? `+${p.pointsDiff}` : p.pointsDiff}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                  {p.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 16 }}>
        <strong>Quy tắc Tie-break:</strong>
        <span>1. Đối đầu trực tiếp</span>
        <span>2. Hiệu số Set</span>
        <span>3. Hiệu số Điểm</span>
      </div>
    </div>
  )
}
