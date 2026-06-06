import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Icon from '../../components/shared/Icon'

// ---- BM11: Format Configuration Form ----

const formatSchema = z.object({
  formatType: z.enum(['round_robin', 'single_elimination', 'group_knockout']),
  sets: z.number().refine(val => [1, 3, 5].includes(val), 'Số set phải là 1, 3 hoặc 5'),
  pointsPerSet: z.number().min(11).max(30)
})

type FormatData = z.infer<typeof formatSchema>

type Props = {
  eventId: string
  eventName: string
  tournamentName: string
  initialData?: any
  status: 'draft' | 'confirmed'
  hasBracket: boolean
  onSaveDraft: (data: FormatData) => void
  onConfirm: (data: FormatData) => void
  onGenerateBracket: () => void
  onReset: () => void
  loading?: boolean
}

export default function FormatForm({
  eventName, tournamentName, initialData, status, hasBracket,
  onSaveDraft, onConfirm, onGenerateBracket, onReset, loading
}: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormatData>({
    resolver: zodResolver(formatSchema),
    defaultValues: {
      formatType: initialData?.formatType || 'single_elimination',
      sets: initialData?.sets || 3,
      pointsPerSet: initialData?.pointsPerSet || 21
    }
  })

  const setsWatch = watch('sets')

  const submitDraft = (data: FormatData) => onSaveDraft(data)
  const submitConfirm = (data: FormatData) => onConfirm(data)

  const isConfirmed = status === 'confirmed'

  return (
    <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, textTransform: 'uppercase' }}>
            Cấu hình thể thức thi đấu
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            Hạng mục: <strong>{eventName}</strong> &middot; Giải: <strong>{tournamentName}</strong>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ 
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: isConfirmed ? 'oklch(0.93 0.06 160)' : 'var(--paper-2)',
            color: isConfirmed ? 'oklch(0.42 0.14 160)' : 'var(--ink-2)',
            border: isConfirmed ? 'none' : '1px solid var(--line)'
          }}>
            {isConfirmed ? 'Đã xác nhận' : 'Bản nháp'}
          </span>
          <span style={{ 
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: hasBracket ? 'oklch(0.95 0.04 250)' : 'var(--paper-2)',
            color: hasBracket ? 'oklch(0.45 0.04 250)' : 'var(--ink-2)',
            border: hasBracket ? 'none' : '1px solid var(--line)'
          }}>
            {hasBracket ? 'Sơ đồ: Đã tạo' : 'Sơ đồ: Chưa có'}
          </span>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Kiểu đấu *</label>
            <select {...register('formatType')} disabled={isConfirmed} style={inputStyle(!!errors.formatType, isConfirmed)}>
              <option value="single_elimination">Loại trực tiếp (Knockout)</option>
              <option value="round_robin">Vòng tròn tính điểm</option>
              <option value="group_knockout">Vòng bảng & Knockout</option>
            </select>
            {errors.formatType && <span style={errorStyle}>{errors.formatType.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số set tối đa *</label>
            <div style={{ display: 'flex', gap: 8, height: 38 }}>
              {[1, 3, 5].map(val => (
                <label key={val} style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isConfirmed ? 'default' : 'pointer',
                  borderRadius: 6, border: '1px solid', fontSize: 13, fontWeight: 500,
                  borderColor: setsWatch === val ? 'var(--ink)' : 'var(--line)',
                  background: setsWatch === val ? 'var(--ink)' : isConfirmed ? 'var(--paper-2)' : 'var(--paper)',
                  color: setsWatch === val ? 'white' : isConfirmed ? 'var(--ink-3)' : 'var(--ink-2)',
                  opacity: (isConfirmed && setsWatch !== val) ? 0.5 : 1
                }}>
                  <input type="radio" value={val} {...register('sets', { valueAsNumber: true })} disabled={isConfirmed} style={{ display: 'none' }} />
                  {val} set
                </label>
              ))}
            </div>
            {errors.sets && <span style={errorStyle}>{errors.sets.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số điểm mỗi set *</label>
            <input type="number" {...register('pointsPerSet', { valueAsNumber: true })} disabled={isConfirmed} min={11} max={30} style={inputStyle(!!errors.pointsPerSet, isConfirmed)} />
            {errors.pointsPerSet && <span style={errorStyle}>{errors.pointsPerSet.message}</span>}
          </div>
        </div>

        {isConfirmed ? (
          <div style={{ padding: '16px', borderRadius: 8, background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Icon name="lock" size={16} color="var(--ink-2)" />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Cấu hình đã bị khoá</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
              Bạn cần reset về trạng thái nháp để thay đổi. 
              {hasBracket && <strong style={{ color: 'var(--accent)' }}> Cảnh báo: Việc này sẽ xoá sơ đồ thi đấu hiện tại!</strong>}
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={onReset} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Thay đổi (Reset về bản nháp)
              </button>
              {!hasBracket && (
                <button type="button" onClick={onGenerateBracket} disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}>
                  {loading ? 'Đang tạo...' : 'Tạo sơ đồ thi đấu'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <button type="button" onClick={handleSubmit(submitDraft)} disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper-2)', fontSize: 13, fontWeight: 500, cursor: loading ? 'default' : 'pointer' }}>
              Lưu nháp
            </button>
            <button type="button" onClick={handleSubmit(submitConfirm)} disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}>
              Xác nhận cấu hình
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

const inputStyle = (error: boolean, disabled: boolean) => ({
  padding: '8px 12px', borderRadius: 6, height: 38, boxSizing: 'border-box' as const,
  border: error ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
  background: disabled ? 'var(--paper-2)' : 'var(--paper)',
  color: disabled ? 'var(--ink-3)' : 'var(--ink)',
  fontSize: 13, outline: 'none'
})

const errorStyle = { fontSize: 11, color: 'var(--accent)' }
