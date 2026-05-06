import { useState, useMemo } from 'react'
import type { Session } from '../../data/auth'
import { getUsers, authApprove, authReject, authChangeRole } from '../../data/auth'
import Icon from '../shared/Icon'
import {
  DashboardView, ScheduleView, BracketView, AthletesView,
  CourtsView, InventoryView, FinanceView, ReportsView,
  RefereesView, NewsView, SettingsView,
} from '../btc/BtcViews'

type AdminNavId = 'verify' | 'users'
type BtcNavId = 'dashboard' | 'schedule' | 'bracket' | 'athletes' | 'courts' | 'inventory' | 'referees' | 'finance' | 'news' | 'reports' | 'settings'
type NavId = AdminNavId | BtcNavId

const ADMIN_NAV: { id: AdminNavId; label: string; icon: string }[] = [
  { id: 'verify', label: 'Xác thực người dùng', icon: 'user-check' },
  { id: 'users',  label: 'Quản lý tài khoản',   icon: 'users' },
]

const BTC_NAV: { id: BtcNavId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Tổng quan',    icon: 'layout-dashboard' },
  { id: 'schedule',  label: 'Lịch thi đấu', icon: 'calendar' },
  { id: 'bracket',   label: 'Bảng đấu',     icon: 'git-branch' },
  { id: 'athletes',  label: 'Vận động viên', icon: 'users' },
  { id: 'courts',    label: 'Sân đấu',       icon: 'map-pin' },
  { id: 'inventory', label: 'Kho vật tư',    icon: 'package' },
  { id: 'referees',  label: 'Trọng tài',     icon: 'clipboard' },
  { id: 'finance',   label: 'Tài chính',     icon: 'dollar-sign' },
  { id: 'news',      label: 'Tin tức',       icon: 'newspaper' },
  { id: 'reports',   label: 'Báo cáo',       icon: 'bar-chart-2' },
  { id: 'settings',  label: 'Cài đặt',       icon: 'settings' },
]

type Props = { session: Session; onLogout: () => void }

export default function AdminView({ session, onLogout }: Props) {
  const [view, setView] = useState<NavId>(() => {
    try { return (localStorage.getItem('bad.admin.view') as NavId) || 'verify' } catch { return 'verify' }
  })
  const [open, setOpen] = useState(true)

  const handleSetView = (id: NavId) => {
    setView(id)
    try { localStorage.setItem('bad.admin.view', id) } catch {}
  }

  const BTC_VIEW_MAP: Record<BtcNavId, React.FC> = {
    dashboard: DashboardView, schedule: ScheduleView, bracket: BracketView,
    athletes: AthletesView, courts: CourtsView, inventory: InventoryView,
    referees: RefereesView, finance: FinanceView, news: NewsView,
    reports: ReportsView, settings: SettingsView,
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateAreas: '"top top" "side main"',
      gridTemplateRows: '56px 1fr',
      gridTemplateColumns: open ? '232px 1fr' : '64px 1fr',
      height: '100vh',
      transition: 'grid-template-columns 180ms ease',
    }}>
      {/* ── Top bar ── */}
      <header style={{
        gridArea: 'top', background: 'var(--ink)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px 0 12px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setOpen(o => !o)} style={{
            background: 'transparent', border: 'none', color: 'white',
            cursor: 'pointer', padding: 6, borderRadius: 4, display: 'flex',
          }}>
            <Icon name="menu" size={18} />
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Shuttle<span style={{ color: 'var(--accent)' }}>·</span>Ops
          </span>
          <span className="pill" style={{ background: 'oklch(0.62 0.12 25)', color: 'white', border: 'none', fontSize: 10 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>{session.name}</span>
          <button onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 6,
            background: 'transparent', border: '1px solid oklch(0.4 0.01 250)',
            color: 'oklch(0.75 0.01 250)', fontSize: 12, cursor: 'pointer',
          }}>
            <Icon name="log-out" size={13} /> Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Sidebar ── */}
      <nav style={{
        gridArea: 'side', background: 'var(--paper)', borderRight: '1px solid var(--line)',
        padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto',
      }}>
        {open && (
          <div style={{ padding: '4px 10px 8px', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>
            Admin
          </div>
        )}
        {ADMIN_NAV.map(item => (
          <NavBtn key={item.id} item={item} active={view === item.id} open={open} onClick={() => handleSetView(item.id)} />
        ))}

        <div style={{ height: 1, background: 'var(--line)', margin: '8px 0' }} />

        {open && (
          <div style={{ padding: '4px 10px 8px', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>
            Ban tổ chức
          </div>
        )}
        {BTC_NAV.map(item => (
          <NavBtn key={item.id} item={item} active={view === item.id} open={open} onClick={() => handleSetView(item.id)} />
        ))}
      </nav>

      {/* ── Main ── */}
      <main style={{ gridArea: 'main', overflowY: 'auto', background: 'var(--paper-2)' }}>
        {view === 'verify'    && <VerifyView />}
        {view === 'users'     && <UsersView />}
        {view in BTC_VIEW_MAP && (() => { const V = BTC_VIEW_MAP[view as BtcNavId]; return <V /> })()}
      </main>
    </div>
  )
}

function NavBtn({ item, active, open, onClick }: { item: { id: string; label: string; icon: string }; active: boolean; open: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: open ? '9px 16px' : '9px 0', justifyContent: open ? 'flex-start' : 'center',
      background: active ? 'oklch(0.93 0.01 250)' : 'transparent',
      border: 'none', borderRadius: 6, cursor: 'pointer',
      color: active ? 'var(--ink)' : 'var(--ink-2)',
      fontSize: 13.5, fontWeight: active ? 600 : 400,
    }}>
      <Icon name={item.icon} size={16} />
      {open && <span>{item.label}</span>}
    </button>
  )
}

