import { useState } from 'react'
import Icon from './Icon'
import { ShuttleMark } from '../referee/shared'
import type { Session } from '../../data/auth'
import NotificationBell from './NotificationBell'

export type NavItem = {
  id: string
  label: string
  icon: string
  category?: string // If we want to group items under a label (like "Hệ thống")
  badge?: number
  roles?: string[]
  requireTournament?: boolean
}

type Props = {
  session: Session
  items: NavItem[]
  activeId: string
  onTabChange: (id: string) => void
  onLogout: () => void
  children: React.ReactNode
  onAction?: { label: string; icon: string; onClick: () => void } // Extra top-right action button (e.g. "Đổi giải đấu")
}

export default function AppShell({ session, items, activeId, onTabChange, onLogout, children, onAction }: Props) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Group items by category
  const categories = items.reduce((acc, item) => {
    const cat = item.category || 'default'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--paper-2)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: isSidebarCollapsed ? 64 : 240,
        background: 'var(--paper)', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease',
        flexShrink: 0,
        zIndex: 10
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

        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }} className="scrollbar">
          {Object.entries(categories).map(([category, catItems], idx) => (
            <div key={category} style={{ marginBottom: 12 }}>
              {category !== 'default' && !isSidebarCollapsed && (
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: idx > 0 ? 8 : 0 }}>
                  {category}
                </div>
              )}
              {category !== 'default' && isSidebarCollapsed && (
                <div style={{ height: 16, borderBottom: '1px solid var(--line-2)', marginBottom: 8, margin: '0 12px' }} />
              )}
              
              {catItems.map(item => {
                const isActive = activeId === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: isSidebarCollapsed ? '12px' : '10px 14px',
                      background: isActive ? 'var(--paper-3)' : 'transparent',
                      color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      fontSize: 14, fontWeight: isActive ? 600 : 500,
                      transition: 'background 0.15s',
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                      width: '100%',
                      marginBottom: 2
                    }}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon name={item.icon} size={18} stroke={isActive ? 2.5 : 2} />
                    {!isSidebarCollapsed && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span style={{
                            background: isActive ? 'var(--ink)' : 'var(--paper-3)',
                            color: isActive ? 'white' : 'var(--ink-2)',
                            padding: '2px 6px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                            minWidth: 16, textAlign: 'center'
                          }}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
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
              color: 'var(--ink-2)', fontSize: 13, cursor: 'pointer', transition: 'background 0.15s'
            }}
            title={isSidebarCollapsed ? "Đăng xuất" : undefined}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="log-out" size={14} />
            {!isSidebarCollapsed && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar for Actions and Notifications */}
        <header style={{ 
          height: 64, background: 'var(--paper)', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {onAction && (
              <button onClick={onAction.onClick} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 6,
                background: 'transparent', border: '1px solid oklch(0.8 0.05 250)',
                color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon name={onAction.icon || 'plus'} size={14} />
                {onAction.label}
              </button>
            )}
            <NotificationBell />
          </div>
        </header>
        
        {/* Scrollable View Area */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar">
          {children}
        </div>
      </main>
    </div>
  )
}
