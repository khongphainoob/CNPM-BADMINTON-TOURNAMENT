import { useAuth } from './data/auth'
import AuthScreen from './components/auth/AuthScreen'
import SpectatorView from './components/spectator/SpectatorView'
import RefereeApp from './components/referee/RefereeApp'
import BtcApp from './components/btc/BtcApp'
import AthleteView from './components/athlete/AthleteView'
import AdminView from './components/admin/AdminView'

export default function App() {
  const { session, login, logout, register } = useAuth()

  if (!session) {
    return <AuthScreen onLogin={login} onRegister={register} />
  }

  switch (session.role) {
    case 'admin':
      return <AdminView session={session} onLogout={logout} />
    case 'btc':
      return <BtcApp onLogout={logout} />
    case 'referee':
      return <RefereeApp onLogout={logout} />
    case 'athlete':
      return <AthleteView session={session} onLogout={logout} />
    case 'spectator':
      return <SpectatorView onLogout={logout} />
    default:
      return <AuthScreen onLogin={login} onRegister={register} />
  }
}
