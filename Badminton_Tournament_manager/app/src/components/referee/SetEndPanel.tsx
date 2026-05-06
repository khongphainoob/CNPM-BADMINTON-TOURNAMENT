import { useState } from 'react'
import type { MatchState, MatchAction } from '../../types'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction> }

export default function SetEndPanel({ state, dispatch }: Props) {
  const [nextServer, setNextServer] = useState<'p1' | 'p2' | null>(null)

  const lastSet = state.completedSets.at(-1)
  if (!lastSet) return null

  const winnerName = lastSet.winner === 'p1' ? state.p1.name : state.p2.name
  const setNum = state.completedSets.length
  const nextSetNum = setNum + 1
  const isDecider = nextSetNum === 3

  return (
    <>
      <div
        style={{ position: 'absolute', inset: 0, background: 'oklch(0.1 0.01 50 / 0.45)', zIndex: 10 }}
        onClick={() => dispatch({ type: 'UNDO' })}
        aria-label="Huỷ điểm"
      />

      <div className="panel-up" style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: 'var(--color-surface)',
        borderRadius: '20px 20px 0 0',
        padding: '8px 20px 0',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        zIndex: 20,
      }}>
        <div style={{ width: 36, height: 4, background: 'var(--color-border)', borderRadius: 99, margin: '8px auto 22px' }} />

        {/* Result */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 10 }}>
            Ván {setNum} kết thúc
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 52,
            color: 'var(--color-ink)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginBottom: 10,
          }}>
            {lastSet.p1} – {lastSet.p2}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent)' }}>
            {winnerName} thắng
          </div>
        </div>

        {/* Set history */}
        {state.completedSets.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {state.completedSets.map((s, i) => (
              <span key={i} style={{
                padding: '4px 12px',
                background: 'var(--color-surface-2)',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-ink-2)',
                fontFamily: 'monospace',
              }}>
                {s.p1}–{s.p2}
              </span>
            ))}
          </div>
        )}

        {isDecider && (
          <div style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'oklch(0.38 0.14 72)',
            background: 'var(--color-amber-soft)',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 20,
          }}>
            Ván 3: Đổi sân khi một bên đạt 11 điểm
          </div>
        )}

        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 20 }} />

        {/* Next server */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', textAlign: 'center', marginBottom: 12 }}>
            Ai phát cầu ván {nextSetNum}?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['p1', 'p2'] as const).map(p => {
              const nm = p === 'p1' ? state.p1.name : state.p2.name
              const color = p === 'p1' ? 'var(--color-accent)' : 'var(--color-court)'
              const soft  = p === 'p1' ? 'var(--color-accent-soft)' : 'var(--color-court-soft)'
              const sel   = nextServer === p
              return (
                <button key={p} onClick={() => setNextServer(p)} style={{
                  flex: 1,
                  padding: '13px 10px',
                  background: sel ? soft : 'var(--color-surface-2)',
                  border: `2px solid ${sel ? color : 'transparent'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: sel ? color : 'var(--color-ink-2)',
                  transition: 'all 150ms',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {nm}
                </button>
              )
            })}
          </div>
        </div>

        <button
          disabled={!nextServer}
          onClick={() => nextServer && dispatch({ type: 'CONFIRM_NEXT_SET', serving: nextServer })}
          style={{
            width: '100%',
            padding: '17px',
            background: nextServer ? 'var(--color-accent)' : 'var(--color-border)',
            color: nextServer ? 'white' : 'var(--color-ink-3)',
            border: 'none',
            borderRadius: 13,
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 16,
            cursor: nextServer ? 'pointer' : 'default',
            transition: 'background 200ms, color 200ms',
          }}
        >
          Bắt đầu ván {nextSetNum}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--color-ink-3)',
              fontFamily: 'var(--font-body)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Huỷ điểm cuối
          </button>
        </div>
      </div>
    </>
  )
}
