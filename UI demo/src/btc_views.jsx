/* BTC: Schedule + Bracket + Athletes + Courts + Inventory + Finance + Reports + Referees + News + Settings */

/* ------ SCHEDULE (day grid: rows = courts, columns = time slots) ------ */
function ScheduleView() {
  const [day, setDay] = useS_btc(0);
  const days = ['Th.7 18/04','CN 19/04','Th.2 20/04','Th.3 21/04','Th.4 22/04','Th.5 23/04','Th.6 24/04','Th.7 25/04','CN 26/04'];
  const slots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:30','19:00','19:30','20:00'];
  // deterministic "schedule" blocks per court
  const blocks = [
    { court: 1, start: 0, span: 3, cat:'MS', label:'Đ.nam · R32 · #180-183', status:'done' },
    { court: 1, start: 8, span: 4, cat:'MS', label:'Đ.nam · R32 · #184', status:'live' },
    { court: 1, start: 12, span: 3, cat:'MS', label:'Đ.nam · R32 · #192', status:'scheduled' },
    { court: 1, start: 16, span: 3, cat:'MS', label:'Đ.nam · R16 · #202', status:'scheduled' },
    { court: 2, start: 0, span: 4, cat:'WS', label:'Đ.nữ · R32 · #181-185', status:'done' },
    { court: 2, start: 8, span: 3, cat:'WS', label:'Đ.nữ · R32 · #185', status:'live' },
    { court: 2, start: 11, span: 3, cat:'WD', label:'Đôi nữ · QF · #193', status:'scheduled' },
    { court: 2, start: 14, span: 3, cat:'WD', label:'Đôi nữ · QF · #196', status:'scheduled' },
    { court: 3, start: 0, span: 3, cat:'MD', label:'Đôi nam · R32', status:'done' },
    { court: 3, start: 8, span: 5, cat:'MD', label:'Đôi nam · QF · #186', status:'live' },
    { court: 3, start: 13, span: 3, cat:'XD', label:'Đôi NN · QF · #194', status:'scheduled' },
    { court: 4, start: 11, span: 3, cat:'WS', label:'Đ.nữ · R16 · #190', status:'scheduled' },
    { court: 4, start: 14, span: 3, cat:'WS', label:'Đ.nữ · R16', status:'scheduled' },
    { court: 5, start: 0, span: 4, cat:'XD', label:'Đôi NN · R32', status:'done' },
    { court: 5, start: 9, span: 3, cat:'XD', label:'Đôi NN · R16 · #187', status:'live' },
    { court: 5, start: 16, span: 3, cat:'MS', label:'Đ.nam · R16 · #195', status:'scheduled' },
    { court: 6, start: 1, span: 3, cat:'WD', label:'Đôi nữ · R32', status:'done' },
    { court: 6, start: 8, span: 4, cat:'WD', label:'Đôi nữ · R16 · #188', status:'live' },
    { court: 6, start: 14, span: 3, cat:'WD', label:'Đôi nữ · QF', status:'scheduled' },
    { court: 7, start: 0, span: 0, status:'maintenance' },
    { court: 7, start: 11, span: 3, cat:'MS', label:'Đ.nam · R16 · #191', status:'scheduled', conflict: true },
    { court: 8, start: 1, span: 3, cat:'MS', label:'Đ.nam · R32', status:'done' },
    { court: 8, start: 9, span: 3, cat:'MS', label:'Đ.nam · R32 · #189', status:'live' },
    { court: 8, start: 14, span: 3, cat:'MS', label:'Đ.nam · R16', status:'scheduled' },
  ];
  const colBg = {
    done:'var(--paper-3)',
    live:'var(--accent)',
    scheduled:'var(--paper-2)',
    maintenance:'repeating-linear-gradient(45deg, var(--paper-3) 0 6px, var(--paper-2) 6px 12px)',
  };
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 14, height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <div>
          <div className="caps">Lịch thi đấu chi tiết</div>
          <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>Điều phối 9 ngày · 8 sân · 284 trận</h1>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display:'flex', gap: 6 }}>
          <button style={btnGhost}><Icon name="filter" size={13}/> Hạng mục</button>
          <button style={btnGhost}><Icon name="user" size={13}/> Trọng tài</button>
          <button style={btnPrimary}><Icon name="plus" size={13}/> Thêm trận phụ</button>
        </div>
      </div>

      <div style={{ display:'flex', gap: 4, overflowX:'auto' }} className="no-scrollbar">
        {days.map((d, i) => (
          <button key={d} onClick={() => setDay(i)} style={{
            padding:'7px 14px', borderRadius: 6,
            border:'1px solid ' + (day === i ? 'var(--ink)' : 'var(--line)'),
            background: day === i ? 'var(--ink)' : 'var(--paper)',
            color: day === i ? 'white' : 'var(--ink-2)', fontSize: 12, whiteSpace:'nowrap',
          }}>{d}</button>
        ))}
      </div>

      <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, overflow:'hidden', flex: 1, display:'flex', flexDirection:'column' }}>
        {/* header */}
        <div style={{ display:'grid', gridTemplateColumns: `90px repeat(${slots.length}, 1fr)`, borderBottom:'1px solid var(--line)', background:'var(--paper-2)' }}>
          <div/>
          {slots.map((s, i) => (
            <div key={s} className="mono" style={{ padding:'6px 4px', fontSize: 10.5, color:'var(--ink-3)', textAlign:'center', borderLeft:'1px solid var(--line-2)' }}>
              {i === 8 ? '' : ''}{s}
            </div>
          ))}
        </div>
        {/* rows */}
        <div style={{ flex: 1, overflow:'auto' }} className="scrollbar">
          {COURTS.map(c => (
            <div key={c.id} style={{ display:'grid', gridTemplateColumns: `90px repeat(${slots.length}, 1fr)`, borderBottom:'1px solid var(--line-2)', minHeight: 48, position:'relative' }}>
              <div style={{ padding:'12px', fontSize: 12, fontWeight: 600, borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', justifyContent:'center', background:'var(--paper-2)' }}>
                <div>Sân {c.id}</div>
                <div className="mono" style={{ fontSize: 10, color:'var(--ink-3)', fontWeight: 400 }}>{c.floor}</div>
              </div>
              {slots.map((_, i) => <div key={i} style={{ borderLeft:'1px solid var(--line-2)' }}/>)}
              {c.status === 'maintenance' && (
                <div style={{ position:'absolute', left: 90, right: 0, top: 0, bottom: 0,
                  background: colBg.maintenance, display:'flex', alignItems:'center', paddingLeft: 12, color:'var(--ink-3)', fontSize: 11.5, fontStyle:'italic' }}>
                  Bảo trì lưới — không xếp lịch
                </div>
              )}
              {blocks.filter(b => b.court === c.id && b.span > 0).map((b, i) => {
                const width = `calc((100% - 90px) / ${slots.length} * ${b.span})`;
                const left = `calc(90px + (100% - 90px) / ${slots.length} * ${b.start})`;
                return (
                  <div key={i} style={{
                    position:'absolute', left, width, top: 5, bottom: 5,
                    background: colBg[b.status], color: b.status === 'live' ? 'white' : 'var(--ink)',
                    borderRadius: 4, padding: '6px 8px', fontSize: 11, cursor:'pointer',
                    border: b.conflict ? '1.5px solid var(--amber)' : (b.status === 'scheduled' ? '1px solid var(--line)' : 'none'),
                    display:'flex', flexDirection:'column', gap: 1, overflow:'hidden',
                  }}>
                    <div className="mono" style={{ fontSize: 9.5, opacity: 0.75 }}>{b.cat}</div>
                    <div style={{ fontWeight: 600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.label}</div>
                    {b.conflict && <div style={{ fontSize: 10, color:'var(--amber)', fontWeight: 600 }}>⚠ Xung đột trọng tài</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap: 14, fontSize: 11.5, color:'var(--ink-3)' }}>
        <Legend color="var(--accent)" label="Đang thi đấu"/>
        <Legend color="var(--paper-3)" label="Đã kết thúc"/>
        <Legend color="var(--paper-2)" outline label="Đã lên lịch"/>
        <Legend color="var(--amber)" outline label="Xung đột / cần xử lý"/>
        <div style={{ flex:1 }}/>
        <div className="mono">Tự động điều phối: bật · tránh xung đột VĐV ≥ 45′ · cân tải 2 set/ngày</div>
      </div>
    </div>
  );
}
const Legend = ({ color, label, outline }) => (
  <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
    <span style={{ width: 14, height: 10, background: outline ? 'transparent' : color, border: '1px solid ' + color, borderRadius: 2 }}/>
    {label}
  </div>
);
const btnGhost = { background:'var(--paper)', border:'1px solid var(--line)', padding:'7px 11px', borderRadius: 6, fontSize: 12, display:'inline-flex', alignItems:'center', gap: 6, color: 'var(--ink)' };
const btnPrimary = { background:'var(--ink)', color:'white', border: 0, padding:'7px 11px', borderRadius: 6, fontSize: 12, display:'inline-flex', alignItems:'center', gap: 6 };

/* ------ BRACKET ------ */
function BracketView() {
  const rounds = [
    { label: 'Vòng 1/16', matches: 8 },
    { label: 'Tứ kết',    matches: 4 },
    { label: 'Bán kết',   matches: 2 },
    { label: 'Chung kết', matches: 1 },
  ];
  const names = {
    r16: [
      ['Nguyễn Hải Đăng', 'Trần Minh Quân'],
      ['Lê Đức Phát', 'Nguyễn Hoàng Nam'],
      ['Phạm Văn Hiếu', 'Trần Quốc Toàn'],
      ['Đỗ Tuấn Đức', 'Lý Hoàng Long'],
      ['Nguyễn Tiến Minh', 'Hoàng Văn Bách'],
      ['Vũ Tiến Dũng', 'Phan Văn Hùng'],
      ['Lê Hoàng Phúc', 'Đặng Quang Minh'],
      ['Nguyễn Anh Tú', 'Trần Duy Khánh'],
    ],
  };
  const scores = {
    r16: [ '21-14, 16-21, -', '21-19, 9-4', '—', '19-21, 21-17, 8-6', '—', '—', '—', '—' ],
    qf:  [ 'TBD', 'TBD', 'TBD', 'TBD' ],
    sf:  [ 'TBD', 'TBD' ],
    f:   [ 'TBD' ],
  };
  const col = { display:'flex', flexDirection:'column', gap: 12, flex: 1, minWidth: 220 };
  const match = (names, score, live) => (
    <div style={{
      background:'var(--paper)', border:'1px solid '+(live?'var(--accent)':'var(--line)'),
      borderRadius: 6, padding: '8px 10px', fontSize: 12.5, position:'relative',
      boxShadow: live ? '0 0 0 3px oklch(0.94 0.04 25)' : 'none',
    }}>
      {live && <span className="pill live" style={{ position:'absolute', top: -8, right: 8, fontSize: 9.5, padding:'1px 6px' }}><span className="dot live-dot"/>LIVE</span>}
      <div style={{ display:'flex', justifyContent:'space-between', padding: '3px 0' }}>
        <span>{names[0]}</span><span className="mono" style={{ color:'var(--ink-3)' }}>{score[0] || ''}</span>
      </div>
      <div style={{ borderTop:'1px solid var(--line-2)' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', padding: '3px 0' }}>
        <span>{names[1]}</span><span className="mono" style={{ color:'var(--ink-3)' }}>{score[1] || ''}</span>
      </div>
    </div>
  );
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 14 }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap: 12 }}>
        <div>
          <div className="caps">Sơ đồ thi đấu</div>
          <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>Đơn nam · Nhánh loại trực tiếp</h1>
          <div style={{ color:'var(--ink-2)', fontSize: 12.5 }}>Tự cập nhật sau mỗi trận · Hạt giống 1–8 được phân tán theo FIBA seeding</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display:'flex', gap: 6 }}>
          {Object.entries(CATEGORIES).map(([k,v],i) => (
            <button key={k} style={{
              padding:'6px 11px', borderRadius: 6, border:'1px solid ' + (i===0?'var(--ink)':'var(--line)'),
              background: i===0?'var(--ink)':'var(--paper)', color: i===0?'white':'var(--ink-2)', fontSize: 12,
            }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap: 18, padding: 24, background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, overflowX:'auto' }}>
        {/* r16 */}
        <div style={col}>
          <div className="caps" style={{ textAlign:'center' }}>Vòng 1/16</div>
          {names.r16.map((ns, i) => match(ns, (scores.r16[i] ? ['','']:['','']), i === 0))}
          {/* we place score inline via a custom variant */}
        </div>
        <div style={col}>
          <div className="caps" style={{ textAlign:'center' }}>Tứ kết</div>
          {[0,1,2,3].map(i => match(['TBD','TBD'], ['',''], false))}
        </div>
        <div style={col}>
          <div className="caps" style={{ textAlign:'center' }}>Bán kết</div>
          {[0,1].map(i => match(['TBD','TBD'], ['',''], false))}
        </div>
        <div style={col}>
          <div className="caps" style={{ textAlign:'center' }}>Chung kết</div>
          {match(['TBD','TBD'], ['',''], false)}
          <div style={{
            marginTop: 40, background:'var(--ink)', color:'white',
            borderRadius: 8, padding: 16, textAlign:'center',
          }}>
            <div className="caps" style={{ color:'oklch(0.75 0.01 250)' }}>Nhà vô địch</div>
            <div className="serif" style={{ fontSize: 28, letterSpacing:'0.02em', textTransform:'uppercase', marginTop: 6 }}>—</div>
            <div className="mono" style={{ fontSize: 11, color:'oklch(0.65 0.01 250)', marginTop: 4 }}>Cúp + 50.000.000 ₫</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------ ATHLETES — pending auth approval (BTC approves VĐV) ------ */
function PendingAthleteApprovals() {
  const [users, setUsers] = useS_btc(() => getUsers().filter(u => u.status === 'pending' && u.requestedRole === 'athlete'));
  const [confirm, setConfirm] = useS_btc(null);
  const [timer, setTimer] = useS_btc(null);

  const refresh = () => setUsers(getUsers().filter(u => u.status === 'pending' && u.requestedRole === 'athlete'));

  const prime = (userId, action) => {
    if (timer) clearTimeout(timer);
    setConfirm({ userId, action });
    const t = setTimeout(() => setConfirm(null), 3000);
    setTimer(t);
  };

  const execute = () => {
    if (!confirm) return;
    if (confirm.action === 'approve') authApprove(confirm.userId, 'athlete');
    else authReject(confirm.userId);
    setConfirm(null);
    refresh();
  };

  if (users.length === 0) return (
    <div style={{ padding:'32px 0', textAlign:'center', color:'var(--ink-3)', fontSize:13.5 }}>
      Không có VĐV nào chờ phê duyệt.
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:4 }}>
      {confirm && (
        <div style={{
          padding:'10px 14px', borderRadius:6,
          background: confirm.action === 'approve' ? 'oklch(0.93 0.06 160)' : 'oklch(0.96 0.04 25)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <span style={{ fontSize:13 }}>
            {confirm.action === 'approve' ? 'Xác nhận duyệt VĐV?' : 'Xác nhận từ chối?'} Nhấn lại để thực hiện.
          </span>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={execute} style={{
              padding:'5px 12px', borderRadius:5, border:'none', cursor:'pointer',
              background: confirm.action === 'approve' ? 'oklch(0.42 0.14 160)' : 'var(--accent)',
              color:'white', fontSize:12, fontWeight:600,
            }}>{confirm.action === 'approve' ? 'Duyệt' : 'Từ chối'}</button>
            <button onClick={() => setConfirm(null)} style={{ padding:'5px 10px', borderRadius:5, border:'1px solid var(--line)', background:'transparent', fontSize:12, cursor:'pointer' }}>Huỷ</button>
          </div>
        </div>
      )}
      {users.map(u => {
        const isActive = confirm?.userId === u.id;
        return (
          <div key={u.id} style={{
            padding:'12px 16px', borderRadius:7,
            border:'1px solid var(--line)', background:'var(--paper)',
            display:'flex', alignItems:'center', gap:14,
            boxShadow: isActive ? '0 0 0 2px var(--ink)' : 'none',
          }}>
            <div style={{
              width:32, height:32, borderRadius:5, background:'oklch(0.88 0.03 250)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--ink)',
            }}>{u.name.charAt(0)}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13.5 }}>{u.name}</div>
              <div style={{ fontSize:11.5, color:'var(--ink-2)' }}>{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
            </div>
            <span style={{ fontSize:11, color:'var(--ink-3)', fontFamily:'var(--font-mono)' }}>{u.createdAt}</span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => prime(u.id, 'approve')} style={{
                padding:'6px 12px', borderRadius:5, border:'none', cursor:'pointer',
                background: isActive && confirm.action==='approve' ? 'oklch(0.42 0.14 160)' : 'oklch(0.93 0.06 160)',
                color: isActive && confirm.action==='approve' ? 'white' : 'oklch(0.42 0.14 160)',
                fontSize:12, fontWeight:600,
              }}>Duyệt VĐV</button>
              <button onClick={() => prime(u.id, 'reject')} style={{
                padding:'6px 12px', borderRadius:5, cursor:'pointer',
                border:'1px solid var(--line)',
                background: isActive && confirm.action==='reject' ? 'var(--accent)' : 'transparent',
                color: isActive && confirm.action==='reject' ? 'white' : 'var(--ink-2)',
                fontSize:12,
              }}>Từ chối</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------ ATHLETES ------ */
function AthletesView() {
  const [tab, setTab] = useS_btc('roster'); // 'roster' | 'pending-auth'
  const [filter, setFilter] = useS_btc('all');
  const [sel, setSel] = useS_btc(null);
  const pendingAuthCount = getUsers().filter(u => u.status === 'pending' && u.requestedRole === 'athlete').length;
  const filtered = ATHLETES.filter(a => filter === 'all' ? true : a.status === filter);
  return (
    <div style={{ padding: 18, display:'grid', gridTemplateColumns: sel ? '1fr 360px' : '1fr', gap: 16, height:'100%' }}>
      <div style={{ display:'flex', flexDirection:'column', gap: 14, minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap: 12 }}>
          <div>
            <div className="caps">Vận động viên & hồ sơ</div>
            <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>{TOURNAMENT.registered} đăng ký · {TOURNAMENT.approved} hợp lệ</h1>
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ position:'relative' }}>
            <Icon name="search" size={14} style={{ position:'absolute', left: 9, top: 9, color:'var(--ink-3)' }}/>
            <input placeholder="Tìm theo tên, mã, CLB…" style={{
              padding:'7px 11px 7px 30px', fontSize: 12.5, border:'1px solid var(--line)', borderRadius: 6, background:'var(--paper)', width: 240,
            }}/>
          </div>
          <button style={btnPrimary}><Icon name="dl" size={13}/> Xuất danh sách</button>
        </div>

        {/* Top-level tab: Roster vs Pending auth */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--line)' }}>
          {[
            ['roster', 'Danh sách VĐV'],
            ['pending-auth', `Chờ duyệt tài khoản${pendingAuthCount ? ` (${pendingAuthCount})` : ''}`],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:'7px 16px', border:'none', background:'transparent', cursor:'pointer',
              fontSize:13, fontWeight: tab===id ? 600 : 400,
              color: tab===id ? 'var(--ink)' : 'var(--ink-2)',
              borderBottom: tab===id ? '2px solid var(--ink)' : '2px solid transparent',
              marginBottom:-1,
            }}>{label}</button>
          ))}
        </div>

        {tab === 'pending-auth' ? <PendingAthleteApprovals/> : (<>
        <div style={{ display:'flex', gap: 6 }}>
          {[
            ['all','Tất cả', ATHLETES.length],
            ['approved','Đã duyệt', ATHLETES.filter(a=>a.status==='approved').length],
            ['pending','Chờ duyệt', ATHLETES.filter(a=>a.status==='pending').length],
            ['incomplete','Thiếu thông tin', ATHLETES.filter(a=>a.status==='incomplete').length],
          ].map(([id, l, n]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding:'6px 12px', borderRadius: 6, border:'1px solid ' + (filter===id?'var(--ink)':'var(--line)'),
              background: filter===id?'var(--ink)':'var(--paper)', color: filter===id?'white':'var(--ink-2)', fontSize: 12,
            }}>{l} <span style={{ opacity: 0.6, marginLeft: 4 }}>{n}</span></button>
          ))}
        </div>

        <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, overflow:'hidden', flex: 1 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ color:'var(--ink-3)', textAlign:'left', background:'var(--paper-2)' }}>
                {['Mã','Họ tên','CLB','Giới','Sinh','Hạng','Rating','Trạng thái',''].map(h =>
                  <th key={h} className="caps" style={{ padding:'9px 12px', fontWeight: 600, borderBottom:'1px solid var(--line)' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setSel(a)} style={{ cursor:'pointer', background: sel?.id === a.id ? 'var(--paper-2)' : 'transparent' }}>
                  <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', color:'var(--ink-3)' }}>{a.id}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>{a.club}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>{a.gender === 'M' ? 'Nam' : 'Nữ'}</td>
                  <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>{a.dob}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>
                    <span className="mono" style={{
                      padding:'1px 6px', borderRadius: 3, fontSize: 10,
                      background: a.tier==='A'?'var(--ink)':a.tier==='B'?'var(--paper-3)':'var(--paper-2)',
                      color: a.tier==='A'?'white':'var(--ink-2)',
                    }}>{a.tier}</span>
                  </td>
                  <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>{a.rating}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>
                    {a.status === 'approved' && <span className="pill ok"><span className="dot" style={{background:'oklch(0.55 0.12 150)'}}/>Đã duyệt</span>}
                    {a.status === 'pending'  && <span className="pill info">Chờ duyệt</span>}
                    {a.status === 'incomplete' && <span className="pill warn">Thiếu thông tin</span>}
                  </td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', textAlign:'right', color:'var(--ink-3)' }}>
                    <Icon name="chevR" size={14}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>)}
      </div>

      {sel && <AthleteDetail a={sel} onClose={() => setSel(null)}/>}
    </div>
  );
}

function AthleteDetail({ a, onClose }) {
  return (
    <aside style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, padding: 18, display:'flex', flexDirection:'column', gap: 14, alignSelf:'stretch' }}>
      <div style={{ display:'flex', gap: 10 }}>
        <div className="caps" style={{ flex: 1 }}>Hồ sơ vận động viên</div>
        <button onClick={onClose} style={{ border:0, background:'transparent', color:'var(--ink-3)' }}><Icon name="x" size={14}/></button>
      </div>
      <div style={{ display:'flex', gap: 12 }}>
        <div className="court-placeholder" style={{ width: 80, height: 100, borderRadius: 4, flexShrink: 0, fontSize: 9 }}>
          Ảnh 3×4
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, color:'var(--ink-3)' }}>{a.id}</div>
          <div className="serif" style={{ fontSize: 24, letterSpacing:'0.01em', textTransform:'uppercase', marginTop: 2 }}>{a.name}</div>
          <div style={{ fontSize: 12.5, color:'var(--ink-2)', marginTop: 4 }}>{a.club} · {a.gender === 'M' ? 'Nam' : 'Nữ'} · {a.dob}</div>
          <div style={{ marginTop: 6, display:'flex', gap: 4 }}>
            <span className="pill ok">Hạng {a.tier}</span>
            <span className="pill info">Rating {a.rating}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="caps" style={{ marginBottom: 6 }}>Giấy tờ</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6 }}>
          <div className="court-placeholder" style={{ height: 70, borderRadius: 4, fontSize: 9 }}>CCCD mặt trước</div>
          <div className="court-placeholder" style={{ height: 70, borderRadius: 4, fontSize: 9 }}>CCCD mặt sau</div>
        </div>
      </div>

      <div>
        <div className="caps" style={{ marginBottom: 6 }}>Hạng mục đăng ký</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap: 4 }}>
          {['MS','MD','XD'].map(c => <span key={c} className="pill">{CATEGORIES[c]}</span>)}
        </div>
      </div>

      <div>
        <div className="caps" style={{ marginBottom: 6 }}>Thành tích gần đây</div>
        <div style={{ fontSize: 12.5, color:'var(--ink-2)', display:'flex', flexDirection:'column', gap: 4 }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}><span>Giải Toàn Quốc 2025</span><span className="mono">QF</span></div>
          <div style={{ display:'flex', justifyContent:'space-between' }}><span>Giải Các CLB 2024</span><span className="mono">SF</span></div>
          <div style={{ display:'flex', justifyContent:'space-between' }}><span>Vietnam Open 2024</span><span className="mono">R32</span></div>
        </div>
      </div>

      {a.status === 'pending' && (
        <div style={{ marginTop: 'auto', display:'flex', gap: 8 }}>
          <button style={{ ...btnGhost, flex: 1, justifyContent:'center', color:'var(--accent-ink)' }}>
            <Icon name="x" size={13}/> Từ chối
          </button>
          <button style={{ ...btnPrimary, flex: 2, justifyContent:'center', background:'var(--court)' }}>
            <Icon name="check" size={13}/> Phê duyệt hồ sơ
          </button>
        </div>
      )}
      {a.status === 'incomplete' && (
        <div style={{ marginTop: 'auto', padding: 10, background:'var(--amber-soft)', borderRadius: 6, fontSize: 12 }}>
          <b>Yêu cầu bổ sung:</b> {a.note}
        </div>
      )}
    </aside>
  );
}

