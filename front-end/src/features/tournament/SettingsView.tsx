import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { useToast } from '../../components/shared/Toast'
import { useStore, updateTournamentName, updateTournamentVenue } from '../../data/store'
import Icon from '../../components/shared/Icon'
import BM7Form from './BM7Form'
import { tournamentApi, competitionApi } from '../../data/api'

const bm10Schema = z.object({
  name: z.string().min(5, 'Tên giải đấu phải từ 5 ký tự').max(200),
  slug: z.string().min(3).max(50),
  organizer: z.string().max(200),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  venue: z.string().min(1, 'Địa điểm không được để trống'),
  description: z.string().max(2000).optional(),
})

type BM10Data = z.infer<typeof bm10Schema>

function BM10Form() {
  const { tournament } = useStore()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<BM10Data>({
    resolver: zodResolver(bm10Schema),
    defaultValues: {
      name: tournament.name,
      slug: tournament.id.toLowerCase(),
      organizer: tournament.organizer || '', 
      startDate: tournament.start ? new Date(tournament.start).toISOString().split('T')[0] : '', 
      endDate: tournament.end ? new Date(tournament.end).toISOString().split('T')[0] : '',
      venue: tournament.venue,
      description: tournament.description || '',
    }
  })

  const onSubmit = async (data: BM10Data) => {
    try {
      await tournamentApi.update(tournament.id, {
        name: data.name,
        slug: data.slug,
        organizer: data.organizer,
        startDate: data.startDate,
        endDate: data.endDate,
        venue: data.venue,
        description: data.description,
      })
      updateTournamentName(data.name)
      updateTournamentVenue(data.venue)
      toast('Đã lưu thông tin cơ bản giải đấu (BM10)', 'success')
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi lưu thông tin giải đấu', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Tên giải đấu *" error={errors.name?.message}>
          <Input {...register('name')} placeholder="Nhập tên giải..." />
        </FormField>
        <FormField label="Mã định danh (Slug) *" error={errors.slug?.message}>
          <Input {...register('slug')} placeholder="vi-du-giai-dau" />
        </FormField>
      </div>

      <FormField label="Đơn vị tổ chức *" error={errors.organizer?.message}>
        <Input {...register('organizer')} placeholder="Nhập đơn vị tổ chức..." />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ngày bắt đầu *" error={errors.startDate?.message}>
          <Input type="date" {...register('startDate')} />
        </FormField>
        <FormField label="Ngày kết thúc *" error={errors.endDate?.message}>
          <Input type="date" {...register('endDate')} />
        </FormField>
      </div>

      <FormField label="Địa điểm tổ chức *" error={errors.venue?.message}>
        <Input {...register('venue')} placeholder="Nhập địa điểm..." />
      </FormField>

      <FormField label="Mô tả giải đấu" error={errors.description?.message}>
        <textarea
          {...register('description')}
          className="flex w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] resize-none"
          rows={4}
          placeholder="Thông tin thêm..."
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit"><Icon name="check" size={14} className="mr-2" /> Lưu Thông Tin</Button>
      </div>
    </form>
  )
}

const bm11Schema = z.object({
  format: z.enum(['round_robin', 'single_elimination', 'group_knockout']),
  sets: z.number().int().min(1).max(5),
  pointsPerSet: z.number().int().min(11).max(30),
})

type BM11Data = z.infer<typeof bm11Schema>

function BM11Form() {
  const { tournament } = useStore()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<BM11Data>({
    resolver: zodResolver(bm11Schema),
    defaultValues: {
      format: 'single_elimination',
      sets: 3,
      pointsPerSet: 21,
    }
  })

  const [status, setStatus] = useState<'draft' | 'confirmed'>('draft')

  const onSubmit = (data: BM11Data) => {
    setStatus('confirmed')
    toast('Đã xác nhận cấu hình thể thức (BM11)')
  }

  const handleGenerateBracket = async () => {
    if (status !== 'confirmed') return
    toast('Đang tạo sơ đồ thi đấu...', 'info')
    try {
      if (!tournament.events || tournament.events.length === 0) {
        toast('Không tìm thấy hạng mục nào để tạo sơ đồ', 'error')
        return
      }
      for (const ev of tournament.events) {
        await competitionApi.generateDraw(ev.id)
      }
      toast('Đã tạo sơ đồ thi đấu cho tất cả hạng mục thành công!', 'success')
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi tạo sơ đồ thi đấu', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3 bg-[var(--paper-2)] rounded-lg mb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-[var(--ink-2)] uppercase">Trạng thái cấu hình</div>
          <div className="font-medium mt-1">
            {status === 'draft' ? <span className="text-[var(--amber)]">Bản nháp</span> : <span className="text-[var(--court)]">Đã xác nhận</span>}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-[var(--ink-2)] uppercase">Sơ đồ thi đấu</div>
          <div className="font-medium mt-1">Chưa tạo</div>
        </div>
      </div>

      <FormField label="Kiểu đấu *" error={errors.format?.message}>
        <Select {...register('format')} disabled={status === 'confirmed'}>
          <option value="single_elimination">Loại trực tiếp (Single Elimination)</option>
          <option value="round_robin">Vòng tròn (Round Robin)</option>
          <option value="group_knockout">Vòng bảng + Knockout</option>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Số set mỗi trận *" error={errors.sets?.message}>
          <Input type="number" min={1} max={5} {...register('sets', { valueAsNumber: true })} disabled={status === 'confirmed'} />
        </FormField>
        <FormField label="Số điểm mỗi set *" error={errors.pointsPerSet?.message}>
          <Input type="number" min={11} max={30} {...register('pointsPerSet', { valueAsNumber: true })} disabled={status === 'confirmed'} />
        </FormField>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-[var(--line)]">
        <Button type="button" variant="outline" onClick={() => setStatus('draft')} disabled={status === 'draft'}>
          Chỉnh sửa lại
        </Button>
        <div className="flex gap-2">
          {status === 'draft' && (
            <Button type="submit"><Icon name="check" size={14} className="mr-2" /> Xác nhận cấu hình</Button>
          )}
          {status === 'confirmed' && (
            <Button type="button" onClick={handleGenerateBracket} className="bg-[var(--court)] hover:bg-[var(--court)] hover:opacity-90">
              <Icon name="git-branch" size={14} className="mr-2" /> Tạo sơ đồ thi đấu
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

function BM12Form() {
  const { tournament } = useStore()
  const { toast } = useToast()
  const [currentStatus, setCurrentStatus] = useState(tournament.status || 'draft')
  const [nextStatus, setNextStatus] = useState('')
  const [reason, setReason] = useState('')

  const handleUpdate = async () => {
    if (!nextStatus) return
    if (nextStatus === 'cancelled' && !reason.trim()) {
      toast('Vui lòng nhập lý do hủy giải', 'error')
      return
    }
    try {
      await tournamentApi.changeStatus(tournament.id, nextStatus)
      setCurrentStatus(nextStatus)
      setNextStatus('')
      setReason('')
      toast(`Đã cập nhật trạng thái giải đấu thành: ${nextStatus}`, 'success')
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi cập nhật trạng thái giải đấu', 'error')
    }
  }

  const statusLabels: Record<string, { label: string, color: string }> = {
    draft: { label: 'Bản nháp', color: 'var(--ink-3)' },
    open_registration: { label: 'Mở đăng ký', color: 'var(--court)' },
    ongoing: { label: 'Đang thi đấu', color: 'var(--accent)' },
    finished: { label: 'Kết thúc', color: 'oklch(0.5 0.2 300)' },
    cancelled: { label: 'Đã hủy', color: 'var(--accent)' }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-[var(--paper-2)] rounded-lg border border-[var(--line)]">
        <div>
          <div className="text-[11px] font-semibold text-[var(--ink-2)] uppercase">Trạng thái hiện tại</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: statusLabels[currentStatus]?.color }}></span>
            <span className="font-semibold">{statusLabels[currentStatus]?.label}</span>
          </div>
        </div>
      </div>

      <FormField label="Trạng thái chuyển sang *">
        <Select value={nextStatus} onChange={e => setNextStatus(e.target.value)}>
          <option value="">-- Chọn trạng thái mới --</option>
          {currentStatus === 'draft' && <option value="open_registration">Mở đăng ký</option>}
          {currentStatus === 'open_registration' && <option value="ongoing">Bắt đầu thi đấu</option>}
          {currentStatus === 'ongoing' && <option value="finished">Kết thúc giải</option>}
          <option value="cancelled">Hủy giải</option>
        </Select>
      </FormField>

      {nextStatus === 'cancelled' && (
        <FormField label="Lý do hủy *" error={!reason.trim() ? "Bắt buộc nhập lý do" : undefined}>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="flex w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] resize-none"
            rows={3}
            placeholder="Lý do..."
          />
        </FormField>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={handleUpdate} disabled={!nextStatus}>Cập nhật trạng thái</Button>
      </div>
    </div>
  )
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<'info' | 'format' | 'status'>('info')

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-1">Cài đặt giải đấu</div>
        <h1 className="text-2xl font-serif tracking-wide uppercase">Cấu hình chi tiết</h1>
      </div>

      <div className="flex gap-2 p-1 bg-[var(--paper-2)] rounded-lg w-fit mb-6">
        {[
          { id: 'info', label: 'Thông tin chung (BM10)' },
          { id: 'events', label: 'Hạng mục (BM7)' },
          { id: 'format', label: 'Thể thức (BM11)' },
          { id: 'status', label: 'Trạng thái (BM12)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id 
                ? 'bg-[var(--ink)] text-white' 
                : 'text-[var(--ink-2)] hover:bg-[var(--paper-3)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-6 shadow-sm">
        {activeTab === 'info' && <BM10Form />}
        {activeTab === 'events' && <BM7Form />}
        {activeTab === 'format' && <BM11Form />}
        {activeTab === 'status' && <BM12Form />}
      </div>
    </div>
  )
}
