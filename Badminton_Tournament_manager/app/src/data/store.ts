import { useSyncExternalStore } from 'react'
import {
  TOURNAMENT, COURTS, LIVE_MATCHES, UPCOMING, ATHLETES, NEWS,
  type Court, type LiveMatch, type UpcomingMatch, type Athlete, type NewsItem,
} from './legacy'

// ── Extra domain types ────────────────────────────────────────────────────────

export type InventoryStatus = 'ok' | 'warn' | 'critical'

export type InventoryItem = {
  sku: string
  name: string
  stock: number
  min: number
  issued: number
  status: InventoryStatus
}

export type Referee = {
  id: string
  name: string
  cert: string
  assigned: number
  today: number
}

export type Transaction = {
  t: string
  desc: string
  cat: 'Thu' | 'Chi'
  amt: number
}

export type ActivityEntry = {
  t: string
  who: string
  msg: string
}

// ── Store shape ───────────────────────────────────────────────────────────────

export type StoreState = {
  tournament: typeof TOURNAMENT
  courts: Court[]
  liveMatches: LiveMatch[]
  upcomingMatches: UpcomingMatch[]
  athletes: Athlete[]
  news: NewsItem[]
  inventory: InventoryItem[]
  referees: Referee[]
  transactions: Transaction[]
  activityLog: ActivityEntry[]
}

// ── Seed data (extracted from static views) ───────────────────────────────────

const SEED_INVENTORY: InventoryItem[] = [
  { sku: 'SH-VIC-AS30', name: 'Victor AS-30 · tournament grade',    stock: 132, min: 80,  issued: 28, status: 'ok'       },
  { sku: 'SH-YNX-AS50', name: 'Yonex AS-50 · tournament grade',     stock: 96,  min: 80,  issued: 34, status: 'warn'     },
  { sku: 'SH-YNX-M300', name: 'Yonex Mavis 300 · plastic (warmup)', stock: 84,  min: 40,  issued: 12, status: 'ok'       },
  { sku: 'SH-LIN-A200', name: 'Li-Ning A+200 · training',           stock: 100, min: 60,  issued: 13, status: 'ok'       },
  { sku: 'GR-BGY-65',   name: 'Yonex BG65 · dây vợt',              stock: 22,  min: 30,  issued: 4,  status: 'critical' },
  { sku: 'TW-STD',      name: 'Khăn lau sân · hộp 50',             stock: 18,  min: 20,  issued: 6,  status: 'warn'     },
]

const SEED_REFEREES: Referee[] = [
  { id: 'R-01', name: 'Lê Quang Huy',     cert: 'Quốc gia A', assigned: 3, today: 1 },
  { id: 'R-02', name: 'Nguyễn Hồng Sơn',  cert: 'Quốc gia A', assigned: 2, today: 1 },
  { id: 'R-03', name: 'Trịnh Quốc Hưng',  cert: 'Quốc gia B', assigned: 4, today: 2 },
  { id: 'R-04', name: 'Phạm Thành Long',   cert: 'Quốc gia B', assigned: 2, today: 1 },
  { id: 'R-05', name: 'Hoàng Mai',         cert: 'Quốc gia A', assigned: 3, today: 1 },
  { id: 'R-06', name: 'Đinh Văn Khoa',     cert: 'Quốc gia B', assigned: 3, today: 1 },
]

const SEED_TRANSACTIONS: Transaction[] = [
  { t: '18/04', desc: 'Lệ phí đăng ký · VNPay · 14 giao dịch',   cat: 'Thu', amt:   7_000_000 },
  { t: '18/04', desc: 'Lệ phí đăng ký · Momo · 9 giao dịch',     cat: 'Thu', amt:   4_500_000 },
  { t: '17/04', desc: 'Chi phí vật tư · cầu Yonex (200 ống)',     cat: 'Chi', amt:  -48_000_000 },
  { t: '17/04', desc: 'Tiền thưởng Huy chương (50%)',             cat: 'Chi', amt:  -65_000_000 },
  { t: '16/04', desc: 'Thuê nhà thi đấu · 9 ngày',                cat: 'Chi', amt: -270_000_000 },
  { t: '15/04', desc: 'Tài trợ · Yonex Vietnam',                  cat: 'Thu', amt:  250_000_000 },
  { t: '15/04', desc: 'Tài trợ · Victor Asia',                    cat: 'Thu', amt:  180_000_000 },
  { t: '14/04', desc: 'Phí trọng tài · 28 người × 9 ngày',       cat: 'Chi', amt: -126_000_000 },
]

