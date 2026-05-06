import { useState, useMemo } from 'react'
import Icon from '../shared/Icon'
import Modal from '../shared/Modal'
import { useToast } from '../shared/Toast'
import { btnGhost, btnPrimary, money } from '../shared/tokens'
import { useBtcNav } from './BtcApp'
import { CATEGORIES } from '../../data/legacy'
import {
  useStore,
  addMatch, addStock, addNewInventoryItem, issueShuttles,
  assignReferee, addNewsItem,
  approveAthleteProfile, rejectAthleteProfile,
  updateTournamentName, updateTournamentVenue,
  type InventoryItem, type Referee,
} from '../../data/store'
import type { LiveMatch, Athlete } from '../../data/legacy'

// ── Shared sub-components ────────────────────────────────────────────────────

export function StatCard({ label, value, sub, accent, children }: {
  label: string; value: React.ReactNode; sub?: string; accent?: string; children?: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 6,
      minHeight: 112, position: 'relative', overflow: 'hidden',
    }}>
      <div className="caps">{label}</div>
      <div className="serif" style={{ fontSize: 30, color: accent || 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{sub}</div>
      {children}
    </div>
  )
}

export function LiveRow({ m }: { m: LiveMatch }) {
  const aWins = m.sets.filter(s => s[0] > s[1]).length
  const bWins = m.sets.filter(s => s[1] > s[0]).length
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto 44px', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line-2)', gap: 12 }}>
      <div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>SÂN {m.court}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{m.cat}</div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          {m.a.seed && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>[{m.a.seed}]</span>}
          <span style={{ fontWeight: aWins > bWins ? 600 : 500 }}>{m.a.name}</span>
          <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>· {m.a.club}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 2 }}>
          {m.b.seed && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>[{m.b.seed}]</span>}
          <span style={{ fontWeight: bWins > aWins ? 600 : 500 }}>{m.b.name}</span>
          <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>· {m.b.club}</span>
        </div>
      </div>
      <div className="mono" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {m.sets.map((s, i) => (
          <div key={i} style={{
            padding: '3px 7px', borderRadius: 4,
            background: i === m.current ? 'var(--accent)' : 'var(--paper-3)',
            color: i === m.current ? 'white' : 'var(--ink-2)',
            fontSize: 12, fontWeight: 600, minWidth: 42, textAlign: 'center',
          }}>
            {s[0]}<span style={{ opacity: 0.5, margin: '0 3px' }}>–</span>{s[1]}
          </div>
        ))}
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>#{m.id}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{m.elapsed}</div>
      </div>
    </div>
  )
}

// ── Modals ───────────────────────────────────────────────────────────────────

function AddMatchModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const { upcomingMatches, courts } = useStore()
  const nextId = Math.max(...upcomingMatches.map(m => m.id), 199) + 1
  const [form, setForm] = useState({
    id: nextId, t: '17:00', court: 1,
    cat: 'MS', round: 'Vòng 1/16', a: '', b: '',
  })
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const submit = () => {
    if (!form.a.trim() || !form.b.trim()) { toast('Vui lòng nhập tên 2 người thi đấu.', 'error'); return }
    addMatch({ ...form, id: Number(form.id) })
    toast(`Đã thêm trận #${form.id} · ${form.a} vs ${form.b}`)
    onClose()
  }

  return (
    <Modal title="Thêm trận phụ" onClose={onClose}
      footer={<>
        <button style={btnGhost} onClick={onClose}>Huỷ</button>
        <button style={btnPrimary} onClick={submit}><Icon name="plus" size={13}/>Thêm trận</button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FieldRow label="Giờ thi đấu">
          <input value={form.t} onChange={e => set('t', e.target.value)} style={inputStyle} />
        </FieldRow>
        <FieldRow label="Sân">
          <select value={form.court} onChange={e => set('court', Number(e.target.value))} style={inputStyle}>
            {courts.map(c => <option key={c.id} value={c.id}>Sân {c.id} ({c.status})</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Hạng mục">
          <select value={form.cat} onChange={e => set('cat', e.target.value)} style={inputStyle}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Vòng đấu">
          <input value={form.round} onChange={e => set('round', e.target.value)} style={inputStyle} placeholder="VD: Vòng 1/16" />
        </FieldRow>
        <FieldRow label="Người thi đấu A">
          <input value={form.a} onChange={e => set('a', e.target.value)} style={inputStyle} placeholder="Tên hoặc cặp đôi" />
        </FieldRow>
        <FieldRow label="Người thi đấu B">
          <input value={form.b} onChange={e => set('b', e.target.value)} style={inputStyle} placeholder="Tên hoặc cặp đôi" />
        </FieldRow>
      </div>
    </Modal>
  )
}

function IssueShuttlesModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { toast } = useToast()
  const { upcomingMatches, liveMatches } = useStore()
  const allMatches = [
    ...liveMatches.map(m => ({ id: m.id, label: `#${m.id} · LIVE · ${m.a.name} vs ${m.b.name}` })),
    ...upcomingMatches.map(m => ({ id: m.id, label: `#${m.id} · ${m.a} vs ${m.b}` })),
  ]
  const [qty, setQty] = useState(3)
  const [matchId, setMatchId] = useState<number | undefined>(undefined)

  const submit = () => {
    if (qty <= 0) { toast('Số lượng phải lớn hơn 0.', 'error'); return }
    if (qty > item.stock) { toast(`Tồn kho chỉ còn ${item.stock}.`, 'error'); return }
    issueShuttles(item.sku, qty, matchId)
    toast(`Đã cấp ${qty} × ${item.sku}`)
    onClose()
  }

  return (
    <Modal title="Cấp phát vật tư" onClose={onClose}
      footer={<>
        <button style={btnGhost} onClick={onClose}>Huỷ</button>
        <button style={btnPrimary} onClick={submit}><Icon name="check" size={13}/>Cấp phát</button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '10px 12px', background: 'var(--paper-2)', borderRadius: 6, fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>SKU: {item.sku} · Tồn kho: {item.stock}</div>
        </div>
        <FieldRow label="Số lượng cấp phát">
          <input type="number" min={1} max={item.stock} value={qty}
            onChange={e => setQty(Number(e.target.value))} style={inputStyle} />
        </FieldRow>
        <FieldRow label="Cho trận (tuỳ chọn)">
          <select value={matchId ?? ''} onChange={e => setMatchId(e.target.value ? Number(e.target.value) : undefined)} style={inputStyle}>
            <option value="">— Không chỉ định —</option>
            {allMatches.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </FieldRow>
      </div>
    </Modal>
  )
}

function AddStockModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const { inventory } = useStore()
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [sku, setSku] = useState(inventory[0]?.sku ?? '')
  const [qty, setQty] = useState(50)
  const [newItem, setNewItem] = useState({ sku: '', name: '', stock: 0, min: 20, issued: 0 })
  const setN = (k: string, v: string | number) => setNewItem(p => ({ ...p, [k]: v }))

  const submit = () => {
    if (mode === 'existing') {
      if (qty <= 0) { toast('Số lượng phải lớn hơn 0.', 'error'); return }
      addStock(sku, qty)
      toast(`Nhập kho ${qty} × ${sku}`)
    } else {
      if (!newItem.sku.trim() || !newItem.name.trim()) { toast('Vui lòng nhập SKU và tên vật tư.', 'error'); return }
      addNewInventoryItem(newItem)
      toast(`Đã thêm vật tư mới: ${newItem.name}`)
    }
    onClose()
  }

  return (
    <Modal title="Nhập kho" onClose={onClose}
      footer={<>
        <button style={btnGhost} onClick={onClose}>Huỷ</button>
        <button style={btnPrimary} onClick={submit}><Icon name="plus" size={13}/>Nhập kho</button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--paper-2)', borderRadius: 7, width: 'fit-content' }}>
          {(['existing', 'new'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
              background: mode === m ? 'var(--ink)' : 'transparent',
              color: mode === m ? 'white' : 'var(--ink-2)', fontSize: 12,
            }}>
              {m === 'existing' ? 'Vật tư có sẵn' : 'Vật tư mới'}
            </button>
          ))}
        </div>
        {mode === 'existing' ? (
          <>
            <FieldRow label="Vật tư">
              <select value={sku} onChange={e => setSku(e.target.value)} style={inputStyle}>
                {inventory.map(it => <option key={it.sku} value={it.sku}>{it.name} (tồn: {it.stock})</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Số lượng nhập">
              <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} style={inputStyle} />
            </FieldRow>
          </>
        ) : (
          <>
            <FieldRow label="SKU"><input value={newItem.sku} onChange={e => setN('sku', e.target.value)} style={inputStyle} placeholder="VD: SH-YNX-AS40" /></FieldRow>
            <FieldRow label="Tên vật tư"><input value={newItem.name} onChange={e => setN('name', e.target.value)} style={inputStyle} placeholder="Tên vật tư" /></FieldRow>
            <FieldRow label="Số lượng ban đầu"><input type="number" min={0} value={newItem.stock} onChange={e => setN('stock', Number(e.target.value))} style={inputStyle} /></FieldRow>
            <FieldRow label="Tồn kho tối thiểu"><input type="number" min={0} value={newItem.min} onChange={e => setN('min', Number(e.target.value))} style={inputStyle} /></FieldRow>
          </>
        )}
      </div>
    </Modal>
  )
}

function AssignRefereeModal({ referee, onClose }: { referee: Referee; onClose: () => void }) {
  const { toast } = useToast()
  const { upcomingMatches, liveMatches } = useStore()
  const allMatches = [
    ...liveMatches.map(m => ({ id: m.id, label: `#${m.id} · LIVE · ${m.a.name} vs ${m.b.name}` })),
    ...upcomingMatches.map(m => ({ id: m.id, label: `#${m.id} · ${m.t} · ${m.a} vs ${m.b}` })),
  ]
  const [matchId, setMatchId] = useState<number | ''>(allMatches[0]?.id ?? '')

  const submit = () => {
    if (!matchId) { toast('Chọn trận đấu.', 'error'); return }
    assignReferee(referee.id, Number(matchId))
    toast(`Đã phân công ${referee.name} cho trận #${matchId}`)
    onClose()
  }

  return (
    <Modal title={`Phân công: ${referee.name}`} onClose={onClose}
      footer={<>
        <button style={btnGhost} onClick={onClose}>Huỷ</button>
        <button style={btnPrimary} onClick={submit}><Icon name="check" size={13}/>Phân công</button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '10px 12px', background: 'var(--paper-2)', borderRadius: 6, fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{referee.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{referee.cert} · Đã phân công: {referee.assigned} trận</div>
        </div>
        <FieldRow label="Trận đấu">
          <select value={matchId} onChange={e => setMatchId(Number(e.target.value))} style={inputStyle}>
            {allMatches.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </FieldRow>
      </div>
    </Modal>
  )
}

function AddNewsModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ title: '', tag: 'Thông báo', ts: new Date().toLocaleDateString('vi-VN') })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = () => {
    if (!form.title.trim()) { toast('Tiêu đề không được để trống.', 'error'); return }
    addNewsItem(form)
    toast(`Đã đăng bài: "${form.title}"`)
    onClose()
  }

  return (
    <Modal title="Bài viết mới" onClose={onClose}
      footer={<>
        <button style={btnGhost} onClick={onClose}>Huỷ</button>
        <button style={btnPrimary} onClick={submit}><Icon name="check" size={13}/>Đăng bài</button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FieldRow label="Tiêu đề">
          <input value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} placeholder="Tiêu đề bài viết..." />
        </FieldRow>
        <FieldRow label="Nhãn (tag)">
          <select value={form.tag} onChange={e => set('tag', e.target.value)} style={inputStyle}>
            {['Thông báo','Highlight','Thể thức','Khán giả','Kết quả'].map(t => <option key={t}>{t}</option>)}
          </select>
        </FieldRow>
      </div>
    </Modal>
  )
}

// ── Form helpers ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid var(--line)',
  borderRadius: 6, background: 'var(--paper)', fontSize: 13,
  color: 'var(--ink)', fontFamily: 'inherit', boxSizing: 'border-box',
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {children}
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { tournament, liveMatches, upcomingMatches, activityLog, courts } = useStore()
  const { toast } = useToast()
  const navigate = useBtcNav()
  const [addMatchOpen, setAddMatchOpen] = useState(false)

  return (
    <div style={{ display: 'grid', gap: 16, padding: 18, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      {addMatchOpen && <AddMatchModal onClose={() => setAddMatchOpen(false)} />}

      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <div className="caps">Day 1 · Saturday 18 April</div>
          <h1 className="serif" style={{ fontSize: 36, margin: '4px 0 2px', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
            Good afternoon, Phạm Lâm.
          </h1>
          <div style={{ color: 'var(--ink-2)', fontSize: 13 }}>
            {liveMatches.length} trận đang diễn ra · {upcomingMatches.length} trận sắp bắt đầu · {tournament.approved} VĐV đã check-in · {tournament.shuttles.usedToday} cầu đã cấp hôm nay.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnGhost} onClick={() => setAddMatchOpen(true)}><Icon name="plus" size={13}/> Thêm trận phụ</button>
          <button style={btnPrimary} onClick={() => toast('Đang xuất báo cáo ngày...', 'info')}><Icon name="dl" size={13}/> Xuất báo cáo ngày</button>
        </div>
      </div>

      <div style={{ gridColumn: 'span 3' }}>
        <StatCard label="Trận đang diễn ra" value={liveMatches.length} sub={`trên ${tournament.courts} sân đang mở`} accent="var(--accent)">
          <div style={{ position: 'absolute', right: 12, top: 14 }}>
            <span className="pill live"><span className="dot live-dot"/>LIVE</span>
          </div>
        </StatCard>
      </div>
      <div style={{ gridColumn: 'span 3' }}>
        <StatCard label="Trận đã hoàn tất" value={`${tournament.matches.done}/${tournament.matches.total}`} sub={`${Math.round(tournament.matches.done / tournament.matches.total * 100)}% tiến độ giải`}>
          <div style={{ height: 4, background: 'var(--line-2)', borderRadius: 2, marginTop: 4 }}>
            <div style={{ width: `${tournament.matches.done / tournament.matches.total * 100}%`, height: '100%', background: 'var(--court)', borderRadius: 2 }}/>
          </div>
        </StatCard>
      </div>
      <div style={{ gridColumn: 'span 3' }}>
        <StatCard label="Tồn kho cầu" value={tournament.shuttles.stock} sub={`tối thiểu ${tournament.shuttles.min} · dùng hôm nay ${tournament.shuttles.usedToday}`}/>
      </div>
      <div style={{ gridColumn: 'span 3' }}>
        <StatCard label="Ngân sách" value={money(tournament.budget)} sub="được phê duyệt 15/03"/>
      </div>

      <div style={{ gridColumn: 'span 8', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Trận đang diễn ra</h3>
          <span className="pill live" style={{ marginLeft: 10 }}><span className="dot live-dot"/>{liveMatches.length} LIVE</span>
          <div style={{ flex: 1 }}/>
          <button className="caps" style={{ border: 0, background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', fontSize: 11 }}
            onClick={() => navigate('schedule')}>Xem tất cả →</button>
        </div>
        {liveMatches.slice(0, 5).map(m => <LiveRow key={m.id} m={m}/>)}
      </div>

      <div style={{ gridColumn: 'span 4', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Hoạt động hệ thống</h3>
        </div>
        <div style={{ padding: '4px 0', overflowY: 'auto', flex: 1 }}>
          {activityLog.map((f, i) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', gap: 10, fontSize: 12.5 }}>
              <div className="mono" style={{ color: 'var(--ink-3)', width: 38, flexShrink: 0 }}>{f.t}</div>
              <div><span style={{ fontWeight: 600 }}>{f.who}</span> <span style={{ color: 'var(--ink-2)' }}>{f.msg}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ gridColumn: 'span 7', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Sắp bắt đầu</h3>
          <div style={{ flex: 1 }}/>
          <div className="caps">Cửa số 2 giờ</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: 'var(--ink-3)', textAlign: 'left' }}>
              {['Giờ', 'Sân', 'Hạng', 'Vòng', 'Trận đấu', 'Trạng thái'].map(h =>
                <th key={h} className="caps" style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {upcomingMatches.map(m => (
              <tr key={m.id}>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{m.t}</td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>Sân {m.court}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{CATEGORIES[m.cat]}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-2)' }}>{m.round}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>
                  <span style={{ fontWeight: 500 }}>{m.a}</span>
                  <span style={{ color: 'var(--ink-3)', margin: '0 6px' }}>vs</span>
                  <span style={{ fontWeight: 500 }}>{m.b}</span>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>
                  <span className="pill scheduled">Lên lịch</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ gridColumn: 'span 5', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Công suất sân</h3>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {courts.map(c => {
            const bg = c.status === 'live' ? 'var(--accent)' : c.status === 'idle' ? 'var(--paper-3)' : 'var(--amber-soft)'
            const fg = c.status === 'live' ? 'white' : 'var(--ink-2)'
            return (
              <div key={c.id} style={{ background: bg, color: fg, padding: '10px 12px', borderRadius: 6, border: c.status !== 'live' ? '1px solid var(--line)' : 'none', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 74 }}>
                <div className="mono" style={{ fontSize: 11, opacity: 0.8 }}>SÂN {c.id}</div>
                <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>
                  {c.status === 'live' ? c.match : c.status === 'idle' ? 'Trống' : 'Bảo trì'}
                </div>
                <div className="mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 'auto' }}>{c.floor}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Schedule ─────────────────────────────────────────────────────────────────

export function ScheduleView() {
  const { liveMatches, upcomingMatches, courts } = useStore()
  const [day, setDay] = useState(0)
  const [catFilter, setCatFilter] = useState<string>('all')
  const [addMatchOpen, setAddMatchOpen] = useState(false)
  const { toast } = useToast()

  const days = ['Th.7 18/04','CN 19/04','Th.2 20/04','Th.3 21/04','Th.4 22/04','Th.5 23/04','Th.6 24/04','Th.7 25/04','CN 26/04']
  const slots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:30','19:00','19:30','20:00']

  const blocks = [
    { court:1, start:0, span:3, cat:'MS', label:'Đ.nam · R32 · #180-183', status:'done' },
    { court:1, start:8, span:4, cat:'MS', label:'Đ.nam · R32 · #184', status:'live' },
    { court:1, start:12, span:3, cat:'MS', label:'Đ.nam · R32 · #192', status:'scheduled' },
    { court:2, start:0, span:4, cat:'WS', label:'Đ.nữ · R32 · #181-185', status:'done' },
    { court:2, start:8, span:3, cat:'WS', label:'Đ.nữ · R32 · #185', status:'live' },
    { court:2, start:11, span:3, cat:'WD', label:'Đôi nữ · QF · #193', status:'scheduled' },
    { court:3, start:0, span:3, cat:'MD', label:'Đôi nam · R32', status:'done' },
    { court:3, start:8, span:5, cat:'MD', label:'Đôi nam · QF · #186', status:'live' },
    { court:3, start:13, span:3, cat:'XD', label:'Đôi NN · QF · #194', status:'scheduled' },
    { court:4, start:11, span:3, cat:'WS', label:'Đ.nữ · R16 · #190', status:'scheduled' },
    { court:5, start:0, span:4, cat:'XD', label:'Đôi NN · R32', status:'done' },
    { court:5, start:9, span:3, cat:'XD', label:'Đôi NN · R16 · #187', status:'live' },
    { court:5, start:16, span:3, cat:'MS', label:'Đ.nam · R16 · #195', status:'scheduled' },
    { court:6, start:1, span:3, cat:'WD', label:'Đôi nữ · R32', status:'done' },
    { court:6, start:8, span:4, cat:'WD', label:'Đôi nữ · R16 · #188', status:'live' },
    { court:7, start:0, span:0, status:'maintenance' },
    { court:7, start:11, span:3, cat:'MS', label:'Đ.nam · R16 · #191', status:'scheduled', conflict: true },
    { court:8, start:1, span:3, cat:'MS', label:'Đ.nam · R32', status:'done' },
    { court:8, start:9, span:3, cat:'MS', label:'Đ.nam · R32 · #189', status:'live' },
    { court:8, start:14, span:3, cat:'MS', label:'Đ.nam · R16', status:'scheduled' },
    ...upcomingMatches.map((m, i) => ({
      court: m.court, start: 14 + i, span: 3, cat: m.cat,
      label: `${CATEGORIES[m.cat]} · ${m.round} · #${m.id}`, status: 'scheduled',
    })),
  ] as Array<{ court:number; start:number; span:number; cat?:string; label?:string; status:string; conflict?:boolean }>

  const visibleBlocks = catFilter === 'all' ? blocks : blocks.filter(b => !b.cat || b.cat === catFilter)

  const colBg: Record<string, string> = {
    done: 'var(--paper-3)', live: 'var(--accent)', scheduled: 'var(--paper-2)',
    maintenance: 'repeating-linear-gradient(45deg, var(--paper-3) 0 6px, var(--paper-2) 6px 12px)',
  }

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      {addMatchOpen && <AddMatchModal onClose={() => setAddMatchOpen(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="caps">Lịch thi đấu chi tiết</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>Điều phối 9 ngày · 8 sân · 284 trận</h1>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 6 }}>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }}>
            <option value="all">Tất cả hạng mục</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
          </select>
          <button style={btnGhost} onClick={() => toast('Đang xuất lịch...', 'info')}><Icon name="dl" size={13}/> Xuất</button>
          <button style={btnPrimary} onClick={() => setAddMatchOpen(true)}><Icon name="plus" size={13}/> Thêm trận phụ</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }} className="no-scrollbar">
        {days.map((d, i) => (
          <button key={d} onClick={() => setDay(i)} style={{
            padding: '7px 14px', borderRadius: 6,
            border: '1px solid ' + (day === i ? 'var(--ink)' : 'var(--line)'),
            background: day === i ? 'var(--ink)' : 'var(--paper)',
            color: day === i ? 'white' : 'var(--ink-2)', fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{d}</button>
        ))}
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `90px repeat(${slots.length}, 1fr)`, borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
          <div/>
          {slots.map(s => (
            <div key={s} className="mono" style={{ padding: '6px 4px', fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center', borderLeft: '1px solid var(--line-2)' }}>{s}</div>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
          {courts.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: `90px repeat(${slots.length}, 1fr)`, borderBottom: '1px solid var(--line-2)', minHeight: 48, position: 'relative' }}>
              <div style={{ padding: '12px', fontSize: 12, fontWeight: 600, borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--paper-2)' }}>
                <div>Sân {c.id}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 400 }}>{c.floor}</div>
              </div>
              {slots.map((_, i) => <div key={i} style={{ borderLeft: '1px solid var(--line-2)' }}/>)}
              {c.status === 'maintenance' && (
                <div style={{ position: 'absolute', left: 90, right: 0, top: 0, bottom: 0, background: colBg.maintenance, display: 'flex', alignItems: 'center', paddingLeft: 12, color: 'var(--ink-3)', fontSize: 11.5, fontStyle: 'italic' }}>
                  Bảo trì lưới — không xếp lịch
                </div>
              )}
              {visibleBlocks.filter(b => b.court === c.id && b.span > 0).map((b, i) => {
                const width = `calc((100% - 90px) / ${slots.length} * ${b.span})`
                const left  = `calc(90px + (100% - 90px) / ${slots.length} * ${b.start})`
                return (
                  <div key={i} style={{
                    position: 'absolute', left, width, top: 5, bottom: 5,
                    background: colBg[b.status], color: b.status === 'live' ? 'white' : 'var(--ink)',
                    borderRadius: 4, padding: '6px 8px', fontSize: 11, cursor: 'pointer',
                    border: b.conflict ? '1.5px solid var(--amber)' : (b.status === 'scheduled' ? '1px solid var(--line)' : 'none'),
                    display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden',
                  }}>
                    <div className="mono" style={{ fontSize: 9.5, opacity: 0.75 }}>{b.cat}</div>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</div>
                    {b.conflict && <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600 }}>⚠ Xung đột trọng tài</div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--ink-3)' }}>
        <Legend color="var(--accent)" label="Đang thi đấu"/>
        <Legend color="var(--paper-3)" label="Đã kết thúc"/>
        <Legend color="var(--paper-2)" outline label="Đã lên lịch"/>
        <Legend color="var(--amber)" outline label="Xung đột / cần xử lý"/>
      </div>
    </div>
  )
}

const Legend = ({ color, label, outline }: { color: string; label: string; outline?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 14, height: 10, background: outline ? 'transparent' : color, border: '1px solid ' + color, borderRadius: 2, display: 'inline-block' }}/>
    {label}
  </div>
)

// ── Bracket ──────────────────────────────────────────────────────────────────

export function BracketView() {
  const [activeCat, setActiveCat] = useState('MS')
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
  }
  const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 220 }

  const MatchCard = ({ ns, live }: { ns: [string, string]; live?: boolean }) => (
    <div style={{ background: 'var(--paper)', border: '1px solid ' + (live ? 'var(--accent)' : 'var(--line)'), borderRadius: 6, padding: '8px 10px', fontSize: 12.5, position: 'relative', boxShadow: live ? '0 0 0 3px oklch(0.94 0.04 25)' : 'none' }}>
      {live && <span className="pill live" style={{ position: 'absolute', top: -8, right: 8, fontSize: 9.5, padding: '1px 6px' }}><span className="dot live-dot"/>LIVE</span>}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>{ns[0]}</span></div>
      <div style={{ borderTop: '1px solid var(--line-2)' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>{ns[1]}</span></div>
    </div>
  )

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div>
          <div className="caps">Sơ đồ thi đấu</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>{CATEGORIES[activeCat]} · Nhánh loại trực tiếp</h1>
          <div style={{ color: 'var(--ink-2)', fontSize: 12.5 }}>Tự cập nhật sau mỗi trận · Hạt giống 1–8 được phân tán theo FIBA seeding</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <button key={k} onClick={() => setActiveCat(k)} style={{ padding: '6px 11px', borderRadius: 6, border: '1px solid ' + (activeCat === k ? 'var(--ink)' : 'var(--line)'), background: activeCat === k ? 'var(--ink)' : 'var(--paper)', color: activeCat === k ? 'white' : 'var(--ink-2)', fontSize: 12, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, padding: 24, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflowX: 'auto' }}>
        <div style={col}>
          <div className="caps" style={{ textAlign: 'center' }}>Vòng 1/16</div>
          {names.r16.map((ns, i) => <MatchCard key={i} ns={ns as [string,string]} live={i === 0 && activeCat === 'MS'}/>)}
        </div>
        <div style={col}>
          <div className="caps" style={{ textAlign: 'center' }}>Tứ kết</div>
          {[0,1,2,3].map(i => <MatchCard key={i} ns={['TBD','TBD']}/>)}
        </div>
        <div style={col}>
          <div className="caps" style={{ textAlign: 'center' }}>Bán kết</div>
          {[0,1].map(i => <MatchCard key={i} ns={['TBD','TBD']}/>)}
        </div>
        <div style={col}>
          <div className="caps" style={{ textAlign: 'center' }}>Chung kết</div>
          <MatchCard ns={['TBD','TBD']}/>
          <div style={{ marginTop: 40, background: 'var(--ink)', color: 'white', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div className="caps" style={{ color: 'oklch(0.75 0.01 250)' }}>Nhà vô địch</div>
            <div className="serif" style={{ fontSize: 28, letterSpacing: '0.02em', textTransform: 'uppercase', marginTop: 6 }}>—</div>
            <div className="mono" style={{ fontSize: 11, color: 'oklch(0.65 0.01 250)', marginTop: 4 }}>Cúp + 50.000.000 ₫</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Athletes ─────────────────────────────────────────────────────────────────

function AthleteDetail({ a, onClose }: { a: Athlete; onClose: () => void }) {
  const { toast } = useToast()
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = () => {
    if (confirm !== 'approve') { setConfirm('approve'); setTimeout(() => setConfirm(null), 3000); return }
    approveAthleteProfile(a.id)
    toast(`Đã phê duyệt hồ sơ VĐV ${a.name}`)
    onClose()
  }

  const handleReject = () => {
    if (confirm !== 'reject') { setConfirm('reject'); setTimeout(() => setConfirm(null), 3000); return }
    rejectAthleteProfile(a.id, 'Hồ sơ không đạt yêu cầu')
    toast(`Đã từ chối hồ sơ VĐV ${a.name}`, 'error')
    onClose()
  }

  return (
    <aside style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'stretch' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="caps" style={{ flex: 1 }}>Hồ sơ vận động viên</div>
        <button onClick={onClose} style={{ border: 0, background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer' }}><Icon name="x" size={14}/></button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="court-placeholder" style={{ width: 80, height: 100, borderRadius: 4, flexShrink: 0, fontSize: 9 }}>Ảnh 3×4</div>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{a.id}</div>
          <div className="serif" style={{ fontSize: 24, letterSpacing: '0.01em', textTransform: 'uppercase', marginTop: 2 }}>{a.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4 }}>{a.club} · {a.gender === 'M' ? 'Nam' : 'Nữ'} · {a.dob}</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
            {a.tier && <span className="pill ok">Hạng {a.tier}</span>}
            <span className="pill info">Rating {a.rating}</span>
          </div>
        </div>
      </div>
      <div>
        <div className="caps" style={{ marginBottom: 6 }}>Hạng mục đăng ký</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {['MS','MD','XD'].map(c => <span key={c} className="pill">{CATEGORIES[c]}</span>)}
        </div>
      </div>

      {confirm && (
        <div style={{ padding: '8px 12px', borderRadius: 6, background: confirm === 'approve' ? 'oklch(0.93 0.06 160)' : 'oklch(0.96 0.04 25)', fontSize: 12 }}>
          Nhấn lại để xác nhận {confirm === 'approve' ? 'phê duyệt' : 'từ chối'}.
        </div>
      )}

      {(a.status === 'pending' || a.status === 'incomplete') && (
        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={handleReject} style={{ ...btnGhost, flex: 1, justifyContent: 'center', color: confirm === 'reject' ? 'white' : 'var(--accent)', background: confirm === 'reject' ? 'var(--accent)' : 'var(--paper)', borderColor: 'var(--accent)' }}>
            <Icon name="x" size={13}/> Từ chối
          </button>
          <button onClick={handleApprove} style={{ ...btnPrimary, flex: 2, justifyContent: 'center', background: confirm === 'approve' ? 'oklch(0.38 0.14 160)' : 'var(--court)' }}>
            <Icon name="check" size={13}/> Phê duyệt hồ sơ
          </button>
        </div>
      )}
      {a.status === 'incomplete' && a.note && (
        <div style={{ padding: 10, background: 'var(--amber-soft)', borderRadius: 6, fontSize: 12 }}>
          <b>Yêu cầu bổ sung:</b> {a.note}
        </div>
      )}
    </aside>
  )
}

export function AthletesView() {
  const { athletes } = useStore()
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sel, setSel] = useState<Athlete | null>(null)

  const filtered = useMemo(() => {
    let list = athletes.filter(a => filter === 'all' || a.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.club.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    }
    return list
  }, [athletes, filter, search])

  return (
    <div style={{ padding: 18, display: 'grid', gridTemplateColumns: sel ? '1fr 360px' : '1fr', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <div className="caps">Vận động viên & hồ sơ</div>
            <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
              {athletes.filter(a => a.status === 'approved').length} hợp lệ · {athletes.filter(a => a.status === 'pending').length} chờ duyệt
            </h1>
          </div>
          <div style={{ flex: 1 }}/>
          <button style={btnPrimary} onClick={() => toast('Đang xuất danh sách VĐV...', 'info')}><Icon name="dl" size={13}/> Xuất danh sách</button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: 340 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none', display: 'flex' }}>
              <Icon name="search" size={14}/>
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, CLB, mã VĐV..."
              style={{ ...inputStyle, paddingLeft: 32 }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['all','Tất cả'], ['approved','Đã duyệt'], ['pending','Chờ duyệt'], ['incomplete','Thiếu hồ sơ']].map(([id, l]) => (
              <button key={id} onClick={() => setFilter(id)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid ' + (filter===id?'var(--ink)':'var(--line)'), background: filter===id?'var(--ink)':'var(--paper)', color: filter===id?'white':'var(--ink-2)', fontSize: 12, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: 'var(--ink-3)', textAlign: 'left', background: 'var(--paper-2)' }}>
                {['Mã','Họ tên','CLB','Giới','Sinh','Hạng','Rating','Trạng thái',''].map(h =>
                  <th key={h} className="caps" style={{ padding: '9px 12px', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setSel(a)} style={{ cursor: 'pointer', background: sel?.id === a.id ? 'var(--paper-2)' : 'transparent' }}>
                  <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>{a.id}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{a.club}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{a.gender === 'M' ? 'Nam' : 'Nữ'}</td>
                  <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{a.dob}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>
                    {a.tier && <span className="mono" style={{ padding: '1px 6px', borderRadius: 3, fontSize: 10, background: a.tier==='A'?'var(--ink)':a.tier==='B'?'var(--paper-3)':'var(--paper-2)', color: a.tier==='A'?'white':'var(--ink-2)' }}>{a.tier}</span>}
                  </td>
                  <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{a.rating}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>
                    {a.status === 'approved'   && <span className="pill ok">Đã duyệt</span>}
                    {a.status === 'pending'    && <span className="pill info">Chờ duyệt</span>}
                    {a.status === 'incomplete' && <span className="pill warn">Thiếu thông tin</span>}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', textAlign: 'right', color: 'var(--ink-3)' }}><Icon name="chevR" size={14}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>Không tìm thấy VĐV.</div>
          )}
        </div>
      </div>
      {sel && <AthleteDetail key={sel.id} a={athletes.find(a => a.id === sel.id) ?? sel} onClose={() => setSel(null)}/>}
    </div>
  )
}

// ── Courts ───────────────────────────────────────────────────────────────────

export function CourtsView() {
  const { courts, liveMatches } = useStore()
  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="caps">Sân & điều phối</div>
        <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>8 sân · Nhà thi đấu Phú Thọ</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {courts.map(c => {
          const live = liveMatches.find(m => m.court === c.id)
          return (
            <div key={c.id} style={{ background: c.status === 'live' ? 'var(--ink)' : 'var(--paper)', color: c.status === 'live' ? 'white' : 'var(--ink)', border: '1px solid ' + (c.status === 'live' ? 'var(--ink)' : 'var(--line)'), borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid ' + (c.status === 'live' ? 'oklch(0.28 0.01 250)' : 'var(--line)') }}>
                <div>
                  <div className="caps" style={{ opacity: 0.7 }}>SÂN</div>
                  <div className="serif" style={{ fontSize: 40 }}>{c.id}</div>
                </div>
                {c.status === 'live'        && <span className="pill live"><span className="dot live-dot"/>LIVE</span>}
                {c.status === 'idle'        && <span className="pill">Trống</span>}
                {c.status === 'maintenance' && <span className="pill warn">Bảo trì</span>}
              </div>
              <div style={{ padding: 12, height: 110, position: 'relative', background: c.status === 'live' ? 'oklch(0.24 0.01 250)' : 'var(--paper-2)' }}>
                <div style={{ position: 'absolute', inset: 12, border: '1px solid ' + (c.status === 'live' ? 'oklch(0.4 0.01 250)' : 'var(--line)'), borderRadius: 3 }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: c.status === 'live' ? 'oklch(0.4 0.01 250)' : 'var(--line)' }}/>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: c.status === 'live' ? 'oklch(0.4 0.01 250)' : 'var(--line)' }}/>
                </div>
                {live && (
                  <div className="mono" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, letterSpacing: '-0.02em' }}>
                    {live.sets[live.current][0]} : {live.sets[live.current][1]}
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 14px', fontSize: 12 }}>
                {live ? (
                  <>
                    <div style={{ opacity: 0.7, fontSize: 10.5 }} className="caps">{live.round} · {live.cat}</div>
                    <div style={{ marginTop: 3 }}>{live.a.name}</div>
                    <div style={{ opacity: 0.7 }}>vs {live.b.name}</div>
                  </>
                ) : c.status === 'idle' ? (
                  <div style={{ color: 'var(--ink-3)' }}>Trống — chưa xếp lịch</div>
                ) : (
                  <div style={{ color: 'var(--ink-2)' }}>Thay lưới · dự kiến hoạt động trở lại 16:30</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export function InventoryView() {
  const { inventory, tournament } = useStore()
  const { toast } = useToast()
  const [issueItem, setIssueItem] = useState<InventoryItem | null>(null)
  const [addStockOpen, setAddStockOpen] = useState(false)

  const totalStock = inventory.reduce((s, it) => s + it.stock, 0)
  const warnCount = inventory.filter(it => it.status !== 'ok').length

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {issueItem && <IssueShuttlesModal item={issueItem} onClose={() => setIssueItem(null)} />}
      {addStockOpen && <AddStockModal onClose={() => setAddStockOpen(false)} />}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div>
          <div className="caps">Kho cầu & vật tư</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>Tồn kho · cấp phát · cảnh báo</h1>
        </div>
        <div style={{ flex: 1 }}/>
        <button style={btnGhost} onClick={() => toast('Đang xuất báo cáo kho...', 'info')}><Icon name="dl" size={13}/> Xuất báo cáo kho</button>
        <button style={btnPrimary} onClick={() => setAddStockOpen(true)}><Icon name="plus" size={13}/> Nhập kho</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Tổng tồn"           value={totalStock}                  sub="tất cả vật tư"/>
        <StatCard label="Cấp hôm nay"         value={tournament.shuttles.usedToday} sub="cầu đã xuất" accent="var(--court)"/>
        <StatCard label="Định mức / trận"     value="3-5"                         sub="set 2 trở lên: +1"/>
        <StatCard label="Cảnh báo đang mở"    value={warnCount}                   sub={`${inventory.filter(i=>i.status==='critical').length} critical`} accent={warnCount > 0 ? 'var(--amber)' : undefined}/>
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: 'var(--ink-3)', textAlign: 'left', background: 'var(--paper-2)' }}>
              {['Mã','Vật tư','Tồn','Tối thiểu','Xuất hôm nay','Trạng thái',''].map(h =>
                <th key={h} className="caps" style={{ padding: '9px 12px', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {inventory.map(it => {
              const pct = Math.min(100, it.stock / (it.min * 2) * 100)
              return (
                <tr key={it.sku}>
                  <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>{it.sku}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', fontWeight: 500 }}>{it.name}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--line-2)', borderRadius: 2 }}>
                        <div style={{ width: pct + '%', height: '100%', background: it.status === 'critical' ? 'var(--accent)' : it.status === 'warn' ? 'var(--amber)' : 'var(--court)', borderRadius: 2 }}/>
                      </div>
                      <span className="mono">{it.stock}</span>
                    </div>
                  </td>
                  <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>{it.min}</td>
                  <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{it.issued}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>
                    {it.status === 'ok'       && <span className="pill ok">Đủ</span>}
                    {it.status === 'warn'     && <span className="pill warn">Thấp</span>}
                    {it.status === 'critical' && <span className="pill" style={{background:'var(--accent)',color:'white',borderColor:'var(--accent)'}}>Cạn kho</span>}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', textAlign: 'right' }}>
                    <button style={btnGhost} onClick={() => setIssueItem(it)}>Cấp phát</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Finance ──────────────────────────────────────────────────────────────────

export function FinanceView() {
  const { transactions, tournament } = useStore()
  const { toast } = useToast()
  const totalIn  = transactions.filter(r => r.amt > 0).reduce((s, r) => s + r.amt, 0)
  const totalOut = transactions.filter(r => r.amt < 0).reduce((s, r) => s + r.amt, 0)

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div className="caps">Tài chính giải đấu</div>
        <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>Ngân sách · Thu/Chi · Báo cáo</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Ngân sách giải"   value={money(tournament.budget)}  sub="được phê duyệt 15/03"/>
        <StatCard label="Tổng thu đến nay" value={money(totalIn)}             sub="lệ phí + tài trợ" accent="var(--court)"/>
        <StatCard label="Tổng chi đến nay" value={money(-totalOut)}           sub="vật tư + tổ chức + thưởng" accent="var(--accent)"/>
        <StatCard label="Cân đối"          value={money(totalIn + totalOut)}  sub="tính đến hôm nay"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Lịch sử giao dịch</h3>
            <div style={{ flex: 1 }}/>
            <button style={btnGhost} onClick={() => toast('Đang xuất PDF...', 'info')}><Icon name="pdf" size={13}/> Xuất PDF</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <tbody>
              {transactions.map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)', width: 60 }}>{r.t}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)' }}>{r.desc}</td>
                  <td className="mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)', textAlign: 'right', fontWeight: 600, color: r.amt > 0 ? 'var(--court)' : 'var(--accent)' }}>
                    {r.amt > 0 ? '+' : ''}{money(r.amt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Cơ cấu chi phí</h3>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['Thuê địa điểm',270,'var(--ink)'],['Giải thưởng',200,'var(--accent)'],['Vật tư & hậu cần',160,'var(--court)'],['Phí trọng tài',126,'var(--amber)'],['Y tế & an ninh',40,'var(--ink-3)'],['Truyền thông',30,'oklch(0.55 0.12 250)']].map(([l,v,c]) => (
              <div key={String(l)}>
                <div style={{ display: 'flex', fontSize: 12 }}><span>{l}</span><span style={{flex:1}}/><span className="mono">{v}M</span></div>
                <div style={{ height: 4, background: 'var(--line-2)', borderRadius: 2, marginTop: 3 }}>
                  <div style={{ width: `${Number(v)/3}%`, height: '100%', background: String(c), borderRadius: 2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reports ──────────────────────────────────────────────────────────────────

export function ReportsView() {
  const { toast } = useToast()
  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div className="caps">Báo cáo & thống kê</div>
        <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>Xuất báo cáo chuẩn Bộ VHTT&DL</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          {name:'Báo cáo tổng kết giải đấu',    sub:'PDF · chuẩn Bộ VHTT&DL · ~28 trang',  cta:'Xuất PDF',  icon:'pdf'},
          {name:'Danh sách VĐV & CLB',           sub:'CSV · tất cả 384 hồ sơ đăng ký',       cta:'Xuất CSV',  icon:'users'},
          {name:'Báo cáo tài chính chi tiết',    sub:'XLSX · thu, chi, chứng từ',            cta:'Xuất XLSX', icon:'wallet'},
          {name:'Kết quả toàn bộ trận đấu',      sub:'PDF · 284 trận · tỷ số từng set',      cta:'Xuất PDF',  icon:'pdf'},
          {name:'Cập nhật bảng xếp hạng quốc gia',sub:'JSON · đồng bộ với BXH quốc gia',   cta:'Đồng bộ',   icon:'chart'},
          {name:'Nhật ký trọng tài & kháng nghị', sub:'PDF · 4 kháng nghị · 2 walkover',    cta:'Xuất PDF',  icon:'shield'},
        ].map(r => (
          <div key={r.name} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
              <Icon name={r.icon} size={16}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', flex: 1 }}>{r.sub}</div>
            <button style={{ ...btnGhost, width: 'fit-content' }} onClick={() => toast(`Đang xử lý: ${r.cta}...`, 'info')}>
              <Icon name="dl" size={13}/>{r.cta}
            </button>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Thống kê nhanh — 18/04</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginTop: 14 }}>
          {[['Trận hoàn tất','32'],['Set trung bình / trận','2.6'],['Thời gian TB / trận',"38′"],['Hủy / hoãn','1'],['Kháng nghị','2'],['Khán giả check-in','4.120']].map(([l,v]) => (
            <div key={l}>
              <div className="caps">{l}</div>
              <div className="serif" style={{ fontSize: 26, lineHeight: 1, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Referees ─────────────────────────────────────────────────────────────────

export function RefereesView() {
  const { referees } = useStore()
  const [assignTarget, setAssignTarget] = useState<Referee | null>(null)

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {assignTarget && <AssignRefereeModal referee={assignTarget} onClose={() => setAssignTarget(null)} />}

      <div>
        <div className="caps">Trọng tài & phân công</div>
        <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>{referees.length} trọng tài · phân công hôm nay</h1>
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: 'var(--ink-3)', textAlign: 'left', background: 'var(--paper-2)' }}>
              {['Mã','Tên','Cấp','Phân công tổng','Hôm nay',''].map(h =>
                <th key={h} className="caps" style={{ padding: '9px 12px', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {referees.map(r => (
              <tr key={r.id}>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>{r.id}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}><span className="pill">{r.cert}</span></td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.assigned}</td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.today}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', textAlign: 'right' }}>
                  <button style={btnGhost} onClick={() => setAssignTarget(r)}>Phân công</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── News ─────────────────────────────────────────────────────────────────────

export function NewsView() {
  const { news } = useStore()
  const [addNewsOpen, setAddNewsOpen] = useState(false)

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {addNewsOpen && <AddNewsModal onClose={() => setAddNewsOpen(false)} />}

      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <div>
          <div className="caps">Tin tức & truyền thông</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>Bài viết · thông báo · highlight</h1>
        </div>
        <div style={{ flex: 1 }}/>
        <button style={btnPrimary} onClick={() => setAddNewsOpen(true)}><Icon name="plus" size={13}/>Bài viết mới</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {news.map((n, i) => (
          <div key={n.id || i} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
            <div className="court-placeholder" style={{ height: 120, fontSize: 10 }}>ảnh tin tức 16:9</div>
            <div style={{ padding: 14 }}>
              <span className="pill">{n.tag}</span>
              <h4 style={{ margin: '8px 0 6px', fontSize: 14, lineHeight: 1.35 }}>{n.title}</h4>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{n.ts} · Đã xuất bản</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function SettingsView() {
  const { tournament } = useStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(tournament.name)
  const [venue, setVenue] = useState(tournament.venue)

  const save = () => {
    updateTournamentName(name)
    updateTournamentVenue(venue)
    setEditing(false)
    toast('Đã lưu cấu hình giải.')
  }

  const fields = [
    ['Tên giải',       editing ? null : tournament.name,   'name'],
    ['Mã giải',        tournament.id,                       null],
    ['Địa điểm',       editing ? null : tournament.venue,  'venue'],
    ['Thời gian',      `${tournament.start} → ${tournament.end}`, null],
    ['Thể thức',       tournament.format,                   null],
    ['Hạng mục',       tournament.categories.join(' · '),   null],
    ['Lệ phí đăng ký', '500.000 ₫ / hạng mục',             null],
    ['Điểm xếp hạng QG','Công thức VBF-2024',              null],
    ['Vòng tránh đối đầu','cùng CLB ≥ Vòng 1/16',         null],
    ['Ngôn ngữ hệ thống','Tiếng Việt / English',           null],
    ['Bảo mật dữ liệu cá nhân','Tuân thủ Nghị định 13/2023/NĐ-CP', null],
  ] as Array<[string, string | null, string | null]>

  return (
    <div style={{ padding: 18, maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 14 }}>
        <div>
          <div className="caps">Cấu hình giải</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>{tournament.name}</h1>
        </div>
        <div style={{ flex: 1 }}/>
        {editing
          ? <><button style={btnGhost} onClick={() => setEditing(false)}>Huỷ</button><button style={btnPrimary} onClick={save}><Icon name="check" size={13}/>Lưu</button></>
          : <button style={btnGhost} onClick={() => setEditing(true)}><Icon name="cog" size={13}/>Chỉnh sửa</button>
        }
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 20, display: 'grid', gap: 14 }}>
        {fields.map(([l, v, field]) => (
          <div key={l} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, fontSize: 13, borderBottom: '1px solid var(--line-2)', paddingBottom: 12 }}>
            <div className="caps" style={{ fontSize: 10.5, paddingTop: 2 }}>{l}</div>
            {editing && field === 'name'
              ? <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              : editing && field === 'venue'
              ? <input value={venue} onChange={e => setVenue(e.target.value)} style={inputStyle} />
              : <div>{v ?? (field === 'name' ? tournament.name : field === 'venue' ? tournament.venue : '—')}</div>
            }
          </div>
        ))}
      </div>
    </div>
  )
}
