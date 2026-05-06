import type React from 'react'

export const btnGhost: React.CSSProperties = {
  background: 'var(--paper)', border: '1px solid var(--line)',
  padding: '7px 11px', borderRadius: 6, fontSize: 12,
  display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink)',
  cursor: 'pointer', fontFamily: 'inherit',
}

export const btnPrimary: React.CSSProperties = {
  background: 'var(--ink)', color: 'white', border: 0,
  padding: '7px 11px', borderRadius: 6, fontSize: 12,
  display: 'inline-flex', alignItems: 'center', gap: 6,
  cursor: 'pointer', fontFamily: 'inherit',
}

export function money(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + '\u00A0tr'
  return n.toLocaleString('vi-VN') + '\u00A0₫'
}
