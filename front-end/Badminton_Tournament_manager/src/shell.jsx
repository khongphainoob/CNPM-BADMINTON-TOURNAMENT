/* Role switcher and top chrome — persists role to localStorage */
const { useState, useEffect, useMemo, useRef } = React;

const ROLES = [
  { id: 'btc',       label: 'Ban tổ chức', sub: 'Operations console',  surface: 'desktop' },
  { id: 'referee',   label: 'Trọng tài',   sub: 'Umpire mobile',       surface: 'mobile'  },
  { id: 'athlete',   label: 'VĐV / HLV',   sub: 'Athlete portal',      surface: 'desktop' },
  { id: 'spectator', label: 'Khán giả',    sub: 'Public tournament site', surface: 'desktop' },
];

function useRole() {
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem('bad.role') || 'btc'; } catch { return 'btc'; }
  });
  useEffect(() => { try { localStorage.setItem('bad.role', role); } catch {} }, [role]);
  return [role, setRole];
}

function useLang() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('bad.lang') || 'vi'; } catch { return 'vi'; }
  });
  useEffect(() => { try { localStorage.setItem('bad.lang', lang); } catch {} }, [lang]);
  return [lang, setLang];
}

const ShuttleMark = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="16.5" r="3.2" fill="var(--accent)"/>
    <path d="M12 13.5V3" stroke="var(--ink)" strokeWidth="1.4"/>
    <path d="M12 3l-4 10.5" stroke="var(--ink)" strokeWidth="1.1"/>
    <path d="M12 3l4 10.5" stroke="var(--ink)" strokeWidth="1.1"/>
    <path d="M12 3l-1.8 11" stroke="var(--ink)" strokeWidth="1.1"/>
    <path d="M12 3l1.8 11" stroke="var(--ink)" strokeWidth="1.1"/>
    <path d="M7.5 13.5h9" stroke="var(--ink)" strokeWidth="1.1"/>
  </svg>
);

const ROLE_LABELS = { admin:'Admin', btc:'Ban tổ chức', referee:'Trọng tài', athlete:'VĐV / HLV' };

function TopBar({ session, onLogout, lang, setLang }) {
  const initials = session?.name
    ? session.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : '?';

  return (
    <header style={{
      gridArea: 'top',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 18px',
      background: 'var(--ink)',
      color: 'white',
      borderBottom: '1px solid oklch(0.28 0.01 250)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
        <ShuttleMark size={22}/>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing:'0.02em', textTransform:'uppercase' }}>
            Shuttle<span style={{ color:'var(--accent)' }}>·</span>Ops
          </div>
          <div className="caps" style={{ color:'oklch(0.7 0.01 250)', fontSize: 9, marginTop: 3, letterSpacing:'0.1em' }}>
            Tournament Operations Platform
          </div>
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: 'oklch(0.32 0.01 250)', margin: '0 4px' }}/>

      <div style={{ flex: 1 }}/>

      <div className="mono" style={{ fontSize: 11, color:'oklch(0.65 0.01 250)' }}>
        {TOURNAMENT.id} · {TOURNAMENT.venue.split(',')[1]?.trim() || 'TP.HCM'}
      </div>

      <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
        style={{ border:'1px solid oklch(0.32 0.01 250)', background:'transparent', color:'oklch(0.8 0.01 250)',
                 padding:'5px 10px', borderRadius: 6, fontSize: 11, display:'flex', alignItems:'center', gap: 6 }}>
        <Icon name="globe" size={13}/>{lang.toUpperCase()}
      </button>

      <button style={{ border:'1px solid oklch(0.32 0.01 250)', background:'transparent', color:'white',
                       padding:'5px 8px', borderRadius: 6, display:'flex', alignItems:'center', gap: 6 }}>
        <Icon name="bell" size={14}/>
        <span style={{ display:'inline-block', width: 6, height: 6, background: 'var(--accent)', borderRadius: 99 }}/>
      </button>

      {session && (
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background:'oklch(0.58 0.08 70)',
                        color:'var(--ink)', fontWeight: 700, fontSize: 12,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            {initials}
          </div>
          <div style={{ lineHeight: 1.1, fontSize: 12 }}>
            <div>{session.name}</div>
            <div style={{ color:'oklch(0.65 0.01 250)', fontSize: 10.5 }}>
              {ROLE_LABELS[session.role] || session.role}
            </div>
          </div>
          <button onClick={onLogout} title="Đăng xuất"
            style={{ border:'1px solid oklch(0.32 0.01 250)', background:'transparent', color:'oklch(0.7 0.01 250)',
                     padding:'5px 8px', borderRadius: 6, display:'flex', alignItems:'center', cursor:'pointer', marginLeft:4 }}>
            <Icon name="log-out" size={14}/>
          </button>
        </div>
      )}
    </header>
  );
}

window.ROLES = ROLES;
window.useRole = useRole;
window.useLang = useLang;
window.TopBar = TopBar;
window.ShuttleMark = ShuttleMark;
