import { useState, useEffect } from 'react'
import { tournamentApi } from '../../data/api'
import { setActiveTournament } from '../../data/store'
import { TOURNAMENT_STATUS } from '../../data/constants'
import Icon from '../../components/shared/Icon'
import TournamentForm from './TournamentForm'
import { useToast } from '../../components/shared/Toast'

import { useAuth } from '../../data/auth'
import { useNavigate } from 'react-router-dom'

export default function TournamentHub() {
  const { session } = useAuth()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchTournaments = async () => {
    setLoading(true)
    try {
      const params = session?.role === 'btc' ? { ownerId: session.userId } : undefined
      const res = await tournamentApi.list(params)
      setTournaments(res)
    } catch (err) {
      console.error('Failed to fetch tournaments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  const handleCreate = async (data: any) => {
    try {
      const payload = {
        code: data.slug,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        organizer: data.organizer,
        location: data.location,
        format: data.format,
        contactInfo: data.contactInfo
      }
      const createdTournament = await tournamentApi.create(payload)
      
      // Khởi tạo tự động các nội dung nếu người dùng có chọn
      if (data.events && data.events.length > 0) {
        await Promise.all(data.events.map((code: string) => 
          tournamentApi.createEvent(createdTournament.id, {
            categoryCode: code,
            maxSets: 3,
            pointsPerSet: 21
          })
        ))
      }

      setShowCreateForm(false)
      toast('Đã khởi tạo đề xuất giải đấu thành công!')
      fetchTournaments()
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Lỗi tạo giải đấu')
    }
  }

  if (showCreateForm) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', width: '100%' }}>
        <TournamentForm 
          onSave={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink)' }}>
            Giải Đấu
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
            Quản lý và điều hành các giải đấu cầu lông
          </div>
        </div>
        
        <button 
          onClick={() => setShowCreateForm(true)}
          style={{ 
            padding: '10px 20px', borderRadius: 8, border: 'none', 
            background: 'var(--ink)', color: 'white', 
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Icon name="plus" size={16} /> Tạo giải đấu
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Đang tải danh sách giải đấu...</div>
      ) : tournaments.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', background: 'var(--paper)', border: '1px dashed var(--line)', borderRadius: 12 }}>
          <Icon name="activity" size={48} />
          <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: 'var(--ink-2)' }}>Chưa có giải đấu nào</div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)' }}>Bấm "Tạo giải đấu" để bắt đầu tổ chức giải.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {tournaments.map(t => (
            <div 
              key={t.id} 
              data-testid="tournament-card"
              onClick={() => {
                setActiveTournament(t.id)
                if (session?.role === 'btc' || session?.role === 'admin') navigate(`/tournament/${t.id}/dashboard`)
                if (session?.role === 'referee') navigate(`/tournament/${t.id}/schedule`)
              }}
              style={{ 
                background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', 
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ height: 100, background: 'oklch(0.96 0.01 260)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="award" size={40} style={{ opacity: 0.4 }} />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
                    {t.name}
                  </div>
                  <div style={{ 
                    padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: t.status === 'live' ? 'var(--accent)' : t.status === 'finished' ? 'var(--paper-2)' : 'var(--paper-2)',
                    color: TOURNAMENT_STATUS[t.status]?.color || 'var(--ink-3)',
                    border: `1px solid ${TOURNAMENT_STATUS[t.status]?.color || 'var(--line)'}`
                  }}>
                    {TOURNAMENT_STATUS[t.status]?.label || t.status}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                    <Icon name="calendar" size={14} />
                    <span>{new Date(t.start_date).toLocaleDateString('vi-VN')} - {new Date(t.end_date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                    <Icon name="map-pin" size={14} />
                    <span>{t.venue_name || t.location || 'Chưa cập nhật địa điểm'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
