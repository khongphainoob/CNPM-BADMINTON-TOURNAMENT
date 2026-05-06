export function ShuttleMark({ size = 22, light = false }: { size?: number; light?: boolean }) {
  const stroke = light ? 'white' : 'var(--color-ink)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="16.5" r="3.2" fill="var(--color-accent)" />
      <path d="M12 13.5V3" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 3l-4 10.5" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12 3l4 10.5"  stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12 3l-1.8 11" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M12 3l1.8 11"  stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M7.5 13.5h9"   stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
