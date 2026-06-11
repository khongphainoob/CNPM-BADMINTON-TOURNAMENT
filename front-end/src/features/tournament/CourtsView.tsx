import React, { useState, useEffect } from 'react'
import { tournamentApi } from '../../data/api'
import { useStore } from '../../data/store'
import Icon from '../../components/shared/Icon'
import Modal from '../../components/shared/Modal'
import { btnPrimary, btnGhost } from '../../components/shared/tokens'
import { useToast } from '../../components/shared/Toast'

export function CourtsView() {
  const { tournament, liveMatches } = useStore()
  const { toast } = useToast()
  
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<any>(null)
  
  // Form State
  const [label, setLabel] = useState('')
  const [floor, setFloor] = useState('Taraflex')
  const [status, setStatus] = useState('idle')

  const fetchCourts = async () => {
    if (!tournament?.id) return
    try {
      const data = await tournamentApi.listCourts(tournament.id)
      setCourts(data)
    } catch (err) {
      console.error(err)
      toast('Lỗi khi tải danh sách sân', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourts()
  }, [tournament?.id])

  const openAdd = () => {
    setEditingCourt(null)
    setLabel(`Sân ${courts.length + 1}`)
    setFloor('Taraflex')
    setStatus('idle')
    setModalOpen(true)
  }

  const openEdit = (c: any) => {
    setEditingCourt(c)
    setLabel(c.label)
    setFloor(c.floor || 'Taraflex')
    setStatus(c.status)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!label.trim()) return toast('Vui lòng nhập tên sân', 'error')
    try {
      if (editingCourt) {
        await tournamentApi.updateCourt(tournament.id, editingCourt.id, { label, floor })
        if (editingCourt.status !== status) {
          await tournamentApi.updateCourtStatus(tournament.id, editingCourt.id, status)
        }
        toast('Cập nhật sân thành công')
      } else {
        await tournamentApi.createCourt(tournament.id, { label, floor, status })
        toast('Thêm sân mới thành công')
      }
      setModalOpen(false)
      fetchCourts()
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi khi lưu sân', 'error')
    }
  }

  const handleDelete = async (courtId: string | number) => {
    if (!confirm('Bạn có chắc muốn xóa sân này?')) return
    try {
      await tournamentApi.deleteCourt(tournament.id, courtId)
      toast('Đã xóa sân')
      fetchCourts()
    } catch (e: any) {
      toast('Không thể xóa sân đang có dữ liệu thi đấu', 'error')
    }
  }

  const toggleStatus = async (courtId: string | number, currentStatus: string) => {
    // Only toggle between idle and maintenance manually
    if (currentStatus === 'live') {
      return toast('Không thể đổi trạng thái sân đang diễn ra trận đấu!', 'error')
    }
    const nextStatus = currentStatus === 'idle' ? 'maintenance' : 'idle'
    try {
      await tournamentApi.updateCourtStatus(tournament.id, courtId, nextStatus)
      fetchCourts()
    } catch (e) {
      toast('Lỗi khi đổi trạng thái', 'error')
    }
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--ink-2)' }}>Đang tải danh sách sân...</div>

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="caps">Sân & điều phối</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
            {courts.length} Sân · {tournament?.name}
          </h1>
        </div>
        <button style={btnPrimary} onClick={openAdd}><Icon name="plus" size={13}/> Thêm sân</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {courts.map(c => {
          const live = liveMatches?.find(m => m.court === c.id)
          return (
            <div key={c.id} style={{ background: c.status === 'live' ? 'var(--ink)' : 'var(--paper)', color: c.status === 'live' ? 'white' : 'var(--ink)', border: '1px solid ' + (c.status === 'live' ? 'var(--ink)' : 'var(--line)'), borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid ' + (c.status === 'live' ? 'oklch(0.28 0.01 250)' : 'var(--line)') }}>
                <div>
                  <div className="caps" style={{ opacity: 0.7 }}>SÂN</div>
                  <div className="serif" style={{ fontSize: 24 }}>{c.label}</div>
                </div>
                {c.status === 'live'        && <span className="pill live"><span className="dot live-dot"/>LIVE</span>}
                {c.status === 'idle'        && <button className="pill" onClick={() => toggleStatus(c.id, c.status)} style={{ cursor: 'pointer', border: '1px solid var(--line)' }}>Trống</button>}
                {c.status === 'maintenance' && <button className="pill warn" onClick={() => toggleStatus(c.id, c.status)} style={{ cursor: 'pointer', border: '1px solid var(--amber)' }}>Bảo trì</button>}
              </div>
              <div style={{ padding: 12, height: 110, position: 'relative', background: c.status === 'live' ? 'oklch(0.24 0.01 250)' : 'var(--paper-2)' }}>
                <div style={{ position: 'absolute', inset: 12, border: '1px solid ' + (c.status === 'live' ? 'oklch(0.4 0.01 250)' : 'var(--line)'), borderRadius: 3 }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: c.status === 'live' ? 'oklch(0.4 0.01 250)' : 'var(--line)' }}/>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: c.status === 'live' ? 'oklch(0.4 0.01 250)' : 'var(--line)' }}/>
                </div>
                {live && (
                  <div className="mono" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, letterSpacing: '-0.02em' }}>
                    {live.sets[live.current][0]} : {live.sets[live.current][1]}
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 14px', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {live ? (
                    <>
                      <div style={{ opacity: 0.7, fontSize: 10.5 }} className="caps">{live.round} · {live.cat}</div>
                      <div style={{ marginTop: 3 }}>{live.a.name}</div>
                      <div style={{ opacity: 0.7 }}>vs {live.b.name}</div>
                    </>
                  ) : c.status === 'idle' ? (
                    <div style={{ color: 'var(--ink-3)' }}>Thảm {c.floor} — chưa xếp lịch</div>
                  ) : (
                    <div style={{ color: 'var(--ink-2)' }}>Đang bảo trì/sửa chữa</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(c)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-3)' }}><Icon name="edit" size={14}/></button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--amber)' }}><Icon name="x" size={14}/></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <Modal title={editingCourt ? 'Sửa thông tin sân' : 'Thêm sân thi đấu'} onClose={() => setModalOpen(false)}>
          
          <div style={{ marginBottom: 12 }}>
            <label className="caps" style={{ display: 'block', marginBottom: 6 }}>Tên sân/Ký hiệu</label>
            <input className="input" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ví dụ: Sân 1, Sân Trung Tâm" />
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <label className="caps" style={{ display: 'block', marginBottom: 6 }}>Loại thảm</label>
            <select className="input" value={floor} onChange={e => setFloor(e.target.value)}>
              <option value="Taraflex">Taraflex</option>
              <option value="Nhựa PVC">Nhựa PVC</option>
              <option value="Sàn gỗ">Sàn gỗ</option>
            </select>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label className="caps" style={{ display: 'block', marginBottom: 6 }}>Trạng thái</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value)} disabled={status === 'live'}>
              <option value="idle">Sẵn sàng (Trống)</option>
              <option value="maintenance">Đang bảo trì</option>
              {status === 'live' && <option value="live">Đang thi đấu</option>}
            </select>
            {status === 'live' && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>Không thể đổi trạng thái thủ công khi sân đang có trận đấu.</div>}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button style={btnGhost} onClick={() => setModalOpen(false)}>Hủy</button>
            <button style={btnPrimary} onClick={handleSave}>Lưu sân</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
