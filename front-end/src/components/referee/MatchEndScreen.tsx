import type { MatchState, SideId } from '../../types'

type Props = { state: MatchState; onBack?: () => void; onLogout?: () => void }

const RESULT_LABEL: Record<string, string> = {
  normal: '',
  walkover: 'Walkover · đối thủ vắng mặt',
  disqualification: 'Truất quyền thi đấu',
}

export default function MatchEndScreen({ state, onBack, onLogout }: Props) {
  const winner: SideId = state.result?.winner ?? (state.gamesWon.A >= state.gamesWon.B ? 'A' : 'B')
  const nameOf = (s: SideId) => state.sides[s].players.map(p => p.name).join(' / ')
  const winnerName = nameOf(winner)
  const resultType = state.result?.type ?? 'normal'
  const abnormal = resultType !== 'normal'

  return (
    <div className="fade-in" style={{
      height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--color-ink)', color: 'white', padding: '48px 24px',
      paddingBottom: 'max(40px, env(safe-area-inset-bottom))', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>
        Kết thúc trận đấu · {state.tournament}
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 18 }}>
          Người thắng
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px, 7.5vw, 46px)', color: 'var(--color-accent)', lineHeight: 1.1, margin: '0 auto 6px', maxWidth: '88vw' }}>
          {winnerName}
        </div>

        {abnormal ? (
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 24, color: 'var(--color-amber)' }}>
            {RESULT_LABEL[resultType]}
            {state.result?.note ? ` · ${state.result.note}` : ''}
          </div>
        ) : (
          <div style={{ fontSize: 14, opacity: 0.45, marginBottom: 36 }}>{state.gamesWon.A} – {state.gamesWon.B} ván</div>
        )}

        {!abnormal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            {state.completedGames.map((g, i) => {
              const aIsWinner = winner === 'A'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14 }}>
                  <span style={{ fontWeight: 700, opacity: aIsWinner ? 1 : 0.38, minWidth: 110, textAlign: 'right', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nameOf('A')}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, opacity: 0.9, minWidth: 64 }}>{g.A}–{g.B}</span>
                  <span style={{ fontWeight: 700, opacity: !aIsWinner ? 1 : 0.38, minWidth: 110, textAlign: 'left', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nameOf('B')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <div style={{ fontSize: 12, opacity: 0.5 }}>Kết quả đã được lưu lên hệ thống.</div>
        {onBack && (
          <button onClick={onBack} style={{ padding: '15px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 13, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            ← Về danh sách trận
          </button>
        )}
        {onLogout && (
          <button onClick={onLogout} style={{ padding: '11px', background: 'none', color: 'oklch(0.55 0.01 50)', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, cursor: 'pointer', opacity: 0.7 }}>
            Đăng xuất
          </button>
        )}
      </div>
    </div>
  )
}
