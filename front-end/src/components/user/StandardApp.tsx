import { useState, useEffect } from 'react'
import Icon from '../shared/Icon'
import { ShuttleMark } from '../referee/shared'
import LiveMatchesView from './LiveMatchesView'
import TournamentExplorer from './TournamentExplorer'
import UserProfileView from './UserProfileView'
import MyScheduleView from './MyScheduleView'
import type { Session } from '../../data/auth'
import { initBtcData } from '../../data/store'

export type StandardNavId = 'live' | 'tournaments' | 'schedule' | 'profile' | 'news'

const NAV_ITEMS: { id: StandardNavId; label: string; icon: string }[] = [
  { id: 'live',        label: 'Trực tiếp',     icon: 'activity' },
  { id: 'tournaments', label: 'Giải đấu',      icon: 'award' },
  { id: 'schedule',    label: 'Lịch trình',    icon: 'calendar' },
  { id: 'profile',     label: 'Hồ sơ',         icon: 'user' },
  { id: 'news',        label: 'Tin tức',       icon: 'newspaper' },
]

type Props = { session: Session; onLogout: () => void }

export default function StandardApp({ session, onLogout }: Props) {
  const [active, setActive] = useState<StandardNavId>('tournaments')
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Fetch some initial data if needed globally
  useEffect(() => {
    initBtcData()
    const interval = setInterval(() => initBtcData(), 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--paper-2)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: isSidebarCollapsed ? 64 : 240,
        background: 'var(--paper)', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', transition: 'width 0.2s',
        flexShrink: 0,
      }}>
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: isSidebarCollapsed ? '0 16px' : '0 24px',
          borderBottom: '1px solid var(--line)', cursor: 'pointer',
        }} onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
            <ShuttleMark size={24} />
            {!isSidebarCollapsed && (
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', color: 'var(--ink)' }}>
                Shuttle<span style={{ color: 'var(--accent)' }}>·</span>Ops
              </span>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: isSidebarCollapsed ? '12px' : '10px 14px',
                  background: isActive ? 'var(--paper-3)' : 'transparent',
                  color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  transition: 'background 0.15s',
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                }}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon name={item.icon} size={18} stroke={isActive ? 2.5 : 2} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--paper-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="user" size={16} />
            </div>
            {!isSidebarCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {session.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'capitalize' }}>
                  {session.role}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: 8,
              background: 'transparent', border: '1px solid var(--line)', borderRadius: 6,
              color: 'var(--ink-2)', fontSize: 13, cursor: 'pointer'
            }}
            title={isSidebarCollapsed ? "Đăng xuất" : undefined}
          >
            <Icon name="log-out" size={14} />
            {!isSidebarCollapsed && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto' }} className="scrollbar">
        {active === 'live' && <LiveMatchesView />}
        {active === 'tournaments' && <TournamentExplorer />}
        {active === 'profile' && <UserProfileView />}
        {active === 'schedule' && <MyScheduleView />}
        {active === 'news' && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            Tính năng Tin tức đang được phát triển...
          </div>
        )}
      </main>
    </div>
  )
}
