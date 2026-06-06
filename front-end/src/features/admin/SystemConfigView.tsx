import { useState } from 'react'
import Icon from '../../components/shared/Icon'
import { btnPrimary } from '../../components/shared/tokens'

type ConfigTab = 'general' | 'security' | 'integrations'

export default function SystemConfigView() {
  const [tab, setTab] = useState<ConfigTab>('general')

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink)' }}>
            Cài đặt Hệ thống
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
            Cấu hình các tham số toàn cục và tích hợp API
          </div>
        </div>
        <button style={btnPrimary}>Lưu thay đổi</button>
      </div>

      <div style={{ display: 'flex', gap: 32 }}>
        {/* Sidebar for Settings Category */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ConfigTabButton id="general" label="Chung" icon="settings" active={tab === 'general'} onClick={() => setTab('general')} />
            <ConfigTabButton id="security" label="Bảo mật & Quyền" icon="shield" active={tab === 'security'} onClick={() => setTab('security')} />
            <ConfigTabButton id="integrations" label="Tích hợp API" icon="link" active={tab === 'integrations'} onClick={() => setTab('integrations')} />
          </div>
        </div>

        {/* Configuration Forms */}
        <div style={{ flex: 1 }}>
          {tab === 'general' && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 24, borderBottom: '1px solid var(--line-2)', paddingBottom: 16 }}>
                Thông tin chung
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tên hệ thống</label>
                  <input type="text" defaultValue="ShuttleOps Platform" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Múi giờ mặc định</label>
                  <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14 }}>
                    <option>Asia/Ho_Chi_Minh (UTC+7)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: 18, height: 18 }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Chế độ bảo trì (Bảo vệ toàn hệ thống)</span>
                  </label>
                  <p style={{ margin: '4px 0 0 28px', fontSize: 12, color: 'var(--ink-3)' }}>Chỉ Admin mới có thể đăng nhập khi chế độ này được bật.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 24, borderBottom: '1px solid var(--line-2)', paddingBottom: 16 }}>
                Bảo mật & Phân quyền
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Yêu cầu mật khẩu mạnh</label>
                  <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14 }}>
                    <option>Có (Tối thiểu 8 ký tự, 1 chữ hoa, 1 số)</option>
                    <option>Không (Tối thiểu 6 ký tự)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Thời hạn JWT Token (Giờ)</label>
                  <input type="number" defaultValue={24} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14 }} />
                </div>
              </div>
            </div>
          )}

          {tab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* VNPay Config */}
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--line-2)', paddingBottom: 16 }}>
                  <Icon name="credit-card" size={24} />
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Cổng thanh toán VNPay</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>TmnCode (Terminal ID)</label>
                    <input type="text" placeholder="Nhập mã Terminal VNPay..." style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, fontFamily: 'monospace' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>HashSecret</label>
                    <input type="password" placeholder="Nhập Secret Key..." style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, fontFamily: 'monospace' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Môi trường</label>
                    <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14 }}>
                      <option>Sandbox (Thử nghiệm)</option>
                      <option>Production (Thực tế)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SMS Gateway Config */}
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--line-2)', paddingBottom: 16 }}>
                  <Icon name="message-square" size={24} />
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>SMS Gateway</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Nhà cung cấp</label>
                    <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14 }}>
                      <option>Twilio</option>
                      <option>SpeedSMS</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>API Key / Auth Token</label>
                    <input type="password" placeholder="Nhập API Key..." style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 14, fontFamily: 'monospace' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfigTabButton({ label, icon, active, onClick }: { id: string; label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      background: active ? 'var(--ink)' : 'transparent',
      color: active ? 'white' : 'var(--ink-2)',
      border: 'none', borderRadius: 8, cursor: 'pointer',
      fontSize: 14, fontWeight: active ? 600 : 500,
      transition: 'background 0.2s', textAlign: 'left'
    }}>
      <Icon name={icon} size={18} stroke={active ? 2.5 : 2} />
      {label}
    </button>
  )
}
