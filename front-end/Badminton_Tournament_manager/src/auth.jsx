/* Auth — mock user database + session management */

const USERS_KEY = 'bad.users';
const SESSION_KEY = 'bad.session';

const SEED_USERS = [
  { id:'U-001', name:'Admin', email:'admin@shuttleops.vn', phone:null, password:'admin123', role:'admin', status:'approved', createdAt:'2026-04-01' },
  { id:'U-002', name:'Phạm Lâm', email:'phamlam@shuttleops.vn', phone:'0901234567', password:'btc123', role:'btc', status:'approved', createdAt:'2026-04-01' },
  { id:'U-003', name:'Lê Quang Huy', email:'lequanghuy@shuttleops.vn', phone:'0912345678', password:'ref123', role:'referee', status:'approved', createdAt:'2026-04-01' },
  { id:'U-004', name:'Nguyễn Hải Đăng', email:'nguyenhaidang@shuttleops.vn', phone:'0923456789', password:'vdv123', role:'athlete', status:'approved', createdAt:'2026-04-01' },
  { id:'U-008', name:'Khán giả', email:'khangía@shuttleops.vn', phone:null, password:'fan123', role:'spectator', status:'approved', createdAt:'2026-04-01' },
  { id:'U-005', name:'Trần Văn Minh', email:'tranvanminh@example.com', phone:'0934567890', password:'test123', role:null, requestedRole:'btc', status:'pending', createdAt:'2026-04-17' },
  { id:'U-006', name:'Lê Thị Lan', email:'lethilan@example.com', phone:'0945678901', password:'test123', role:null, requestedRole:'athlete', status:'pending', createdAt:'2026-04-17' },
  { id:'U-007', name:'Nguyễn Thành Công', email:'ntcong@example.com', phone:'0956789012', password:'test123', role:null, requestedRole:'athlete', status:'pending', createdAt:'2026-04-18' },
];

function getUsers() {
  try {
    const s = localStorage.getItem(USERS_KEY);
    if (s) {
      const users = JSON.parse(s);
      const needsSpectator = !users.find(u => u.role === 'spectator');
      if (needsSpectator) {
        const merged = [...users, SEED_USERS.find(u => u.role === 'spectator')];
        localStorage.setItem(USERS_KEY, JSON.stringify(merged));
        return merged;
      }
      return users;
    }
  } catch {}
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}

function getSession() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function persistSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

function authApprove(userId, assignedRole) {
  const users = getUsers();
  saveUsers(users.map(u => u.id === userId ? { ...u, role: assignedRole, status: 'approved' } : u));
}

function authReject(userId) {
  const users = getUsers();
  saveUsers(users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
}

function authChangeRole(userId, newRole) {
  const users = getUsers();
  saveUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
}

function useAuth() {
  const [session, setSession] = React.useState(getSession);

  const login = (credential, password) => {
    const user = getUsers().find(u =>
      (u.email === credential.trim() || u.phone === credential.trim()) && u.password === password
    );
    if (!user) return { ok: false, error: 'Thông tin đăng nhập không đúng. Vui lòng thử lại.' };
    if (user.status === 'pending') return { ok: false, error: 'pending' };
    if (user.status === 'rejected') return { ok: false, error: 'Tài khoản đã bị từ chối. Liên hệ BTC để biết thêm chi tiết.' };
    const s = { userId: user.id, role: user.role, name: user.name, email: user.email };
    persistSession(s);
    setSession(s);
    return { ok: true };
  };

  const logout = () => { persistSession(null); setSession(null); };

  const register = ({ name, email, phone, password, requestedRole }) => {
    const users = getUsers();
    if (users.find(u => u.email === email.trim() || (phone && phone.trim() && u.phone === phone.trim()))) {
      return { ok: false, error: 'Email hoặc số điện thoại đã được đăng ký.' };
    }
    const newUser = {
      id: 'U-' + String(users.length + 1).padStart(3, '0'),
      name: name.trim(), email: email.trim(),
      phone: phone?.trim() || null, password,
      role: null, requestedRole, status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    saveUsers([...users, newUser]);
    return { ok: true };
  };

  return { session, login, logout, register };
}

window.getUsers = getUsers;
window.saveUsers = saveUsers;
window.authApprove = authApprove;
window.authReject = authReject;
window.authChangeRole = authChangeRole;
window.useAuth = useAuth;
