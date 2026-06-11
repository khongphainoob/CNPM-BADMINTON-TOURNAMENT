import { useState, useMemo } from 'react'
import RegistrationHubView from '../../features/registration/RegistrationHubView'
import ArticleEditor from '../../features/cms/ArticleEditor'
import LegalReportModal from '../../features/reports/LegalReportModal'
import MatchAuditLogView from '../../features/tournament/MatchAuditLogView'
import LeaderboardView from '../../features/tournament/LeaderboardView'
import Icon from '../shared/Icon'
import Modal from '../shared/Modal'
import { useToast } from '../shared/Toast'
import { btnGhost, btnPrimary, money } from '../shared/tokens'
import { useBtcNav } from './BtcApp'
import { CATEGORIES } from '../../data/constants'
export { CourtsView } from '../../features/tournament/CourtsView'
export { BracketView } from '../../features/tournament/BracketView'
export { ScheduleView } from '../../features/tournament/ScheduleView'
export { SettingsView } from '../../features/tournament/SettingsView'
export { FinanceView } from '../../features/finance/FinanceView'
import {
  useStore,
  addMatch, addStock, addNewInventoryItem, issueShuttles,
  assignReferee, addNewsItem,
  approveAthleteProfile, rejectAthleteProfile,
  updateTournamentName, updateTournamentVenue,
  type InventoryItem, type Referee,
} from '../../data/store'
import { tournamentApi } from '../../data/api'
import type { LiveMatch, Athlete } from '../../data/constants'

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
  const [role, setRole] = useState('main')

  const submit = () => {
    if (!matchId) { toast('Chọn trận đấu.', 'error'); return }
    if (referee.assigned >= 4) {
      if (!confirm('Cảnh báo: Trọng tài này đã phân công 4 trận. Bạn có chắc chắn muốn tiếp tục?')) return
    }
    assignReferee(referee.id, Number(matchId)) // Assume API accepts role in future
    toast(`Đã phân công ${referee.name} làm ${role === 'main' ? 'Trọng tài chính' : role === 'line' ? 'Trọng tài biên' : 'Trọng tài giao bóng'} cho trận #${matchId}`)
    onClose()
  }

  const isOverloaded = referee.assigned >= 4

  return (
    <Modal title={`Phân công: ${referee.name}`} onClose={onClose}
      footer={<>
        <button style={btnGhost} onClick={onClose}>Huỷ</button>
        <button style={btnPrimary} onClick={submit}><Icon name="check" size={13}/>Phân công</button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '10px 12px', background: isOverloaded ? 'var(--amber-soft)' : 'var(--paper-2)', borderRadius: 6, fontSize: 13, border: isOverloaded ? '1px solid var(--amber)' : 'none' }}>
          <div style={{ fontWeight: 600 }}>{referee.name}</div>
          <div style={{ fontSize: 11.5, color: isOverloaded ? 'var(--amber)' : 'var(--ink-3)', marginTop: 2 }}>
            {referee.cert} · Đã phân công: <strong style={{ color: isOverloaded ? 'var(--accent)' : 'inherit'}}>{referee.assigned} trận</strong>
          </div>
          {isOverloaded && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4, fontWeight: 600 }}>⚠️ Vượt quá số trận khuyến nghị/ngày.</div>}
        </div>
        <FieldRow label="Trận đấu *">
          <select value={matchId} onChange={e => setMatchId(Number(e.target.value))} style={inputStyle}>
            {allMatches.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Vai trò điều hành *">
          <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
            <option value="main">Trọng tài chính (Main Umpire)</option>
            <option value="service">Trọng tài giao bóng (Service Judge)</option>
            <option value="line">Trọng tài biên (Line Judge)</option>
          </select>
        </FieldRow>
      </div>
    </Modal>
  )
}

function AddNewsModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ title: '', tag: 'Thông báo', ts: new Date().toLocaleDateString('vi-VN') })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.title.trim()) { toast('Tiêu đề không được để trống.', 'error'); return }
    setLoading(true)
    try {
      await addNewsItem(form)
      toast(`Đã đăng bài: "${form.title}"`)
      onClose()
    } catch(e) {
      toast('Có lỗi xảy ra, vui lòng thử lại.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Bài viết mới" onClose={onClose}
      footer={<>
        <button style={btnGhost} onClick={onClose} disabled={loading}>Huỷ</button>
        <button style={{...btnPrimary, opacity: loading ? 0.7 : 1}} onClick={submit} disabled={loading}>
          <Icon name="check" size={13}/>{loading ? 'Đang xử lý...' : 'Đăng bài'}
        </button>
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
          {tournament.status === 'draft' && (
            <button style={{ ...btnPrimary, background: 'var(--accent)' }} onClick={async () => {
              if (!confirm('Bạn có chắc chắn muốn BẮT ĐẦU giải đấu? Thao tác này sẽ chuyển giải sang trạng thái LIVE.')) return;
              try {
                await tournamentApi.changeStatus(tournament.id, 'live');
                toast('Đã bắt đầu giải đấu!');
                // Cần reload trang hoặc cập nhật store (giả lập bằng reload)
                window.location.reload();
              } catch (e) { toast('Lỗi khi đổi trạng thái', 'error'); }
            }}><Icon name="play" size={13}/> Bắt đầu Giải</button>
          )}
          {tournament.status === 'live' && (
            <button style={{ ...btnPrimary, background: 'oklch(0.42 0.14 160)' }} onClick={async () => {
              if (!confirm('Bạn có chắc chắn muốn KẾT THÚC giải đấu? Thao tác này sẽ khoá giải.')) return;
              try {
                await tournamentApi.changeStatus(tournament.id, 'finished');
                toast('Đã kết thúc giải đấu!');
                window.location.reload();
              } catch (e) { toast('Lỗi khi đổi trạng thái', 'error'); }
            }}><Icon name="check-circle" size={13}/> Kết thúc Giải</button>
          )}
          <button style={btnGhost} onClick={() => setAddMatchOpen(true)}><Icon name="plus" size={13}/> Thêm trận phụ</button>
          <button style={btnPrimary} onClick={() => toast('Đang xuất báo cáo ngày...', 'info')}><Icon name="dl" size={13}/> Xuất báo cáo</button>
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
        <StatCard label="Trận đã hoàn tất" value={`${tournament.matches.done}/${tournament.matches.total}`} sub={`${Math.round(tournament.matches.done / (tournament.matches.total || 1) * 100)}% tiến độ giải`}>
          <div style={{ height: 4, background: 'var(--line-2)', borderRadius: 2, marginTop: 4 }}>
            <div style={{ width: `${Math.round(tournament.matches.done / (tournament.matches.total || 1) * 100)}%`, height: '100%', background: 'var(--court)', borderRadius: 2 }}/>
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

// ── Schedule (Moved to features/tournament/ScheduleView.tsx) ────────────────

// ── Bracket (Moved to features/tournament/BracketView.tsx) ──────────────────

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

export function AthletesView() { return <RegistrationHubView />; }
function _AthletesView() {
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

// ── Courts (Moved to features/tournament/CourtsView.tsx) ────────────────────

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

// ── Finance (Moved to features/finance/FinanceView.tsx) ──────────────────────

// ── Reports ──────────────────────────────────────────────────────────────────

export function ReportsView() {
  const [showBM25, setShowBM25] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      {showBM25 && <LegalReportModal onClose={() => setShowBM25(false)} onSave={(d) => { console.log(d); setShowBM25(false); }} />}
      <div style={{ padding: '16px 32px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowBM25(true)} style={{ background: 'var(--ink)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>+ Xuất báo cáo pháp lý (BM25)</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}><MatchAuditLogView /></div>
    </div>
  )
}
function _ReportsView() {
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
      {addNewsOpen && <ArticleEditor onClose={() => setAddNewsOpen(false)} onSave={(data) => {
        addNewsItem({ title: data.title, ts: new Date().toLocaleDateString('vi-VN'), tag: data.tags?.[0] || 'Tin tức' })
        setAddNewsOpen(false)
      }} />}

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

// ── Settings (Moved to features/tournament/SettingsView.tsx) ─────────────────
