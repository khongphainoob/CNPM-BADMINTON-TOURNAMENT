import React, { useState, useEffect } from 'react'
import { peopleApi, tournamentApi, participationApi } from '../../data/api'
import { TOURNAMENT_STATUS } from '../../data/constants'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import TeamRegistrationForm from './TeamRegistrationForm'
import { useToast } from '../../components/shared/Toast'

export default function TeamDashboardView({ me }: { me: any }) {
  const { toast } = useToast()
  const [clubs, setClubs] = useState<any[]>([])
  const [myClub, setMyClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTour, setSelectedTour] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])

  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberCccd, setNewMemberCccd] = useState('')

  // Đăng ký thi đấu
  const [showRegModal, setShowRegModal] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('')
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Giả sử lấy danh sách Club, nếu me.clubId trùng thì đó là club của mình
      const clubRes = await peopleApi.listClubs()
      setClubs(clubRes)
      if (me.clubId) {
        const found = clubRes.find((c: any) => c.id === me.clubId)
        setMyClub(found || null)
        // Fetch team members if we had an API. For now, fetch all players and filter.
        const playersRes = await peopleApi.listPlayers({ clubId: me.clubId })
        setTeamMembers(playersRes.data || [])
      }

      const tourRes = await tournamentApi.list({})
      setTournaments(tourRes.filter((t: any) => t.status === 'live' || t.status === 'open_registration'))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleCreateClub = async (data: any) => {
    try {
      const res = await peopleApi.createClub(data)
      toast('Đăng ký đoàn thành công!', 'success')
      // Update my profile to link to this club
      if (me.dbId) {
        await peopleApi.updatePlayer(me.dbId, { clubId: res.id })
      }
      window.location.reload()
    } catch (e: any) {
      toast(e.response?.data?.error?.message || 'Lỗi đăng ký đoàn', 'error')
    }
  }

  const handleAddMember = async () => {
    if (!newMemberName || !newMemberCccd) return toast('Vui lòng nhập đủ tên và CCCD', 'error')
    try {
      await peopleApi.createPlayer({
        name: newMemberName,
        cccd: newMemberCccd,
        clubId: myClub.id,
        gender: 'M'
      })
      toast('Thêm thành viên thành công!', 'success')
      setShowAddMember(false)
      loadData()
    } catch (e: any) {
      toast('Lỗi: ' + (e.response?.data?.error?.message || e.message), 'error')
    }
  }

  const handleSelectTour = async (t: any) => {
    setSelectedTour(t)
    try {
      const evs = await tournamentApi.listEvents(t.id)
      setEvents(evs)
    } catch (e) {
      console.error(e)
    }
  }

  const handleRegister = async () => {
    if (!selectedEventId || !selectedAthleteId) return toast('Vui lòng chọn VĐV và Nội dung', 'error')
    
    // Tìm event để xem có phải đánh đôi không
    const ev = events.find(e => String(e.id) === String(selectedEventId))
    if (ev?.is_doubles && !selectedPartnerId) {
      return toast('Nội dung đánh đôi yêu cầu phải chọn Partner!', 'error')
    }

    try {
      await participationApi.register(selectedEventId, {
        playerId: Number(selectedAthleteId),
        partnerId: selectedPartnerId ? Number(selectedPartnerId) : undefined
      })
      toast(`Đăng ký thành công cho VĐV vào nội dung ${ev?.label}!`, 'success')
      setShowRegModal(false)
    } catch (e: any) {
      toast('Lỗi: ' + (e.response?.data?.error?.message || e.message), 'error')
    }
  }

  if (loading) return <div>Đang tải thông tin đội...</div>

  if (!myClub) {
    return (
      <div>
        <h2 className="font-serif text-2xl mb-4">Quản lý Đội / Đoàn</h2>
        <div className="bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] mb-6">
          <p className="text-[var(--ink-2)] mb-4">Bạn chưa quản lý đoàn thi đấu nào. Bạn có muốn đăng ký một đoàn mới không? Sau khi đăng ký, bạn sẽ trở thành Trưởng đoàn của đơn vị này.</p>
          <TeamRegistrationForm 
            onSubmit={handleCreateClub} 
            onCancel={() => {}} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <div className="text-[11px] font-bold text-[var(--accent)] uppercase mb-1">Tài khoản Trưởng đoàn</div>
        <h1 className="font-serif text-3xl mb-1">{myClub.name}</h1>
        <div className="text-[var(--ink-2)] text-sm">Mã đoàn: {myClub.code}</div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Danh sách thành viên */}
        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Danh sách VĐV trong đoàn</h3>
            <Button size="sm" onClick={() => setShowAddMember(!showAddMember)}>+ Thêm VĐV</Button>
          </div>

          {showAddMember && (
            <div className="mb-4 p-4 bg-[var(--paper-2)] rounded-lg border border-[var(--line)] flex flex-col gap-3">
              <Input placeholder="Họ và tên VĐV" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
              <Input placeholder="CCCD / CMND" value={newMemberCccd} onChange={e => setNewMemberCccd(e.target.value)} />
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddMember(false)}>Hủy</Button>
                <Button size="sm" onClick={handleAddMember}>Lưu</Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {teamMembers.length === 0 && <div className="text-sm text-[var(--ink-3)]">Đoàn chưa có thành viên nào.</div>}
            {teamMembers.map(m => (
              <div key={m.id} className="flex justify-between items-center p-3 border border-[var(--line-2)] rounded-lg text-sm">
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-[var(--ink-3)]">CCCD: {m.cccd || 'Chưa cập nhật'}</div>
                </div>
                <div className="px-2 py-1 bg-[var(--line)] rounded text-xs">Điểm: {m.rating || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Đăng ký giải đấu */}
        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-5">
          <h3 className="font-bold mb-4">Đăng ký Giải đấu</h3>
          
          <div className="flex flex-col gap-4">
            <FormField label="Chọn giải đấu">
              <select 
                className="w-full p-2 border border-[var(--line)] rounded-md bg-[var(--paper)]"
                onChange={e => {
                  const t = tournaments.find(x => String(x.id) === e.target.value)
                  if (t) handleSelectTour(t)
                }}
                value={selectedTour?.id || ''}
              >
                <option value="">-- Chọn giải đấu đang mở --</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} - [{TOURNAMENT_STATUS[t.status]?.label || t.status}]
                  </option>
                ))}
              </select>
            </FormField>

            {selectedTour && selectedTour.status !== 'open_registration' && selectedTour.status !== 'upcoming' && (
              <div className="mt-2 p-4 bg-[var(--paper-2)] rounded-lg border border-[var(--line)] text-sm text-[var(--ink-2)]">
                Giải đấu này hiện đang ở trạng thái <strong>{TOURNAMENT_STATUS[selectedTour.status]?.label}</strong> và không cho phép đăng ký mới.
              </div>
            )}

            {selectedTour && (selectedTour.status === 'open_registration' || selectedTour.status === 'upcoming') && (
              <div className="mt-2 p-4 bg-[var(--amber-soft)] rounded-lg border border-[var(--amber)]">
                <div className="text-sm font-semibold mb-2">Đăng ký nội dung cho VĐV</div>
                <Button className="w-full" onClick={() => setShowRegModal(true)}>Tiến hành Đăng ký (BM13)</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--paper)] p-6 rounded-xl w-full max-w-md shadow-lg border border-[var(--line)]">
            <h3 className="font-serif text-xl mb-4">Đăng ký Nội dung</h3>
            
            <div className="flex flex-col gap-4">
              <FormField label="Chọn Vận động viên">
                <select className="w-full p-2 border rounded bg-white" value={selectedAthleteId} onChange={e => setSelectedAthleteId(e.target.value)}>
                  <option value="">-- Chọn VĐV trong đoàn --</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </FormField>

              <FormField label="Chọn Hạng mục thi đấu">
                <select className="w-full p-2 border rounded bg-white" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                  <option value="">-- Chọn Nội dung --</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.label} {e.is_doubles ? '(Đôi)' : '(Đơn)'}</option>)}
                </select>
              </FormField>

              {events.find(e => String(e.id) === String(selectedEventId))?.is_doubles && (
                <FormField label="Chọn Partner (VĐV Đánh cặp)">
                  <select className="w-full p-2 border rounded bg-white" value={selectedPartnerId} onChange={e => setSelectedPartnerId(e.target.value)}>
                    <option value="">-- Chọn Partner --</option>
                    {teamMembers.filter(m => String(m.id) !== selectedAthleteId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <div className="text-xs text-[var(--amber)] mt-1">Nội dung đánh đôi bắt buộc chọn Partner.</div>
                </FormField>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--line)]">
              <Button variant="ghost" onClick={() => setShowRegModal(false)}>Hủy bỏ</Button>
              <Button onClick={handleRegister}>Đăng ký ngay</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
