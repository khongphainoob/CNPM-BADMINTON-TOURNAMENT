import React, { useState } from 'react'
import Icon from '../../components/shared/Icon'
import { money } from '../../components/shared/tokens'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'

type Props = {
  registration: { id: string; name: string; amount: number; event: string }
  onClose: () => void
  onPay: (data: any) => void
}

export default function PaymentModal({ registration, onClose, onPay }: Props) {
  const [method, setMethod] = useState('bank_transfer')
  const [txId, setTxId] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPay({
      method, txId,
      fileName: file?.name,
      amount: registration.amount
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--paper)] rounded-xl w-[480px] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper-2)]">
          <div>
            <div className="font-serif font-bold text-lg">Thanh toán Lệ phí (BM23)</div>
            <div className="text-xs text-[var(--ink-3)] mt-1">Mã hồ sơ: {registration.id}</div>
          </div>
          <button onClick={onClose} className="text-[var(--ink-2)] hover:text-[var(--ink)]"><Icon name="x" size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          
          {/* Readonly Info */}
          <div className="flex flex-col gap-3 bg-[var(--paper-2)] p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--ink-3)]">Người nộp:</span>
              <strong className="font-semibold">{registration.name}</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--ink-3)]">Nội dung thi đấu:</span>
              <span className="font-medium">{registration.event}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[var(--line-2)] pt-3 mt-1">
              <span className="text-[var(--ink-3)]">Số tiền cần nộp:</span>
              <strong className="text-xl text-[var(--accent)]">{money(registration.amount)}</strong>
            </div>
          </div>

          <div className="bg-[var(--accent-soft)] p-3 rounded-md flex flex-col gap-1 border border-red-100">
            <div className="text-[11px] font-bold text-red-700 uppercase mb-1">Thông tin chuyển khoản</div>
            <div className="text-[13px] flex justify-between"><span className="opacity-80">Ngân hàng:</span> <strong>Vietcombank</strong></div>
            <div className="text-[13px] flex justify-between"><span className="opacity-80">Số tài khoản:</span> <strong className="font-mono">0123456789</strong></div>
            <div className="text-[13px] flex justify-between"><span className="opacity-80">Nội dung CK:</span> <strong className="font-mono">{registration.id} LE PHI THI DAU</strong></div>
          </div>

          <FormField label="Phương thức thanh toán *">
            <Select value={method} onChange={e => setMethod(e.target.value)} required>
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              <option value="cash">Tiền mặt</option>
              <option value="e-wallet">Ví điện tử (Momo, ZaloPay)</option>
            </Select>
          </FormField>

          {(method === 'bank_transfer' || method === 'e-wallet') && (
            <>
              <FormField label="Mã giao dịch (TxID)">
                <Input 
                  value={txId} onChange={e => setTxId(e.target.value)}
                  placeholder="Nhập mã giao dịch..."
                />
              </FormField>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[var(--ink-2)] uppercase tracking-wider">Ảnh chứng từ / Biên lai *</label>
                <label className="border-2 border-dashed border-[var(--line)] rounded-lg p-4 text-center cursor-pointer bg-[var(--paper-2)] text-[var(--ink-3)] hover:bg-[var(--paper-3)] transition-colors">
                  <div className="flex justify-center mb-2"><Icon name="upload-cloud" size={24} /></div>
                  <div className="text-[13px]">{file ? file.name : 'Click để tải lên hình ảnh biên lai'}</div>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, application/pdf" 
                    className="hidden"
                    onChange={e => e.target.files && setFile(e.target.files[0])}
                    required
                  />
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[var(--line)]">
            <Button type="button" variant="ghost" onClick={onClose}>Huỷ</Button>
            <Button type="submit">Xác nhận thanh toán</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
