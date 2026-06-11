import { useState, useEffect } from 'react'
import type { MatchState, MatchAction, SideId, PlayerIdx } from '../../types'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction> }

export default function SetEndPanel({ state, dispatch }: Props) {
  const lastGame = state.completedGames.at(-1)
  const defaultServing: SideId = lastGame ? lastGame.winner : 'A'

  const [servingSide, setServingSide] = useState<SideId>(defaultServing)
  const [serverIdx, setServerIdx] = useState<PlayerIdx>(0)
  const [receiverIdx, setReceiverIdx] = useState<PlayerIdx>(0)
  const [secondsLeft, setSecondsLeft] = useState(120) // between-game interval

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  if (!lastGame) return null

  const recvSide: SideId = servingSide === 'A' ? 'B' : 'A'
  const gameNum = state.completedGames.length
  const nextGameNum = gameNum + 1
  const isDecider = state.gamesWon.A === state.gamesToWin - 1 && state.gamesWon.B === state.gamesToWin - 1
  const winnerName = state.sides[lastGame.winner].players.map(p => p.name).join(' / ')

  const accentFor = (s: SideId) => (s === 'A' ? 'var(--color-accent)' : 'var(--color-court)')
  const softFor = (s: SideId) => (s === 'A' ? 'var(--color-accent-soft)' : 'var(--color-court-soft)')
  const mins = Math.floor(secondsLeft / 60), secs = secondsLeft % 60

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'oklch(0.1 0.01 50 / 0.45)', zIndex: 10 }} />

      <div className="panel-up" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)',
        borderRadius: '20px 20px 0 0', padding: '8px 20px 0',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))', zIndex: 20, maxHeight: '92dvh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, background: 'var(--color-border)', borderRadius: 99, margin: '8px auto 18px' }} />

        {/* Result */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 8 }}>
            Ván {gameNum} kết thúc
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 50, color: 'var(--color-ink)', lineHeight: 1, marginBottom: 8 }}>
            {lastGame.A} – {lastGame.B}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-accent)' }}>{winnerName} thắng ván</div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 4 }}>
            Tổng ván: {state.gamesWon.A} – {state.gamesWon.B}
          </div>
        </div>

        {/* Between-game interval countdown */}
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-2)', background: 'var(--color-surface-2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          Nghỉ giữa ván · <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'oklch(0.38 0.14 72)', background: 'var(--color-amber-soft)', borderRadius: 8, padding: '8px 12px', marginBottom: 18 }}>
          Đổi sân trước ván {nextGameNum}{isDecider ? ' · Ván quyết định: đổi sân lại khi một bên đạt 11 điểm' : ''}
        </div>

        {/* Next serving side */}
        <Picker label={`Đội giao cầu ván ${nextGameNum}?`}>
          {(['A', 'B'] as const).map(s => (
            <PickButton key={s} label={state.sides[s].players.map(p => p.name).join(' / ')}
              selected={servingSide === s} color={accentFor(s)} soft={softFor(s)}
              onSelect={() => { setServingSide(s); setServerIdx(0); setReceiverIdx(0) }} />
          ))}
        </Picker>

        {state.isDoubles && (
          <>
            <Picker label={`Người giao (đội ${servingSide})`}>
              {state.sides[servingSide].players.map((p, idx) => (
                <PickButton key={idx} label={p.name} selected={serverIdx === idx}
                  color={accentFor(servingSide)} soft={softFor(servingSide)} onSelect={() => setServerIdx(idx as PlayerIdx)} />
              ))}
            </Picker>
            <Picker label={`Người nhận (đội ${recvSide})`}>
              {state.sides[recvSide].players.map((p, idx) => (
                <PickButton key={idx} label={p.name} selected={receiverIdx === idx}
                  color={accentFor(recvSide)} soft={softFor(recvSide)} onSelect={() => setReceiverIdx(idx as PlayerIdx)} />
              ))}
            </Picker>
          </>
        )}

        <button onClick={() => dispatch({ type: 'SETUP_GAME', servingSide, serverIdx, receiverIdx })} style={{
          width: '100%', padding: '17px', background: 'var(--color-accent)', color: 'white', border: 'none',
          borderRadius: 13, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 6,
        }}>
          Bắt đầu ván {nextGameNum}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => dispatch({ type: 'UNDO' })} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-ink-3)',
            fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 3,
          }}>Huỷ điểm cuối (sửa ván)</button>
        </div>
      </div>
    </>
  )
}

function Picker({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', textAlign: 'center', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', gap: 10 }}>{children}</div>
    </div>
  )
}

function PickButton({ label, selected, color, soft, onSelect }: { label: string; selected: boolean; color: string; soft: string; onSelect: () => void }) {
  return (
    <button onClick={onSelect} style={{
      flex: 1, padding: '13px 10px', background: selected ? soft : 'var(--color-surface-2)',
      border: `2px solid ${selected ? color : 'transparent'}`, borderRadius: 10, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: selected ? color : 'var(--color-ink-2)',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>{label}</button>
  )
}
