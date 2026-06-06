import { useState, useMemo } from 'react'
import Icon from '../../components/shared/Icon'
import { money } from '../../components/shared/tokens'

// Mock Budget Lines
const BUDGET_LINES = [
  { id: 'BL_01', name: 'Thuê sân bãi', planned: 50000000, spent: 48000000 }, // 96% -> Cảnh báo
  { id: 'BL_02', name: 'Giải thưởng', planned: 100000000, spent: 0 },
  { id: 'BL_03', name: 'Nhân sự trọng tài', planned: 20000000, spent: 10000000 }, // 50%
  { id: 'BL_04', name: 'Vật tư (Cầu)', planned: 15000000, spent: 16000000 }, // 106% -> Vượt ngân sách
]

type Props = {
  onClose: () => void
  onSave: (data: any) => void
}

export default function ExpenseForm({ onClose, onSave }: Props) {
  const [desc, setDesc] = useState('')
  const [invoice, setInvoice] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState('bank_transfer')
  const [budgetLineId, setBudgetLineId] = useState('')
  const [status, setStatus] = useState('draft')

  const selectedBudget = useMemo(() => BUDGET_LINES.find(b => b.id === budgetLineId), [budgetLineId])
  
  // Validation
  let percentSpent = 0
  let isWarning = false
  let isOverBudget = false

  if (selectedBudget && amount) {
    const numAmount = Number(amount) || 0
    const newSpent = selectedBudget.spent + numAmount
    percentSpent = (newSpent / selectedBudget.planned) * 100
    
    if (percentSpent >= 100) isOverBudget = true
    else if (percentSpent >= 85) isWarning = true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isOverBudget) return
    onSave({
      desc, invoice, amount: Number(amount), date, method, budgetLineId, status
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--paper)', borderRadius: 12, width: 600, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Nhập Chi phí Tổ chức (BM24)</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Mã phiếu: EXP-{Math.random().toString(36).substring(2,8).toUpperCase()}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Hạng mục ngân sách *</label>
              <select 
                value={budgetLineId} onChange={e => setBudgetLineId(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
                required
              >
                <option value="">-- Chọn hạng mục --</option>
                {BUDGET_LINES.map(b => (
                  <option key={b.id} value={b.id}>{b.name} (NS: {money(b.planned)})</option>
                ))}
              </select>
            </div>

            {selectedBudget && (
              <div style={{ gridColumn: '1 / -1', padding: '12px 16px', background: 'var(--paper-2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: 'var(--ink-3)' }}>Đã chi: <strong>{money(selectedBudget.spent)}</strong></span>
                  <span style={{ color: 'var(--ink-3)' }}>Ngân sách: <strong>{money(selectedBudget.planned)}</strong></span>
                </div>
                <div style={{ height: 6, background: 'var(--line-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((selectedBudget.spent / selectedBudget.planned) * 100, 100)}%`, background: selectedBudget.spent > selectedBudget.planned ? 'var(--amber)' : 'var(--ink)' }} />
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Tên chi phí / Mô tả *</label>
              <input 
                value={desc} onChange={e => setDesc(e.target.value)} maxLength={300}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
                required placeholder="VD: Thanh toán tiền thuê sân đợt 2"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số tiền (VNĐ) *</label>
              <input 
                type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
                required placeholder="0"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Số hóa đơn</label>
              <input 
                value={invoice} onChange={e => setInvoice(e.target.value)} maxLength={100}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
                placeholder="VD: HD-12345"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Ngày chi *</label>
              <input 
                type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Phương thức *</label>
              <select 
                value={method} onChange={e => setMethod(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
              >
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="cash">Tiền mặt</option>
                <option value="card">Thẻ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Cảnh báo (Warnings) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isOverBudget && (
              <div style={{ padding: '10px 14px', background: 'oklch(0.96 0.04 25)', color: 'var(--accent)', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alert-triangle" size={16} /> Vượt ngân sách! Không thể thêm chi phí này vì tổng chi sẽ là {money(selectedBudget!.spent + Number(amount))} (Ngân sách: {money(selectedBudget!.planned)}).
              </div>
            )}
            {isWarning && !isOverBudget && (
              <div style={{ padding: '10px 14px', background: 'var(--amber-soft)', color: 'var(--amber)', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alert-triangle" size={16} /> Chú ý: Đã sử dụng {percentSpent.toFixed(1)}% ngân sách hạng mục này.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper-2)', fontSize: 12, outline: 'none', color: 'var(--ink-2)' }}>
                <option value="draft">Bản nháp (Draft)</option>
                <option value="submitted">Trình duyệt (Submitted)</option>
                <option value="paid">Đã thanh toán (Paid)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button type="submit" disabled={isOverBudget} style={{ 
                padding: '8px 20px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, 
                cursor: isOverBudget ? 'default' : 'pointer',
                opacity: isOverBudget ? 0.5 : 1 
              }}>
                Lưu chi phí
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
