import { useStore } from '../../data/store'

import { CATEGORIES } from '../../data/constants'

export default function MyScheduleView() {
  const { upcomingMatches } = useStore()

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink)' }}>
            Lịch trình của tôi
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
            Danh sách các trận đấu sắp tới bạn tham gia hoặc theo dõi
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
            {upcomingMatches.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  Không có trận đấu nào sắp tới.
                </td>
              </tr>
            ) : upcomingMatches.map((m, i) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
