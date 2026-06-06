export type Tournament = {
  id: string;
  name: string;
  nameEn: string;
  venue: string;
  organizer?: string;
  description?: string;
  start: string;
  end: string;
  status: 'draft' | 'open_registration' | 'ongoing' | 'finished' | 'cancelled' | 'upcoming' | 'live';
  format: string;
  categories: string[];
  registered: number;
  approved: number;
  matches: { total: number; done: number; live: number; next: number };
  courts: number;
  shuttles: { stock: number; min: number; usedToday: number };
  revenue: number;
  budget: number;
  events?: any[];
}

export const TOURNAMENT_DEFAULT: Tournament = {
  id: '',
  name: '',
  nameEn: '',
  venue: '',
  organizer: '',
  description: '',
  start: '',
  end: '',
  status: 'draft',
  format: '',
  categories: [],
  registered: 0,
  approved: 0,
  matches: { total: 0, done: 0, live: 0, next: 0 },
  courts: 0,
  shuttles: { stock: 0, min: 120, usedToday: 0 },
  revenue: 0,
  budget: 0,
}

export const TOURNAMENT_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Bản nháp', color: 'var(--ink-3)' },
  live: { label: 'Đang thi đấu (Live)', color: 'var(--accent)' },
  finished: { label: 'Hoàn thành', color: 'oklch(0.42 0.14 160)' },
  cancelled: { label: 'Đã hủy', color: 'var(--amber)' }
}

export const CATEGORIES: Record<string, string> = {
  MS: 'Đơn nam',
  WS: 'Đơn nữ',
  MD: 'Đôi nam',
  WD: 'Đôi nữ',
  XD: 'Đôi nam nữ',
}

export type CourtStatus = 'live' | 'idle' | 'maintenance'
export type Court = {
  id: number; label: string; floor: string
  status: CourtStatus; match: string | null
}

export const COURTS_DEFAULT: Court[] = []

export type LivePlayer = { name: string; club: string; seed: number | null }
export type LiveMatch = {
  id: number; court: number; cat: string; round: string
  a: LivePlayer; b: LivePlayer
  sets: number[][]; current: number
  umpire: string; start: string; elapsed: string
}
export const LIVE_MATCHES: LiveMatch[] = []

export type UpcomingMatch = {
  id: number; t: string; court: number; cat: string; round: string; a: string; b: string
}
export const UPCOMING: UpcomingMatch[] = []

export type AthleteStatus = 'approved' | 'pending' | 'incomplete'
export type Athlete = {
  id: string; name: string; club: string; gender: 'M' | 'F'
  dob: string; rating: number; status: AthleteStatus; tier?: string; note?: string
}
export const ATHLETES: Athlete[] = []

export type NewsItem = { id: string; title: string; ts: string; tag: string }
export const NEWS: NewsItem[] = []

export type RankingEntry = { rank: number; name: string; club: string; pts: number; chg: number; tier: string }
export const RANKING_MS: RankingEntry[] = []
