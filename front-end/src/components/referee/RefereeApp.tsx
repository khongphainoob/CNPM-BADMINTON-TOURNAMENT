import { useState } from 'react'
import { useMatch } from '../../hooks/useMatch'
import PreMatch from './PreMatch'
import Scoring from './Scoring'
import SetEndPanel from './SetEndPanel'
import IntervalOverlay from './IntervalOverlay'
import AbnormalEndSheet from './AbnormalEndSheet'
import MatchEndScreen from './MatchEndScreen'
import RefereeMatchList from './RefereeMatchList'
import SyncLogView from '../../features/referee/SyncLogView'

type Props = { onBack?: () => void; onLogout?: () => void }

import AppShell from '../shared/AppShell'
import { useAuth } from '../../data/auth'
import { setActiveTournament } from '../../data/store'

export default function RefereeApp({ onBack, onLogout }: Props) {
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('ref_schedule')
  const { session } = useAuth()
  
  const handleBackToList = () => {
    setSelectedMatch(null)
    if (onBack) onBack()
  }

  if (!selectedMatch) {
    return (
      <AppShell
        session={session!}
        items={[
          { id: 'ref_schedule', label: 'Lịch làm việc', icon: 'calendar' },
          { id: 'sync_log', label: 'Đồng bộ Offline', icon: 'refresh-cw' }
        ]}
        activeId={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        onLogout={onLogout || (() => {})}
        onAction={{ label: 'Đổi giải đấu', icon: 'award', onClick: () => setActiveTournament(null) }}
      >
        {activeTab === 'ref_schedule' ? (
          <RefereeMatchList onSelect={setSelectedMatch} />
        ) : (
          <SyncLogView />
        )}
      </AppShell>
    )
  }

  return <RefereeMatchApp matchData={selectedMatch} onBack={handleBackToList} onLogout={onLogout} />
}

function RefereeMatchApp({ matchData, onBack, onLogout }: { matchData: any; onBack: () => void; onLogout?: () => void }) {
  const { state, dispatch } = useMatch(matchData)
  const [abnormalOpen, setAbnormalOpen] = useState(false)

  if (state.phase === 'match-end') {
    return <MatchEndScreen state={state} onBack={onBack} onLogout={onLogout} />
  }

  if (state.phase === 'pre') {
    return <PreMatch state={state} dispatch={dispatch} onBack={onBack} />
  }

  return (
    <div style={{ height: '100dvh', width: '100%', overflow: 'hidden', position: 'relative', background: 'var(--color-surface)' }}>
      <Scoring state={state} dispatch={dispatch} onAbnormal={() => setAbnormalOpen(true)} />
      {state.phase === 'interval' && <IntervalOverlay state={state} dispatch={dispatch} />}
      {state.phase === 'game-end' && <SetEndPanel state={state} dispatch={dispatch} />}
      {abnormalOpen && <AbnormalEndSheet state={state} dispatch={dispatch} onClose={() => setAbnormalOpen(false)} />}
    </div>
  )
}
