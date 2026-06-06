import { useState, useEffect } from 'react'
import type { Session } from '../../data/auth'
import { initBtcData, useStore } from '../../data/store'
import TournamentHub from '../../features/tournament/TournamentHub'
import Icon from '../shared/Icon'
import {
  DashboardView, ScheduleView, BracketView, AthletesView,
  CourtsView, InventoryView, FinanceView, ReportsView,
  RefereesView, NewsView, SettingsView,
} from '../btc/BtcViews'
import UsersView from '../../features/admin/UsersView'
import SystemConfigView from '../../features/admin/SystemConfigView'

type AdminNavId = 'verify' | 'users' | 'tournaments' | 'config'
type BtcNavId = 'dashboard' | 'schedule' | 'bracket' | 'athletes' | 'courts' | 'inventory' | 'referees' | 'finance' | 'news' | 'reports' | 'settings'

const ADMIN_NAV: { id: AdminNavId; label: string; icon: string }[] = [
  { id: 'verify',      label: 'Xác thực người dùng', icon: 'user-check' },
  { id: 'users',       label: 'Quản lý tài khoản',   icon: 'users' },
  { id: 'tournaments', label: 'Quản lý giải đấu',    icon: 'award' },
  { id: 'config',      label: 'Cài đặt hệ thống',    icon: 'settings' },
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
  const [adminView, setAdminView] = useState<AdminNavId>(() => {
    try { return (localStorage.getItem('bad.admin.view') as AdminNavId) || 'users' } catch { return 'users' }
  })
  const [btcView, setBtcView] = useState<BtcNavId>('dashboard')
  const [open, setOpen] = useState(true)

  const handleSetAdminView = (id: AdminNavId) => {
    setAdminView(id)
    try { localStorage.setItem('bad.admin.view', id) } catch {}
  }

  const activeTournamentId = useStore(state => state.activeTournamentId)

  useEffect(() => {
    if (!activeTournamentId) return
    initBtcData()
  }, [activeTournamentId])

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
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>
            Hệ thống
          </div>
        )}
        {ADMIN_NAV.map(item => {
          const active = adminView === item.id
          return (
            <button key={item.id} onClick={() => handleSetAdminView(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: open ? '8px 12px' : '10px',
              borderRadius: 6, border: 'none', background: active ? 'var(--paper-2)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-2)',
              fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer',
              justifyContent: open ? 'flex-start' : 'center',
            }} title={!open ? item.label : undefined}>
              <Icon name={item.icon} size={16} stroke={active ? 2.5 : 2} />
              {open && <span>{item.label}</span>}
            </button>
          )
        })}

        {adminView === 'tournaments' && activeTournamentId && (
          <>
            {open && (
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 16 }}>
                Quản lý Giải (BTC)
              </div>
            )}
            {BTC_NAV.map(item => {
              const active = btcView === item.id
              return (
                <button key={item.id} onClick={() => setBtcView(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: open ? '8px 12px' : '10px',
                  borderRadius: 6, border: 'none', background: active ? 'var(--paper-2)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer',
                  justifyContent: open ? 'flex-start' : 'center',
                }} title={!open ? item.label : undefined}>
                  <Icon name={item.icon} size={16} stroke={active ? 2.5 : 2} />
                  {open && <span>{item.label}</span>}
                </button>
              )
            })}
          </>
        )}
      </nav>

      {/* ── Main ── */}
      <main style={{ gridArea: 'main', background: 'var(--paper-2)', overflowY: 'auto' }}>
        {adminView === 'verify' && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            Tính năng Xác thực người dùng đang được phát triển...
          </div>
        )}
        {adminView === 'users' && <UsersView />}
        {adminView === 'config' && <SystemConfigView />}
        {adminView === 'tournaments' && (
          !activeTournamentId ? (
            <TournamentHub />
          ) : (
            (() => {
              const BtcComp = BTC_VIEW_MAP[btcView]
              return <BtcComp />
            })()
          )
        )}
      </main>
    </div>
  )
}
