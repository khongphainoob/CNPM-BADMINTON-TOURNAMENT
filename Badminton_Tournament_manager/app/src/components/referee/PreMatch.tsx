import { useState } from 'react'
import type { MatchState, MatchAction } from '../../types'
import { ShuttleMark } from './shared'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction>; onBack?: () => void }

export default function PreMatch({ state, dispatch, onBack }: Props) {
  const [serving, setServing] = useState<'p1' | 'p2' | null>(null)

  return (
    <div className="fade-in" style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-body)',
      background: 'var(--color-surface)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        background: 'var(--color-ink)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <ShuttleMark size={20} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          flex: 1,
        }}>
          Shuttle<span style={{ color: 'var(--color-accent)' }}>·</span>Ops
        </span>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'oklch(0.78 0.01 50)',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              padding: '4px 0',
              letterSpacing: '0.02em',
            }}
          >
            ← Bảng điểm
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Tournament + court */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 6 }}>
            {state.tournament}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 42, color: 'var(--color-ink)', lineHeight: 1, letterSpacing: '-0.01em' }}>
            Sân {state.court}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* Players */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 2 }}>
            Vận động viên
          </div>

          <PlayerCard name={state.p1.name} label="VĐV 1" color="var(--color-accent)" soft="var(--color-accent-soft)" />

          <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--color-ink-3)', letterSpacing: '0.1em' }}>
            VS
          </div>

          <PlayerCard name={state.p2.name} label="VĐV 2" color="var(--color-court)" soft="var(--color-court-soft)" />
        </div>

        {/* Serve picker */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 12 }}>
            Ai phát cầu trước?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <ServeButton
              name={state.p1.name}
              selected={serving === 'p1'}
              color="var(--color-accent)"
              soft="var(--color-accent-soft)"
              onSelect={() => setServing('p1')}
            />
            <ServeButton
              name={state.p2.name}
              selected={serving === 'p2'}
              color="var(--color-court)"
              soft="var(--color-court-soft)"
              onSelect={() => setServing('p2')}
            />
          </div>
        </div>
      </div>

      {/* Start */}
      <div style={{ padding: '16px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <button
          disabled={!serving}
          onClick={() => serving && dispatch({ type: 'START_MATCH', serving })}
          style={{
            width: '100%',
            padding: '18px',
            background: serving ? 'var(--color-accent)' : 'var(--color-border)',
            color: serving ? 'white' : 'var(--color-ink-3)',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 17,
            cursor: serving ? 'pointer' : 'default',
            transition: 'background 200ms, color 200ms',
            letterSpacing: '0.01em',
          }}
        >
          Bắt đầu trận đấu
        </button>
      </div>
    </div>
  )
}

function PlayerCard({ name, label, color, soft }: { name: string; label: string; color: string; soft: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: soft,
      borderRadius: 12,
    }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-ink)' }}>{name}</div>
      </div>
    </div>
  )
}

function ServeButton({ name, selected, color, soft, onSelect }: {
  name: string; selected: boolean; color: string; soft: string; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        flex: 1,
        padding: '14px 10px',
        background: selected ? soft : 'var(--color-surface-2)',
        border: `2px solid ${selected ? color : 'transparent'}`,
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: 13,
        color: selected ? color : 'var(--color-ink-2)',
        transition: 'all 150ms ease-out',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </button>
  )
}
