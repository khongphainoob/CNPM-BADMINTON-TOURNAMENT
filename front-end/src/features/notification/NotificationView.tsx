import React, { useState, useEffect } from 'react'
import { notificationApi, participationApi } from '../../data/api'
import { useToast } from '../../components/shared/Toast'

export default function NotificationView() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchNotifs = async () => {
    setLoading(true)
    try {
      const res = await notificationApi.list()
      setNotifications(Array.isArray(res) ? res : (res?.data || []))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const handleAction = async (n: any, action: 'confirm' | 'reject') => {
    try {
      const meta = n.meta ? (typeof n.meta === 'string' ? JSON.parse(n.meta) : n.meta) : {}
      if (!meta.participantId) {
        return toast('Dữ liệu không hợp lệ', 'error')
      }
      if (action === 'confirm') {
        await participationApi.confirmPartner(meta.participantId)
        toast('Đã xác nhận thành công')
      } else {
        await participationApi.rejectPartner(meta.participantId)
        toast('Đã từ chối lời mời')
      }
      await notificationApi.markRead(n.id)
      fetchNotifs()
    } catch (err: any) {
      toast(err.response?.data?.error?.message || 'Có lỗi xảy ra', 'error')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <h1 className="serif" style={{ fontSize: 28, marginBottom: 24 }}>Thông báo</h1>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        {loading && notifications.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Bạn không có thông báo nào.</div>
        ) : (
          notifications.map(n => {
            const meta = n.meta ? (typeof n.meta === 'string' ? JSON.parse(n.meta) : n.meta) : {}
            const isInvite = meta.type === 'partner_invite'

            return (
              <div key={n.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', background: n.status === 'unread' ? 'var(--paper-2)' : 'transparent', opacity: n.status === 'unread' ? 1 : 0.7, display: 'flex', gap: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.status === 'unread' ? 'var(--accent)' : 'transparent', marginTop: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: 'var(--ink)' }}>{n.subject}</div>
                  <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: isInvite && n.status === 'unread' ? 16 : 0 }}>{n.body}</div>
                  {isInvite && n.status === 'unread' && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => handleAction(n, 'confirm')} style={{ padding: '8px 24px', background: 'var(--ink)', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Đồng ý</button>
                      <button onClick={() => handleAction(n, 'reject')} style={{ padding: '8px 24px', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Từ chối</button>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {new Date(n.sent_at || n.created_at || Date.now()).toLocaleDateString('vi-VN')}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
