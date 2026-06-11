import { useState } from 'react'
import type { MatchState, MatchAction, SideId, PlayerIdx } from '../../types'
import { ShuttleMark } from './shared'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction>; onBack?: () => void }

export default function PreMatch({ state, dispatch, onBack }: Props) {
  const [servingSide, setServingSide] = useState<SideId | null>(null)
  const [serverIdx, setServerIdx] = useState<PlayerIdx>(0)
  const [receiverIdx, setReceiverIdx] = useState<PlayerIdx>(0)

  const recvSide: SideId | null = servingSide ? (servingSide === 'A' ? 'B' : 'A') : null
  const ready = servingSide !== null

  const accentFor = (s: SideId) => (s === 'A' ? 'var(--color-accent)' : 'var(--color-court)')
  const softFor = (s: SideId) => (s === 'A' ? 'var(--color-accent-soft)' : 'var(--color-court-soft)')

  return (
    <div className="fade-in" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)', background: 'var(--color-surface)' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', background: 'var(--color-ink)', color: 'white', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <ShuttleMark size={20} light />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '0.04em', textTransform: 'uppercase', flex: 1 }}>
          Shuttle<span style={{ color: 'var(--color-accent)' }}>·</span>Ops
        </span>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'oklch(0.78 0.01 50)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            ← Bảng điểm
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 26 }}>
        {/* Tournament + court + format */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 6 }}>
            {state.tournament}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 42, color: 'var(--color-ink)', lineHeight: 1 }}>
            Sân {state.court}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 6 }}>
            {state.isDoubles ? 'Đôi' : 'Đơn'} · {state.gamesToWin * 2 - 1} ván × {state.pointsPerSet} điểm
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* Sides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)' }}>Vận động viên</div>
          <SideCard side="A" players={state.sides.A.players} color={accentFor('A')} soft={softFor('A')} />
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--color-ink-3)', letterSpacing: '0.1em' }}>VS</div>
          <SideCard side="B" players={state.sides.B.players} color={accentFor('B')} soft={softFor('B')} />
        </div>

        {/* Serving side */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 12 }}>
            Đội nào giao cầu trước?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['A', 'B'] as const).map(s => (
              <PickButton key={s} label={state.sides[s].players.map(p => p.name).join(' / ')}
                selected={servingSide === s} color={accentFor(s)} soft={softFor(s)}
                onSelect={() => { setServingSide(s); setServerIdx(0); setReceiverIdx(0) }} />
            ))}
          </div>
        </div>

        {/* Doubles: server + receiver */}
        {state.isDoubles && servingSide && recvSide && (
          <>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 12 }}>
                Người giao cầu (đội {servingSide})
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {state.sides[servingSide].players.map((p, idx) => (
                  <PickButton key={idx} label={p.name} selected={serverIdx === idx}
                    color={accentFor(servingSide)} soft={softFor(servingSide)} onSelect={() => setServerIdx(idx as PlayerIdx)} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 12 }}>
                Người nhận cầu (đội {recvSide})
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {state.sides[recvSide].players.map((p, idx) => (
                  <PickButton key={idx} label={p.name} selected={receiverIdx === idx}
                    color={accentFor(recvSide)} soft={softFor(recvSide)} onSelect={() => setReceiverIdx(idx as PlayerIdx)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '16px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <button disabled={!ready}
          onClick={() => servingSide && dispatch({ type: 'SETUP_GAME', servingSide, serverIdx, receiverIdx })}
          style={{
            width: '100%', padding: '18px', background: ready ? 'var(--color-accent)' : 'var(--color-border)',
            color: ready ? 'white' : 'var(--color-ink-3)', border: 'none', borderRadius: 14,
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 17, cursor: ready ? 'pointer' : 'default',
          }}>
          Bắt đầu trận đấu
        </button>
      </div>
    </div>
  )
}

function SideCard({ side, players, color, soft }: { side: SideId; players: { name: string }[]; color: string; soft: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: soft, borderRadius: 12 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Đội {side}</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-ink)' }}>{players.map(p => p.name).join(' / ')}</div>
      </div>
    </div>
  )
}

function PickButton({ label, selected, color, soft, onSelect }: { label: string; selected: boolean; color: string; soft: string; onSelect: () => void }) {
  return (
    <button onClick={onSelect} style={{
      flex: 1, padding: '14px 10px', background: selected ? soft : 'var(--color-surface-2)',
      border: `2px solid ${selected ? color : 'transparent'}`, borderRadius: 10, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: selected ? color : 'var(--color-ink-2)',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>{label}</button>
  )
}
