import { useState, useEffect } from 'react'
import ApprovalModal from './ApprovalModal'
import ReceiveRegistrationModal from './ReceiveRegistrationModal'
import AthleteSearchView from './AthleteSearchView'
import EventParticipantsView from './EventParticipantsView'
import Icon from '../../components/shared/Icon'
import { participationApi } from '../../data/api'
import { useToast } from '../../components/shared/Toast'

export default function RegistrationHubView() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'online' | 'offline' | 'search' | 'events'>('online')
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Approval Modal (BM14)
  const [approvalTarget, setApprovalTarget] = useState<any>(null)
  
  // Receive Modal (BM9)
  const [receiveTarget, setReceiveTarget] = useState<any>(null)

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const res = await participationApi.listAllParticipants({ limit: 100 })
      setRegistrations(res.data)
    } catch (err) {
      console.error('Failed to fetch registrations', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const handleApproveSave = async (decision: string, reason?: string) => {
    try {
      const status = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'supplement_required'
      await participationApi.updateStatus(approvalTarget.id, status)
      toast('Đã phê duyệt hồ sơ thành công!', 'success')
      setApprovalTarget(null)
      fetchRegistrations()
    } catch (err: any) {
      console.error('Lỗi khi xử lý hồ sơ', err)
      toast(err.response?.data?.error?.message || 'Lỗi khi xử lý hồ sơ', 'error')
    }
  }

  const handleReceiveSave = async (status: string, notes: string) => {
    try {
      await participationApi.updateStatus(receiveTarget.id, status)
      toast(`Đã tiếp nhận hồ sơ ${receiveTarget.id}`, 'success')
      setReceiveTarget(null)
      fetchRegistrations()
    } catch (err: any) {
      toast(err.response?.data?.error?.message || 'Lỗi khi tiếp nhận hồ sơ', 'error')
    }
  }

  // Split online vs offline logic if we had a flag. For now just show all in both for demonstration
  // or show pending in online and approved in offline, etc.
  // Actually, we'll just show all in online tab for now as 'online regs'
  const onlineRegs = registrations.filter(r => r.status === 'registered')
  const offlineRegs = registrations.filter(r => r.status !== 'registered')

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
          Quản lý Đăng ký & Hồ sơ
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
          Tiếp nhận, xét duyệt và tra cứu thông tin VĐV
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--line)' }}>
        <button
          onClick={() => setActiveTab('online')}
          style={{ padding: '12px 0', fontWeight: activeTab === 'online' ? 600 : 500, color: activeTab === 'online' ? 'var(--ink)' : 'var(--ink-2)', borderBottom: activeTab === 'online' ? '2px solid var(--ink)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          Tiếp nhận Đăng ký Trực tuyến (BM9)
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          style={{ padding: '12px 0', fontWeight: activeTab === 'offline' ? 600 : 500, color: activeTab === 'offline' ? 'var(--ink)' : 'var(--ink-2)', borderBottom: activeTab === 'offline' ? '2px solid var(--ink)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          Tiếp nhận Hồ sơ offline (BM8)
        </button>
        <button
          onClick={() => setActiveTab('search')}
          style={{ padding: '12px 0', fontWeight: activeTab === 'search' ? 600 : 500, color: activeTab === 'search' ? 'var(--ink)' : 'var(--ink-2)', borderBottom: activeTab === 'search' ? '2px solid var(--ink)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          Tra cứu / Điều chỉnh Hồ sơ VĐV (BM15)
        </button>
        <button
          onClick={() => setActiveTab('events')}
          style={{ padding: '12px 0', fontWeight: activeTab === 'events' ? 600 : 500, color: activeTab === 'events' ? 'var(--ink)' : 'var(--ink-2)', borderBottom: activeTab === 'events' ? '2px solid var(--ink)' : '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          Theo Nội dung thi đấu
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'online' && (
          <div style={{ background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--line)', overflowX: 'auto' }} className="scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Mã HS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Vận động viên</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Đoàn / CLB</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Hạng mục</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>Đang tải...</td></tr>
                ) : onlineRegs.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>Không có hồ sơ nào</td></tr>
                ) : onlineRegs.map(reg => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                    <td className="mono" style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>REG-{reg.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{reg.player_name}</td>
                    <td style={{ padding: '12px 16px' }}>{reg.club_name || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>{reg.category_code}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: reg.status === 'registered' ? 'oklch(0.95 0.04 250)' : 'oklch(0.97 0.05 80)',
                        color: reg.status === 'registered' ? 'oklch(0.45 0.14 250)' : 'oklch(0.48 0.14 70)'
                      }}>
                        {reg.status === 'registered' ? 'Chờ duyệt' : reg.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => setApprovalTarget(reg)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                        Duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'offline' && (
          <div style={{ background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--line)', overflowX: 'auto' }} className="scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Mã HS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Vận động viên</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Đoàn / CLB</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Hạng mục</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, textAlign: 'right' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>Đang tải...</td></tr>
                ) : offlineRegs.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>Không có hồ sơ nào</td></tr>
                ) : offlineRegs.map(reg => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
                    <td className="mono" style={{ padding: '12px 16px', color: 'var(--ink-2)' }}>REG-{reg.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{reg.player_name}</td>
                    <td style={{ padding: '12px 16px' }}>{reg.club_name || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>{reg.category_code}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: 'oklch(0.95 0.04 150)', color: 'oklch(0.40 0.14 150)'
                      }}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'search' && (
          <div style={{ height: '100%', margin: '-24px -32px', padding: '24px 32px' }}>
            <AthleteSearchView />
          </div>
        )}

        {activeTab === 'events' && (
          <div style={{ height: '100%', margin: '-24px -32px', padding: '24px 32px' }}>
            <EventParticipantsView />
          </div>
        )}
      </div>

      {approvalTarget && <ApprovalModal registration={{ ...approvalTarget, cccd: approvalTarget.player_code, eventName: approvalTarget.category_code, athleteName: approvalTarget.player_name }} currentUser="Ban tổ chức" onClose={() => setApprovalTarget(null)} onSave={handleApproveSave} />}
      {receiveTarget && <ReceiveRegistrationModal registration={{ ...receiveTarget, teamName: receiveTarget.club_name, athleteName: receiveTarget.player_name, eventName: receiveTarget.category_code }} currentUser="Nhân viên tiếp nhận" onClose={() => setReceiveTarget(null)} onSave={handleReceiveSave} />}
    </div>
  )
}
