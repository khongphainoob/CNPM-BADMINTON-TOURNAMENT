import { useState, useEffect } from 'react'
import Icon from '../../components/shared/Icon'
import { peopleApi } from '../../data/api'

// ---- BM15: Athlete Search View ----

export default function AthleteSearchView() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null)

  const handleSearch = async () => {
    setLoading(true)
    try {
      // Simulate API call using peopleApi
      const res = await peopleApi.listPlayers({ search, limit: 20 })
      setResults(res.data)
      setSelectedAthlete(null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.length > 1) handleSearch()
    }, 500)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div style={{ padding: '24px 32px', display: 'flex', gap: 24, height: '100%' }}>
      {/* Search Panel */}
      <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, textTransform: 'uppercase' }}>Tra cứu Vận động viên</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>BM15 - Dành cho Admin & BTC</div>
        </div>

        <div style={{ position: 'relative' }}>
          <Icon name="search" size={16} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo ID, tên, đơn vị..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13.5, boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Đang tìm kiếm...</div>
          ) : results.length === 0 && search.length > 1 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Không tìm thấy kết quả.</div>
          ) : (
            results.map(ath => (
              <button 
                key={ath.id} 
                onClick={() => setSelectedAthlete(ath)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  border: selectedAthlete?.id === ath.id ? '1px solid var(--ink)' : '1px solid var(--line)',
                  background: selectedAthlete?.id === ath.id ? 'var(--paper-2)' : 'var(--paper)',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {ath.avatar_url ? <img src={ath.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="user" color="var(--ink-3)" size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{ath.name || ath.user_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>{ath.club || 'Tự do'} &middot; {ath.gender === 'M' || ath.gender === 'male' ? 'Nam' : ath.gender === 'F' || ath.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div style={{ flex: 1, background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)', overflowY: 'auto' }}>
        {selectedAthlete ? (
          <div>
            <div style={{ padding: 24, borderBottom: '1px solid var(--line)', display: 'flex', gap: 20 }}>
              <div style={{ width: 100, height: 100, borderRadius: 8, background: 'var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {selectedAthlete.avatar_url ? <img src={selectedAthlete.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="user" color="var(--ink-3)" size={40} />}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{selectedAthlete.name || selectedAthlete.user_name}</h2>
                  <span style={{ padding: '2px 8px', borderRadius: 4, background: 'oklch(0.95 0.04 250)', color: 'oklch(0.45 0.14 250)', fontSize: 11, fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                  <div><strong>Mã VĐV:</strong> <span className="mono">{selectedAthlete.id.substring(0, 8)}</span></div>
                  <div><strong>Đơn vị:</strong> {selectedAthlete.club || 'Tự do'}</div>
                  <div><strong>Ngày sinh:</strong> {selectedAthlete.dob ? new Date(selectedAthlete.dob).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Giới tính:</strong> {selectedAthlete.gender === 'M' || selectedAthlete.gender === 'male' ? 'Nam' : selectedAthlete.gender === 'F' || selectedAthlete.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                </div>
              </div>
              <div style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--paper-2)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>Điểm xếp hạng</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>1,450</div>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lịch sử tham gia giải</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ padding: 16, borderRadius: 8, border: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Giải Cầu lông Vô địch Quốc gia 2024</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>Nội dung: Đơn nam U21 &middot; Hạng: Tứ kết</div>
                    </div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>Tháng 3, 2024</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', gap: 12 }}>
            <Icon name="search" size={48} opacity={0.2} />
            <div style={{ fontSize: 14 }}>Chọn một vận động viên để xem chi tiết</div>
          </div>
        )}
      </div>
    </div>
  )
}
