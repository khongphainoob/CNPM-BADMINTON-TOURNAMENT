import { useState, useCallback } from 'react'
import type { MatchState, MatchAction } from '../../types'
import { isGamePoint } from '../../hooks/useMatch'
import { ShuttleMark, formatTime } from './shared'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction> }

export default function Scoring({ state, dispatch }: Props) {
  const [flash, setFlash] = useState<'p1' | 'p2' | null>(null)
  const [pop, setPop]     = useState<'p1' | 'p2' | null>(null)

  const score = useCallback((player: 'p1' | 'p2') => {
    if ('vibrate' in navigator) navigator.vibrate(35)
    setFlash(player)
    setPop(player)
    setTimeout(() => setFlash(null), 90)
    setTimeout(() => setPop(null),   300)
    dispatch({ type: 'SCORE', player })
  }, [dispatch])

  const { p1: s1, p2: s2 } = state.currentSet
  const gamePointFor = isGamePoint(s1, s2)
  const isMatchPoint = gamePointFor !== null && state.setsWon[gamePointFor] === 1
  const isDeuce = s1 >= 20 && s2 >= 20

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', userSelect: 'none', WebkitUserSelect: 'none' }}>

      {/* Header */}
      <header style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'var(--color-ink)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <ShuttleMark size={18} light />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Sân {state.court}
          </span>
        </div>

        <span style={{
          background: 'var(--color-accent)',
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 9px',
          borderRadius: 999,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}>
          ● Live · Ván {state.completedSets.length + 1}
        </span>

        <span style={{ fontFamily: 'monospace', fontSize: 13, opacity: 0.65 }}>
          {formatTime(state.elapsedSeconds)}
        </span>
      </header>

      {/* P1 Zone */}
      <Zone
        name={state.p1.name}
        score={s1}
        serving={state.serving === 'p1'}
        serveColor="var(--color-accent)"
        isFlashing={flash === 'p1'}
        isPopping={pop === 'p1'}
        position="top"
        onScore={() => score('p1')}
      />

      {/* Middle Strip */}
      <div style={{
        flexShrink: 0,
        height: 52,
        background: 'var(--color-strip)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {state.completedSets.map((s, i) => (
            <span key={i} style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-ink-2)',
              fontFamily: 'monospace',
              background: 'var(--color-surface-2)',
              padding: '2px 8px',
              borderRadius: 5,
            }}>
              {s.p1}–{s.p2}
            </span>
          ))}

          {isMatchPoint && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--color-accent-dim)',
              background: 'var(--color-accent-soft)',
              padding: '2px 8px',
              borderRadius: 5,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}>
              Match point
            </span>
          )}

          {!isMatchPoint && gamePointFor && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'oklch(0.38 0.14 148)',
              background: 'var(--color-court-soft)',
              padding: '2px 8px',
              borderRadius: 5,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}>
              Game point
            </span>
          )}

          {isDeuce && !gamePointFor && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'oklch(0.38 0.14 72)',
              background: 'var(--color-amber-soft)',
              padding: '2px 8px',
              borderRadius: 5,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}>
              Deuce
            </span>
          )}
        </div>

        {state.undoVisible && (
          <button
            className="fade-in"
            onClick={() => dispatch({ type: 'UNDO' })}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '6px 11px',
              color: 'var(--color-ink-2)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            ↩ Huỷ điểm
          </button>
        )}
      </div>

      {/* P2 Zone */}
      <Zone
        name={state.p2.name}
        score={s2}
        serving={state.serving === 'p2'}
        serveColor="var(--color-court)"
        isFlashing={flash === 'p2'}
        isPopping={pop === 'p2'}
        position="bottom"
        onScore={() => score('p2')}
      />
    </div>
  )
}

type ZoneProps = {
  name: string
  score: number
  serving: boolean
  serveColor: string
  isFlashing: boolean
  isPopping: boolean
  position: 'top' | 'bottom'
  onScore: () => void
}

function Zone({ name, score, serving, serveColor, isFlashing, isPopping, position, onScore }: ZoneProps) {
  const isTop = position === 'top'
  const bg = isFlashing
    ? 'var(--color-surface-flash)'
    : serving
    ? (isTop ? 'var(--color-surface-p1)' : 'var(--color-surface-p2)')
    : 'var(--color-surface)'

  const nameEl = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, pointerEvents: 'none' }}>
      {isTop && serving && <ServeIcon color={serveColor} />}
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: serving ? serveColor : 'var(--color-ink-3)',
        maxWidth: '72vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {name}
      </span>
      {!isTop && serving && <ServeIcon color={serveColor} />}
    </div>
  )

  return (
    <button
      onClick={onScore}
      aria-label={`${name} scores`}
      style={{
        flex: 1,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        border: 'none',
        background: bg,
        cursor: 'pointer',
        padding: '20px 24px',
        transition: isFlashing ? 'none' : 'background 600ms ease-out',
        position: 'relative',
        width: '100%',
      }}
    >
      {isTop && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)' }}>
          {nameEl}
        </div>
      )}

      <span
        key={score}
        className={isPopping ? 'score-pop' : ''}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(80px, 23vw, 124px)',
          lineHeight: 1,
          color: 'var(--color-ink)',
          letterSpacing: '-0.02em',
          display: 'block',
          pointerEvents: 'none',
        }}
      >
        {score}
      </span>

      {!isTop && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
          {nameEl}
        </div>
      )}
    </button>
  )
}

function ServeIcon({ color }: { color: string }) {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="16.5" r="3.2" fill={color} />
      <path d="M12 13.5V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5l-3.5 8.5M12 5l3.5 8.5M12 5l-1.2 8.5M12 5l1.2 8.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 13.5h8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
