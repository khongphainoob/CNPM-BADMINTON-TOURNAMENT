import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Icon from '../../components/shared/Icon'

// ---- BM7: Event Settings Form ----

const eventSchema = z.object({
  categoryCode: z.enum(['MS', 'WS', 'MD', 'WD', 'XD']),
  label: z.string().optional(),
  maxSets: z.number().int().min(1).max(5),
  pointsPerSet: z.number().int().min(11).max(30),
  contentType: z.enum(['singles', 'doubles', 'mixed']).optional(),
  gender: z.enum(['male', 'female', 'mixed']).optional(),
  ageGroup: z.string().optional(),
  maxParticipants: z.number().int().min(2).default(64),
  registrationStart: z.string().optional(),
  registrationEnd: z.string().optional()
})

type EventData = z.infer<typeof eventSchema>

type Props = {
  initialData?: any
  tournamentName?: string
  onSave: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function EventForm({ initialData, tournamentName, onSave, onCancel, loading }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EventData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      categoryCode: initialData?.category_code || 'MS',
      label: initialData?.label || '',
      maxSets: initialData?.max_sets || 3,
      pointsPerSet: initialData?.points_per_set || 21,
      contentType: initialData?.content_type || 'singles',
      gender: initialData?.gender || 'male',
      ageGroup: initialData?.age_group || '',
      maxParticipants: initialData?.max_participants || 64,
      registrationStart: initialData?.registration_start ? new Date(initialData.registration_start).toISOString().slice(0, 16) : '',
      registrationEnd: initialData?.registration_end ? new Date(initialData.registration_end).toISOString().slice(0, 16) : ''
    }
  })

  const typeWatch = watch('categoryCode')
  const contentTypeWatch = watch('contentType')

  return (
    <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, textTransform: 'uppercase' }}>
          {initialData ? 'Chỉnh sửa hạng mục' : 'Thêm hạng mục mới'}
        </div>
        {tournamentName && <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Giải đấu: <strong>{tournamentName}</strong></div>}
      </div>

      {(typeWatch === 'MD' || typeWatch === 'WD' || typeWatch === 'XD' || contentTypeWatch === 'doubles' || contentTypeWatch === 'mixed') && (
        <div style={{ padding: '10px 14px', borderRadius: 6, background: 'var(--paper-2)', borderLeft: '3px solid var(--amber)', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon name="alert-triangle" size={16} color="var(--amber)" />
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            Hạng mục đánh đôi: Yêu cầu vận động viên <strong>phải khai báo đối tác</strong> khi đăng ký tham gia.
            {(typeWatch === 'XD' || contentTypeWatch === 'mixed') && ' Hệ thống sẽ kiểm tra bắt buộc phải là một nam và một nữ.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Loại Nội Dung *</label>
            <select {...register('categoryCode')} style={inputStyle(!!errors.categoryCode)}>
              <option value="MS">Đơn Nam (MS)</option>
              <option value="WS">Đơn Nữ (WS)</option>
              <option value="MD">Đôi Nam (MD)</option>
              <option value="WD">Đôi Nữ (WD)</option>
              <option value="XD">Đôi Nam Nữ (XD)</option>
            </select>
            {errors.categoryCode && <span style={errorStyle}>{errors.categoryCode.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Tên/Mô tả phụ (Không bắt buộc)</label>
            <input {...register('label')} placeholder="Ví dụ: U21, Chuyên nghiệp..." style={inputStyle(!!errors.label)} />
            {errors.label && <span style={errorStyle}>{errors.label.message}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số ván đấu (Sets) *</label>
            <input type="number" {...register('maxSets', { valueAsNumber: true })} style={inputStyle(!!errors.maxSets)} />
            {errors.maxSets && <span style={errorStyle}>{errors.maxSets.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Điểm mỗi ván *</label>
            <input type="number" {...register('pointsPerSet', { valueAsNumber: true })} style={inputStyle(!!errors.pointsPerSet)} />
            {errors.pointsPerSet && <span style={errorStyle}>{errors.pointsPerSet.message}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Hình thức thi đấu</label>
            <select {...register('contentType')} style={inputStyle(!!errors.contentType)}>
              <option value="singles">Đánh đơn</option>
              <option value="doubles">Đánh đôi</option>
              <option value="mixed">Đôi nam nữ</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Giới tính</label>
            <select {...register('gender')} style={inputStyle(!!errors.gender)}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="mixed">Hỗn hợp</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Nhóm tuổi</label>
            <input {...register('ageGroup')} placeholder="Ví dụ: U21, Open" style={inputStyle(!!errors.ageGroup)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số lượng tối đa *</label>
            <input type="number" {...register('maxParticipants', { valueAsNumber: true })} style={inputStyle(!!errors.maxParticipants)} />
            {errors.maxParticipants && <span style={errorStyle}>{errors.maxParticipants.message}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Bắt đầu đăng ký</label>
            <input type="datetime-local" {...register('registrationStart')} style={inputStyle(!!errors.registrationStart)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Kết thúc đăng ký</label>
            <input type="datetime-local" {...register('registrationEnd')} style={inputStyle(!!errors.registrationEnd)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}>
            {loading ? 'Đang lưu...' : 'Lưu cấu hình Hạng mục'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputStyle = (error: boolean) => ({
  padding: '8px 12px', borderRadius: 6,
  border: error ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
  background: 'var(--paper)', color: 'var(--ink)', fontSize: 13, outline: 'none'
})

const errorStyle = { fontSize: 11, color: 'var(--accent)' }
