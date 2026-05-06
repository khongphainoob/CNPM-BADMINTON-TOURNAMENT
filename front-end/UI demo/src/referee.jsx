/* Referee mobile — live score entry with offline indicator */
const { useState: useS_ref, useEffect: useE_ref } = React;

function RefereeView() {
  const [online, setOnline] = useS_ref(true);
  const [queue, setQueue] = useS_ref(0);
  const [sets, setSets] = useS_ref([[21,18],[14,21],[17,14]]);
  const [cur, setCur] = useS_ref(2);
  const [server, setServer] = useS_ref('A');
  const [confirming, setConfirming] = useS_ref(false);

  useE_ref(() => {
    if (online && queue > 0) {
      const t = setTimeout(() => setQueue(0), 1200);
      return () => clearTimeout(t);
    }
  }, [online, queue]);

  const inc = (side) => {
    const ns = sets.map((s, i) => i === cur ? [...s] : s);
    ns[cur][side === 'A' ? 0 : 1]++;
    setSets(ns);
    setServer(side);
    if (!online) setQueue(q => q + 1);
  };
  const dec = (side) => {
    const ns = sets.map((s, i) => i === cur ? [...s] : s);
    ns[cur][side === 'A' ? 0 : 1] = Math.max(0, ns[cur][side === 'A' ? 0 : 1] - 1);
    setSets(ns);
  };

  const m = LIVE_MATCHES[0];
  const aWins = sets.filter(s => s[0] > s[1] && (s[0] >= 21 || s[1] >= 21)).length;
  const bWins = sets.filter(s => s[1] > s[0] && (s[0] >= 21 || s[1] >= 21)).length;

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding: 24, height:'100%', background: 'var(--paper-2)' }}>
      {/* Phone frame */}
      <div style={{ width: 390, height: 780, background: 'var(--ink)', borderRadius: 42, padding: 10, boxShadow: '0 40px 80px -20px oklch(0 0 0 / 0.25), 0 0 0 1px oklch(0.2 0.01 250)' }}>
        <div style={{ height:'100%', background:'var(--paper)', borderRadius: 32, overflow:'hidden', display:'flex', flexDirection:'column', position:'relative' }}>
          {/* notch */}
          <div style={{ position:'absolute', top: 10, left:'50%', transform:'translateX(-50%)', width: 110, height: 28, background:'var(--ink)', borderRadius: 20, zIndex: 2 }}/>
          {/* status bar */}
          <div style={{ padding:'14px 28px 6px', display:'flex', justifyContent:'space-between', fontSize: 12, fontWeight: 600 }}>
            <span className="mono">15:08</span>
            <span style={{ display:'flex', gap: 6, alignItems:'center' }}>
              <Icon name={online ? 'wifi' : 'wifiOff'} size={13}/>
              <span style={{ width: 22, height: 10, border:'1px solid var(--ink)', borderRadius: 2, position:'relative' }}>
                <span style={{ position:'absolute', inset: 1, right: 5, background:'var(--ink)' }}/>
              </span>
            </span>
          </div>

          {/* app header */}
          <div style={{ padding:'4px 16px 12px', borderBottom:'1px solid var(--line)' }}>
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <Icon name="chevL" size={18}/>
              <div style={{ flex: 1 }}>
                <div className="caps" style={{ fontSize: 9.5 }}>Trận đang điều hành</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>#{m.id} · Sân {m.court} · {m.round}</div>
              </div>
              {online ? (
                <span className="pill ok" style={{ fontSize: 10 }}>
                  <span className="dot" style={{background:'oklch(0.55 0.12 150)'}}/>Online
                </span>
              ) : (
                <span className="pill warn" style={{ fontSize: 10 }}>
                  <Icon name="wifiOff" size={11}/>Offline · {queue} chờ
                </span>
              )}
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* set indicator */}
            <div style={{ display:'flex', justifyContent:'center', gap: 6, padding: '12px 16px 8px' }}>
              {sets.map((s, i) => (
                <button key={i} onClick={() => setCur(i)} style={{
                  padding: '5px 12px', borderRadius: 14, fontSize: 11,
                  border: 'none',
                  background: i === cur ? 'var(--ink)' : 'var(--paper-2)',
                  color: i === cur ? 'white' : 'var(--ink-2)',
                  fontWeight: 600,
                }}>
                  Set {i+1} <span className="mono" style={{ opacity: 0.7, marginLeft: 4 }}>{s[0]}–{s[1]}</span>
                </button>
              ))}
            </div>

            {/* scores */}
            <div style={{ flex: 1, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 1, background:'var(--line)' }}>
              {['A','B'].map(side => {
                const pl = side === 'A' ? m.a : m.b;
                const score = sets[cur][side === 'A' ? 0 : 1];
                const wins = side === 'A' ? aWins : bWins;
                return (
                  <div key={side} style={{
                    background: server === side ? 'var(--accent)' : 'var(--paper)',
                    color: server === side ? 'white' : 'var(--ink)',
                    display:'flex', flexDirection:'column', padding: 14,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.06, opacity: 0.85 }}>
                      {side === 'A' ? 'Đội nhà' : 'Đội khách'}
                      {server === side && <span style={{ marginLeft: 6, fontSize: 9.5, opacity: 0.9 }}>● GIAO CẦU</span>}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 6, lineHeight: 1.25 }}>{pl.name}</div>
                    <div style={{ fontSize: 10.5, opacity: 0.75 }}>{pl.club}</div>
                    <div style={{ flex: 1 }}/>
                    <div className="mono" style={{ fontSize: 10.5, opacity: 0.75 }}>Set đã thắng: {wins}</div>
                    <div className="serif" style={{ fontSize: 96, lineHeight: 0.9, textAlign:'center', fontWeight: 400, letterSpacing:'-0.03em' }}>
                      {score}
                    </div>
                    <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
                      <button onClick={() => dec(side)} style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, border: 0,
                        background: server === side ? 'oklch(0.45 0.14 25)' : 'var(--paper-2)',
                        color: server === side ? 'white' : 'var(--ink-2)',
                        fontSize: 18, fontWeight: 600,
                      }}>−</button>
                      <button onClick={() => inc(side)} style={{
                        flex: 2, padding: '10px 0', borderRadius: 8, border: 0,
                        background: server === side ? 'white' : 'var(--ink)',
                        color: server === side ? 'var(--accent)' : 'white',
                        fontSize: 20, fontWeight: 700,
                      }}>+1</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* actions */}
            <div style={{ padding: 12, borderTop: '1px solid var(--line)', display:'flex', flexDirection:'column', gap: 8 }}>
              <div style={{ display:'flex', gap: 6 }}>
                <button style={{ flex: 1, padding:'9px 0', fontSize: 11.5, borderRadius: 6, border:'1px solid var(--line)', background:'var(--paper)' }}>
                  Hội ý VĐV
                </button>
                <button style={{ flex: 1, padding:'9px 0', fontSize: 11.5, borderRadius: 6, border:'1px solid var(--line)', background:'var(--paper)' }}>
                  Đổi sân
                </button>
                <button style={{ flex: 1, padding:'9px 0', fontSize: 11.5, borderRadius: 6, border:'1px solid var(--line)', background:'var(--paper)', color:'var(--accent-ink)' }}>
                  Walkover
                </button>
              </div>
              <button onClick={() => setConfirming(true)} style={{
                padding:'12px 0', borderRadius: 8, background: 'var(--ink)', color:'white', border: 0, fontSize: 13, fontWeight: 600,
              }}>
                Kết thúc set & gửi BTC
              </button>
              <div style={{ display:'flex', gap: 10, padding:'6px 4px 0', fontSize: 10.5, color:'var(--ink-3)', alignItems:'center' }}>
                <span>● Đồng bộ tự động sau mỗi điểm</span>
                <span style={{ flex: 1 }}/>
                <button onClick={() => setOnline(o => !o)} style={{ border:'1px solid var(--line)', background:'var(--paper)', padding:'3px 8px', borderRadius: 12, fontSize: 10 }}>
                  Giả lập {online ? 'mất mạng' : 'có mạng'}
                </button>
              </div>
            </div>
          </div>

          {/* home indicator */}
          <div style={{ padding:'6px 0 10px', display:'flex', justifyContent:'center' }}>
            <div style={{ width: 130, height: 4, background:'var(--ink)', borderRadius: 2 }}/>
          </div>

          {/* offline banner */}
          {!online && (
            <div style={{ position:'absolute', top: 50, left: 0, right: 0, background:'var(--amber)', color:'var(--ink)', padding: '6px 16px', fontSize: 11.5, display:'flex', alignItems:'center', gap: 8, zIndex: 1 }}>
              <Icon name="wifiOff" size={13}/>
              <b>Chế độ ngoại tuyến</b> · điểm lưu cục bộ, tự đồng bộ khi có mạng.
            </div>
          )}

          {/* confirm sheet */}
          {confirming && (
            <div style={{ position:'absolute', inset: 0, background:'oklch(0 0 0 / 0.4)', zIndex: 5, display:'flex', alignItems:'flex-end' }}>
              <div style={{ background:'var(--paper)', width:'100%', borderRadius:'24px 24px 0 0', padding: 20 }}>
                <div style={{ width: 40, height: 4, background:'var(--line)', borderRadius: 2, margin:'0 auto 14px' }}/>
                <div className="caps">Xác nhận hai bên · NFR-06</div>
                <h3 style={{ margin:'6px 0 4px', fontSize: 17 }}>Kết thúc set {cur+1}?</h3>
                <div style={{ fontSize: 12.5, color:'var(--ink-2)' }}>
                  Tỷ số <b className="mono">{sets[cur][0]}–{sets[cur][1]}</b> sẽ được gửi để BTC xác nhận.
                  VĐV hai bên cần ký xác nhận qua mã QR trên màn hình ngay sau đó.
                </div>
                <div style={{ background:'var(--paper-2)', borderRadius: 8, padding: 10, marginTop: 12, fontSize: 12 }}>
                  <div>● Trọng tài chính: Lê Quang Huy</div>
                  <div>● Trọng tài phụ: Phạm Hải</div>
                  <div>● Thời gian set: 18′ 42″</div>
                </div>
                <div style={{ display:'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: 12, border:'1px solid var(--line)', background:'var(--paper)', borderRadius: 8 }}>Hủy</button>
                  <button onClick={() => setConfirming(false)} style={{ flex: 2, padding: 12, background:'var(--court)', color:'white', border: 0, borderRadius: 8, fontWeight: 600 }}>Xác nhận & gửi</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar info */}
      <div style={{ marginLeft: 28, maxWidth: 320, fontSize: 13, color:'var(--ink-2)' }}>
        <div className="caps">Ứng dụng trọng tài</div>
        <h2 className="serif" style={{ margin:'4px 0 10px', fontSize: 26 }}>Nhập điểm thời gian thực · mobile-first</h2>
        <p style={{ lineHeight: 1.6 }}>
          Mỗi lần chạm là một điểm, hiển thị trên màn hình khán giả trong ≤ 3 giây.
          Khi mất kết nối, ứng dụng vẫn ghi điểm cục bộ và tự đồng bộ khi có mạng. Tỷ số cuối set
          cần 2 bên xác nhận trước khi lưu chính thức.
        </p>
        <div className="caps" style={{ marginTop: 20 }}>Yêu cầu phi chức năng liên quan</div>
        <ul style={{ paddingLeft: 16, marginTop: 6, lineHeight: 1.7, fontSize: 12.5 }}>
          <li>NFR-02 · Tap → màn hình khán giả ≤ 3s</li>
          <li>NFR-05 · Chế độ ngoại tuyến với đồng bộ tự động</li>
          <li>NFR-07 · Trọng tài chỉ sửa trận được phân công</li>
          <li>NFR-11 · Tính toàn vẹn · 2-party confirmation</li>
        </ul>
      </div>
    </div>
  );
}

window.RefereeView = RefereeView;
