import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// ---- BM13: Athlete Registration Form ----

const registrationSchema = z.object({
  cccd: z.string().regex(/^\d{12}$/, 'CCCD phải gồm đúng 12 chữ số'),
  photo: z.any().optional(),
  eventId: z.string().min(1, 'Vui lòng chọn hạng mục thi đấu'),
  partnerId: z.string().optional()
})

type RegistrationData = z.infer<typeof registrationSchema>

type Props = {
  currentUser: { name: string; email: string }
  availableEvents: { id: string; name: string; type: string }[]
  availablePartners: { id: string; name: string; email: string }[]
  onSubmit: (data: RegistrationData) => void
  onCancel: () => void
  loading?: boolean
}

export default function RegistrationForm({ currentUser, availableEvents, availablePartners, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { eventId: '' }
  })

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const eventIdWatch = watch('eventId')

  const selectedEvent = availableEvents.find(e => e.id === eventIdWatch)
  const isDoubles = selectedEvent?.type === 'doubles' || selectedEvent?.type === 'mixed_doubles'

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Chỉ hỗ trợ ảnh JPG hoặc PNG')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không vượt quá 5MB')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const submit = (data: RegistrationData) => {
    if (isDoubles && !data.partnerId) {
      alert('Vui lòng chọn VĐV đối tác cho nội dung đánh đôi!')
      return
    }
    onSubmit(data)
  }

  return (
    <div style={{ background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, textTransform: 'uppercase' }}>
          Đăng ký tham dự giải đấu
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
          Điền thông tin hồ sơ vận động viên (BM13)
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Họ và tên VĐV</label>
            <input value={currentUser.name} disabled style={inputStyle(false, true)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Email nhận xác nhận</label>
            <input value={currentUser.email} disabled style={inputStyle(false, true)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số Căn cước công dân *</label>
            <input {...register('cccd')} placeholder="Gồm 12 chữ số" style={inputStyle(!!errors.cccd)} />
            {errors.cccd && <span style={errorStyle}>{errors.cccd.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Ảnh thẻ 3x4 *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 64, background: 'var(--paper-2)', border: '1px dashed var(--line)', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photoPreview ? <img src={photoPreview} alt="3x4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>Ảnh</span>}
              </div>
              <input type="file" accept="image/jpeg,image/png" {...register('photo')} onChange={handlePhotoChange} style={{ fontSize: 11, width: 140 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Hạng mục thi đấu *</label>
          <select {...register('eventId')} style={inputStyle(!!errors.eventId)}>
            <option value="" disabled>-- Chọn hạng mục --</option>
            {availableEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          {errors.eventId && <span style={errorStyle}>{errors.eventId.message}</span>}
        </div>

        {isDoubles && (
          <div style={{ padding: '16px', borderRadius: 8, background: 'var(--paper-2)', border: '1px solid var(--amber)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>
              Nội dung đánh đôi yêu cầu VĐV đối tác
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Chọn VĐV đối tác *</label>
              <select {...register('partnerId')} style={inputStyle(false)}>
                <option value="">-- Tìm và chọn VĐV đối tác --</option>
                {availablePartners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid var(--line)', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ bỏ</button>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer' }}>
            {loading ? 'Đang gửi...' : 'Nộp hồ sơ'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputStyle = (error: boolean, disabled = false) => ({
  padding: '10px 14px', borderRadius: 6,
  border: error ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
  background: disabled ? 'var(--paper-2)' : 'var(--paper)',
  color: disabled ? 'var(--ink-3)' : 'var(--ink)',
  fontSize: 13, outline: 'none'
})

const errorStyle = { fontSize: 11, color: 'var(--accent)' }
