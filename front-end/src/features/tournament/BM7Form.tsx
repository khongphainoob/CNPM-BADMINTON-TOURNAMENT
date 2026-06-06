import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { useToast } from '../../components/shared/Toast'
import { useStore } from '../../data/store'
import Icon from '../../components/shared/Icon'
import { tournamentApi } from '../../data/api'

const bm7Schema = z.object({
  label: z.string().min(1, 'Vui lòng nhập tên hạng mục'),
  contentType: z.enum(['singles', 'doubles', 'mixed_doubles']),
  gender: z.enum(['male', 'female', 'mixed', 'open']),
  ageGroup: z.string().optional(),
  maxParticipants: z.number().int().min(2, 'Ít nhất 2 VĐV').refine(v => v % 2 === 0, 'Phải là bội số của 2'),
  registrationStart: z.string().min(1, 'Chọn ngày mở đăng ký'),
  registrationEnd: z.string().min(1, 'Chọn ngày đóng đăng ký'),
}).refine(data => new Date(data.registrationStart) < new Date(data.registrationEnd), {
  message: 'Thời gian mở phải trước thời gian đóng',
  path: ['registrationEnd']
})

type BM7Data = z.infer<typeof bm7Schema>

export default function BM7Form() {
  const { tournament } = useStore()
  const { toast } = useToast()
  
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BM7Data>({
    resolver: zodResolver(bm7Schema),
  })

  const contentType = watch('contentType')

  const fetchEvents = async () => {
    if (!tournament?.id) return
    setLoading(true)
    try {
      const data = await tournamentApi.listEvents(tournament.id)
      setEvents(data)
      if (data.length > 0 && selectedEventId === null) {
        setSelectedEventId(data[0].id)
      }
    } catch (e) {
      toast('Lỗi khi tải hạng mục', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [tournament?.id])

  useEffect(() => {
    if (selectedEventId && selectedEventId !== 'new') {
      const evt = events.find(e => e.id === selectedEventId)
      if (evt) {
        reset({
          label: evt.label || evt.category_label || '',
          contentType: evt.content_type || (evt.is_doubles ? 'doubles' : 'singles'),
          gender: evt.gender || 'open',
          ageGroup: evt.age_group || '',
          maxParticipants: evt.max_participants || 64,
          registrationStart: evt.registration_start ? new Date(evt.registration_start).toISOString().slice(0, 16) : '',
          registrationEnd: evt.registration_end ? new Date(evt.registration_end).toISOString().slice(0, 16) : '',
        })
      }
    }
  }, [selectedEventId, events, reset])

  const onSubmit = async (data: BM7Data) => {
    if (!tournament?.id || !selectedEventId) return
    setSaving(true)
    try {
      if (selectedEventId === 'new') {
        await tournamentApi.createEvent(tournament.id, data)
        toast('Đã tạo hạng mục thi đấu mới')
      } else {
        await tournamentApi.updateEvent(tournament.id, selectedEventId, data)
        toast('Đã lưu cấu hình hạng mục thành công')
      }
      fetchEvents()
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi khi lưu cấu hình', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading && events.length === 0) {
    return <div className="p-4 text-center text-[var(--ink-3)]">Đang tải cấu hình...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 pb-2 bg-[var(--paper-2)] rounded-lg w-full overflow-x-auto scrollbar">
        {events.map(e => (
          <button
            key={e.id}
            type="button"
            onClick={() => setSelectedEventId(e.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              selectedEventId === e.id 
                ? 'bg-[var(--ink)] text-white shadow-sm' 
                : 'text-[var(--ink-2)] hover:bg-[var(--paper-3)]'
            }`}
          >
            {e.category_code} {e.label ? `- ${e.label}` : ''}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            if (events.length >= 10) return;
            setSelectedEventId('new');
            reset({
              label: '',
              contentType: 'singles',
              gender: 'open',
              ageGroup: '',
              maxParticipants: 64,
              registrationStart: '',
              registrationEnd: '',
            });
          }}
          disabled={events.length >= 10}
          title={events.length >= 10 ? 'Chỉ được phép cấu hình tối đa 10 hạng mục cho mỗi giải đấu' : ''}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            events.length >= 10
              ? 'bg-[var(--paper-3)] text-[var(--ink-3)] cursor-not-allowed opacity-60'
              : selectedEventId === 'new' 
                ? 'bg-[var(--court)] text-white shadow-sm' 
                : 'text-[var(--court)] hover:bg-[var(--paper-3)]'
          }`}
        >
          + Thêm hạng mục
        </button>
      </div>

      {!selectedEventId ? (
        <div className="text-center text-[var(--ink-3)] p-4">Vui lòng chọn một hạng mục để cấu hình.</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Tên hạng mục hiển thị *" error={errors.label?.message}>
            <Input {...register('label')} placeholder="Ví dụ: Đơn nam U21..." />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Loại nội dung *" error={errors.contentType?.message}>
              <Select {...register('contentType')}>
                <option value="singles">Đánh đơn</option>
                <option value="doubles">Đánh đôi</option>
                <option value="mixed_doubles">Đôi nam nữ</option>
              </Select>
            </FormField>
            
            <FormField label="Giới tính áp dụng *" error={errors.gender?.message}>
              <Select {...register('gender')}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="mixed">Nam & Nữ (Hỗn hợp)</option>
                <option value="open">Mở rộng (Không phân biệt)</option>
              </Select>
            </FormField>

            <FormField label="Nhóm tuổi" error={errors.ageGroup?.message}>
              <Input {...register('ageGroup')} placeholder="Vd: U21, 35+, Open..." />
            </FormField>
          </div>

          {(contentType === 'doubles' || contentType === 'mixed_doubles') && (
            <div className="p-3 bg-[var(--amber)] bg-opacity-10 border border-[var(--amber)] border-opacity-30 rounded-md flex gap-2 text-[13px] text-amber-700">
              <Icon name="alert-triangle" size={16} />
              <span>Yêu cầu VĐV phải khai báo đối tác (partner) khi đăng ký nội dung này.</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Số VĐV tối đa *" error={errors.maxParticipants?.message}>
              <Input type="number" {...register('maxParticipants', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Mở đăng ký lúc *" error={errors.registrationStart?.message}>
              <Input type="datetime-local" {...register('registrationStart')} />
            </FormField>
            <FormField label="Đóng đăng ký lúc *" error={errors.registrationEnd?.message}>
              <Input type="datetime-local" {...register('registrationEnd')} />
            </FormField>
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-[var(--line)]">
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : <><Icon name="check" size={14} className="mr-2" /> {selectedEventId === 'new' ? 'Tạo hạng mục' : 'Lưu cấu hình'}</>}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
