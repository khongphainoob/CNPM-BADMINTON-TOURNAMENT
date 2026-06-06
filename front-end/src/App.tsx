import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom'
import { useAuth } from './data/auth'
import { useStore, initBtcData, setActiveTournament } from './data/store'
import AuthScreen from './components/auth/AuthScreen'
import AppShell from './components/shared/AppShell'
import type { NavItem } from './components/shared/AppShell'

// --- View Components ---
// Admin Views
import UsersView from './features/admin/UsersView'
import SystemConfigView from './features/admin/SystemConfigView'
// BTC Views
import TournamentHub from './features/tournament/TournamentHub'
import {
  DashboardView, ScheduleView, BracketView, AthletesView,
  CourtsView, InventoryView, FinanceView, ReportsView,
  RefereesView, NewsView, SettingsView,
} from './components/btc/BtcViews'
// Referee Views
import RefereeApp from './components/referee/RefereeApp'
// Standard Views
import LiveMatchesView from './components/user/LiveMatchesView'
import TournamentExplorer from './components/user/TournamentExplorer'
import UserProfileView from './components/user/UserProfileView'
import MyScheduleView from './components/user/MyScheduleView'
// Athlete Views
import { AthleteOverview, AthleteRegistration, AthleteProfile, AthleteRanking, useAthleteProfile } from './components/athlete/AthleteViews'
import TeamDashboardView from './features/registration/TeamDashboardView'

// Admin Views
import SystemOverviewView from './features/admin/SystemOverviewView'
import NotificationView from './features/notification/NotificationView'

// Shared Views
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import NotFound from './components/shared/NotFound'

// --- Nav Configurations (Unified RBAC) ---
const GLOBAL_NAV: NavItem[] = [
  // --- Admin ---
  { id: '/users', label: 'Quản lý tài khoản', icon: 'users', category: 'Hệ thống', roles: ['admin'] },
  { id: '/config', label: 'Cài đặt hệ thống', icon: 'settings', category: 'Hệ thống', roles: ['admin'] },

  // --- Chung (Outside Tournament) ---
  { id: '/overview', label: 'Tổng quan chung', icon: 'layout-dashboard', category: 'Cá nhân' },
  { id: '/team', label: 'Quản lý Đội/Đoàn', icon: 'users', category: 'Cá nhân', roles: ['coach'] },
  { id: '/tournaments', label: 'Giải đấu', icon: 'award', category: 'Nghiệp vụ' },
  { id: '/register', label: 'Đăng ký thi đấu', icon: 'edit', category: 'Nghiệp vụ', roles: ['athlete'] },
  { id: '/live', label: 'Trực tiếp', icon: 'activity', category: 'Khám phá' },
  { id: '/ranking', label: 'Bảng xếp hạng', icon: 'bar-chart-2', category: 'Khám phá' },

  // --- Profile / Personal ---
  { id: '/notifications', label: 'Thông báo', icon: 'bell', category: 'Cá nhân' },
  { id: '/my-schedule', label: 'Lịch thi đấu', icon: 'calendar', category: 'Cá nhân', roles: ['athlete', 'spectator'] },
  { id: '/profile', label: 'Hồ sơ', icon: 'user', category: 'Cá nhân' },

  // --- Trong Giải đấu (Tournament specific) ---
  { id: '/dashboard', label: 'Dashboard Giải', icon: 'pie-chart', category: 'Quản lý Giải đấu', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/schedule', label: 'Lịch thi đấu', icon: 'calendar', category: 'Quản lý Giải đấu', roles: ['admin', 'btc', 'referee'], requireTournament: true },
  { id: '/bracket', label: 'Bảng đấu', icon: 'git-branch', category: 'Quản lý Giải đấu', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/athletes', label: 'Vận động viên', icon: 'users', category: 'Nhân sự', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/referees', label: 'Trọng tài', icon: 'clipboard', category: 'Nhân sự', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/courts', label: 'Sân đấu', icon: 'map-pin', category: 'Nguồn lực', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/inventory', label: 'Kho vật tư', icon: 'package', category: 'Nguồn lực', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/finance', label: 'Tài chính', icon: 'dollar-sign', category: 'Nguồn lực', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/reports', label: 'Thống kê & Báo cáo', icon: 'bar-chart-2', category: 'Cài đặt & Báo cáo', roles: ['admin', 'btc'], requireTournament: true },
  { id: '/settings', label: 'Cài đặt giải', icon: 'settings', category: 'Cài đặt & Báo cáo', roles: ['admin', 'btc'], requireTournament: true },
]

const getDefaultPath = (role: string) => {
  return '/overview' // All roles default to general overview
}

function ProtectedRoute({ allowed, children }: { allowed?: string[], children: React.ReactNode }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/" replace />
  if (allowed && !allowed.includes(session.role)) return <Navigate to={getDefaultPath(session.role)} replace />
  return <>{children}</>
}

// Wrapper to inject `me` hook for Athlete routes
function AthleteViewWrapper({ view, session }: { view: string, session: any }) {
  const { me, loading } = useAthleteProfile(session.userId, session.role)
  
  if (loading) return <div style={{ padding: 40, color: 'var(--ink-2)' }}>Đang tải hồ sơ...</div>
  
  let content = null
  switch (view) {
    case 'overview': content = <AthleteOverview me={me} />; break;
    case 'register': content = <AthleteRegistration me={me} />; break;
    case 'team': content = <TeamDashboardView me={me} />; break;
    case 'profile': content = <AthleteProfile me={me} />; break;
    case 'ranking': content = <AthleteRanking me={me} />; break;
    case 'matches': content = <div style={{ padding: 24, fontSize: 14, color: 'var(--ink-2)' }}>Xem tab Tổng quan để quản lý trận của bạn.</div>; break;
    default: content = <div>Giao diện chưa khả dụng</div>; break;
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1080, margin: '0 auto' }}>
      {content}
    </div>
  )
}