const SEED_ACTIVITY: ActivityEntry[] = [
  { t: '14:52', who: 'Trọng tài Lê Quang Huy',     msg: 'xác nhận set 2 trận #184 · 21-14' },
  { t: '14:48', who: 'BTC',                         msg: 'phê duyệt hồ sơ A-0201 · Phạm Lê Hoàng' },
  { t: '14:45', who: 'Hệ thống',                   msg: 'cảnh báo tồn kho cầu Victor AS-30 sắp xuống dưới mức' },
  { t: '14:40', who: 'BTC',                         msg: 'hoán đổi sân 7 → 8 cho trận #189 · xung đột trọng tài' },
  { t: '14:32', who: 'VĐV-0146',                   msg: 'nộp kháng nghị trận #179 · video đính kèm' },
  { t: '14:25', who: 'Trọng tài Nguyễn Hồng Sơn',  msg: 'đồng bộ 2 cập nhật ngoại tuyến' },
  { t: '14:10', who: 'VNPay',                       msg: 'xác nhận 14 giao dịch lệ phí đăng ký · +7.000.000 ₫' },
]

function createInitialState(): StoreState {
  return {
    tournament: { ...TOURNAMENT },
    courts: COURTS.map(c => ({ ...c })),
    liveMatches: LIVE_MATCHES.map(m => ({ ...m })),
    upcomingMatches: UPCOMING.map(m => ({ ...m })),
    athletes: ATHLETES.map(a => ({ ...a })),
    news: NEWS.map(n => ({ ...n })),
    inventory: SEED_INVENTORY.map(i => ({ ...i })),
    referees: SEED_REFEREES.map(r => ({ ...r })),
    transactions: SEED_TRANSACTIONS.map(t => ({ ...t })),
    activityLog: SEED_ACTIVITY.map(a => ({ ...a })),
  }
}

// ── Store internals ───────────────────────────────────────────────────────────

let state: StoreState = createInitialState()
const subscribers = new Set<() => void>()

function notify() {
  subscribers.forEach(fn => fn())
}

function setState(updater: (prev: StoreState) => StoreState) {
  state = updater(state)
  notify()
}

// ── React integration ─────────────────────────────────────────────────────────

function subscribe(fn: () => void): () => void {
  subscribers.add(fn)
  return () => { subscribers.delete(fn) }
}

