import { useState } from 'react'
import type { Session } from '../../data/auth'
import { TOURNAMENT, CATEGORIES, RANKING_MS } from '../../data/legacy'
import Icon from '../shared/Icon'
import { btnGhost, btnPrimary } from '../shared/tokens'
import { StatCard } from '../btc/BtcViews'

type Props = { session: Session; onLogout: () => void }

const me = {
  name: 'Nguyễn Hải Đăng',
  id: 'A-0142',
  club: 'CAND',
  tier: 'A',
  rating: 2184,
}

export default function AthleteView({ session, onLogout }: Props) {
  const [view, setView] = useState('overview')

  const NAV: [string, string, string][] = [
    ['overview', 'Tổng quan',           'dashboard'],
    ['matches',  'Lịch thi đấu của tôi', 'calendar'],
    ['profile',  'Hồ sơ & giấy tờ',     'user'],
    ['register', 'Đăng ký giải mới',     'plus'],
    ['ranking',  'Bảng xếp hạng',        'chart'],
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh', background: 'var(--paper-2)' }}>
      {/* ── Sidebar ── */}
      <aside style={{ background: 'var(--paper)', borderRight: '1px solid var(--line)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            background: 'var(--ink)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
          }}>
            NH
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{me.name}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{me.id} · {me.club}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <span className="pill ok">Hạng {me.tier}</span>
          <span className="pill info">Rating {me.rating}</span>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV.map(([id, label, icon]) => (
            <button key={id} onClick={() => setView(id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 6, border: 0,
              background: view === id ? 'var(--paper-2)' : 'transparent',
              color: 'var(--ink)', textAlign: 'left',
              fontSize: 13, fontWeight: view === id ? 600 : 400, cursor: 'pointer',
            }}>
              <Icon name={icon} size={14} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <button onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            width: '100%', padding: '7px 10px', borderRadius: 6,
            background: 'transparent', border: '1px solid var(--line)',
            color: 'var(--ink-2)', fontSize: 12, cursor: 'pointer',
          }}>
            <Icon name="log-out" size={13} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ padding: 24, overflowY: 'auto' }}>
        {view === 'overview' && <OverviewTab />}
        {view === 'register' && <OnboardingFlow />}
        {view === 'profile'  && <AthleteProfile />}
        {view === 'matches'  && (
          <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>
            Xem tab Tổng quan để quản lý trận của bạn.
          </div>
        )}
        {view === 'ranking' && <RankingTable />}
      </main>
    </div>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab() {
  const matches = [
    { t: '18/04 16:00', court: 1, round: 'Vòng 1/16', opp: 'Vũ Tiến Dũng · TP.HCM',              st: 'upcoming' },
    { t: '18/04 14:20', court: 1, round: 'Vòng 1/16', opp: 'Trần Minh Quân · TP.HCM',             st: 'live',    score: '21-18, 14-21, 17-14' },
    { t: '17/04 10:30', court: 3, round: 'Vòng 1/32', opp: 'Nguyễn Quang Hưng · Nghệ An',         st: 'done',    score: '21-14, 21-19' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div className="caps">Lời chào</div>
        <h1 className="serif" style={{ margin: '2px 0 6px', fontSize: 34, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
          Xin chào, Hải Đăng.
        </h1>
        <div style={{ color: 'var(--ink-2)', fontSize: 13 }}>
          Bạn có 1 trận sắp diễn ra tại Sân 1 · 16:00 hôm nay.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Trận sắp tới"  value="1"       sub="hôm nay" />
        <StatCard label="Đã thi đấu"    value="2"       sub="thắng 2 · thua 0" accent="var(--court)" />
        <StatCard label="Điểm tích lũy" value={me.rating} sub="+42 tuần này" />
        <StatCard label="Hạng quốc gia" value="#4"      sub="Đơn nam · Hạng A" />
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 13 }}>
          Trận của tôi tại giải này
        </div>
        {matches.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '120px 60px 120px 1fr auto auto',
            gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--line-2)',
            fontSize: 12.5, alignItems: 'center',
          }}>
            <div className="mono">{r.t}</div>
            <div className="mono">Sân {r.court}</div>
            <div style={{ color: 'var(--ink-2)' }}>{r.round}</div>
            <div>vs {r.opp}</div>
            <div className="mono" style={{ color: 'var(--ink-3)' }}>{(r as any).score || ''}</div>
            <div>
              {r.st === 'upcoming' && <span className="pill info">Sắp diễn ra</span>}
              {r.st === 'live'     && <span className="pill live"><span className="dot live-dot" />LIVE</span>}
              {r.st === 'done'     && <span className="pill ok">Thắng</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onboarding / Registration flow ──────────────────────────────────────────

function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [cats, setCats] = useState(['MS'])
  const STEPS = ['Thông tin', 'Giấy tờ', 'Hạng mục', 'Xác nhận']
  const fee = cats.length * 500_000

  const toggleCat = (k: string) => setCats(prev => prev.includes(k) ? prev.filter(c => c !== k) : [...prev, k])

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="caps">Đăng ký giải đấu</div>
      <h1 className="serif" style={{ margin: '2px 0 24px', fontSize: 30, textTransform: 'uppercase' }}>
        {TOURNAMENT.name}
      </h1>

      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1 1 auto' : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: step > i + 1 ? 'var(--court)' : step === i + 1 ? 'var(--ink)' : 'var(--paper-3)',
                color: step >= i + 1 ? 'white' : 'var(--ink-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                border: '2px solid ' + (step === i + 1 ? 'var(--ink)' : step > i + 1 ? 'var(--court)' : 'var(--line)'),
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 10.5, whiteSpace: 'nowrap', color: step === i + 1 ? 'var(--ink)' : 'var(--ink-3)', fontWeight: step === i + 1 ? 600 : 400 }}>
                {s}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 18, background: step > i + 1 ? 'var(--court)' : 'var(--line)' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 24 }}>
        {/* Step 1 — Personal info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="caps">Thông tin cá nhân</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Họ và tên *"      value="Nguyễn Hải Đăng" />
              <FormField label="Ngày sinh *"       value="12/08/1998" />
              <FormField label="CCCD / CMND *"     value="079098001234" />
              <FormField label="CLB / đơn vị *"    value="CAND" />
              <FormField label="Số điện thoại *"   value="0912 345 678" />
              <FormField label="Email"             value="haidang@cand.vn" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>Tay thuận</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Phải', 'Trái'].map((h, i) => (
                  <label key={h} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6,
                    border: '1px solid ' + (i === 0 ? 'var(--ink)' : 'var(--line)'),
                    background: i === 0 ? 'var(--ink)' : 'var(--paper)',
                    color: i === 0 ? 'white' : 'var(--ink-2)', fontSize: 13, cursor: 'pointer',
                  }}>
                    <input type="radio" name="hand" defaultChecked={i === 0} style={{ accentColor: 'var(--accent)' }} />
                    {h}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Documents */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div className="caps" style={{ marginBottom: 6 }}>Ảnh và giấy tờ tùy thân</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 16 }}>
                Tệp JPG/PNG · tối đa 5MB · ảnh rõ nét, không chỉnh sửa.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  ['ẢNH 3×4', 'Ảnh chân dung\n(nền trắng, nhìn thẳng)', 150],
                  ['CCCD · MẶT TRƯỚC', 'Căn cước công dân\nmặt trước', 110],
                  ['CCCD · MẶT SAU', 'Căn cước công dân\nmặt sau', 110],
                ].map(([placeholder, label, h]) => (
                  <div key={String(placeholder)}>
                    <div className="court-placeholder" style={{ height: Number(h), borderRadius: 6, fontSize: 9.5, cursor: 'pointer', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 20, opacity: 0.35 }}>↑</span>
                      {placeholder}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--amber-soft)', border: '1px solid oklch(0.85 0.08 70)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'oklch(0.4 0.14 70)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span>⚠</span>
              <span>Hồ sơ thiếu ảnh hoặc CCCD mờ sẽ bị trả lại để bổ sung. Vui lòng kiểm tra kỹ trước khi nộp.</span>
            </div>
          </div>
        )}

        {/* Step 3 — Categories */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="caps">Hạng mục tham dự</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(CATEGORIES).map(([k, v]) => {
                const sel = cats.includes(k)
                return (
                  <label key={k} onClick={() => toggleCat(k)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 8,
                    border: '1px solid ' + (sel ? 'var(--ink)' : 'var(--line)'),
                    background: sel ? 'var(--paper-2)' : 'var(--paper)', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: '2px solid ' + (sel ? 'var(--ink)' : 'var(--ink-4)'),
                      background: sel ? 'var(--ink)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {sel && <span style={{ color: 'white', fontSize: 11, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: sel ? 600 : 400, fontSize: 13.5 }}>{v}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{k} · Lệ phí tham dự: 500.000 ₫</div>
                    </div>
                    <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>500.000 ₫</div>
                  </label>
                )
              })}
            </div>
            <div style={{ background: 'var(--paper-2)', borderRadius: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--line)' }}>
              <div>
                <div className="caps">Tổng lệ phí</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{cats.length} hạng mục × 500.000 ₫</div>
              </div>
              <div className="serif" style={{ fontSize: 32 }}>{fee.toLocaleString('vi-VN')} ₫</div>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="caps">Xác nhận thông tin</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Họ và tên', 'Nguyễn Hải Đăng'],
                ['Ngày sinh', '12/08/1998'],
                ['CCCD', '079098001234'],
                ['CLB', 'CAND'],
                ['Tay thuận', 'Phải'],
                ['Hạng mục', cats.map(c => CATEGORIES[c]).join(', ') || '—'],
              ].map(([l, v]) => (
                <div key={l} style={{ padding: '10px 12px', background: 'var(--paper-2)', borderRadius: 6, border: '1px solid var(--line-2)' }}>
                  <div className="caps" style={{ marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="caps" style={{ marginBottom: 6 }}>Giấy tờ đã tải lên</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Ảnh 3×4', 'CCCD mặt trước', 'CCCD mặt sau'].map(d => (
                  <span key={d} className="pill ok">{d} ✓</span>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--paper-2)', borderRadius: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--line)' }}>
              <div>
                <div className="caps">Tổng thanh toán</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{cats.length} hạng mục · VNPay / MoMo</div>
              </div>
              <div className="serif" style={{ fontSize: 32 }}>{fee.toLocaleString('vi-VN')} ₫</div>
            </div>
            <label style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
              Tôi xác nhận thông tin trên là đúng sự thật và đồng ý với điều lệ giải. Dữ liệu cá nhân được xử lý theo NĐ 13/2023/NĐ-CP.
            </label>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        {step > 1
          ? <button onClick={() => setStep(s => s - 1)} style={btnGhost}>← Quay lại</button>
          : <div />
        }
        {step < 4
          ? <button onClick={() => setStep(s => s + 1)} style={{ ...btnPrimary, background: 'var(--ink)' }}>Tiếp theo →</button>
          : <button style={{ ...btnPrimary, background: 'var(--accent)' }}>Nộp hồ sơ & thanh toán VNPay →</button>
        }
      </div>
    </div>
  )
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <input defaultValue={value} style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--paper)', fontSize: 13 }} />
    </label>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function AthleteProfile() {
  return (
    <div style={{ maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div className="caps">Hồ sơ</div>
        <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 30 }}>{me.name}</h1>
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 20, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20 }}>
        <div className="court-placeholder" style={{ height: 150, fontSize: 10 }}>ảnh 3×4</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Mã VĐV', me.id],
            ['CLB', me.club],
            ['Hạng', me.tier],
            ['Rating', String(me.rating)],
            ['Năm sinh', '1998'],
            ['Tay thuận', 'Phải'],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="caps">{l}</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 20 }}>
        <h3 style={{ margin: 0, fontSize: 13 }}>Thành tích 12 tháng gần đây</h3>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, alignItems: 'flex-end', height: 100 }}>
          {[55, 72, 40, 88, 64, 92, 70, 80, 60, 95, 78, 85].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div style={{ width: '100%', height: `${h}%`, background: i === 11 ? 'var(--accent)' : 'var(--ink)', borderRadius: 2 }} />
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>
                {['5','6','7','8','9','10','11','12','1','2','3','4'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Ranking table ────────────────────────────────────────────────────────────

function RankingTable() {
  return (
    <div style={{ maxWidth: 780 }}>
      <div className="caps">Bảng xếp hạng quốc gia</div>
      <h1 className="serif" style={{ margin: '2px 0 14px', fontSize: 30 }}>Đơn nam · tuần 16/2026</h1>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)' }}>
              {['#', 'Vận động viên', 'CLB', 'Hạng', 'Điểm', 'Thay đổi'].map(h => (
                <th key={h} className="caps" style={{ padding: '9px 12px', textAlign: h === 'Điểm' || h === 'Thay đổi' ? 'right' : 'left', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RANKING_MS.map(r => (
              <tr key={r.rank} style={{ background: r.name === me.name ? 'var(--amber-soft)' : 'transparent' }}>
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
