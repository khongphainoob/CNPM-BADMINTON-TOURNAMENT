import { useState, useCallback } from 'react'
import type { MatchState, MatchAction, SideId } from '../../types'
import { getServeInfo, gamePointSide, isMatchPoint, isDeuce } from '../../hooks/useMatch'
import { ShuttleMark, formatTime } from './shared'

type Props = {
  state: MatchState
  dispatch: React.Dispatch<MatchAction>
  onAbnormal?: () => void
}

export default function Scoring({ state, dispatch, onAbnormal }: Props) {
  const [flash, setFlash] = useState<SideId | null>(null)
  const [pop, setPop] = useState<SideId | null>(null)

  const score = useCallback((side: SideId) => {
    if (state.phase !== 'scoring') return
    if ('vibrate' in navigator) navigator.vibrate(35)
    setFlash(side); setPop(side)
    setTimeout(() => setFlash(null), 90)
    setTimeout(() => setPop(null), 300)
    dispatch({ type: 'SCORE', side })
  }, [dispatch, state.phase])

  const serve = getServeInfo(state)
  const gp = gamePointSide(state)
  const mp = isMatchPoint(state)
  const deuce = isDeuce(state)

  // Change-of-ends: swap which side renders on top.
  const topSide: SideId = state.displaySwap ? 'B' : 'A'
  const bottomSide: SideId = state.displaySwap ? 'A' : 'B'

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Header */}
      <header style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'var(--color-ink)', color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <ShuttleMark size={18} light />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Sân {state.court}
          </span>
        </div>

        <span style={{
          background: 'var(--color-accent)', color: 'white', fontSize: 10, fontWeight: 700,
          padding: '2px 9px', borderRadius: 999, letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          ● Live · Ván {state.completedGames.length + 1}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, opacity: 0.65 }}>{formatTime(state.elapsedSeconds)}</span>
          {onAbnormal && (
            <button onClick={onAbnormal} title="Kết thúc đặc biệt" style={{
              background: 'transparent', border: '1px solid oklch(0.4 0.01 250)', color: 'white',
              borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>⚑</button>
          )}
        </div>
      </header>

      {/* Top zone */}
      <SideZone side={topSide} state={state} serve={serve}
        accent={topSide === 'A' ? 'var(--color-accent)' : 'var(--color-court)'}
        flashing={flash === topSide} popping={pop === topSide} position="top" onScore={() => score(topSide)} />

      {/* Middle strip */}
      <div style={{
        flexShrink: 0, minHeight: 52, background: 'var(--color-strip)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {state.completedGames.map((g, i) => (
            <span key={i} style={{
              fontSize: 12, fontWeight: 700, color: 'var(--color-ink-2)', fontFamily: 'monospace',
              background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 5,
            }}>{g.A}–{g.B}</span>
          ))}

          {mp && <Tag text="Match point" fg="var(--color-accent-dim)" bg="var(--color-accent-soft)" />}
          {!mp && gp && <Tag text="Game point" fg="oklch(0.38 0.14 148)" bg="var(--color-court-soft)" />}
          {!gp && deuce && <Tag text="Deuce" fg="oklch(0.38 0.14 72)" bg="var(--color-amber-soft)" />}
        </div>

        {state.history.length > 0 && (
          <button className="fade-in" onClick={() => dispatch({ type: 'UNDO' })} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, background: 'none',
            border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 11px',
            color: 'var(--color-ink-2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>↩ Huỷ điểm</button>
        )}
      </div>

      {/* Bottom zone */}
      <SideZone side={bottomSide} state={state} serve={serve}
        accent={bottomSide === 'A' ? 'var(--color-accent)' : 'var(--color-court)'}
        flashing={flash === bottomSide} popping={pop === bottomSide} position="bottom" onScore={() => score(bottomSide)} />
    </div>
  )
}

function Tag({ text, fg, bg }: { text: string; fg: string; bg: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: fg, background: bg, padding: '2px 8px',
      borderRadius: 5, letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>{text}</span>
  )
}

type ZoneProps = {
  side: SideId
  state: MatchState
  serve: ReturnType<typeof getServeInfo>
  accent: string
  flashing: boolean
  popping: boolean
  position: 'top' | 'bottom'
  onScore: () => void
}

function SideZone({ side, state, serve, accent, flashing, popping, position, onScore }: ZoneProps) {
  const isTop = position === 'top'
  const players = state.sides[side].players
  const isServingSide = serve.servingSide === side
  const isReceivingSide = serve.receivingSide === side
  const score = state.currentGame[side]

  const bg = flashing
    ? 'var(--color-surface-flash)'
    : isServingSide
      ? (side === 'A' ? 'var(--color-surface-p1)' : 'var(--color-surface-p2)')
      : 'var(--color-surface)'

  // Role badge per player (server / receiver) for doubles; for singles the lone player.
  const roleFor = (idx: number): { label: string; court?: string } | null => {
    if (isServingSide && idx === serve.serverIdx) return { label: 'Giao', court: serve.serviceCourt === 'right' ? 'P' : 'T' }
    if (isReceivingSide && idx === serve.receiverIdx) return { label: 'Nhận' }
    return null
  }

  const namesEl = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', pointerEvents: 'none' }}>
      {players.map((p, idx) => {
        const role = roleFor(idx)
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {role?.label === 'Giao' && <ServeIcon color={accent} />}
            <span style={{
              fontFamily: 'var(--font-body)', fontWeight: role ? 800 : 600, fontSize: 13,
              letterSpacing: '0.03em', textTransform: 'uppercase',
              color: role ? accent : 'var(--color-ink-3)',
              maxWidth: '64vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{p.name}</span>
            {role && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', color: 'white', background: accent,
                borderRadius: 4, padding: '1px 5px',
              }}>
                {role.label}{role.court ? ` ${role.court}` : ''}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <button onClick={onScore} aria-label={`${side} scores`} style={{
      flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10, border: 'none', background: bg, cursor: 'pointer',
      padding: '20px 24px', transition: flashing ? 'none' : 'background 600ms ease-out',
      position: 'relative', width: '100%',
    }}>
      {isTop && <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)' }}>{namesEl}</div>}

      <span key={score} className={popping ? 'score-pop' : ''} style={{
        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(72px, 21vw, 120px)',
        lineHeight: 1, color: 'var(--color-ink)', letterSpacing: '-0.02em', display: 'block', pointerEvents: 'none',
      }}>{score}</span>

      {!isTop && <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)' }}>{namesEl}</div>}
    </button>
  )
}

function ServeIcon({ color }: { color: string }) {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="16.5" r="3.2" fill={color} />
      <path d="M12 13.5V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 5l-3.5 8.5M12 5l3.5 8.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 13.5h8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