function getSnapshot(): StoreState {
  return state
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot)
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function timestamp(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function calcInventoryStatus(stock: number, min: number): InventoryStatus {
  if (stock < min) return 'critical'
  if (stock < min * 1.25) return 'warn'
  return 'ok'
}

function pushActivity(who: string, msg: string) {
  setState(prev => ({
    ...prev,
    activityLog: [{ t: timestamp(), who, msg }, ...prev.activityLog].slice(0, 50),
  }))
}

// ── Mutators: Courts ──────────────────────────────────────────────────────────

export function updateCourt(id: number, patch: Partial<Court>) {
  setState(prev => ({
    ...prev,
    courts: prev.courts.map(c => c.id === id ? { ...c, ...patch } : c),
  }))
}

// ── Mutators: Matches ─────────────────────────────────────────────────────────

export function addMatch(match: UpcomingMatch) {
  setState(prev => ({
    ...prev,
    upcomingMatches: [...prev.upcomingMatches, match],
    tournament: {
      ...prev.tournament,
      matches: { ...prev.tournament.matches, total: prev.tournament.matches.total + 1 },
    },
  }))
  pushActivity('BTC', `thêm trận phụ #${match.id} · ${match.a} vs ${match.b}`)
}

export function resolveConflict(matchId: number, newCourt: number) {
  setState(prev => ({
    ...prev,
    upcomingMatches: prev.upcomingMatches.map(m =>
      m.id === matchId ? { ...m, court: newCourt } : m
    ),
  }))
  pushActivity('BTC', `giải quyết xung đột trận #${matchId} → Sân ${newCourt}`)
}

// ── Mutators: Athletes ────────────────────────────────────────────────────────

export function approveAthleteProfile(athleteId: string) {
  setState(prev => ({
    ...prev,
    athletes: prev.athletes.map(a =>
      a.id === athleteId ? { ...a, status: 'approved' as const } : a
    ),
  }))
  pushActivity('BTC', `phê duyệt hồ sơ VĐV ${athleteId}`)
}

export function rejectAthleteProfile(athleteId: string, note?: string) {
  setState(prev => ({
    ...prev,
    athletes: prev.athletes.map(a =>
      a.id === athleteId ? { ...a, status: 'incomplete' as const, note } : a
    ),
  }))
  pushActivity('BTC', `từ chối hồ sơ VĐV ${athleteId}`)
}

// ── Mutators: Inventory ───────────────────────────────────────────────────────

export function addStock(sku: string, qty: number) {
  setState(prev => {
    const inventory = prev.inventory.map(it => {
      if (it.sku !== sku) return it
      const stock = it.stock + qty
      return { ...it, stock, status: calcInventoryStatus(stock, it.min) }
    })
    return {
      ...prev,
      inventory,
      tournament: {
        ...prev.tournament,
        shuttles: { ...prev.tournament.shuttles, stock: prev.tournament.shuttles.stock + qty },
      },
    }
  })
  pushActivity('BTC', `nhập kho ${qty} × ${sku}`)
}

export function addNewInventoryItem(item: Omit<InventoryItem, 'status'>) {
  const status = calcInventoryStatus(item.stock, item.min)
  setState(prev => ({
    ...prev,
    inventory: [...prev.inventory, { ...item, status }],
  }))
  pushActivity('BTC', `thêm vật tư mới ${item.sku} · tồn ${item.stock}`)
}

export function issueShuttles(sku: string, qty: number, matchId?: number) {
  setState(prev => {
    const inventory = prev.inventory.map(it => {
      if (it.sku !== sku) return it
      const stock = Math.max(0, it.stock - qty)
      return { ...it, stock, issued: it.issued + qty, status: calcInventoryStatus(stock, it.min) }
    })
    return {
      ...prev,
      inventory,
      tournament: {
        ...prev.tournament,
        shuttles: {
          ...prev.tournament.shuttles,
          stock: Math.max(0, prev.tournament.shuttles.stock - qty),
          usedToday: prev.tournament.shuttles.usedToday + qty,
        },
      },
    }
  })
  pushActivity('BTC', `cấp phát ${qty} × ${sku}${matchId ? ` cho trận #${matchId}` : ''}`)
}

// ── Mutators: Referees ────────────────────────────────────────────────────────

export function assignReferee(refereeId: string, matchId: number) {
  setState(prev => ({
    ...prev,
    referees: prev.referees.map(r =>
      r.id === refereeId ? { ...r, assigned: r.assigned + 1, today: r.today + 1 } : r
    ),
  }))
  pushActivity('BTC', `phân công trọng tài ${refereeId} cho trận #${matchId}`)
}

// ── Mutators: News ────────────────────────────────────────────────────────────

export function addNewsItem(item: Omit<NewsItem, 'id'>) {
  const id = `N-${Date.now()}`
  setState(prev => ({
    ...prev,
    news: [{ id, ...item }, ...prev.news],
  }))
  pushActivity('BTC', `đăng bài viết mới · "${item.title}"`)
}

// ── Mutators: Finance ─────────────────────────────────────────────────────────

export function addTransaction(tx: Transaction) {
  setState(prev => ({
    ...prev,
    transactions: [tx, ...prev.transactions],
  }))
  pushActivity('BTC', `giao dịch ${tx.cat} ${tx.amt > 0 ? '+' : ''}${tx.amt.toLocaleString('vi-VN')} · ${tx.desc}`)
}

// ── Mutators: Tournament settings ─────────────────────────────────────────────

export function updateTournamentName(name: string) {
  setState(prev => ({ ...prev, tournament: { ...prev.tournament, name } }))
}

export function updateTournamentVenue(venue: string) {
  setState(prev => ({ ...prev, tournament: { ...prev.tournament, venue } }))
}

// ── Dev util ──────────────────────────────────────────────────────────────────

export function resetStore() {
  state = createInitialState()
  notify()
}
