import { create } from 'zustand'
import {
  TOURNAMENT_DEFAULT, COURTS_DEFAULT, type Tournament,
  type Court, type LiveMatch, type UpcomingMatch, type Athlete, type NewsItem,
} from './constants'
import { authApi, peopleApi, tournamentApi, paymentApi, reportingApi, competitionApi } from './api'

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
  budgetLine?: string
}

export type ActivityEntry = {
  t: string
  who: string
  msg: string
}

// ── Store shape ───────────────────────────────────────────────────────────────

export type StoreState = {
  activeTournamentId: number | string | null
  tournament: Tournament
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

const SEED_INVENTORY: InventoryItem[] = []
const SEED_REFEREES: Referee[] = []
const SEED_TRANSACTIONS: Transaction[] = []
const SEED_ACTIVITY: ActivityEntry[] = []

function createInitialState(): StoreState {
  return {
    activeTournamentId: null,
    tournament: { ...TOURNAMENT_DEFAULT },
    courts: [...COURTS_DEFAULT],
    liveMatches: [],
    upcomingMatches: [],
    athletes: [],
    news: [],
    inventory: [],
    referees: [],
    transactions: [],
    activityLog: [],
  }
}

// ── Store internals ───────────────────────────────────────────────────────────

const useStoreBase = create<StoreState>(() => createInitialState())

export const useStore = useStoreBase

function setState(updater: (prev: StoreState) => StoreState) {
  useStoreBase.setState(updater)
}

export function setActiveTournament(id: number | string | null) {
  useStoreBase.setState({ activeTournamentId: id })
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

export async function approveAthleteProfile(athleteId: string) {
  setState(prev => ({
    ...prev,
    athletes: prev.athletes.map(a =>
      a.id === athleteId ? { ...a, status: 'approved' as const } : a
    ),
  }))
  pushActivity('BTC', `phê duyệt hồ sơ VĐV ${athleteId}`)
  try {
    await peopleApi.updatePlayer(athleteId, { profileStatus: 'approved' })
  } catch (e) {
    console.error('Failed to approve athlete via API', e)
  }
  await fetchAthletes()
}

export async function rejectAthleteProfile(athleteId: string, note?: string) {
  setState(prev => ({
    ...prev,
    athletes: prev.athletes.map(a =>
      a.id === athleteId ? { ...a, status: 'incomplete' as const, note } : a
    ),
  }))
  pushActivity('BTC', `từ chối hồ sơ VĐV ${athleteId}`)
  await fetchAthletes()
}

// ── Mutators: Inventory ───────────────────────────────────────────────────────

export async function addStock(sku: string, qty: number) {
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
  try {
    const item = useStoreBase.getState().inventory.find(i => i.sku === sku)
    if (item) {
      await reportingApi.updateInventory(sku, { stock: item.stock })
    }
  } catch (e) {
    console.error('Failed to update inventory via API', e)
  }
  await fetchInventoryData()
}

export async function addNewInventoryItem(item: Omit<InventoryItem, 'status'>) {
  try {
    await reportingApi.createInventory({
      sku: item.sku,
      name: item.name,
      minStock: item.min,
      initialStock: item.stock
    })
  } catch (e) {
    console.error('Failed to create inventory via API', e)
  }
  const status = calcInventoryStatus(item.stock, item.min)
  setState(prev => ({
    ...prev,
    inventory: [...prev.inventory, { ...item, status }],
  }))
  pushActivity('BTC', `thêm vật tư mới ${item.sku} · tồn ${item.stock}`)
  await fetchInventoryData()
}

export async function issueShuttles(sku: string, qty: number, matchId?: number) {
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
  try {
    await reportingApi.issueInventory(sku, { qty, matchId })
  } catch (e) {
    console.error('Failed to issue inventory via API', e)
  }
  await fetchInventoryData()
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

export async function addNewsItem(item: Omit<NewsItem, 'id'>) {
  const id = `N-${Date.now()}`
  setState(prev => ({
    ...prev,
    news: [{ id, ...item }, ...prev.news],
  }))
  pushActivity('BTC', `đăng bài viết mới · "${item.title}"`)
  try {
    await reportingApi.createNews({ title: item.title, tag: item.tag })
  } catch (e) {
    console.error('Failed to create news via API', e)
  }
  await fetchNews()
}

// ── Mutators: Finance ─────────────────────────────────────────────────────────

export async function addTransaction(tx: any) {
  setState(prev => ({
    ...prev,
    transactions: [tx, ...prev.transactions],
  }))
  pushActivity('BTC', `giao dịch ${tx.cat} ${tx.amt > 0 ? '+' : ''}${tx.amt.toLocaleString('vi-VN')} · ${tx.desc}`)
  try {
    await paymentApi.createExpense({ 
      amount: tx.amt, 
      desc: tx.desc, 
      date: tx.t,
      invoice: tx.invoiceNo,
      method: tx.method,
      budgetLineId: tx.budgetLine,
      status: tx.status
    })
  } catch (e) {
    console.error('Failed to create expense via API', e)
  }
  await fetchFinance()
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
  useStoreBase.setState(createInitialState())
}


// ═══════════════════════════════════════════════════════════════════════════════
// FETCH FUNCTIONS — Pull data from real API
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchDashboard(tournamentId?: number | string) {
  const id = tournamentId || useStoreBase.getState().activeTournamentId
  if (!id) return

  try {
    const data = await tournamentApi.getDashboard(id)
    setState(prev => ({
      ...prev,
      tournament: {
        ...prev.tournament,
        id: String(id),
        name: data.tournament?.name || prev.tournament.name,
        venue: data.tournament?.venue_name ? `${data.tournament.venue_name}` : prev.tournament.venue,
        start: data.tournament?.start_date || prev.tournament.start,
        end: data.tournament?.end_date || prev.tournament.end,
        budget: Number(data.tournament?.budget) || prev.tournament.budget,
        revenue: Number(data.tournament?.revenue) || prev.tournament.revenue,
        matches: {
          total: data.stats.matches.total,
          done: data.stats.matches.completed,
          live: data.stats.matches.live,
          next: data.stats.matches.upcoming,
        },
        registered: data.stats.totalPlayers,
        approved: data.stats.totalPlayers, // approximation
        courts: data.stats.totalCourts || prev.tournament.courts,
        events: data.events && data.events.length > 0 ? data.events.map((e: any) => ({
          id: e.id,
          categoryCode: e.category_code,
          label: e.label || e.category_code
        })) : prev.tournament.events,
      },
      courts: (data.courts || []).map((c: any) => ({
        id: c.id,
        label: c.label,
        floor: c.floor || 'PVC',
        status: c.status || 'idle',
        match: null,
      })),
    }))
  } catch (e) {
    console.error('Failed to fetch dashboard', e)
  }
}

export async function fetchAthletes() {
  try {
    const data = await peopleApi.listPlayers({ limit: 100 })
    // API response: { data: items[], meta: { page, limit, total } }
    const items = data.data || []
    setState(prev => ({
      ...prev,
      athletes: items.map((p: any) => ({
        id: p.code || String(p.id),
        name: p.name,
        club: p.club_name || 'Tự do',
        gender: p.gender || 'M',
        dob: p.dob || '2000',
        rating: p.rating || 0,
        tier: p.tier || undefined,
        status: p.profile_status === 'approved' ? 'approved' 
             : p.profile_status === 'incomplete' ? 'incomplete' 
             : 'pending',
      }))
    }))
  } catch (e) {
    console.error('Failed to fetch athletes', e)
  }
}

export async function fetchFinance() {
  try {
    const data = await paymentApi.list({ limit: 100 })
    // API response: { data: items[], meta }
    const items = data.data || []
    setState(prev => ({
      ...prev,
      transactions: items.map((p: any) => ({
        t: new Date(p.created_at).toLocaleDateString('vi-VN'),
        desc: p.purpose === 'other' ? (p.note || '') : (p.event_label ? `Lệ phí: ${p.event_label}` : 'Lệ phí đăng ký'),
        cat: Number(p.amount) > 0 ? 'Thu' as const : 'Chi' as const,
        amt: Number(p.amount),
        budgetLine: p.budget_line_id || undefined
      }))
    }))
  } catch (e) {
    console.error('Failed to fetch finance', e)
  }
}

export async function fetchInventoryData() {
  try {
    // reportingApi.getInventory returns array directly (wrapped in { data: [...] })
    const items = await reportingApi.getInventory()
    const list = Array.isArray(items) ? items : []
    setState(prev => ({
      ...prev,
      inventory: list.map((i: any) => ({
        sku: i.sku,
        name: i.name,
        stock: Number(i.stock),
        min: Number(i.min_stock),
        issued: Number(i.issued) || 0,
        status: (i.status as InventoryStatus) || calcInventoryStatus(Number(i.stock), Number(i.min_stock)),
      })),
      tournament: {
        ...prev.tournament,
        shuttles: {
          ...prev.tournament.shuttles,
          stock: list.reduce((sum: number, i: any) => sum + Number(i.stock), 0),
        },
      },
    }))
  } catch (e) {
    console.error('Failed to fetch inventory', e)
  }
}

export async function fetchActivityLog() {
  try {
    const data = await reportingApi.getActivityLog({ limit: 50 })
    // API response: { data: items[], meta }
    const items = data.data || []
    setState(prev => ({
      ...prev,
      activityLog: items.map((l: any) => ({
        t: new Date(l.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        who: l.actor_name || 'Hệ thống',
        msg: l.message || l.action || '',
      }))
    }))
  } catch (e) {
    console.error('Failed to fetch activity log', e)
  }
}

export async function fetchMatches(tournamentId?: number | string) {
  const id = tournamentId || useStoreBase.getState().activeTournamentId
  if (!id) return

  try {
    const data = await competitionApi.listMatches({ tournament_id: id, limit: 100 })
    // API response: { data: items[], meta }
    const items = data.data || []
    setState(prev => {
      const live: LiveMatch[] = []
      const upc: UpcomingMatch[] = []
      items.forEach((m: any) => {
        // Extract participants by side
        const sideA = (m.participants || []).filter((p: any) => p.side === 'A')
        const sideB = (m.participants || []).filter((p: any) => p.side === 'B')
        const playerA = sideA[0]?.player || { name: 'TBD', club: '', code: '' }
        const playerB = sideB[0]?.player || { name: 'TBD', club: '', code: '' }

        // Map sets to score arrays
        const sets = (m.sets || []).map((s: any) => [s.score_a, s.score_b])
        const courtNum = m.court_label?.replace('Sân ', '') || '0'

        if (m.status === 'live') {
          live.push({
            id: m.id,
            court: Number(courtNum),
            cat: m.category_code || m.event_label || '',
            round: m.round || '',
            a: { name: playerA.name, club: playerA.club || '', seed: sideA[0]?.seed || null },
            b: { name: playerB.name, club: playerB.club || '', seed: sideB[0]?.seed || null },
            sets,
            current: sets.length > 0 ? sets.length - 1 : 0,
            umpire: m.referee_name || 'Chưa xếp',
            start: m.started_at ? new Date(m.started_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            elapsed: m.started_at ? formatElapsed(new Date(m.started_at)) : '0:00',
          })
        }
        if (m.status === 'upcoming') {
          upc.push({
            id: m.id,
            t: m.scheduled_at ? new Date(m.scheduled_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--',
            court: Number(courtNum),
            cat: m.category_code || m.event_label || '',
            round: m.round || '',
            a: playerA.name,
            b: playerB.name,
          })
        }
      })
      return { ...prev, liveMatches: live, upcomingMatches: upc }
    })
  } catch (e) {
    console.error('Failed to fetch matches', e)
  }
}

export async function fetchNews() {
  try {
    const data = await reportingApi.getNews({ limit: 20 })
    // API response: { data: items[], meta }
    const items = data.data || []
    setState(prev => ({
      ...prev,
      news: items.map((n: any) => ({
        id: String(n.id),
        title: n.title || '',
        ts: n.published_at ? new Date(n.published_at).toLocaleDateString('vi-VN') : '',
        tag: n.tag || 'Tin tức',
      }))
    }))
  } catch (e) {
    console.error('Failed to fetch news', e)
  }
}

export async function fetchReferees() {
  try {
    const items = await peopleApi.listReferees()
    const list = Array.isArray(items) ? items : []
    setState(prev => ({
      ...prev,
      referees: list.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        cert: r.cert || 'QG_B',
        assigned: 0,
        today: 0,
      }))
    }))
  } catch (e) {
    console.error('Failed to fetch referees', e)
  }
}

// ── Helper: format elapsed time ───────────────────────────────────────────────
function formatElapsed(start: Date): string {
  const diff = Math.floor((Date.now() - start.getTime()) / 1000)
  const min = Math.floor(diff / 60)
  const sec = diff % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

// ── Init all BTC data ─────────────────────────────────────────────────────────
export async function initBtcData(tournamentId?: number | string) {
  const id = tournamentId || useStoreBase.getState().activeTournamentId
  if (!id) return

  await Promise.allSettled([
    fetchDashboard(id),
    fetchAthletes(),
    fetchFinance(),
    fetchInventoryData(),
    fetchActivityLog(),
    fetchMatches(id),
    fetchNews(),
    fetchReferees(),
  ])
}
