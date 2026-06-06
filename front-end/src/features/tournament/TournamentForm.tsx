import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'

// ---- BM6: Phiếu Đăng ký Giải đấu (Khởi tạo sơ bộ) ----

const bm6Schema = z.object({
  name: z.string().min(5, 'Tên giải đấu tối thiểu 5 ký tự').max(200, 'Tối đa 200 ký tự'),
  slug: z.string().min(2, 'Slug tối thiểu 2 ký tự').regex(/^[a-z0-9-]+$/, 'Chỉ chứa chữ thường, số và dấu gạch ngang'),
  organizer: z.string().min(1, 'Vui lòng nhập đơn vị tổ chức').max(200, 'Tối đa 200 ký tự'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  location: z.string().min(1, 'Vui lòng nhập địa điểm tổ chức'),
  format: z.enum(['round_robin', 'single_elimination', 'group_knockout']),
  contactInfo: z.string().max(500, 'Thông tin liên hệ tối đa 500 ký tự').optional(),
  events: z.array(z.string()).optional()
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Ngày bắt đầu không thể sau ngày kết thúc',
  path: ['endDate']
})

type BM6Data = z.infer<typeof bm6Schema>

type Props = {
  initialData?: any
  onSave: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

export default function TournamentForm({ initialData, onSave, onCancel, loading }: Props) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<BM6Data>({
    resolver: zodResolver(bm6Schema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.code || '',
      organizer: initialData?.organizer || '',
      startDate: initialData?.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
      endDate: initialData?.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
      location: initialData?.venue_name || '',
      format: initialData?.format || 'single_elimination',
      contactInfo: initialData?.contactInfo || '',
      events: []
    }
  })

  const nameWatch = watch('name')
  const [autoSlug, setAutoSlug] = useState(true)

  // Reset form when initialData loads
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        slug: initialData.code || '',
        organizer: initialData.organizer || '',
        startDate: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
        endDate: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
        location: initialData.venue_name || '',
        format: initialData.format || 'single_elimination',
        contactInfo: initialData.contactInfo || '',
        events: []
      })
      setAutoSlug(false)
    }
  }, [initialData, reset])

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && nameWatch) {
      const slug = nameWatch
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-')
      setValue('slug', slug, { shouldValidate: true })
    }
  }, [nameWatch, autoSlug, setValue])

  return (
    <div className="bg-[var(--paper)] rounded-xl border border-[var(--line)] p-6">
      <div className="mb-6">
        <h2 className="font-serif font-bold text-xl uppercase tracking-wide">
          Khởi tạo Đề xuất Giải đấu (BM6)
        </h2>
        <div className="text-[13px] text-[var(--ink-2)] mt-1">
          Thiết lập thông tin sơ bộ ban đầu. Bạn có thể cấu hình chi tiết (BM10, BM11) sau khi khởi tạo thành công.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tên giải đấu *" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Giải cầu lông các nhóm tuổi..." />
          </FormField>
          <FormField label="Mã định danh (Slug) *" error={errors.slug?.message}>
            <Input {...register('slug')} onChange={e => { setAutoSlug(false); setValue('slug', e.target.value, {shouldValidate:true}) }} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Đơn vị tổ chức *" error={errors.organizer?.message}>
            <Input {...register('organizer')} placeholder="Liên đoàn cầu lông..." />
          </FormField>
          <FormField label="Địa điểm tổ chức *" error={errors.location?.message}>
            <Input {...register('location')} placeholder="Nhà thi đấu..." />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ngày bắt đầu *" error={errors.startDate?.message}>
            <Input type="date" {...register('startDate')} />
          </FormField>
          <FormField label="Ngày kết thúc *" error={errors.endDate?.message}>
            <Input type="date" {...register('endDate')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Thể thức thi đấu *" error={errors.format?.message}>
            <Select {...register('format')}>
              <option value="single_elimination">Loại trực tiếp (Single Elimination)</option>
              <option value="round_robin">Vòng tròn (Round Robin)</option>
              <option value="group_knockout">Vòng bảng + Knockout</option>
            </Select>
          </FormField>
          <FormField label="Thông tin liên hệ BTC" error={errors.contactInfo?.message}>
            <textarea 
              {...register('contactInfo')} 
              rows={2} 
              className="flex w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] resize-none"
              placeholder="Email, SĐT liên hệ giải đáp thắc mắc..."
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-[11px] font-semibold text-[var(--ink-2)] uppercase tracking-wider">
            Khởi tạo Hạng mục thi đấu sơ bộ
          </label>
          <div className="flex gap-4 flex-wrap">
            {[
              { id: 'MS', label: 'Đơn Nam' },
              { id: 'WS', label: 'Đơn Nữ' },
              { id: 'MD', label: 'Đôi Nam' },
              { id: 'WD', label: 'Đôi Nữ' },
              { id: 'XD', label: 'Đôi Nam Nữ' }
            ].map(cat => (
              <label key={cat.id} className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" value={cat.id} {...register('events')} />
                {cat.label} ({cat.id})
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--line)]">
          <Button type="button" variant="ghost" onClick={onCancel}>Huỷ</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang khởi tạo...' : 'Tạo Giải Đấu Mới'}
          </Button>
        </div>
      </form>
    </div>
  )
}
