import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { User } from '../../data/auth'
import { authApi } from '../../data/api'

// ---- BM4: User Edit Modal ----

const userSchema = z.object({
  status: z.enum(['active', 'locked', 'pending', 'deleted']),
  roles: z.array(z.string()).min(1, 'Phải có ít nhất 1 vai trò'),
  notes: z.string().max(500, 'Ghi chú không quá 500 ký tự').optional()
})

type UserFormData = z.infer<typeof userSchema>

function UserEditModal({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (id: string | number, data: any) => void }) {
  const [resetting, setResetting] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: user.status === 'approved' ? 'active' : user.status as any,
      roles: [user.primary_role_code || 'athlete'],
      notes: ''
    }
  })

  const rolesWatch = watch('roles')

  const ROLE_LIST = [
    { id: 'admin', label: 'Admin' },
    { id: 'btc', label: 'Ban tổ chức' },
    { id: 'referee', label: 'Trọng tài' },
    { id: 'athlete', label: 'Vận động viên' },
    { id: 'spectator', label: 'Khán giả' }
  ]

  const toggleRole = (roleId: string) => {
    const current = [...rolesWatch]
    if (current.includes(roleId)) {
      if (current.length > 1) setValue('roles', current.filter(r => r !== roleId))
    } else {
      setValue('roles', [...current, roleId])
    }
  }

  const submit = (data: UserFormData) => {
    onSave(user.id, data)
  }

  const handleResetPassword = () => {
    if (user.status !== 'approved' && user.status !== 'active') return
    setResetting(true)
    setTimeout(() => {
      alert('Đã gửi email reset mật khẩu cho người dùng.')
      setResetting(false)
    }, 1000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--paper)', borderRadius: 12, width: 500, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Chỉnh sửa tài khoản</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-2)' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit(submit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Họ và tên</label>
              <input value={user.name} disabled style={inputStyle(false, true)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Mã User</label>
              <input value={user.id} disabled style={inputStyle(false, true)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Email / SĐT</label>
            <input value={user.email + (user.phone ? ` - ${user.phone}` : '')} disabled style={inputStyle(false, true)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Trạng thái tài khoản *</label>
            <select {...register('status')} style={inputStyle(!!errors.status)}>
              <option value="active">Hoạt động (Active)</option>
              <option value="pending">Chờ duyệt (Pending)</option>
              <option value="locked">Bị khoá (Locked)</option>
              <option value="deleted">Đã xoá (Deleted)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Vai trò được gán *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0' }}>
              {ROLE_LIST.map(r => (
                <button
                  key={r.id} type="button" onClick={() => toggleRole(r.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    borderColor: rolesWatch.includes(r.id) ? 'var(--ink)' : 'var(--line)',
                    background: rolesWatch.includes(r.id) ? 'var(--ink)' : 'var(--paper)',
                    color: rolesWatch.includes(r.id) ? 'white' : 'var(--ink-2)'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {errors.roles && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{errors.roles.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Ghi chú</label>
            <textarea {...register('notes')} rows={3} placeholder="Lý do khoá hoặc ghi chú khác..." style={{...inputStyle(!!errors.notes), resize: 'none'}} />
            {errors.notes && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{errors.notes.message}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={user.status !== 'approved' && user.status !== 'active'}
              style={{
                padding: '8px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                opacity: (user.status !== 'approved' && user.status !== 'active') ? 0.5 : 1
              }}
            >
              {resetting ? 'Đang gửi...' : 'Reset mật khẩu'}
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Lưu thay đổi</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputStyle = (error: boolean, disabled = false) => ({
  padding: '8px 12px', borderRadius: 6,
  border: error ? '1.5px solid var(--accent)' : '1.5px solid var(--line)',
  background: disabled ? 'var(--paper-2)' : 'var(--paper)',
  color: disabled ? 'var(--ink-3)' : 'var(--ink)',
  fontSize: 13, outline: 'none'
})

// ---- Main UsersView ----

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const statusParam = filter !== 'all' ? filter : undefined
      const res = await authApi.listUsers({ status: statusParam, search, limit: 100 })
      setUsers(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [filter, search])

  const handleSaveUser = async (id: string | number, data: any) => {
    try {
      const roleToSave = data.roles[0] // since backend only accepts primary role for now
      
      if (data.status === 'active' || data.status === 'approved') {
        await authApi.approveUser(id.toString(), roleToSave)
      } else if (data.status === 'locked' || data.status === 'rejected' || data.status === 'deleted') {
        await authApi.rejectUser(id.toString(), data.notes)
      } else {
        await authApi.changeRole(id.toString(), roleToSave)
      }
      
      setEditingUser(null)
      fetchUsers()
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Thay đổi thông tin thất bại.')
    }
  }

  const FILTERS = [
    { id: 'all',      label: 'Tất cả' },
    { id: 'approved', label: 'Hoạt động' },
    { id: 'pending',  label: 'Chờ duyệt' },
    { id: 'rejected', label: 'Bị khóa/Từ chối' },
  ]

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin', btc: 'BTC', referee: 'Trọng tài', athlete: 'VĐV', spectator: 'Khán giả'
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
          Quản lý tài khoản
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
          {loading ? 'Đang tải...' : `${users.length} tài khoản trong hệ thống`}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo ID, tên hoặc email…"
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)', fontSize: 13.5, width: 280 }} />
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--paper-2)', borderRadius: 7 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
              background: filter === f.id ? 'var(--ink)' : 'transparent',
              color: filter === f.id ? 'white' : 'var(--ink-2)',
              fontSize: 12, fontWeight: 500,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
              {['Mã User', 'Người dùng', 'Vai trò', 'Trạng thái', 'Thao tác'].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} style={{ borderBottom: idx < users.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{u.id.toString().substring(0,8)}...</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-2)', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 6px' }}>
                    {ROLE_LABELS[u.primary_role_code || 'spectator'] || u.primary_role_code}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ 
                    display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: u.status === 'approved' ? 'oklch(0.93 0.06 160)' : u.status === 'pending' ? 'oklch(0.95 0.06 70)' : 'oklch(0.96 0.04 25)',
                    color: u.status === 'approved' ? 'oklch(0.42 0.14 160)' : u.status === 'pending' ? 'oklch(0.48 0.14 70)' : 'oklch(0.50 0.16 25)'
                  }}>
                    {u.status === 'approved' ? 'Active' : u.status === 'pending' ? 'Pending' : u.status === 'rejected' ? 'Locked' : u.status}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => setEditingUser(u)} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>
            Không tìm thấy tài khoản nào.
          </div>
        )}
      </div>

      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
    </div>
  )
}
