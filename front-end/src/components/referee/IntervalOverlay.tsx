import type { MatchState, MatchAction } from '../../types'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction> }

export default function IntervalOverlay({ state, dispatch }: Props) {
  const left = state.interval?.secondsLeft ?? 0
  const mins = Math.floor(left / 60), secs = left % 60

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30, background: 'oklch(0.15 0.03 260 / 0.96)', color: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
        Giải lao giữa ván · 60 giây
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 96, lineHeight: 1 }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: 14, opacity: 0.7 }}>
        {state.currentGame.A} – {state.currentGame.B}
      </div>
      <button onClick={() => dispatch({ type: 'END_INTERVAL' })} style={{
        marginTop: 8, padding: '14px 28px', background: 'var(--color-accent)', color: 'white', border: 'none',
        borderRadius: 12, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
      }}>
        Tiếp tục ngay
      </button>
    </div>
  )
}
