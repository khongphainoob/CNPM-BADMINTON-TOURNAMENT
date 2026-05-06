import { useState, createContext, useContext } from 'react'
import Icon from '../shared/Icon'
import {
  DashboardView, ScheduleView, BracketView, AthletesView,
  CourtsView, InventoryView, FinanceView, ReportsView,
  RefereesView, NewsView, SettingsView,
} from './BtcViews'

export type BtcNavId =
  | 'dashboard' | 'schedule' | 'bracket' | 'athletes'
  | 'courts' | 'inventory' | 'finance' | 'reports'
  | 'referees' | 'news' | 'settings'

export const BtcNavContext = createContext<(id: BtcNavId) => void>(() => {})

type NavId = BtcNavId

type NavItem = { id: NavId; icon: string; label: string; badge?: number }

const NAV: NavItem[] = [
  { id: 'dashboard',  icon: 'dashboard',  label: 'Tổng quan' },
  { id: 'schedule',   icon: 'calendar',   label: 'Lịch thi đấu' },
  { id: 'bracket',    icon: 'bracket',    label: 'Bảng đấu' },
  { id: 'athletes',   icon: 'users',      label: 'Vận động viên', badge: 3 },
  { id: 'courts',     icon: 'court',      label: 'Sân đấu' },
  { id: 'inventory',  icon: 'box',        label: 'Kho cầu' },
  { id: 'finance',    icon: 'wallet',     label: 'Tài chính' },
  { id: 'reports',    icon: 'chart',      label: 'Báo cáo' },
  { id: 'referees',   icon: 'user-check', label: 'Trọng tài' },
  { id: 'news',       icon: 'newspaper',  label: 'Tin tức' },
  { id: 'settings',   icon: 'cog',        label: 'Cấu hình' },
]

const VIEW_MAP: Record<NavId, React.FC> = {
  dashboard: DashboardView,
  schedule:  ScheduleView,
  bracket:   BracketView,
  athletes:  AthletesView,
  courts:    CourtsView,
  inventory: InventoryView,
  finance:   FinanceView,
  reports:   ReportsView,
  referees:  RefereesView,
  news:      NewsView,
  settings:  SettingsView,
}

type Props = { onLogout: () => void }

export function useBtcNav() {
  return useContext(BtcNavContext)
}

export default function BtcApp({ onLogout }: Props) {
  const [active, setActive] = useState<NavId>('dashboard')
  const ActiveView = VIEW_MAP[active]

  return (
    <BtcNavContext.Provider value={setActive}>
    <div style={{
      display: 'flex',
      height: '100dvh',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      background: 'var(--paper-2)',
    }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 200,
        flexShrink: 0,
        background: 'var(--paper)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{
          padding: '16px 14px 12px',
          borderBottom: '1px solid var(--line)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--ink)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}>
              <Icon name="shuttle" size={14} stroke={1.8}/>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                lineHeight: 1,
                color: 'var(--ink)',
              }}>
                Shuttle<span style={{ color: 'var(--accent)' }}>·</span>Ops
              </div>
              <div className="caps" style={{ marginTop: 2, fontSize: 8.5 }}>BTC Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="no-scrollbar">
          {NAV.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: 'calc(100% - 12px)',
                  padding: '9px 14px',
                  border: 0,
                  background: isActive ? 'var(--paper-3)' : 'transparent',
                  color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  borderRadius: 6,
                  margin: '0 6px',
                  transition: 'background 120ms, color 120ms',
                }}
              >
                <Icon name={item.icon} size={15} stroke={isActive ? 2 : 1.6}/>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: 'var(--amber)',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: '1px 6px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--line)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--paper-3)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--line)',
              flexShrink: 0,
            }}>
              <Icon name="user" size={13} stroke={1.6}/>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Phạm Lâm
              </div>
              <div className="caps" style={{ fontSize: 8.5, marginTop: 1 }}>BTC · Ban tổ chức</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', padding: '7px 10px',
              background: 'transparent', border: '1px solid var(--line)',
              borderRadius: 6, color: 'var(--ink-2)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 120ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <Icon name="log-out" size={13}/>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }} className="scrollbar">
        <ActiveView />
      </main>
    </div>
    </BtcNavContext.Provider>
  )
}