/* ------ COURTS ------ */
function CourtsView() {
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 16 }}>
      <div>
        <div className="caps">Sân & điều phối</div>
        <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>8 sân · Nhà thi đấu Phú Thọ</h1>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12 }}>
        {COURTS.map(c => {
          const live = LIVE_MATCHES.find(m => m.court === c.id);
          return (
            <div key={c.id} style={{
              background: c.status === 'live' ? 'var(--ink)' : 'var(--paper)', color: c.status==='live'?'white':'var(--ink)',
              border: '1px solid ' + (c.status === 'live' ? 'var(--ink)' : 'var(--line)'),
              borderRadius: 8, overflow:'hidden',
            }}>
              <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between',
                            borderBottom: '1px solid ' + (c.status === 'live' ? 'oklch(0.28 0.01 250)' : 'var(--line)') }}>
                <div>
                  <div className="caps" style={{ opacity: 0.7 }}>SÂN</div>
                  <div className="serif" style={{ fontSize: 40 }}>{c.id}</div>
                </div>
                {c.status === 'live' && <span className="pill live"><span className="dot live-dot"/>LIVE</span>}
                {c.status === 'idle' && <span className="pill">Trống</span>}
                {c.status === 'maintenance' && <span className="pill warn">Bảo trì</span>}
              </div>
              {/* mini court diagram */}
              <div style={{ padding: 12, height: 110, position:'relative', background: c.status === 'live' ? 'oklch(0.24 0.01 250)' : 'var(--paper-2)' }}>
                <div style={{ position:'absolute', inset: 12, border: '1px solid ' + (c.status==='live'?'oklch(0.4 0.01 250)':'var(--line)'), borderRadius: 3 }}>
                  <div style={{ position:'absolute', top:'50%', left: 0, right: 0, height: 1, background: c.status==='live'?'oklch(0.4 0.01 250)':'var(--line)' }}/>
                  <div style={{ position:'absolute', top: 0, bottom: 0, left:'50%', width: 1, background: c.status==='live'?'oklch(0.4 0.01 250)':'var(--line)' }}/>
                </div>
                {live && (
                  <div className="mono" style={{ position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 22, letterSpacing: '-0.02em' }}>
                    {live.sets[live.current][0]} : {live.sets[live.current][1]}
                  </div>
                )}
              </div>
              <div style={{ padding:'10px 14px', fontSize: 12 }}>
                {live ? (
                  <>
                    <div style={{ opacity: 0.7, fontSize: 10.5 }} className="caps">{live.round} · {live.cat}</div>
                    <div style={{ marginTop: 3 }}>{live.a.name}</div>
                    <div style={{ opacity: 0.7 }}>vs {live.b.name}</div>
                  </>
                ) : c.status === 'idle' ? (
                  <>
                    <div style={{ color:'var(--ink-3)' }}>Trận kế: <b>15:30</b> · #190</div>
                    <div style={{ color:'var(--ink-3)' }}>Nguyễn Thùy Linh vs Đào Ngọc Bích</div>
                  </>
                ) : (
                  <div style={{ color:'var(--ink-2)' }}>Thay lưới · dự kiến hoạt động trở lại 16:30</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------ INVENTORY ------ */
function InventoryView() {
  const items = [
    { sku: 'SH-VIC-AS30', name: 'Victor AS-30 · tournament grade', stock: 132, min: 80, issued: 28, status: 'ok' },
    { sku: 'SH-YNX-AS50', name: 'Yonex AS-50 · tournament grade', stock: 96,  min: 80, issued: 34, status: 'warn' },
    { sku: 'SH-YNX-M300', name: 'Yonex Mavis 300 · plastic (warmup)', stock: 84, min: 40, issued: 12, status: 'ok' },
    { sku: 'SH-LIN-A200', name: 'Li-Ning A+200 · training', stock: 100, min: 60, issued: 13, status: 'ok' },
    { sku: 'GR-BGY-65',  name: 'Yonex BG65 · dây vợt', stock: 22, min: 30, issued: 4, status: 'critical' },
    { sku: 'TW-STD',     name: 'Khăn lau sân · hộp 50',    stock: 18, min: 20, issued: 6, status: 'warn' },
  ];
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 14 }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap: 12 }}>
        <div>
          <div className="caps">Kho cầu & vật tư</div>
          <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>Tồn kho · cấp phát · cảnh báo</h1>
        </div>
        <div style={{ flex: 1 }}/>
        <button style={btnGhost}><Icon name="dl" size={13}/> Xuất báo cáo kho</button>
        <button style={btnPrimary}><Icon name="plus" size={13}/> Nhập kho</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Tổng tồn" value="412" sub="cầu thi đấu + tập"/>
        <StatCard label="Cấp hôm nay" value="87" sub="+12 so với hôm qua" accent="var(--court)"/>
        <StatCard label="Định mức / trận" value="3-5" sub="set 2 trở lên: +1"/>
        <StatCard label="Cảnh báo đang mở" value="2" sub="1 critical · 1 warning" accent="var(--amber)"/>
      </div>

      <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color:'var(--ink-3)', textAlign:'left', background:'var(--paper-2)' }}>
              {['Mã','Vật tư','Tồn','Tối thiểu','Xuất hôm nay','Trạng thái',''].map(h =>
                <th key={h} className="caps" style={{ padding:'9px 12px', fontWeight: 600, borderBottom:'1px solid var(--line)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map(it => {
              const pct = Math.min(100, it.stock / (it.min * 2) * 100);
              return (
                <tr key={it.sku}>
                  <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', color:'var(--ink-3)' }}>{it.sku}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', fontWeight: 500 }}>{it.name}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', minWidth: 160 }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background:'var(--line-2)', borderRadius: 2 }}>
                        <div style={{ width: pct + '%', height: '100%', background: it.status === 'critical' ? 'var(--accent)' : it.status === 'warn' ? 'var(--amber)' : 'var(--court)', borderRadius: 2 }}/>
                      </div>
                      <span className="mono">{it.stock}</span>
                    </div>
                  </td>
                  <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', color:'var(--ink-3)' }}>{it.min}</td>
                  <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>{it.issued}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>
                    {it.status === 'ok' && <span className="pill ok">Đủ</span>}
                    {it.status === 'warn' && <span className="pill warn">Thấp</span>}
                    {it.status === 'critical' && <span className="pill" style={{background:'var(--accent)', color:'white', borderColor:'var(--accent)'}}>Cạn kho</span>}
                  </td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', textAlign:'right' }}>
                    <button style={btnGhost}>Cấp phát</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------ FINANCE ------ */
function FinanceView() {
  const rows = [
    { t:'18/04', desc:'Lệ phí đăng ký · VNPay · 14 giao dịch', cat:'Thu', amt: 7_000_000 },
    { t:'18/04', desc:'Lệ phí đăng ký · Momo · 9 giao dịch', cat:'Thu', amt: 4_500_000 },
    { t:'17/04', desc:'Chi phí vật tư · cầu Yonex (200 ống)', cat:'Chi', amt: -48_000_000 },
    { t:'17/04', desc:'Tiền thưởng Huy chương (50%)', cat:'Chi', amt: -65_000_000 },
    { t:'16/04', desc:'Thuê nhà thi đấu · 9 ngày', cat:'Chi', amt: -270_000_000 },
    { t:'15/04', desc:'Tài trợ · Yonex Vietnam', cat:'Thu', amt: 250_000_000 },
    { t:'15/04', desc:'Tài trợ · Victor Asia', cat:'Thu', amt: 180_000_000 },
    { t:'14/04', desc:'Phí trọng tài · 28 người × 9 ngày', cat:'Chi', amt: -126_000_000 },
  ];
  const totalIn = rows.filter(r=>r.amt>0).reduce((s,r)=>s+r.amt,0);
  const totalOut = rows.filter(r=>r.amt<0).reduce((s,r)=>s+r.amt,0);
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 14 }}>
      <div>
        <div className="caps">Tài chính giải đấu</div>
        <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>Ngân sách · Thu/Chi · Báo cáo</h1>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Ngân sách giải" value={money(TOURNAMENT.budget)} sub="được phê duyệt 15/03"/>
        <StatCard label="Tổng thu đến nay" value={money(totalIn)} sub="lệ phí + tài trợ" accent="var(--court)"/>
        <StatCard label="Tổng chi đến nay" value={money(-totalOut)} sub="vật tư + tổ chức + thưởng" accent="var(--accent)"/>
        <StatCard label="Cân đối" value={money(totalIn+totalOut)} sub="tính tại 18/04 15:00"/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14 }}>
        <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8 }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center' }}>
            <h3 style={{ margin:0, fontSize: 13, fontWeight: 600 }}>Lịch sử giao dịch</h3>
            <div style={{ flex:1 }}/>
            <button style={btnGhost}><Icon name="pdf" size={13}/> Xuất PDF</button>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 12.5 }}>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{ padding:'10px 16px', borderBottom:'1px solid var(--line-2)', color:'var(--ink-3)', width: 60 }}>{r.t}</td>
                  <td style={{ padding:'10px 16px', borderBottom:'1px solid var(--line-2)' }}>{r.desc}</td>
                  <td className="mono" style={{ padding:'10px 16px', borderBottom:'1px solid var(--line-2)', textAlign:'right', fontWeight: 600, color: r.amt > 0 ? 'var(--court)' : 'var(--accent)' }}>
                    {r.amt > 0 ? '+' : ''}{money(r.amt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, padding: 16 }}>
          <h3 style={{ margin:0, fontSize: 13, fontWeight: 600 }}>Cơ cấu chi phí</h3>
          <div style={{ marginTop: 12, display:'flex', flexDirection:'column', gap: 8 }}>
            {[
              ['Thuê địa điểm', 270, 'var(--ink)'],
              ['Giải thưởng', 200, 'var(--accent)'],
              ['Vật tư & hậu cần', 160, 'var(--court)'],
              ['Phí trọng tài', 126, 'var(--amber)'],
              ['Y tế & an ninh', 40, 'var(--ink-3)'],
              ['Truyền thông', 30, 'oklch(0.55 0.12 250)'],
            ].map(([l,v,c]) => (
              <div key={l}>
                <div style={{ display:'flex', fontSize: 12 }}>
                  <span>{l}</span><span style={{flex:1}}/><span className="mono">{v}M</span>
                </div>
                <div style={{ height: 4, background:'var(--line-2)', borderRadius: 2, marginTop: 3 }}>
                  <div style={{ width: `${v/3}%`, height:'100%', background: c, borderRadius: 2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function money(n) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + '\u00A0tr';
  return n.toLocaleString('vi-VN') + '\u00A0₫';
}

/* ------ REPORTS ------ */
function ReportsView() {
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 14 }}>
      <div>
        <div className="caps">Báo cáo & thống kê</div>
        <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>Xuất báo cáo chuẩn Bộ VHTT&DL</h1>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12 }}>
        {[
          { name: 'Báo cáo tổng kết giải đấu', sub: 'PDF · chuẩn Bộ VHTT&DL · ~28 trang', cta: 'Xuất PDF', icon: 'pdf' },
          { name: 'Danh sách VĐV & CLB', sub: 'CSV · tất cả 384 hồ sơ đăng ký', cta: 'Xuất CSV', icon: 'users' },
          { name: 'Báo cáo tài chính chi tiết', sub: 'XLSX · thu, chi, chứng từ', cta: 'Xuất XLSX', icon: 'wallet' },
          { name: 'Kết quả toàn bộ trận đấu', sub: 'PDF · 284 trận · tỷ số từng set', cta: 'Xuất PDF', icon: 'pdf' },
          { name: 'Cập nhật bảng xếp hạng quốc gia', sub: 'JSON · đồng bộ với BXH quốc gia', cta: 'Đồng bộ', icon: 'chart' },
          { name: 'Nhật ký trọng tài & kháng nghị', sub: 'PDF · 4 kháng nghị · 2 walkover', cta: 'Xuất PDF', icon: 'shield' },
        ].map(r => (
          <div key={r.name} style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, padding: 16, display:'flex', flexDirection:'column', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background:'var(--paper-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-2)' }}>
              <Icon name={r.icon} size={16}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 12, color:'var(--ink-3)', flex: 1 }}>{r.sub}</div>
            <button style={{ ...btnGhost, width:'fit-content' }}><Icon name="dl" size={13}/>{r.cta}</button>
          </div>
        ))}
      </div>

      <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ margin:0, fontSize: 13, fontWeight: 600 }}>Thống kê nhanh — 18/04</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 16, marginTop: 14 }}>
          {[
            ['Trận hoàn tất', '32'],
            ['Set trung bình / trận', '2.6'],
            ['Thời gian TB / trận', '38′'],
            ['Hủy / hoãn', '1'],
            ['Kháng nghị', '2'],
            ['Khán giả check-in', '4.120'],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="caps">{l}</div>
              <div className="serif" style={{ fontSize: 26, lineHeight: 1, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------ simple stubs for the rest ------ */
function RefereesView() {
  const refs = [
    { id:'R-01', name:'Lê Quang Huy', assigned: 3, today: 1, cert: 'Quốc gia A' },
    { id:'R-02', name:'Nguyễn Hồng Sơn', assigned: 2, today: 1, cert: 'Quốc gia A' },
    { id:'R-03', name:'Trịnh Quốc Hưng', assigned: 4, today: 2, cert: 'Quốc gia B' },
    { id:'R-04', name:'Phạm Thành Long', assigned: 2, today: 1, cert: 'Quốc gia B' },
    { id:'R-05', name:'Hoàng Mai', assigned: 3, today: 1, cert: 'Quốc gia A' },
    { id:'R-06', name:'Đinh Văn Khoa', assigned: 3, today: 1, cert: 'Quốc gia B' },
  ];
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 14 }}>
      <div>
        <div className="caps">Trọng tài & phân công</div>
        <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>28 trọng tài · 6 trận hiện tại</h1>
      </div>
      <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color:'var(--ink-3)', textAlign:'left', background:'var(--paper-2)' }}>
              {['Mã','Tên','Cấp','Phân công tổng','Hôm nay',''].map(h =>
                <th key={h} className="caps" style={{ padding:'9px 12px', fontWeight: 600, borderBottom:'1px solid var(--line)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {refs.map(r => (
              <tr key={r.id}>
                <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', color:'var(--ink-3)' }}>{r.id}</td>
                <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}><span className="pill">{r.cert}</span></td>
                <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>{r.assigned}</td>
                <td className="mono" style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)' }}>{r.today}</td>
                <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--line-2)', textAlign:'right' }}>
                  <button style={btnGhost}>Phân công</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewsView() {
  return (
    <div style={{ padding: 18, display:'flex', flexDirection:'column', gap: 14 }}>
      <div style={{ display:'flex', alignItems:'flex-end' }}>
        <div>
          <div className="caps">Tin tức & truyền thông</div>
          <h1 className="serif" style={{ margin:'2px 0 0', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>Bài viết · thông báo · highlight</h1>
        </div>
        <div style={{ flex:1 }}/>
        <button style={btnPrimary}><Icon name="plus" size={13}/>Bài viết mới</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12 }}>
        {NEWS.concat(NEWS).map((n, i) => (
          <div key={i} style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, overflow:'hidden' }}>
            <div className="court-placeholder" style={{ height: 120, fontSize: 10 }}>ảnh tin tức 16:9</div>
            <div style={{ padding: 14 }}>
              <span className="pill">{n.tag}</span>
              <h4 style={{ margin: '8px 0 6px', fontSize: 14, lineHeight: 1.35 }}>{n.title}</h4>
              <div className="mono" style={{ fontSize: 10.5, color:'var(--ink-3)' }}>{n.ts} · Đã xuất bản</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div style={{ padding: 18, maxWidth: 720 }}>
      <div className="caps">Cấu hình giải</div>
      <h1 className="serif" style={{ margin:'2px 0 14px', fontSize: 28, letterSpacing:'0.01em', textTransform:'uppercase' }}>{TOURNAMENT.name}</h1>
      <div style={{ background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 8, padding: 20, display:'grid', gap: 14 }}>
        {[
          ['Tên giải', TOURNAMENT.name],
          ['Mã giải', TOURNAMENT.id],
          ['Địa điểm', TOURNAMENT.venue],
          ['Thời gian', `${TOURNAMENT.start} → ${TOURNAMENT.end}`],
          ['Thể thức', TOURNAMENT.format],
          ['Hạng mục', TOURNAMENT.categories.map(c => CATEGORIES[c]).join(' · ')],
          ['Lệ phí đăng ký', '500.000 ₫ / hạng mục'],
          ['Điểm xếp hạng QG', 'Công thức VBF-2024'],
          ['Vòng tránh đối đầu', 'cùng CLB ≥ Vòng 1/16'],
          ['Ngôn ngữ hệ thống', 'Tiếng Việt / English'],
          ['Bảo mật dữ liệu cá nhân', 'Tuân thủ Nghị định 13/2023/NĐ-CP'],
        ].map(([l, v]) => (
          <div key={l} style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap: 12, fontSize: 13, borderBottom:'1px solid var(--line-2)', paddingBottom: 12 }}>
            <div className="caps" style={{ fontSize: 10.5, paddingTop: 2 }}>{l}</div>
            <div>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ScheduleView = ScheduleView;
window.BracketView = BracketView;
window.AthletesView = AthletesView;
window.CourtsView = CourtsView;
window.InventoryView = InventoryView;
window.FinanceView = FinanceView;
window.ReportsView = ReportsView;
window.RefereesView = RefereesView;
window.NewsView = NewsView;
window.SettingsView = SettingsView;
window.btnGhost = btnGhost;
window.btnPrimary = btnPrimary;
window.StatCard = StatCard;
