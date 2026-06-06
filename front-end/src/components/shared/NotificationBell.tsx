import React, { useState, useEffect } from 'react'
import { notificationApi, participationApi } from '../../data/api'
import Icon from './Icon'
import { useToast } from './Toast'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const fetchNotifs = async () => {
    try {
      const res = await notificationApi.list()
      setNotifications(Array.isArray(res) ? res : (res?.data || []))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => n.status === 'unread').length

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
      setOpen(false)
    } catch (err: any) {
      toast(err.response?.data?.error?.message || 'Có lỗi xảy ra', 'error')
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
      >
        <Icon name="bell" size={16} />
        {unreadCount > 0 && (
          <div style={{ position: 'absolute', top: -2, right: -2, background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
            {unreadCount}
          </div>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 48, right: 0, width: 320, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 400 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', fontWeight: 700 }}>Thông báo</div>
          <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Không có thông báo mới</div>
            ) : (
              notifications.map(n => {
                const meta = n.meta ? (typeof n.meta === 'string' ? JSON.parse(n.meta) : n.meta) : {}
                const isInvite = meta.type === 'partner_invite'

                return (
                  <div key={n.id} style={{ padding: 16, borderBottom: '1px solid var(--line)', background: n.status === 'unread' ? 'var(--paper-2)' : 'transparent', opacity: n.status === 'unread' ? 1 : 0.6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{n.subject}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>{n.body}</div>
                    {isInvite && n.status === 'unread' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={() => handleAction(n, 'confirm')} style={{ flex: 1, padding: '6px 0', background: 'var(--ink)', color: 'white', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Đồng ý</button>
                        <button onClick={() => handleAction(n, 'reject')} style={{ flex: 1, padding: '6px 0', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Từ chối</button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
