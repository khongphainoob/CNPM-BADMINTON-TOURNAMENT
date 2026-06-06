import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

// ---- BM8: Team Registration Form ----

const teamSchema = z.object({
  clubName: z.string().min(2, 'Tên CLB tối thiểu 2 ký tự').max(200),
  clubCode: z.string().min(2, 'Mã tối thiểu 2 ký tự').max(20).regex(/^[A-Za-z0-9]+$/, 'Chỉ chứa chữ và số'),
  leaderName: z.string().min(2, 'Tên trưởng đoàn tối thiểu 2 ký tự').max(100),
  leaderPhone: z.string().regex(/^(0[3-9]\d{8})$/, 'Số điện thoại VN không hợp lệ'),
  leaderEmail: z.string().email('Email không hợp lệ'),
  logo: z.any().optional(),
  notes: z.string().max(500, 'Tối đa 500 ký tự').optional()
})

type TeamData = z.infer<typeof teamSchema>

type Props = {
  onSubmit: (data: TeamData) => void
  onCancel: () => void
  loading?: boolean
}

export default function TeamRegistrationForm({ onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<TeamData>({
    resolver: zodResolver(teamSchema)
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Chỉ hỗ trợ JPG hoặc PNG')
      e.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo không vượt quá 2MB')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-[var(--paper)] rounded-xl border border-[var(--line)] p-6 max-w-[600px] mx-auto">
      <div className="mb-6">
        <h2 className="font-serif font-bold text-xl uppercase tracking-wide">
          Đăng ký đoàn thi đấu / CLB
        </h2>
        <div className="text-[13px] text-[var(--ink-2)] mt-1">
          Điền thông tin dành cho Trưởng đoàn (BM8)
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <FormField label="Tên CLB / Đơn vị *" error={errors.clubName?.message}>
              <Input {...register('clubName')} placeholder="Ví dụ: CLB Cầu lông Hồ Chí Minh" />
            </FormField>
          </div>
          <FormField label="Mã CLB / Tỉnh *" error={errors.clubCode?.message}>
            <Input {...register('clubCode')} placeholder="HCM" />
          </FormField>
        </div>

        <FormField label="Họ tên Trưởng đoàn *" error={errors.leaderName?.message}>
          <Input {...register('leaderName')} placeholder="Nhập họ tên đầy đủ" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email liên hệ *" error={errors.leaderEmail?.message}>
            <Input type="email" {...register('leaderEmail')} placeholder="email@example.com" />
          </FormField>
          <FormField label="SĐT liên hệ *" error={errors.leaderPhone?.message}>
            <Input type="tel" {...register('leaderPhone')} placeholder="09xxxxxxxx" />
          </FormField>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[var(--ink-2)] uppercase tracking-wider">
            Logo CLB (Không bắt buộc)
          </label>
          <div className="flex items-center gap-4 mt-1">
            <div className="w-16 h-16 bg-[var(--paper-2)] border border-dashed border-[var(--line)] rounded-full overflow-hidden flex items-center justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-[var(--ink-3)]">Logo</span>
              )}
            </div>
            <input type="file" accept="image/jpeg,image/png" {...register('logo')} onChange={handleLogoChange} className="text-xs text-[var(--ink-2)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--paper-2)] file:text-[var(--ink)] hover:file:bg-[var(--line-2)] cursor-pointer" />
          </div>
        </div>

        <FormField label="Ghi chú" error={errors.notes?.message}>
          <textarea 
            {...register('notes')} 
            rows={3} 
            placeholder="Ghi chú thêm..." 
            className="flex w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] resize-none"
          />
        </FormField>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--line)]">
          <Button type="button" variant="ghost" onClick={onCancel}>Huỷ bỏ</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Đăng ký đoàn'}
          </Button>
        </div>
      </form>
    </div>
  )
}
