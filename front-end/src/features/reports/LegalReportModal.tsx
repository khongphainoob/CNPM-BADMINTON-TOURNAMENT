import { useState, useEffect } from 'react'
import Icon from '../../components/shared/Icon'
import { useStore } from '../../data/store'

type Props = {
  onClose: () => void
  onSave: (data: any) => void
}

export default function LegalReportModal({ onClose, onSave }: Props) {
  const { tournament } = useStore()
  const [reportType, setReportType] = useState('summary')
  const [template, setTemplate] = useState('tpl_01')
  const [note, setNote] = useState('')
  const [docId, setDocId] = useState('')
  
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'submitted'>('idle')
  const [progress, setProgress] = useState(0)

  const handleGenerate = () => {
    setStatus('generating')
    setProgress(0)
    
    // Simulate generation 2-3 seconds
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setStatus('ready')
          return 100
        }
        return p + 20
      })
    }, 400)
  }

  const handleDownload = () => {
    // Fake download
    const link = document.createElement('a')
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1DMyA1Fyom5qXmJuYmaebm1pUlF9aVKyXnF+UB2SYg1gA6cQMugplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjQ4CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L0ZvbnQ8PC9GMCA0IDAgUj4+Pj4vQ29udGVudHMgMiAwIFIvUGFyZW50IDUgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sxIDAgUl0+PgplbmRvYmoKCjYgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDUgMCBSPj4KZW5kb2JqCgp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDAxNyAwMDAwMCBuIAowMDAwMDAwMTA2IDAwMDAwIG4gCjAwMDAwMDAyMjMgMDAwMDAgbiAKMDAwMDAwMDI3OCAwMDAwMCBuIAowMDAwMDAwMzI5IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgNiAwIFI+PgpzdGFydHhyZWYKMzc4CiUlRU9GCg=='
    link.download = `Bao_Cao_${reportType}_${new Date().getTime()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ reportType, template, note, docId, status: 'submitted' })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--paper)', borderRadius: 12, width: 560, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Trích xuất Báo cáo Pháp lý (BM25)</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Biểu mẫu gửi Liên đoàn Cầu lông</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)' }}>✕</button>
        </div>
        
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Giải đấu</label>
              <input 
                value={tournament.name} readOnly disabled
                style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper-2)', color: 'var(--ink-2)', fontSize: 14, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Loại báo cáo *</label>
              <select 
                value={reportType} onChange={e => setReportType(e.target.value)} disabled={status !== 'idle'}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
              >
                <option value="summary">Báo cáo Tổng kết</option>
                <option value="financial">Báo cáo Tài chính</option>
                <option value="attendance">Danh sách VĐV tham dự</option>
                <option value="other">Báo cáo khác</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Template</label>
              <select 
                value={template} onChange={e => setTemplate(e.target.value)} disabled={status !== 'idle'}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
              >
                <option value="tpl_01">Template Chuẩn LĐ VN</option>
                <option value="tpl_02">Template Nội bộ</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Ghi chú / Tham số phụ</label>
              <textarea 
                value={note} onChange={e => setNote(e.target.value)} disabled={status !== 'idle'}
                rows={2} placeholder="Nhập thêm thông tin cần thiết vào báo cáo..."
                style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none', resize: 'none' }}
              />
            </div>
          </div>

          {/* Action Area */}
          <div style={{ background: 'var(--paper-2)', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {status === 'idle' && (
              <button onClick={handleGenerate} style={{ width: '100%', padding: '12px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Khởi tạo Báo cáo
              </button>
            )}

            {status === 'generating' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>
                  <span>Đang trích xuất dữ liệu...</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            {(status === 'ready' || status === 'submitted') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--court)', fontWeight: 600, fontSize: 13 }}>
                  <Icon name="check-circle" size={16} /> Báo cáo đã sẵn sàng
                </div>
                <button onClick={handleDownload} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="dl" size={14} /> Tải xuống PDF
                </button>
              </div>
            )}
          </div>

          {(status === 'ready' || status === 'submitted') && (
             <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Mã Công văn / Nơi nhận *</label>
                  <input 
                    value={docId} onChange={e => setDocId(e.target.value)}
                    placeholder="VD: CV-1234/LĐCL" required disabled={status === 'submitted'}
                    style={{ padding: '10px 12px', borderRadius: 6, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 14, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={status === 'submitted'} style={{ 
                    padding: '10px 24px', borderRadius: 6, border: 'none', background: 'oklch(0.38 0.14 148)', color: 'white', fontSize: 13, fontWeight: 600, 
                    cursor: status === 'submitted' ? 'default' : 'pointer', opacity: status === 'submitted' ? 0.5 : 1 
                  }}>
                    {status === 'submitted' ? 'Đã nộp báo cáo' : 'Đánh dấu đã nộp (Submit)'}
                  </button>
                </div>
             </form>
          )}

        </div>
      </div>
    </div>
  )
}
