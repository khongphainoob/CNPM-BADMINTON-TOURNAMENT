import { createContext, useContext, useState, useCallback, useRef } from 'react'
import Icon from './Icon'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: number
  type: ToastType
  message: string
}

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  const iconMap: Record<ToastType, string> = {
    success: 'check',
    error: 'x',
    info: 'info',
  }

  const colorMap: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: 'oklch(0.93 0.06 160)', border: 'oklch(0.78 0.10 160)', icon: 'oklch(0.42 0.14 160)' },
    error:   { bg: 'oklch(0.96 0.04 25)',  border: 'oklch(0.80 0.10 25)',  icon: 'var(--accent)' },
    info:    { bg: 'oklch(0.94 0.04 250)', border: 'oklch(0.78 0.08 250)', icon: 'oklch(0.45 0.10 250)' },
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = colorMap[t.type]
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px',
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                boxShadow: '0 4px 16px oklch(0.10 0.02 260 / 0.15)',
                fontSize: 13, fontWeight: 500,
                pointerEvents: 'all',
                minWidth: 260, maxWidth: 400,
                animation: 'slideIn 0.18s ease',
              }}
            >
              <Icon name={iconMap[t.type]} size={14} style={{ color: c.icon, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--ink-3)', padding: 2, display: 'flex',
                }}
              >
                <Icon name="x" size={12} />
              </button>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  )
}
