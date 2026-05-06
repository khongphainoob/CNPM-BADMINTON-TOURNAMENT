import { useState } from 'react'
import { TOURNAMENT, CATEGORIES, LIVE_MATCHES, UPCOMING, ATHLETES, NEWS, RANKING_MS } from '../../data/legacy'
import { ShuttleMark } from '../referee/shared'
import Icon from '../shared/Icon'
import { btnGhost, btnPrimary, money } from '../shared/tokens'
import { BracketView } from '../btc/BtcViews'

type Tab = 'home' | 'ranking' | 'calendar' | 'players' | 'news' | 'live' | 'results' | 'bracket' | 'tickets'
type Props = { onLogout: () => void }

export default function SpectatorView({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)', overflowY: 'auto' }}>
      <SpectatorNav tab={tab} setTab={setTab} onLogout={onLogout} />
      <SpectatorHero tab={tab} />
      <div style={{ padding: '48px 48px 80px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {tab === 'home'                             && <PubHome onGoTo={setTab} />}
        {tab === 'ranking'                          && <PubRanking />}
        {(tab === 'calendar' || tab === 'schedule') && <PubSchedule />}
        {tab === 'players'                          && <PubPlayers />}
        {tab === 'news'                             && <PubNews />}
        {tab === 'live'                             && <PubLive />}
        {tab === 'results'                          && <PubResults />}
        {tab === 'bracket'                          && <BracketView />}
        {tab === 'tickets'                          && <PubTickets />}
      </div>
      <footer style={{ padding: '32px 48px 24px', background: 'oklch(0.15 0.03 260)', color: 'oklch(0.60 0.02 260)', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1184, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
            <ShuttleMark size={20} light />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Shuttle<span style={{ color: 'var(--accent)' }}>·</span>Ops
            </span>
          </div>
          <div style={{ flex: 1, fontSize: 12 }}>
            Nền tảng quản lý giải cầu lông · dữ liệu thời gian thực · tuân thủ NĐ 13/2023/NĐ-CP
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function SpectatorNav({ tab, setTab, onLogout }: { tab: Tab; setTab: (t: Tab) => void; onLogout: () => void }) {
  const NAV: [Tab, string][] = [
    ['home',     'Tổng quan'],
    ['ranking',  'Bảng xếp hạng'],
    ['calendar', 'Lịch thi đấu'],
    ['players',  'Vận động viên'],
    ['news',     'Tin tức'],
  ]
  return (
    <nav style={{
      background: 'oklch(0.15 0.03 260)', color: 'white',
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'stretch', padding: '0 48px',
      minHeight: 60, boxShadow: '0 2px 20px oklch(0.05 0.03 260 / 0.55)',
    }}>
      <button onClick={() => setTab('home')} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'transparent', border: 0, color: 'white',
        padding: '0 36px 0 0', cursor: 'pointer', flexShrink: 0,
      }}>
        <ShuttleMark size={24} light />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Shuttle<span style={{ color: 'var(--accent)' }}>·</span>Ops
        </span>
      </button>

      <div style={{ display: 'flex', flex: 1 }}>
        {NAV.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: 'transparent', border: 0,
            borderBottom: '3px solid ' + (tab === id ? 'var(--accent)' : 'transparent'),
            color: tab === id ? 'white' : 'oklch(0.60 0.02 260)',
            padding: '0 16px', fontSize: 12, fontWeight: tab === id ? 700 : 500,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap',
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span className="pill live" style={{ fontSize: 10.5 }}>
          <span className="dot live-dot" /> {LIVE_MATCHES.length} trận live
        </span>
        <button onClick={onLogout} style={{
          background: 'transparent', border: '1px solid oklch(0.34 0.01 250)',
          color: 'oklch(0.75 0.01 250)', padding: '5px 11px', borderRadius: 5,
          fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Icon name="log-out" size={12} /> Đăng xuất
        </button>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HERO_CONFIG: Record<string, { label: string; lines: string[]; accent: number; sub: string }> = {
  home:     { label: 'Giải đấu đang diễn ra · Ngày 1 / 9',      lines: ['National Club', 'Badminton', 'Championship 2026'],  accent: 1, sub: '18 – 26 tháng 4 · Nhà thi đấu Phú Thọ, TP.HCM · 384 VĐV · 5 hạng mục' },
  ranking:  { label: 'Xếp hạng quốc gia · 2026',                 lines: ['Bảng', 'Xếp Hạng', 'Quốc Gia'],                    accent: 1, sub: 'Điểm tích lũy từ các giải đấu VBF được công nhận trong năm 2026' },
  calendar: { label: 'Lịch thi đấu · 18–26 tháng 4',             lines: ['Lịch', 'Thi Đấu', '& Kết Quả'],                    accent: 1, sub: '284 trận · 8 sân · Bảng đấu + Loại trực tiếp' },
  players:  { label: 'Danh sách vận động viên · 2026',            lines: ['Vận Động', 'Viên', 'Tham Dự'],                     accent: 1, sub: '384 vận động viên đã đăng ký từ các câu lạc bộ toàn quốc' },
  news:     { label: 'Tin tức & truyền thông',                    lines: ['Tin Tức', '&', 'Highlight'],                        accent: 0, sub: 'Bài viết, thông báo và highlight từ ban tổ chức giải đấu' },
}

function SpectatorHero({ tab }: { tab: Tab }) {
  const cfg = HERO_CONFIG[tab] ?? HERO_CONFIG.home
  return (
    <section style={{ background: 'oklch(0.15 0.03 260)', color: 'white', padding: '60px 48px 50px', position: 'relative', overflow: 'hidden', minHeight: 252 }}>
      <svg aria-hidden style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '55%', opacity: 0.05, pointerEvents: 'none' }}
        viewBox="0 0 560 300" preserveAspectRatio="xMaxYMid slice" fill="none" stroke="white">
        <rect x="40" y="20" width="480" height="260" strokeWidth="2"/>
        <line x1="280" y1="20" x2="280" y2="280" strokeWidth="1.5"/>
        <line x1="40" y1="150" x2="520" y2="150" strokeWidth="1.2"/>
        <line x1="40" y1="98" x2="280" y2="98" strokeWidth="0.8"/>
        <line x1="280" y1="202" x2="520" y2="202" strokeWidth="0.8"/>
        <line x1="40" y1="44" x2="520" y2="44" strokeWidth="0.7"/>
        <line x1="40" y1="256" x2="520" y2="256" strokeWidth="0.7"/>
        <line x1="84" y1="20" x2="84" y2="280" strokeWidth="0.7"/>
        <line x1="476" y1="20" x2="476" y2="280" strokeWidth="0.7"/>
      </svg>
      <div style={{ position: 'absolute', top: -90, right: -90, width: 420, height: 420, borderRadius: '50%', border: '1px solid oklch(0.27 0.03 260)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: -50, right: 140, width: 180, height: 180, borderRadius: '50%', border: '1px solid oklch(0.22 0.02 260)', pointerEvents: 'none' }}/>
      <div style={{ position: 'relative', maxWidth: 1184, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
          {cfg.label}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(48px, 7vw, 86px)', lineHeight: 0.9, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: '0 0 20px', maxWidth: 760 }}>
          {cfg.lines.map((line, i) => (
            <span key={i}>
              {i === cfg.accent ? <span style={{ color: 'var(--accent)' }}>{line}</span> : line}
              {i < cfg.lines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'oklch(0.65 0.02 260)', margin: 0, lineHeight: 1.65, maxWidth: 520 }}>
          {cfg.sub}
        </p>
      </div>
    </section>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function PubHome({ onGoTo }: { onGoTo: (t: Tab) => void }) {
  const featured = LIVE_MATCHES[2]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Vận động viên', TOURNAMENT.registered, 'đã đăng ký'],
          ['Trận hôm nay', TOURNAMENT.matches.live + TOURNAMENT.matches.next, 'live + sắp diễn ra'],
          ['Sân thi đấu', TOURNAMENT.courts, LIVE_MATCHES.length + ' đang sử dụng'],
          ['Hạng mục', TOURNAMENT.categories.length, TOURNAMENT.categories.join(' · ')],
        ].map(([label, val, sub]) => (
          <div key={String(label)} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '16px 18px' }}>
            <div className="caps">{label}</div>
            <div className="serif" style={{ fontSize: 44, margin: '4px 0 2px', lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Featured + categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div>
          <div className="caps" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pill live" style={{ padding: '1px 7px', fontSize: 9.5 }}><span className="dot live-dot" /> LIVE</span>
            Trận nổi bật
          </div>
          <div style={{ background: 'var(--ink)', color: 'white', borderRadius: 10, padding: 22 }}>
            <div style={{ fontSize: 11, color: 'oklch(0.68 0.01 250)', marginBottom: 14 }}>
              {CATEGORIES[featured.cat]} · {featured.round} · Sân {featured.court}
            </div>
            {[featured.a, featured.b].map((player, pi) => {
              const setsWon = featured.sets.filter((_, si) => si < featured.current).reduce((acc, s) => acc + (s[pi] > s[1 - pi] ? 1 : 0), 0)
              return (
                <div key={pi}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{player.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.55, marginTop: 1 }}>{player.club}{player.seed ? ' · Hạt giống ' + player.seed : ''}</div>
                    </div>
                    <div className="serif" style={{ fontSize: 48, color: 'white', lineHeight: 1, minWidth: 32, textAlign: 'center' }}>{setsWon}</div>
                  </div>
                  {pi === 0 && <div style={{ height: 1, background: 'oklch(0.28 0.01 250)', margin: '12px 0' }} />}
                </div>
              )
            })}
            <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {featured.sets.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 12px', borderRadius: 4, gap: 2,
                  background: i === featured.current ? 'var(--accent)' : 'oklch(0.23 0.01 250)',
                  fontSize: 14, fontWeight: 700,
                }}>
                  <span>{s[0]}</span>
                  <span style={{ fontSize: 8, opacity: 0.4, fontWeight: 400 }}>–</span>
                  <span>{s[1]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'oklch(0.68 0.01 250)' }}>⏱ {featured.elapsed} · TT: {featured.umpire}</div>
              <button onClick={() => onGoTo('live')} style={{ background: 'transparent', border: '1px solid oklch(0.34 0.01 250)', color: 'oklch(0.82 0.01 250)', padding: '6px 13px', borderRadius: 5, fontSize: 11.5, cursor: 'pointer' }}>
                Tất cả trận →
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="caps" style={{ marginBottom: 10 }}>Hạng mục thi đấu</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <div key={k} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="serif" style={{ fontSize: 22, minWidth: 44, color: 'var(--accent)' }}>{k}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>Bảng đấu → Loại trực tiếp</div>
                </div>
                <span className="pill live" style={{ fontSize: 10 }}><span className="dot live-dot" /> Đang diễn ra</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="caps">Tin tức mới nhất</div>
          <button onClick={() => onGoTo('news')} style={{ ...btnGhost, fontSize: 12 }}>Xem tất cả →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {NEWS.map(n => (
            <div key={n.id} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
              <div className="court-placeholder" style={{ height: 100, fontSize: 9 }}>tin · 16:9</div>
              <div style={{ padding: '12px 14px' }}>
                <span className="pill" style={{ fontSize: 10 }}>{n.tag}</span>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35, margin: '6px 0 4px' }}>{n.title}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{n.ts}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'var(--ink)', borderRadius: 10, padding: '32px 36px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1, color: 'white' }}>
          <div className="caps" style={{ color: 'oklch(0.68 0.01 250)' }}>Còn 8 ngày thi đấu</div>
          <div className="serif" style={{ fontSize: 36, marginTop: 4 }}>Chưa đăng ký?</div>
          <div style={{ fontSize: 13, color: 'oklch(0.78 0.01 250)', marginTop: 6 }}>Đăng ký trước 19/04 · Lệ phí từ 500.000 ₫/hạng mục</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button style={{ background: 'var(--accent)', border: 0, color: 'white', padding: '11px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Đăng ký tham dự →
          </button>
          <button onClick={() => onGoTo('calendar')} style={{ background: 'transparent', border: '1px solid oklch(0.34 0.01 250)', color: 'white', padding: '11px 20px', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
            Xem lịch thi đấu
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

function PubRanking() {
  return (
    <div style={{ maxWidth: 780 }}>
      <div className="caps">Bảng xếp hạng quốc gia</div>
      <h1 className="serif" style={{ margin: '2px 0 14px', fontSize: 30 }}>Đơn nam · tuần 16/2026</h1>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)' }}>
              {['#', 'Vận động viên', 'CLB', 'Hạng', 'Điểm', 'Thay đổi'].map(h => (
                <th key={h} className="caps" style={{ padding: '9px 12px', textAlign: h === 'Điểm' || h === 'Thay đổi' ? 'right' : 'left', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RANKING_MS.map(r => (
              <tr key={r.rank}>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.rank}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.club}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.tier}</td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', textAlign: 'right', fontWeight: 600 }}>{r.pts.toLocaleString('vi-VN')}</td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', textAlign: 'right', color: r.chg > 0 ? 'var(--court)' : r.chg < 0 ? 'var(--accent)' : 'var(--ink-3)' }}>
                  {r.chg > 0 ? '▲' : r.chg < 0 ? '▼' : '—'} {r.chg !== 0 ? Math.abs(r.chg) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

function PubSchedule() {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <button style={{ ...btnPrimary, background: 'var(--ink)' }}>Hôm nay · 18/04</button>
        {['19/04','20/04','21/04','22/04','23/04','24/04','25/04','26/04'].map(d => (
          <button key={d} style={btnGhost}>{d}</button>
        ))}
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)' }}>
              {['Giờ','Sân','Hạng','Vòng','Đấu','Trạng thái'].map(h => (
                <th key={h} className="caps" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ...LIVE_MATCHES.map(m => ({ ...m, status: 'live' as const, t: m.start })),
              ...UPCOMING.map(m => ({ ...m, status: 'upcoming' as const, a: { name: m.a, club: '', seed: null }, b: { name: m.b, club: '', seed: null } })),
            ].map((m, i) => (
              <tr key={i}>
                <td className="mono" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>{m.t}</td>
                <td className="mono" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>Sân {m.court}</td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>{CATEGORIES[m.cat]}</td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-2)' }}>{m.round}</td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>
                  {m.a.name} <span style={{ color: 'var(--ink-3)', margin: '0 6px' }}>vs</span> {m.b.name}
                </td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>
                  {m.status === 'live'
                    ? <span className="pill live"><span className="dot live-dot" />LIVE</span>
                    : <span className="pill scheduled">Lên lịch</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Players ──────────────────────────────────────────────────────────────────

function PubPlayers() {
  const [query, setQuery] = useState('')
  const [filterTier, setFilterTier] = useState('all')

  const filtered = ATHLETES.filter(a => {
    const q = query.trim().toLowerCase()
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.club.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    const matchTier = filterTier === 'all' || a.tier === filterTier
    return matchQ && matchTier
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 480 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none', display: 'flex' }}>
            <Icon name="search" size={15} />
          </span>
          <input type="text" placeholder="Tìm vận động viên hoặc câu lạc bộ..." value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 38px', border: '1px solid var(--line)', borderRadius: 8, background: 'white', fontSize: 13.5, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {['all', 'A', 'B', 'C'].map(tier => (
            <button key={tier} onClick={() => setFilterTier(tier)} style={{
              padding: '10px 16px', border: '1px solid ' + (filterTier === tier ? 'var(--ink)' : 'var(--line)'),
              borderRadius: 7, background: filterTier === tier ? 'var(--ink)' : 'transparent',
              color: filterTier === tier ? 'white' : 'var(--ink-2)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em',
            }}>
              {tier === 'all' ? 'Tất cả' : `Hạng ${tier}`}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', flexShrink: 0 }}>{filtered.length} vận động viên</div>
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
          {filtered.map(a => <PlayerCard key={a.id} athlete={a} />)}
        </div>
      ) : (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
          Không tìm thấy vận động viên phù hợp.
        </div>
      )}
    </div>
  )
}

function PlayerCard({ athlete: a }: { athlete: typeof ATHLETES[number] }) {
  const words = a.name.trim().split(/\s+/)
  const initials = words.length >= 2 ? words[words.length - 2][0] + words[words.length - 1][0] : words[0].slice(0, 2)
  const tierMeta: Record<string, { bg: string; label: string }> = {
    A: { bg: 'var(--accent)',        label: 'Hạng A' },
    B: { bg: 'oklch(0.46 0.14 220)', label: 'Hạng B' },
    C: { bg: 'oklch(0.50 0.01 260)', label: 'Hạng C' },
  }
  const tm = a.tier ? (tierMeta[a.tier] ?? tierMeta.C) : null

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'oklch(0.18 0.03 260)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '0.02em', flexShrink: 0, textTransform: 'uppercase' }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{a.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{a.club}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Mã VĐV</div>
          <div className="mono" style={{ fontSize: 12, marginTop: 2 }}>{a.id}</div>
        </div>
        {a.rating && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Rating</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1, marginTop: 2, letterSpacing: '-0.01em' }}>
              {a.rating.toLocaleString('vi-VN')}
            </div>
          </div>
        )}
        {tm && (
          <span style={{ background: tm.bg, color: 'white', padding: '4px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
            {tm.label}
          </span>
        )}
      </div>
      <div>
        {a.status === 'approved'   && <span className="pill ok">Đã duyệt</span>}
        {a.status === 'pending'    && <span className="pill warn">Chờ duyệt</span>}
        {a.status === 'incomplete' && <span className="pill" style={{ fontSize: 10.5 }}>Thiếu hồ sơ</span>}
      </div>
    </div>
  )
}

// ─── Live ─────────────────────────────────────────────────────────────────────

function PubLive() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {LIVE_MATCHES.map(m => (
        <div key={m.id} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pill live"><span className="dot live-dot" />LIVE</span>
            <span className="caps">{CATEGORIES[m.cat]} · {m.round}</span>
            <div style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Sân {m.court} · {m.elapsed}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, marginTop: 14, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{m.a.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{m.a.club}</div>
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600 }}>{m.b.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{m.b.club}</div>
            </div>
            <div className="mono" style={{ display: 'flex', gap: 4 }}>
              {m.sets.map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 10px', borderRadius: 4, background: i === m.current ? 'var(--accent)' : 'var(--paper-2)', color: i === m.current ? 'white' : 'var(--ink)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{s[0]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{s[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Results ──────────────────────────────────────────────────────────────────

function PubResults() {
  const rs = [
    { d: '17/04', cat: 'MS', w: 'Nguyễn Hải Đăng', l: 'Nguyễn Quang Hưng', score: '21-14, 21-19',         r: 'R64' },
    { d: '17/04', cat: 'WS', w: 'Nguyễn Thùy Linh', l: 'Đặng Thị Mai',     score: '21-12, 21-15',         r: 'R32' },
    { d: '17/04', cat: 'MD', w: 'Đức / Nam',         l: 'Anh / Long',       score: '21-18, 19-21, 21-17',  r: 'R32' },
    { d: '17/04', cat: 'XD', w: 'Đức / Khánh',       l: 'Minh / Trang',     score: '21-12, 21-13',         r: 'R32' },
    { d: '16/04', cat: 'MS', w: 'Lê Đức Phát',       l: 'Vũ Quốc Anh',      score: '21-10, 21-14',         r: 'R64' },
    { d: '16/04', cat: 'WD', w: 'Linh / Trang',      l: 'Vân Anh / Thảo',   score: '21-17, 14-21, 21-18',  r: 'R32' },
  ]
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)' }}>
            {['Ngày','Hạng','Vòng','Thắng','Thua','Tỷ số'].map(h => (
              <th key={h} className="caps" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rs.map((r, i) => (
            <tr key={i}>
              <td className="mono" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>{r.d}</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>{CATEGORIES[r.cat]}</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-2)' }}>{r.r}</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)', fontWeight: 600 }}>{r.w}</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>{r.l}</td>
              <td className="mono" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-2)' }}>{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── News ─────────────────────────────────────────────────────────────────────

function PubNews() {
  const items = [...NEWS, ...NEWS.map(n => ({ ...n, id: n.id + '_b' }))]
  const [featured, ...rest] = items
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}>
        <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', background: 'oklch(0.14 0.03 260)' }}>
          <svg width="100%" height="100%" viewBox="0 0 640 360" fill="none" style={{ position: 'absolute', inset: 0 }}>
            <rect width="640" height="360" fill="oklch(0.14 0.03 260)"/>
            <rect x="100" y="60" width="440" height="240" stroke="oklch(0.24 0.03 260)" strokeWidth="2" fill="none"/>
            <line x1="320" y1="60" x2="320" y2="300" stroke="oklch(0.22 0.03 260)" strokeWidth="1.5"/>
            <line x1="100" y1="180" x2="540" y2="180" stroke="oklch(0.21 0.03 260)" strokeWidth="1.2"/>
            <circle cx="320" cy="180" r="36" stroke="oklch(0.20 0.02 260)" strokeWidth="0.8" fill="none"/>
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 20px 16px', background: 'linear-gradient(to top, oklch(0.10 0.03 260 / 0.85), transparent)' }}>
            <span className="pill" style={{ fontSize: 10 }}>{featured.tag}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
          <span className="pill" style={{ alignSelf: 'flex-start' }}>{featured.tag}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: 0 }}>{featured.title}</h2>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{featured.ts} · Đã xuất bản</div>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0, maxWidth: '62ch' }}>
            Cặp đôi hạt giống số 2 đã lội ngược dòng thành công sau khi để thua set đầu tiên 19-21, vượt qua hai đối thủ trẻ từ Becamex với tỷ số cuối 21-17 trong set thứ ba kéo dài 40 phút.
          </p>
          <button style={{ ...btnGhost, alignSelf: 'flex-start', fontSize: 12.5, fontWeight: 600 }}>Đọc thêm →</button>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--line)' }} />
      <div>
        <div className="caps" style={{ marginBottom: 16 }}>Tin tức mới nhất</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {rest.map(n => (
            <div key={n.id} style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ height: 140, background: 'oklch(0.14 0.03 260)', position: 'relative', overflow: 'hidden' }}>
                <svg width="100%" height="100%" viewBox="0 0 280 140" fill="none" style={{ position: 'absolute', inset: 0 }}>
                  <rect width="280" height="140" fill="oklch(0.14 0.03 260)"/>
                  <line x1="0" y1="0" x2="280" y2="140" stroke="oklch(0.20 0.03 260)" strokeWidth="1"/>
                  <line x1="0" y1="70" x2="280" y2="70" stroke="oklch(0.19 0.02 260)" strokeWidth="0.7"/>
                  <line x1="140" y1="0" x2="140" y2="140" stroke="oklch(0.19 0.02 260)" strokeWidth="0.7"/>
                </svg>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <span className="pill" style={{ fontSize: 10 }}>{n.tag}</span>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, margin: '8px 0 6px' }}>{n.title}</h4>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{n.ts}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

function PubTickets() {
  const tiers = [
    { name: 'Phổ thông', price: 100_000, sub: 'Khán đài Bắc · không ghế cố định', left: 'Còn nhiều' },
    { name: 'Ưu tiên',   price: 250_000, sub: 'Ghế ngồi gần sân 1-4',             left: 'Còn 120 vé' },
    { name: 'VIP',       price: 800_000, sub: 'Ghế hàng đầu · đồ uống · khu check-in', left: 'Còn 18 vé' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div className="caps">Vé trực tuyến</div>
          <h2 className="serif" style={{ fontSize: 30, margin: '4px 0 0' }}>Chọn hạng vé cho ngày thi đấu</h2>
        </div>
        {tiers.map((t, i) => (
          <div key={t.name} style={{
            background: i === 2 ? 'var(--ink)' : 'var(--paper)',
            color: i === 2 ? 'white' : 'var(--ink)',
            border: '1px solid ' + (i === 2 ? 'var(--ink)' : 'var(--line)'),
            borderRadius: 8, padding: 18,
            display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 20, alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12.5, opacity: 0.75, marginTop: 3 }}>{t.sub}</div>
              <div className="mono" style={{ fontSize: 10.5, opacity: 0.6, marginTop: 4 }}>{t.left}</div>
            </div>
            <div className="serif" style={{ fontSize: 28 }}>{money(t.price).replace(' ', ' ')}</div>
            <button style={{ background: i === 2 ? 'var(--accent)' : 'var(--ink)', color: 'white', padding: '10px 16px', border: 0, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Mua vé</button>
          </div>
        ))}
      </div>
      <aside style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 18 }}>
        <div className="caps">Phương thức thanh toán</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {['VNPay', 'MoMo', 'Chuyển khoản', 'ZaloPay'].map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: '1px solid var(--line)', borderRadius: 6, background: 'var(--paper)', fontSize: 12.5 }}>
              <div style={{ width: 36, height: 24, background: 'var(--paper-3)', borderRadius: 3 }} />
              {p}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Sau khi thanh toán thành công, vé điện tử (QR) sẽ được gửi qua email và tin nhắn. Quét mã tại cổng để vào khán đài.
        </div>
      </aside>
    </div>
  )
}