function TournamentRouteWrapper() {
  const { id } = useParams()
  const activeTournamentId = useStore(state => state.activeTournamentId)

  useEffect(() => {
    if (id && parseInt(id, 10) !== activeTournamentId) {
      setActiveTournament(parseInt(id, 10))
    }
  }, [id, activeTournamentId])

  if (!activeTournamentId || (id && parseInt(id, 10) !== activeTournamentId)) {
    return <div style={{ padding: 40, color: 'var(--ink-2)' }}>Đang tải thông tin giải đấu...</div>
  }

  return <Outlet />
}

export default function App() {
  const { session, login, logout, register } = useAuth()
  const activeTournamentId = useStore(state => state.activeTournamentId)

  const location = useLocation()
  const navigate = useNavigate()

  // Auto init BTC data if a tournament is selected
  useEffect(() => {
    if (activeTournamentId && session && ['btc', 'referee', 'admin'].includes(session.role)) {
      initBtcData()
      const intervalId = setInterval(() => initBtcData(), 15000)
      return () => clearInterval(intervalId)
    }
  }, [activeTournamentId, session])

  if (!session) {
    return <AuthScreen onLogin={login} onRegister={register} />
  }

  // --- Unified Layout Selection Logic ---
  let items: NavItem[] = GLOBAL_NAV.filter(item => {
    if (item.roles && !item.roles.includes(session.role)) return false
    if (item.requireTournament && !activeTournamentId) return false
    return true
  })

  // Inject dynamic badges
  const liveCount = useStore.getState().liveMatches?.length || 0
  const pendingAthletes = useStore.getState().athletes?.filter(a => (a as any).status === 'pending').length || 0
  const lowStockCount = useStore.getState().inventory?.filter(i => i.status === 'warn' || i.status === 'critical').length || 0

  items = items.map(item => {
    let newItem = { ...item }
    if (item.requireTournament && activeTournamentId) {
      newItem.id = `/tournament/${activeTournamentId}${item.id}`
    }
    
    if (newItem.id.endsWith('/dashboard') && liveCount > 0) newItem.badge = liveCount
    if (newItem.id.endsWith('/athletes') && pendingAthletes > 0) newItem.badge = pendingAthletes
    if (newItem.id.endsWith('/inventory') && lowStockCount > 0) newItem.badge = lowStockCount
    return newItem
  })

  let onAction: { label: string; icon: string; onClick: () => void } | undefined
  if (activeTournamentId && ['admin', 'btc', 'referee'].includes(session.role)) {
    onAction = {
      label: 'Đổi giải đấu', icon: 'award', onClick: () => {
        setActiveTournament(null)
        navigate('/tournaments')
      }
    }
  }

  return (
    <ErrorBoundary>
    <AppShell
      session={session}
      items={items}
      activeId={location.pathname}
      onTabChange={(path) => navigate(path)}
      onLogout={logout}
      onAction={onAction}
    >
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultPath(session.role)} replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationView /></ProtectedRoute>} />


        {/* Admin Routes */}
        <Route path="/users" element={<ProtectedRoute allowed={['admin']}><UsersView /></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute allowed={['admin']}><SystemConfigView /></ProtectedRoute>} />

        {/* Shared Tournaments Route (Admin, BTC, Referee, Spectator) */}
        <Route path="/tournaments" element={
          <ProtectedRoute allowed={['admin', 'btc', 'referee', 'spectator']}>
            {session.role === 'spectator' ? <TournamentExplorer /> : <TournamentHub />}
          </ProtectedRoute>
        } />

        {/* Tournament Routes */}
        <Route path="/tournament/:id" element={<TournamentRouteWrapper />}>
          <Route path="dashboard" element={<ProtectedRoute allowed={['admin', 'btc']}><DashboardView /></ProtectedRoute>} />
          <Route path="bracket" element={<ProtectedRoute allowed={['admin', 'btc']}><BracketView /></ProtectedRoute>} />
          <Route path="athletes" element={<ProtectedRoute allowed={['admin', 'btc']}><AthletesView /></ProtectedRoute>} />
          <Route path="courts" element={<ProtectedRoute allowed={['admin', 'btc']}><CourtsView /></ProtectedRoute>} />
          <Route path="inventory" element={<ProtectedRoute allowed={['admin', 'btc']}><InventoryView /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute allowed={['admin', 'btc']}><FinanceView /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute allowed={['admin', 'btc']}><ReportsView /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowed={['admin', 'btc']}><SettingsView /></ProtectedRoute>} />
          <Route path="news" element={<ProtectedRoute allowed={['admin', 'btc']}><NewsView /></ProtectedRoute>} />
          <Route path="referees" element={<ProtectedRoute allowed={['admin', 'btc']}><RefereesView /></ProtectedRoute>} />
          <Route path="schedule" element={
            <ProtectedRoute allowed={['admin', 'btc', 'referee']}>
              {session.role === 'referee' ? <RefereeApp onLogout={logout} /> : <ScheduleView />}
            </ProtectedRoute>
          } />
        </Route>

        {/* Overview Routes */}
        <Route path="/overview" element={
          <ProtectedRoute allowed={['admin', 'btc', 'referee', 'athlete', 'spectator']}>
            {session.role === 'athlete' ? <AthleteViewWrapper view="overview" session={session} /> : <SystemOverviewView />}
          </ProtectedRoute>
        } />
        <Route path="/register" element={<ProtectedRoute allowed={['athlete']}><AthleteViewWrapper view="register" session={session} /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute allowed={['coach', 'admin']}><TeamDashboardView /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute allowed={['admin', 'btc', 'referee', 'athlete', 'spectator']}><AthleteViewWrapper view="ranking" session={session} /></ProtectedRoute>} />

        {/* Shared Athlete, Spectator & BTC Routes */}
        <Route path="/profile" element={
          <ProtectedRoute allowed={['admin', 'btc', 'referee', 'athlete', 'spectator']}>
            {session.role === 'athlete' ? <AthleteViewWrapper view="profile" session={session} /> : <UserProfileView />}
          </ProtectedRoute>
        } />
        <Route path="/my-schedule" element={
          <ProtectedRoute allowed={['athlete', 'spectator']}>
            {session.role === 'athlete' ? <AthleteViewWrapper view="matches" session={session} /> : <MyScheduleView />}
          </ProtectedRoute>
        } />

        {/* Spectator Routes */}
        <Route path="/live" element={<ProtectedRoute allowed={['admin', 'btc', 'referee', 'athlete', 'spectator']}><LiveMatchesView /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
    </ErrorBoundary>
  )
}
