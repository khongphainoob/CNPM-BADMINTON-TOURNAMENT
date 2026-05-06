import { useMatch } from '../../hooks/useMatch'
import PreMatch from './PreMatch'
import Scoring from './Scoring'
import SetEndPanel from './SetEndPanel'
import MatchEndScreen from './MatchEndScreen'

type Props = { onBack?: () => void; onLogout?: () => void }

export default function RefereeApp({ onBack, onLogout }: Props) {
  const { state, dispatch } = useMatch()

  if (state.phase === 'match-end') {
    return <MatchEndScreen state={state} dispatch={dispatch} onBack={onBack} onLogout={onLogout} />
  }

  return (
    <div style={{ height: '100dvh', width: '100%', overflow: 'hidden', position: 'relative', background: 'var(--color-surface)' }}>
      {state.phase === 'pre' && (
        <PreMatch state={state} dispatch={dispatch} onBack={onBack} />
      )}
      {(state.phase === 'scoring' || state.phase === 'set-end') && (
        <Scoring state={state} dispatch={dispatch} />
      )}
      {state.phase === 'set-end' && (
        <SetEndPanel state={state} dispatch={dispatch} />
      )}
    </div>
  )
}
