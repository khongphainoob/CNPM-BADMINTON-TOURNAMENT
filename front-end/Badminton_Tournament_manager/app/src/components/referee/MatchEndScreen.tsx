import type { MatchState, MatchAction } from '../../types'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction>; onBack?: () => void; onLogout?: () => void }

export default function MatchEndScreen({ state, dispatch, onBack, onLogout }: Props) {
  const winner: 'p1' | 'p2' = state.setsWon.p1 > state.setsWon.p2 ? 'p1' : 'p2'
  const loser:  'p1' | 'p2' = winner === 'p1' ? 'p2' : 'p1'
  const winnerName = state[winner].name
  const loserName  = state[loser].name

  return (
    <div className="fade-in" style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--color-ink)',
      color: 'white',
      padding: '48px 24px',
      paddingBottom: 'max(40px, env(safe-area-inset-bottom))',
      textAlign: 'center',
    }}>
      {/* Top label */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        opacity: 0.4,
      }}>
        Kết thúc trận đấu · {state.tournament}
      </div>

      {/* Winner block */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 18 }}>
          Người thắng
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(26px, 7.5vw, 46px)',
          color: 'var(--color-accent)',
          lineHeight: 1.1,
          marginBottom: 6,
          maxWidth: '88vw',
          margin: '0 auto 6px',
        }}>
          {winnerName}
        </div>

        <div style={{ fontSize: 14, opacity: 0.45, marginBottom: 36 }}>
          {state.setsWon.p1} – {state.setsWon.p2} ván
        </div>

        {/* Set breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {state.completedSets.map((s, i) => {
            const p1Won = s.winner === 'p1'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14 }}>
                <span style={{
                  fontWeight: 700,
                  opacity: winner === 'p1' ? 1 : 0.38,
                  minWidth: 100,
                  textAlign: 'right',
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {p1Won ? winnerName : loserName}
                </span>

                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 20,
                  opacity: 0.9,
                  minWidth: 64,
                }}>
                  {s.p1}–{s.p2}
                </span>

                <span style={{
                  fontWeight: 700,
                  opacity: winner === 'p2' ? 1 : 0.38,
                  minWidth: 100,
                  textAlign: 'left',
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {p1Won ? loserName : winnerName}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <button style={{
          padding: '17px',
          background: 'var(--color-accent)',
          color: 'white',
          border: 'none',
          borderRadius: 13,
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
        }}>
          Nộp kết quả
        </button>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '13px',
              background: 'none',
              color: 'oklch(0.55 0.01 50)',
              border: '1px solid oklch(0.28 0.01 50)',
              borderRadius: 13,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ← Bảng điểm khán giả
          </button>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: '11px',
              background: 'none',
              color: 'oklch(0.45 0.01 50)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              opacity: 0.6,
            }}
          >
            Đăng xuất
          </button>
        )}

        <button
          onClick={() => dispatch({ type: 'RESET' })}
          style={{
            padding: '15px',
            background: 'none',
            color: 'oklch(0.78 0.01 50)',
            border: '1px solid oklch(0.32 0.01 50)',
            borderRadius: 13,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Trận mới
        </button>
      </div>
    </div>
  )
}
