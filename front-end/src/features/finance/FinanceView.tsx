import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useStore, addTransaction } from '../../data/store'
import { useToast } from '../../components/shared/Toast'
import { StatCard } from '../../components/btc/BtcViews'
import { money, btnGhost, btnPrimary } from '../../components/shared/tokens'
import Icon from '../../components/shared/Icon'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'

const expenseSchema = z.object({
  name: z.string().min(1, 'Bắt buộc').max(300),
  invoiceNo: z.string().max(100).optional(),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  date: z.string().min(1, 'Bắt buộc').refine(val => new Date(val) <= new Date(), 'Ngày chi không thể ở tương lai'),
  method: z.enum(['cash', 'bank_transfer', 'card', 'other']),
  budgetLine: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid']),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

const BUDGET_LINES = [
  { id: 'venue', label: 'Thuê địa điểm', limit: 300_000_000 },
  { id: 'prizes', label: 'Giải thưởng', limit: 200_000_000 },
  { id: 'logistics', label: 'Vật tư & hậu cần', limit: 200_000_000 },
  { id: 'referees', label: 'Phí trọng tài', limit: 150_000_000 },
  { id: 'medical', label: 'Y tế & an ninh', limit: 50_000_000 },
  { id: 'media', label: 'Truyền thông', limit: 100_000_000 },
]

function ExpenseFormModal({ onClose, onSave }: { onClose: () => void, onSave: (data: ExpenseFormData) => void }) {
  const { transactions } = useStore()
  const { toast } = useToast()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      method: 'bank_transfer',
      status: 'draft'
    }
  })

  const amount = watch('amount') || 0
  const budgetLineId = watch('budgetLine')
  const budgetLine = BUDGET_LINES.find(b => b.id === budgetLineId)
  
  // Calculate actual spent from transactions
  const actualSpent = transactions
    .filter(t => t.budgetLine === budgetLineId && t.amt < 0)
    .reduce((sum, t) => sum + Math.abs(t.amt), 0)
  const totalAfter = actualSpent + amount
  const percentUsed = budgetLine ? (totalAfter / budgetLine.limit) * 100 : 0

  const isOverBudget = percentUsed >= 100
  const isWarningBudget = percentUsed >= 85 && percentUsed < 100

  const onSubmit = (data: ExpenseFormData) => {
    if (isOverBudget) {
      toast('⛔ Vượt ngân sách! Không thể thêm chi phí mới.', 'error')
      return
    }
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--paper)] rounded-xl w-[600px] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper-2)]">
          <h2 className="font-serif text-lg tracking-wide uppercase">Phiếu Nhập Chi Phí (BM24)</h2>
          <button onClick={onClose} className="text-[var(--ink-2)] hover:text-[var(--ink)]"><Icon name="x" size={20}/></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField label="Tên chi phí / Mô tả *" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Ví dụ: Mua thêm 10 thùng cầu lông" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số tiền (VNĐ) *" error={errors.amount?.message}>
              <Input type="number" {...register('amount', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Ngày chi *" error={errors.date?.message}>
              <Input type="date" {...register('date')} max={new Date().toISOString().split('T')[0]} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hạng mục ngân sách" error={errors.budgetLine?.message}>
              <Select {...register('budgetLine')}>
                <option value="">-- Chọn hạng mục --</option>
                {BUDGET_LINES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Phương thức *" error={errors.method?.message}>
              <Select {...register('method')}>
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="card">Thẻ tín dụng</option>
                <option value="other">Khác</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số hóa đơn (nếu có)" error={errors.invoiceNo?.message}>
              <Input {...register('invoiceNo')} placeholder="Ký hiệu HĐ..." />
            </FormField>
            <FormField label="Trạng thái *" error={errors.status?.message}>
              <Select {...register('status')}>
                <option value="draft">Bản nháp</option>
                <option value="submitted">Trình duyệt</option>
                <option value="paid">Đã thanh toán</option>
              </Select>
            </FormField>
          </div>

          {budgetLine && (
            <div className={`p-3 rounded-lg border text-sm mt-4 ${isOverBudget ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' : isWarningBudget ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-[var(--paper-2)] border-[var(--line)] text-[var(--ink-2)]'}`}>
              <div className="flex justify-between mb-1 font-semibold">
                <span>Ngân sách: {money(budgetLine.limit)}</span>
                <span>Đã dự chi: {percentUsed.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                <div className={`h-full ${isOverBudget ? 'bg-[var(--accent)]' : isWarningBudget ? 'bg-orange-500' : 'bg-[var(--court)]'}`} style={{ width: `${Math.min(percentUsed, 100)}%` }} />
              </div>
              {isOverBudget && <div className="mt-2 font-bold flex items-center gap-1"><Icon name="alert-triangle" size={14}/> ⛔ Vượt ngân sách! Không thể thêm chi phí mới.</div>}
              {isWarningBudget && <div className="mt-2 font-bold flex items-center gap-1"><Icon name="alert-circle" size={14}/> ⚠️ Cảnh báo: Đã sử dụng quá 85% ngân sách.</div>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
            <Button type="submit" disabled={isOverBudget}>Thêm chi phí</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function FinanceView() {
  const { transactions, tournament } = useStore()
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)

  const totalIn  = transactions.filter(r => r.amt > 0).reduce((s, r) => s + r.amt, 0)
  const totalOut = transactions.filter(r => r.amt < 0).reduce((s, r) => s + r.amt, 0)

  const categorySpent = BUDGET_LINES.map(line => {
    const spent = transactions
      .filter(t => t.budgetLine === line.id && t.amt < 0)
      .reduce((sum, t) => sum + Math.abs(t.amt), 0)
    const color = {
      venue: 'var(--ink)',
      prizes: 'var(--accent)',
      logistics: 'var(--court)',
      referees: 'var(--amber)',
      medical: 'var(--ink-3)',
      media: 'oklch(0.55 0.12 250)'
    }[line.id] || 'var(--ink-3)'
    
    return {
      label: line.label,
      spent,
      spentText: spent > 0 ? `${(spent / 1_000_000).toFixed(1)}M` : '0M',
      percent: Math.min(line.limit > 0 ? (spent / line.limit) * 100 : 0, 100),
      color
    }
  })

  const handleAddExpense = async (data: ExpenseFormData) => {
    await addTransaction({
      t: data.date,
      desc: data.name,
      cat: 'Chi',
      amt: -data.amount,
      invoiceNo: data.invoiceNo,
      method: data.method,
      budgetLine: data.budgetLine,
      status: data.status
    })
    setShowModal(false)
    toast('Đã thêm phiếu chi phí mới')
  }

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="flex justify-between items-end">
        <div>
          <div className="caps">Tài chính giải đấu</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>Ngân sách · Thu/Chi · Báo cáo</h1>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Thêm chi phí (BM24)</Button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Ngân sách giải"   value={money(tournament.budget)}  sub="được phê duyệt 15/03"/>
        <StatCard label="Tổng thu đến nay" value={money(totalIn)}             sub="lệ phí + tài trợ" accent="var(--court)"/>
        <StatCard label="Tổng chi đến nay" value={money(-totalOut)}           sub="vật tư + tổ chức + thưởng" accent="var(--accent)"/>
        <StatCard label="Cân đối"          value={money(totalIn + totalOut)}  sub="tính đến hôm nay"/>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Lịch sử giao dịch</h3>
            <div style={{ flex: 1 }}/>
            <button style={btnGhost} onClick={() => toast('Đang xuất PDF...', 'info')}><Icon name="pdf" size={13}/> Xuất PDF</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <tbody>

              {transactions.map((r, i) => (
                <tr key={`t-${i}`}>
                  <td className="mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)', color: 'var(--ink-3)', width: 90 }}>{r.t}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)' }}>{r.desc}</td>
                  <td className="mono" style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-2)', textAlign: 'right', fontWeight: 600, color: r.amt > 0 ? 'var(--court)' : 'var(--accent)' }}>
                    {r.amt > 0 ? '+' : ''}{money(r.amt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Cơ cấu chi phí</h3>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categorySpent.map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', fontSize: 12 }}><span>{item.label}</span><span style={{flex:1}}/><span className="mono">{item.spentText}</span></div>
                <div style={{ height: 4, background: 'var(--line-2)', borderRadius: 2, marginTop: 3 }}>
                  <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: 2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <ExpenseFormModal onClose={() => setShowModal(false)} onSave={handleAddExpense} />}
    </div>
  )
}
