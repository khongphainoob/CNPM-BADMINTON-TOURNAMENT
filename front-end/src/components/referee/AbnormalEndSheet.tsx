import { useState } from 'react'
import type { MatchState, MatchAction, SideId } from '../../types'

type Props = { state: MatchState; dispatch: React.Dispatch<MatchAction>; onClose: () => void }
type Kind = 'walkover' | 'disqualification'

export default function AbnormalEndSheet({ state, dispatch, onClose }: Props) {
  const [kind, setKind] = useState<Kind | null>(null)
  // The side that is absent (walkover) or disqualified — the OTHER side wins.
  const [offending, setOffending] = useState<SideId | null>(null)
  const [note, setNote] = useState('')

  const nameOf = (s: SideId) => state.sides[s].players.map(p => p.name).join(' / ')
  const winner: SideId | null = offending ? (offending === 'A' ? 'B' : 'A') : null
  const ready = kind !== null && offending !== null

  const offendingLabel = kind === 'walkover' ? 'Đội vắng mặt' : 'Đội bị truất quyền'

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'oklch(0.1 0.01 50 / 0.5)', zIndex: 40 }} onClick={onClose} />
      <div className="panel-up" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--color-surface)', borderRadius: '20px 20px 0 0',
        padding: '8px 20px 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))', zIndex: 50, maxHeight: '90dvh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, background: 'var(--color-border)', borderRadius: 99, margin: '8px auto 18px' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, textAlign: 'center', marginBottom: 4 }}>
          Kết thúc đặc biệt
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-ink-3)', textAlign: 'center', marginBottom: 18 }}>
          Gán đội thắng và ghi nhận lý do
        </div>

        <Section label="Hình thức">
          <Choice label="Walkover (vắng mặt)" selected={kind === 'walkover'} onSelect={() => { setKind('walkover'); setOffending(null) }} />
          <Choice label="Truất quyền (DQ)" selected={kind === 'disqualification'} onSelect={() => { setKind('disqualification'); setOffending(null) }} />
        </Section>

        {kind && (
          <Section label={offendingLabel}>
            {(['A', 'B'] as const).map(s => (
              <Choice key={s} label={`Đội ${s} · ${nameOf(s)}`} selected={offending === s} onSelect={() => setOffending(s)} />
            ))}
          </Section>
        )}

        {winner && (
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
            Đội thắng: {nameOf(winner)}
          </div>
        )}

        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)" style={{
          width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1px solid var(--color-border)',
          borderRadius: 10, background: 'white', fontSize: 14, fontFamily: 'var(--font-body)', marginBottom: 16, outline: 'none',
        }} />

        <button disabled={!ready}
          onClick={() => ready && winner && dispatch({ type: 'END_ABNORMAL', resultType: kind!, winner, note: note.trim() || undefined })}
          style={{
            width: '100%', padding: '16px', background: ready ? 'var(--color-accent)' : 'var(--color-border)',
            color: ready ? 'white' : 'var(--color-ink-3)', border: 'none', borderRadius: 13,
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, cursor: ready ? 'pointer' : 'default',
          }}>
          Xác nhận kết thúc
        </button>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>Huỷ</button>
        </div>
      </div>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-ink-3)', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', gap: 10 }}>{children}</div>
    </div>
  )
}

function Choice({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} style={{
      flex: 1, padding: '13px 10px', background: selected ? 'var(--color-accent-soft)' : 'var(--color-surface-2)',
      border: `2px solid ${selected ? 'var(--color-accent)' : 'transparent'}`, borderRadius: 10, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12.5, color: selected ? 'var(--color-accent)' : 'var(--color-ink-2)',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>{label}</button>
  )
}