// ─── Verify view ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:  { label: 'Chờ duyệt', bg: 'oklch(0.95 0.06 70)',  color: 'oklch(0.48 0.14 70)' },
    approved: { label: 'Đã duyệt',  bg: 'oklch(0.93 0.06 160)', color: 'oklch(0.42 0.14 160)' },
    rejected: { label: 'Từ chối',   bg: 'oklch(0.96 0.04 25)',  color: 'oklch(0.50 0.16 25)' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null
  const labels: Record<string, string> = { admin: 'Admin', btc: 'BTC', referee: 'Trọng tài', athlete: 'VĐV' }
  return (
    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-2)', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '1px 6px' }}>
      {labels[role] ?? role}
    </span>
  )
}

function VerifyView() {
  const [users, setUsers] = useState(() => getUsers())
  const [confirm, setConfirm] = useState<{ userId: string; action: 'approve' | 'reject' } | null>(null)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [assignRole, setAssignRole] = useState<Record<string, string>>({})

  const pending = users.filter(u => u.status === 'pending')
  const refresh = () => setUsers(getUsers())

  const prime = (userId: string, action: 'approve' | 'reject') => {
    if (timer) clearTimeout(timer)
    setConfirm({ userId, action })
    const t = setTimeout(() => setConfirm(null), 3000)
    setTimer(t)
  }

  const execute = () => {
    if (!confirm) return
    const { userId, action } = confirm
    if (action === 'approve') {
      const role = assignRole[userId] || users.find(u => u.id === userId)?.requestedRole || 'athlete'
      authApprove(userId, role)
    } else {
      authReject(userId)
    }
    setConfirm(null)
    refresh()
  }

  const ROLE_OPTS = [
    { value: 'btc',     label: 'Ban tổ chức' },
    { value: 'referee', label: 'Trọng tài' },
    { value: 'athlete', label: 'VĐV / HLV' },
  ]

  if (pending.length === 0) return (
    <div style={{ padding: 40, color: 'var(--ink-2)', fontSize: 14 }}>
      Không có tài khoản nào đang chờ duyệt.
    </div>
  )

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
          Xác thực người dùng
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
          {pending.length} tài khoản đang chờ phê duyệt
        </div>
      </div>

      {confirm && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 7,
          background: confirm.action === 'approve' ? 'oklch(0.93 0.06 160)' : 'oklch(0.96 0.04 25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {confirm.action === 'approve' ? 'Xác nhận phê duyệt?' : 'Xác nhận từ chối?'} Nhấn lại để thực hiện.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={execute} style={{
              padding: '6px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
              background: confirm.action === 'approve' ? 'oklch(0.42 0.14 160)' : 'var(--accent)',
              color: 'white', fontSize: 12.5, fontWeight: 600,
            }}>
              {confirm.action === 'approve' ? 'Duyệt' : 'Từ chối'}
            </button>
            <button onClick={() => setConfirm(null)} style={{ padding: '6px 14px', borderRadius: 5, border: '1px solid var(--line)', background: 'var(--paper)', cursor: 'pointer', fontSize: 12.5 }}>
              Huỷ
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pending.map(u => {
          const isActive = confirm?.userId === u.id
          return (
            <div key={u.id} style={{
              padding: '16px 20px', borderRadius: 8,
              border: '1px solid var(--line)', background: 'var(--paper)',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: isActive ? '0 0 0 2px var(--ink)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 6,
                background: 'oklch(0.88 0.03 250)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)',
              }}>
                {u.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
                  {u.email}{u.phone ? ` · ${u.phone}` : ''}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Đăng ký: {u.createdAt}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>Vai trò:</span>
                <select
                  value={assignRole[u.id] ?? (u.requestedRole || 'athlete')}
                  onChange={e => setAssignRole(p => ({ ...p, [u.id]: e.target.value }))}
                  style={{ padding: '5px 8px', borderRadius: 5, border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)', fontSize: 12.5 }}
                >
                  {ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => prime(u.id, 'approve')} style={{
                  padding: '7px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: isActive && confirm?.action === 'approve' ? 'oklch(0.42 0.14 160)' : 'oklch(0.93 0.06 160)',
                  color: isActive && confirm?.action === 'approve' ? 'white' : 'oklch(0.42 0.14 160)',
                  fontSize: 12.5, fontWeight: 600, transition: 'all 0.15s',
                }}>
                  Duyệt
                </button>
                <button onClick={() => prime(u.id, 'reject')} style={{
                  padding: '7px 14px', borderRadius: 5,
                  border: '1px solid var(--line)', cursor: 'pointer',
                  background: isActive && confirm?.action === 'reject' ? 'var(--accent)' : 'var(--paper)',
                  color: isActive && confirm?.action === 'reject' ? 'white' : 'var(--ink-2)',
                  fontSize: 12.5, fontWeight: 500, transition: 'all 0.15s',
                }}>
                  Từ chối
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Users view ──────────────────────────────────────────────────────────────

function UsersView() {
  const [users, setUsers] = useState(() => getUsers())
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ userId: string; role: string } | null>(null)

  const refresh = () => setUsers(getUsers())

  const ROLE_OPTS = [
    { value: 'admin',   label: 'Admin' },
    { value: 'btc',     label: 'BTC' },
    { value: 'referee', label: 'Trọng tài' },
    { value: 'athlete', label: 'VĐV' },
  ]

  const filtered = useMemo(() => {
    let list = users
    if (filter !== 'all') list = list.filter(u => u.status === filter || u.role === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    return list
  }, [users, filter, search])

  const saveRole = (userId: string, newRole: string) => {
    authChangeRole(userId, newRole)
    setEditing(null)
    refresh()
  }

  const FILTERS = [
    { id: 'all',      label: 'Tất cả' },
    { id: 'approved', label: 'Đã duyệt' },
    { id: 'pending',  label: 'Chờ duyệt' },
    { id: 'rejected', label: 'Từ chối' },
  ]

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
          Quản lý tài khoản
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{users.length} tài khoản</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email…"
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)', fontSize: 13.5, width: 260 }} />
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--paper-2)', borderRadius: 7 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
              background: filter === f.id ? 'var(--ink)' : 'transparent',
              color: filter === f.id ? 'white' : 'var(--ink-2)',
              fontSize: 12, fontWeight: 500,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
              {['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày đăng ký', ''].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, idx) => {
              const isEditing = editing?.userId === u.id
              return (
                <tr key={u.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--line-2)' : 'none', background: isEditing ? 'var(--paper-2)' : 'transparent' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13.5, fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select
                          defaultValue={u.role || ''}
                          id={`role-${u.id}`}
                          onChange={e => setEditing({ userId: u.id, role: e.target.value })}
                          style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 12.5 }}>
                          {ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <button onClick={() => saveRole(u.id, editing?.role || u.role || 'athlete')}
                          style={{ padding: '4px 10px', borderRadius: 5, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 12, cursor: 'pointer' }}>
                          Lưu
                        </button>
                        <button onClick={() => setEditing(null)}
                          style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid var(--line)', background: 'transparent', fontSize: 12, cursor: 'pointer' }}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <RoleBadge role={u.role} />
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={u.status} /></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{u.createdAt}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {u.role !== 'admin' && u.status === 'approved' && (
                      <button
                        onClick={() => setEditing({ userId: u.id, role: u.role || 'athlete' })}
                        style={{ padding: '5px 10px', borderRadius: 5, border: '1px solid var(--line)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>
                        Đổi vai trò
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>
            Không tìm thấy tài khoản nào.
          </div>
        )}
      </div>
    </div>
  )
}
