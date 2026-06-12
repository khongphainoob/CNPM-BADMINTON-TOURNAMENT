import React, { useState, useEffect } from 'react'
import type { Session } from '../../data/auth'
import { CATEGORIES } from '../../data/constants'
import { reportingApi, competitionApi, peopleApi, tournamentApi, participationApi } from '../../data/api'
import { useForm } from 'react-hook-form'
import RegistrationForm from '../../features/registration/RegistrationForm'
import PaymentModal from '../../features/finance/PaymentModal'
import Icon from '../shared/Icon'
import { btnGhost, btnPrimary } from '../shared/tokens'
import { StatCard } from '../btc/BtcViews'

// Hạng mục cho phép theo giới tính: nam → MS/MD/XD, nữ → WS/WD/XD
function genderAllowsCategory(gender: string, code?: string): boolean {
  if (!gender || !code) return true
  const c = code.toUpperCase()
  if (c === 'XD') return true
  if (gender === 'M') return ['MS', 'MD'].includes(c)
  if (gender === 'F') return ['WS', 'WD'].includes(c)
  return true
}

export function useAthleteProfile(userId: number | string | undefined, role?: string) {
  const [me, setMe] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        if (role === 'coach') {
          const coaches = await peopleApi.listCoaches()
          const myCoach = coaches.find((c: any) => String(c.user_id) === String(userId))
          if (myCoach) {
            setMe({
              name: myCoach.name,
              id: `C-${myCoach.id}`,
              dbId: myCoach.id,
              club: myCoach.club_name || 'Chưa có',
              clubId: myCoach.club_id,
              isCoach: true
            })
          } else {
            setMe({ name: 'Trưởng Đoàn Mới', id: `U-${userId}`, dbId: null, club: 'Chưa có', isCoach: true })
          }
        } else {
          const res = await peopleApi.listPlayers({ userId })
          if (res.data && res.data.length > 0) {
            const p = res.data[0]
            setMe({
              name: p.name,
              id: p.code || String(p.id),
              dbId: p.id,
              club: p.club_name || 'Tự do',
              tier: p.tier || 'C',
              rating: p.rating || 1000,
              dob: p.dob || '2000-01-01',
              cccd: p.cccd || '',
              photoUrl: p.photo_url || '',
              gender: p.gender || '',
              clubId: p.club_id
            })
          } else {
            setMe({ name: 'VĐV Mới', id: `U-${userId}`, dbId: null, club: 'Chưa có', tier: '-', rating: 0, dob: '2000' })
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, role])

  return { me, loading }
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export function AthleteOverview({ me }: { me: any }) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)

  // Fetch real matches for athlete
  
  // Fix useState to useEffect
  React.useEffect(() => {
    if (!me?.dbId) {
      setLoading(false)
      return
    }
    competitionApi.listMatches({ playerId: me.dbId, limit: 10 }).then(res => {
      setMatches(res.data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [me.dbId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div className="caps">Lời chào</div>
        <h1 className="serif" style={{ margin: '2px 0 6px', fontSize: 34, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
          Xin chào, Hải Đăng.
        </h1>
        <div style={{ color: 'var(--ink-2)', fontSize: 13 }}>
          Bạn có 1 trận sắp diễn ra tại Sân 1 · 16:00 hôm nay.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Trận sắp tới"  value="1"       sub="hôm nay" />
        <StatCard label="Đã thi đấu"    value="2"       sub="thắng 2 · thua 0" accent="var(--court)" />
        <StatCard label="Điểm tích lũy" value={me.rating || 0} sub="+42 tuần này" />
        <StatCard label="Hạng quốc gia" value="#4"      sub="Đơn nam · Hạng A" />
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 20 }}>
        <h3 style={{ margin: 0, fontSize: 13 }}>Thành tích & Tích điểm 12 tháng gần đây</h3>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, alignItems: 'flex-end', height: 100 }}>
          {[55, 72, 40, 88, 64, 92, 70, 80, 60, 95, 78, 85].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', position: 'relative' }}>
              <div style={{ width: '100%', height: `${h}%`, background: i === 11 ? 'var(--accent)' : 'var(--ink)', borderRadius: 2 }} />
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>
                {['5','6','7','8','9','10','11','12','1','2','3','4'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!hasPaid && (
        <div className="bg-[var(--accent-soft)] border border-[var(--accent)] rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="font-semibold text-[var(--accent)] text-sm mb-1">Cảnh báo: Bạn có 1 khoản lệ phí chưa thanh toán</div>
            <div className="text-xs text-[var(--ink-2)]">Hồ sơ đăng ký của bạn sẽ không được duyệt nếu chưa hoàn tất lệ phí.</div>
          </div>
          <button onClick={() => setShowPayment(true)} className="px-4 py-2 bg-[var(--accent)] text-white rounded-md text-sm font-semibold border-none cursor-pointer">
            Thanh toán ngay
          </button>
        </div>
      )}

      {showPayment && (
        <PaymentModal 
          registration={{ id: 'HS-1024', name: me.name || 'Nguyễn Hải Đăng', amount: 500000, event: 'Đơn nam thi đấu' }}
          onClose={() => setShowPayment(false)}
          onPay={() => {
            alert('Đã gửi thông tin thanh toán thành công! Vui lòng chờ BTC xác nhận.')
            setHasPaid(true)
            setShowPayment(false)
          }}
        />
      )}

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 13 }}>
          Trận của tôi tại giải này
        </div>
        {loading ? <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)' }}>Đang tải...</div> : matches.length === 0 ? <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)' }}>Chưa có trận nào.</div> : matches.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '120px 60px 120px 1fr auto auto',
            gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--line-2)',
            fontSize: 12.5, alignItems: 'center',
          }}>
            <div className="mono">{new Date(r.scheduled_at || r.created_at).toLocaleString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}</div>
            <div className="mono">Sân {r.court_label || '-'}</div>
            <div style={{ color: 'var(--ink-2)' }}>{r.round}</div>
            <div>{r.event_label}</div>
            <div className="mono" style={{ color: 'var(--ink-3)' }}>-</div>
            <div>
              <span className={`pill ${r.status === 'completed' ? 'ok' : r.status === 'live' ? 'live' : 'info'}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onboarding / Registration flow ──────────────────────────────────────────

export function AthleteRegistration({ me }: { me: any }) {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTour, setSelectedTour] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    tournamentApi.list({}).then(res => setTournaments(res.filter((t: any) => t.status === 'live' || t.status === 'draft')))
    peopleApi.listPlayers({}).then(res => setPartners(res.data))
  }, [])

  useEffect(() => {
    if (selectedTour) {
      tournamentApi.listEvents(selectedTour.id).then(res => setEvents(res))
    }
  }, [selectedTour])

  if (!selectedTour) {
    return (
      <div style={{ maxWidth: 800 }}>
        <h2 className="serif" style={{ fontSize: 24, marginBottom: 20 }}>Chọn Giải Đấu</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {tournaments.map(t => (
            <div key={t.id} style={{ padding: 20, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Trạng thái: <span className="pill">{t.status}</span></div>
              <button onClick={() => { setSelectedTour(t); setShowForm(false); }} style={{ padding: '8px 16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, marginTop: 'auto' }}>
                Xem chi tiết & Đăng ký
              </button>
            </div>
          ))}
          {tournaments.length === 0 && <div style={{ color: 'var(--ink-2)' }}>Hiện chưa có giải đấu nào đang mở.</div>}
        </div>
      </div>
    )
  }

  if (!showForm) {
    return (
      <div style={{ maxWidth: 680 }}>
        <button onClick={() => setSelectedTour(null)} style={btnGhost}>← Quay lại danh sách giải</button>
        <h2 className="serif" style={{ fontSize: 28, margin: '20px 0 10px' }}>{selectedTour.name}</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <span className="pill live">Đang nhận đăng ký</span>
          <span className="pill info">Cấp độ Quốc gia</span>
        </div>
        
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="caps" style={{ marginBottom: 4 }}>Thông tin chung</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              Giải đấu {selectedTour.name} dành cho các VĐV chuyên nghiệp và phong trào. Vui lòng chuẩn bị sẵn CCCD và Ảnh thẻ 3x4 để điền vào form đăng ký.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="caps" style={{ marginBottom: 4 }}>Thời gian thi đấu</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Dự kiến 2026</div>
            </div>
            <div>
              <div className="caps" style={{ marginBottom: 4 }}>Hạng mục thi đấu</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{events.length > 0 ? events.map(e => e.label || e.category_label || e.category_code).join(', ') : 'Đang tải...'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowForm(true)} style={{ padding: '12px 24px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            Tiến hành Đăng ký cá nhân (BM13) →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <button onClick={() => setShowForm(false)} style={btnGhost}>← Quay lại Chi tiết giải</button>
      <h2 className="serif" style={{ fontSize: 24, margin: '20px 0' }}>Form Đăng ký: {selectedTour.name}</h2>
      <RegistrationForm 
        currentUser={{ name: me.name, email: '' }}
        availableEvents={events.filter(e => genderAllowsCategory(me.gender, e.category_code)).map(e => ({ id: String(e.id), name: e.label || e.category_label || e.category_code, type: e.is_doubles ? 'doubles' : 'singles' }))}
        availablePartners={partners.filter(p => p.id !== me.dbId).map(p => ({ id: String(p.id), name: p.name, email: p.code }))}
        onSubmit={async (data) => {
          try {
            if (me.dbId) {
              await peopleApi.updatePlayer(me.dbId, { cccd: data.cccd })
            } else {
              if (!me.gender) {
                alert('Vui lòng cập nhật giới tính trong Hồ sơ cá nhân trước khi đăng ký.')
                return
              }
              // Create player if not exists
              await peopleApi.createPlayer({ name: me.name, cccd: data.cccd, gender: me.gender, clubId: 1 })
            }
            await participationApi.register(data.eventId, { partnerId: data.partnerId ? Number(data.partnerId) : undefined })
            alert('Đăng ký thành công! Vui lòng chờ BTC duyệt.')
            setSelectedTour(null)
            setShowForm(false)
          } catch (e: any) {
            alert('Lỗi: ' + (e.response?.data?.error?.message || e.message))
          }
        }}
        onCancel={() => setShowForm(false)}
      />
    </div>
  )
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <input defaultValue={value} style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--paper)', fontSize: 13 }} />
    </label>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function AthleteProfile({ me }: { me: any }) {
  const { register, handleSubmit } = useForm({
    defaultValues: { name: me.name, dob: me.dob, cccd: me.cccd, clubId: me.clubId || 1, gender: me.gender || '' }
  })

  const submit = async (data: any) => {
    if (!data.gender) {
      alert('Vui lòng chọn giới tính.')
      return
    }
    try {
      if (me.dbId) {
        await peopleApi.updatePlayer(me.dbId, data)
        alert('Cập nhật hồ sơ thành công! Vui lòng tải lại trang.')
      } else {
        await peopleApi.createPlayer(data)
        alert('Tạo hồ sơ thành công! Vui lòng tải lại trang.')
      }
    } catch (e: any) {
      alert('Lỗi: ' + (e.response?.data?.error?.message || e.message))
    }
  }

  return (
    <div style={{ maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div className="caps">Hồ sơ cá nhân</div>
        <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 30 }}>{me.name}</h1>
      </div>
      <form onSubmit={handleSubmit(submit)} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 20, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20 }}>
        <div className="court-placeholder" style={{ height: 150, fontSize: 10 }}>ảnh 3×4</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label>
            <div className="caps" style={{ marginBottom: 4 }}>Họ và tên</div>
            <input {...register('name')} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--line)', width: '100%' }} />
          </label>
          <label>
            <div className="caps" style={{ marginBottom: 4 }}>CCCD / CMND</div>
            <input {...register('cccd')} placeholder="Gồm 12 chữ số" style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--line)', width: '100%' }} />
          </label>
          <label>
            <div className="caps" style={{ marginBottom: 4 }}>Giới tính</div>
            <select {...register('gender')} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--line)', width: '100%' }}>
              <option value="">-- Chọn --</option>
              <option value="M">Nam</option>
              <option value="F">Nữ</option>
            </select>
          </label>
          <label>
            <div className="caps" style={{ marginBottom: 4 }}>Ngày sinh</div>
            <input type="date" {...register('dob')} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--line)', width: '100%' }} />
          </label>
          <label>
            <div className="caps" style={{ marginBottom: 4 }}>Mã CLB (ID)</div>
            <input type="number" {...register('clubId', { valueAsNumber: true })} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--line)', width: '100%' }} />
          </label>
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button type="submit" style={{ padding: '8px 16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
            Lưu Hồ Sơ
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Ranking table ────────────────────────────────────────────────────────────

export function AthleteRanking({ me }: { me: any }) {
  const [activeCat, setActiveCat] = useState('MS')
  const [ranking, setRanking] = useState<any[]>([])
  
  React.useEffect(() => {
    reportingApi.getLeaderboard({ categoryCode: activeCat }).then(res => {
      setRanking(res)
    })
  }, [activeCat])

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <div>
          <div className="caps">Bảng xếp hạng quốc gia</div>
          <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 30 }}>{CATEGORIES[activeCat]} · tuần 16/2026</h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.keys(CATEGORIES).map(k => (
            <button key={k} onClick={() => setActiveCat(k)} style={{ padding: '6px 11px', borderRadius: 6, border: '1px solid ' + (activeCat === k ? 'var(--ink)' : 'var(--line)'), background: activeCat === k ? 'var(--ink)' : 'var(--paper)', color: activeCat === k ? 'white' : 'var(--ink-2)', fontSize: 12, cursor: 'pointer' }}>{CATEGORIES[k]}</button>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)', color: 'var(--ink-3)' }}>
              {['#', 'Vận động viên', 'CLB', 'Hạng', 'Điểm', 'Thay đổi'].map(h => (
                <th key={h} className="caps" style={{ padding: '9px 12px', textAlign: h === 'Điểm' || h === 'Thay đổi' ? 'right' : 'left', fontWeight: 600, borderBottom: '1px solid var(--line)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranking.map(r => (
              <tr key={r.rank} style={{ background: r.name === me.name ? 'var(--amber-soft)' : 'transparent' }}>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.rank}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.club}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)' }}>{r.tier}</td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', textAlign: 'right', fontWeight: 600 }}>{r.pts.toLocaleString('vi-VN')}</td>
                <td className="mono" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-2)', textAlign: 'right', color: r.chg > 0 ? 'var(--court)' : r.chg < 0 ? 'var(--accent)' : 'var(--ink-3)' }}>
                  {r.chg > 0 ? '▲' : r.chg < 0 ? '▼' : '—'} {r.chg !== 0 ? Math.abs(r.chg) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
