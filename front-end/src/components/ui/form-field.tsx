import * as React from 'react'
import { Label } from './label'
import { cn } from '../../lib/utils'

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Label className={error ? 'text-[var(--accent)]' : ''}>{label}</Label>
      {children}
      {error && <span className="text-[11px] text-[var(--accent)] mt-1">{error}</span>}
    </div>
  )
}
