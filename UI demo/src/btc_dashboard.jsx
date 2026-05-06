/* BTC operations console — main desktop surface */
const { useState: useS_btc } = React;

const btcNav = [
  { id: 'dashboard',  label: 'Tổng quan',      icon: 'dashboard' },
  { id: 'schedule',   label: 'Lịch thi đấu',   icon: 'calendar' },
  { id: 'bracket',    label: 'Bảng đấu',       icon: 'bracket' },
  { id: 'athletes',   label: 'Vận động viên',  icon: 'users' },
  { id: 'courts',     label: 'Sân & điều phối',icon: 'court' },
  { id: 'inventory',  label: 'Kho cầu',        icon: 'shuttle' },
  { id: 'referees',   label: 'Trọng tài',      icon: 'shield' },
  { id: 'finance',    label: 'Tài chính',      icon: 'wallet' },
  { id: 'news',       label: 'Tin tức',        icon: 'bell' },
  { id: 'reports',    label: 'Báo cáo',        icon: 'chart' },
  { id: 'settings',   label: 'Cấu hình giải',  icon: 'cog' },
];

function Sidebar({ view, setView }) {
  return (
    <aside style={{
      gridArea: 'side',
      background: 'var(--paper-2)',
      borderRight: '1px solid var(--line)',
      padding: '16px 10px',
      display: 'flex', flexDirection: 'column', gap: 2,
      overflowY: 'auto',
    }}>
      <div className="caps" style={{ padding: '4px 10px 10px', color:'var(--ink-3)' }}>Giải đang diễn ra</div>
      <div style={{ padding: '8px 10px 14px', borderBottom:'1px solid var(--line)', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{TOURNAMENT.name}</div>
        <div className="mono" style={{ fontSize: 10.5, color:'var(--ink-3)', marginTop: 4 }}>
          {TOURNAMENT.id} · {TOURNAMENT.start.slice(5)} — {TOURNAMENT.end.slice(5)}
        </div>
        <div style={{ display:'flex', gap: 4, marginTop: 8 }}>
          <span className="pill live"><span className="dot live-dot"/> Đang thi đấu</span>
        </div>
      </div>
      {btcNav.map(n => (
        <button key={n.id} onClick={() => setView(n.id)}
          style={{
            display:'flex', alignItems:'center', gap: 10,
            padding: '8px 10px', borderRadius: 6, border: 0,
            background: view === n.id ? 'var(--paper)' : 'transparent',
            color: view === n.id ? 'var(--ink)' : 'var(--ink-2)',
            boxShadow: view === n.id ? 'inset 0 0 0 1px var(--line), 0 1px 2px oklch(0 0 0 / 0.04)' : 'none',
            textAlign: 'left', fontSize: 13, fontWeight: view === n.id ? 600 : 400,
          }}>
          <Icon name={n.icon} size={15}/>
          <span>{n.label}</span>
          {view === n.id && <span style={{ marginLeft:'auto', width: 4, height: 4, borderRadius: 99, background: 'var(--accent)' }}/>}
        </button>
      ))}
      <div style={{ flex: 1 }}/>
      <div style={{ padding: '10px', fontSize: 10.5, color:'var(--ink-3)' }}>
        <div className="mono">v2.3.1 · p95 1.4s</div>
        <div className="mono" style={{ marginTop: 2 }}>Uptime 99.72% · 30d</div>
      </div>
    </aside>
  );
}

/* ---------------- Dashboard ---------------- */
function StatCard({ label, value, sub, accent, children }) {
  return (
    <div style={{
      background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8,
      padding: 16, display:'flex', flexDirection:'column', gap: 6, minHeight: 112, position:'relative', overflow:'hidden',
    }}>
      <div className="caps">{label}</div>
      <div className="serif" style={{ fontSize: 30, color: accent || 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 11.5, color:'var(--ink-3)' }}>{sub}</div>
      {children}
    </div>
  );
}

function DashboardView() {
  const liveCount = LIVE_MATCHES.length;
  const pending = ATHLETES.filter(a => a.status === 'pending').length;
  return (
    <div style={{ display:'grid', gap: 16, padding: 18, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      {/* Hero */}
      <div style={{ gridColumn: '1 / -1', display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap: 16 }}>
        <div>
          <div className="caps">Day 1 · Saturday 18 April</div>
          <h1 className="serif" style={{ fontSize: 36, margin: '4px 0 2px', letterSpacing: '0.01em', textTransform:'uppercase' }}>
            Good afternoon, Phạm Lâm.
          </h1>
          <div style={{ color:'var(--ink-2)', fontSize: 13 }}>
            6 trận đang diễn ra · 12 trận sắp bắt đầu · 342 VĐV đã check-in · 87 cầu đã cấp hôm nay.
          </div>
        </div>
        <div style={{ display:'flex', gap: 8 }}>
          <button style={{ background:'var(--paper)', border:'1px solid var(--line)', padding:'8px 12px', borderRadius: 6, fontSize: 12.5, display:'flex', alignItems:'center', gap: 6 }}>
            <Icon name="plus" size={13}/> Thêm trận phụ
          </button>
          <button style={{ background:'var(--ink)', color:'white', border: 0, padding:'8px 12px', borderRadius: 6, fontSize: 12.5, display:'flex', alignItems:'center', gap: 6 }}>
            <Icon name="dl" size={13}/> Xuất báo cáo ngày
          </button>
        </div>
      </div>

      <div style={{ gridColumn: 'span 3' }}><StatCard label="Trận đang diễn ra" value={liveCount} sub="trên 7 sân đang mở" accent="var(--accent)">
        <div style={{ position:'absolute', right: 12, top: 14 }}><span className="pill live"><span className="dot live-dot"/>LIVE</span></div>
      </StatCard></div>
      <div style={{ gridColumn: 'span 3' }}><StatCard label="Trận đã hoàn tất" value={`${TOURNAMENT.matches.done}/${TOURNAMENT.matches.total}`} sub={`${Math.round(TOURNAMENT.matches.done / TOURNAMENT.matches.total * 100)}% tiến độ giải`}>
        <div style={{ height: 4, background:'var(--line-2)', borderRadius: 2, marginTop: 4 }}>
          <div style={{ width: `${TOURNAMENT.matches.done / TOURNAMENT.matches.total * 100}%`, height:'100%', background:'var(--court)', borderRadius: 2 }}/>
        </div>
      </StatCard></div>
      <div style={{ gridColumn: 'span 3' }}><StatCard label="Hồ sơ chờ duyệt" value={pending} sub={`${ATHLETES.filter(a=>a.status==='incomplete').length} hồ sơ thiếu thông tin`} accent="var(--amber)"/></div>
      <div style={{ gridColumn: 'span 3' }}><StatCard label="Tồn kho cầu" value={TOURNAMENT.shuttles.stock} sub={`tối thiểu ${TOURNAMENT.shuttles.min} · dùng hôm nay ${TOURNAMENT.shuttles.usedToday}`}/></div>

      {/* Live matches */}
      <div style={{ gridColumn: 'span 8', background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--line)' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Trận đang diễn ra</h3>
          <span className="pill live" style={{ marginLeft: 10 }}><span className="dot live-dot"/>{liveCount} LIVE</span>
          <div style={{ flex: 1 }}/>
          <button className="caps" style={{ border: 0, background:'transparent', color:'var(--ink-2)' }}>Xem tất cả →</button>
        </div>
        <div>
          {LIVE_MATCHES.slice(0, 5).map(m => <LiveRow key={m.id} m={m}/>)}
        </div>
      </div>

      {/* Feed */}
      <div style={{ gridColumn: 'span 4', background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Hoạt động hệ thống</h3>
        </div>
        <div style={{ padding: '4px 0' }}>
          {[
            { t: '14:52', who: 'Trọng tài Lê Quang Huy', msg: 'xác nhận set 2 trận #184 · 21-14' , tag: 'score' },
            { t: '14:48', who: 'BTC', msg: 'phê duyệt hồ sơ A-0201 · Phạm Lê Hoàng', tag: 'approve' },
            { t: '14:45', who: 'Hệ thống', msg: 'cảnh báo tồn kho cầu Victor AS-30 sắp xuống dưới mức', tag: 'warn' },
            { t: '14:40', who: 'BTC', msg: 'hoán đổi sân 7 → 8 cho trận #189 · xung đột trọng tài', tag: 'schedule' },
            { t: '14:32', who: 'VĐV-0146', msg: 'nộp kháng nghị trận #179 · video đính kèm', tag: 'alert' },
            { t: '14:25', who: 'Trọng tài Nguyễn Hồng Sơn', msg: 'đồng bộ 2 cập nhật ngoại tuyến', tag: 'sync' },
            { t: '14:10', who: 'VNPay', msg: 'xác nhận 14 giao dịch lệ phí đăng ký · +7.000.000 ₫', tag: 'finance' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom:'1px solid var(--line-2)', display:'flex', gap: 10, fontSize: 12.5 }}>
              <div className="mono" style={{ color:'var(--ink-3)', width: 38 }}>{f.t}</div>
              <div>
                <div><span style={{ fontWeight: 600 }}>{f.who}</span> <span style={{ color:'var(--ink-2)' }}>{f.msg}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming + Courts heat */}
      <div style={{ gridColumn: 'span 7', background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8 }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Sắp bắt đầu</h3>
          <div style={{ flex: 1 }}/>
          <div className="caps">Cửa số 2 giờ</div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color:'var(--ink-3)', textAlign:'left' }}>
              {['Giờ','Sân','Hạng','Vòng','Trận đấu','Trạng thái'].map(h =>
                <th key={h} className="caps" style={{ padding: '8px 12px', fontWeight: 600, borderBottom:'1px solid var(--line)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {UPCOMING.map(m => (
              <tr key={m.id}>
                <td className="mono" style={{ padding: '10px 12px', borderBottom:'1px solid var(--line-2)' }}>{m.t}</td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom:'1px solid var(--line-2)' }}>Sân {m.court}</td>
                <td style={{ padding: '10px 12px', borderBottom:'1px solid var(--line-2)' }}>{CATEGORIES[m.cat]}</td>
                <td style={{ padding: '10px 12px', borderBottom:'1px solid var(--line-2)', color:'var(--ink-2)' }}>{m.round}</td>
                <td style={{ padding: '10px 12px', borderBottom:'1px solid var(--line-2)' }}>
                  <span style={{ fontWeight: 500 }}>{m.a}</span>
                  <span style={{ color:'var(--ink-3)', margin: '0 6px' }}>vs</span>
                  <span style={{ fontWeight: 500 }}>{m.b}</span>
                </td>
                <td style={{ padding: '10px 12px', borderBottom:'1px solid var(--line-2)' }}>
                  <span className="pill scheduled">Lên lịch</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ gridColumn: 'span 5', background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8 }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Công suất sân</h3>
        </div>
        <div style={{ padding: 16, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8 }}>
          {COURTS.map(c => {
            const bg = c.status === 'live' ? 'var(--accent)' :
                       c.status === 'idle' ? 'var(--paper-3)' : 'var(--amber-soft)';
            const fg = c.status === 'live' ? 'white' : 'var(--ink-2)';
            return (
              <div key={c.id} style={{
                background: bg, color: fg, padding: '10px 12px', borderRadius: 6,
                border: c.status !== 'live' ? '1px solid var(--line)' : 'none',
                display:'flex', flexDirection:'column', gap: 4, minHeight: 74,
              }}>
                <div className="mono" style={{ fontSize: 11, opacity: 0.8 }}>SÂN {c.id}</div>
                <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>
                  {c.status === 'live' ? c.match :
                   c.status === 'idle' ? 'Trống' : 'Bảo trì'}
                </div>
                <div className="mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 'auto' }}>{c.floor}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LiveRow({ m }) {
  const curSet = m.sets[m.current];
  const aWins = m.sets.filter(s => s[0] > s[1]).length;
  const bWins = m.sets.filter(s => s[1] > s[0]).length;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'56px 1fr auto 44px', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--line-2)', gap: 12 }}>
      <div>
        <div className="mono" style={{ fontSize: 11, color:'var(--ink-3)' }}>SÂN {m.court}</div>
        <div className="mono" style={{ fontSize: 10.5, color:'var(--ink-3)' }}>{m.cat}</div>
      </div>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 13 }}>
          {m.a.seed && <span className="mono" style={{ fontSize: 10, color:'var(--ink-3)' }}>[{m.a.seed}]</span>}
          <span style={{ fontWeight: aWins > bWins ? 600 : 500 }}>{m.a.name}</span>
          <span style={{ color:'var(--ink-3)', fontSize: 11 }}>· {m.a.club}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 13, marginTop: 2 }}>
          {m.b.seed && <span className="mono" style={{ fontSize: 10, color:'var(--ink-3)' }}>[{m.b.seed}]</span>}
          <span style={{ fontWeight: bWins > aWins ? 600 : 500 }}>{m.b.name}</span>
          <span style={{ color:'var(--ink-3)', fontSize: 11 }}>· {m.b.club}</span>
        </div>
      </div>
      <div className="mono" style={{ display:'flex', gap: 6, alignItems:'center' }}>
        {m.sets.map((s, i) => (
          <div key={i} style={{
            padding: '3px 7px', borderRadius: 4,
            background: i === m.current ? 'var(--accent)' : 'var(--paper-3)',
            color: i === m.current ? 'white' : 'var(--ink-2)',
            fontSize: 12, fontWeight: 600, minWidth: 42, textAlign:'center',
          }}>
            {s[0]}<span style={{ opacity: 0.5, margin: '0 3px' }}>–</span>{s[1]}
          </div>
        ))}
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10.5, color:'var(--ink-3)' }}>#{m.id}</div>
        <div className="mono" style={{ fontSize: 10.5, color:'var(--ink-3)' }}>{m.elapsed}</div>
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.btcNav = btcNav;
window.DashboardView = DashboardView;
window.LiveRow = LiveRow;
