import apiClient from '../lib/api-client'
import type { User, UserRole } from './auth'

export type Paginated<T> = {
  data: T[]
  meta: { page: number; limit: number; total: number }
}

export const authApi = {
  login: async (credential: string, password: string) => {
    const res = await apiClient.post('/api/auth/login', { email: credential, password })
    return res.data.data // { token, user }
  },
  register: async (data: any) => {
    const res = await apiClient.post('/api/auth/register', data)
    return res.data.data
  },
  me: async () => {
    const res = await apiClient.get('/api/auth/me')
    return res.data.data
  },
  listUsers: async (params?: any) => {
    const res = await apiClient.get('/api/auth/users', { params })
    return res.data as Paginated<User>
  },
  approveUser: async (id: string, roleCode: UserRole) => {
    const res = await apiClient.patch(`/api/auth/users/${id}/approve`, { roleCode })
    return res.data.data
  },
  rejectUser: async (id: string, note?: string) => {
    const res = await apiClient.patch(`/api/auth/users/${id}/reject`, { note })
    return res.data.data
  },
  changeRole: async (id: string, roleCode: UserRole) => {
    const res = await apiClient.patch(`/api/auth/users/${id}/role`, { roleCode })
    return res.data.data
  }
}

export const peopleApi = {
  listPlayers: async (params?: any) => {
    const res = await apiClient.get('/api/people/players', { params })
    return res.data as Paginated<any>
  },
  getPlayer: async (id: number | string) => {
    const res = await apiClient.get(`/api/people/players/${id}`)
    return res.data.data
  },
  createPlayer: async (data: any) => {
    const res = await apiClient.post('/api/people/players', data)
    return res.data.data
  },
  updatePlayer: async (id: number | string, data: any) => {
    const res = await apiClient.put(`/api/people/players/${id}`, data)
    return res.data.data
  },
  listClubs: async () => {
    const res = await apiClient.get('/api/people/clubs')
    return res.data.data
  },
  createClub: async (data: any) => {
    const res = await apiClient.post('/api/people/clubs', data)
    return res.data.data
  },
  listReferees: async () => {
    const res = await apiClient.get('/api/people/referees')
    return res.data.data
  },
  listCoaches: async () => {
    const res = await apiClient.get('/api/people/coaches')
    return res.data.data
  },
}

// NOTE: backend mounts at /api/tournaments (plural)
export const tournamentApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/api/tournaments', { params })
    return res.data.data
  },
  getById: async (id: number | string) => {
    const res = await apiClient.get(`/api/tournaments/${id}`)
    return res.data.data
  },
  create: async (data: any) => {
    const res = await apiClient.post('/api/tournaments', data)
    return res.data.data
  },
  update: async (id: number | string, data: any) => {
    const res = await apiClient.put(`/api/tournaments/${id}`, data)
    return res.data.data
  },
  changeStatus: async (id: number | string, status: string) => {
    const res = await apiClient.patch(`/api/tournaments/${id}/status`, { status })
    return res.data.data
  },
  listEvents: async (id: number | string) => {
    const res = await apiClient.get(`/api/tournaments/${id}/events`)
    return res.data.data
  },
  createEvent: async (tournamentId: number | string, data: any) => {
    const res = await apiClient.post(`/api/tournaments/${tournamentId}/events`, data)
    return res.data.data
  },
  updateEvent: async (tournamentId: number | string, eventId: number | string, data: any) => {
    const res = await apiClient.put(`/api/tournaments/${tournamentId}/events/${eventId}`, data)
    return res.data.data
  },
  listCourts: async (id: number | string) => {
    const res = await apiClient.get(`/api/tournaments/${id}/courts`)
    return res.data.data
  },
  createCourt: async (id: number | string, data: any) => {
    const res = await apiClient.post(`/api/tournaments/${id}/courts`, data)
    return res.data.data
  },
  updateCourt: async (id: number | string, courtId: number | string, data: any) => {
    const res = await apiClient.put(`/api/tournaments/${id}/courts/${courtId}`, data)
    return res.data.data
  },
  updateCourtStatus: async (id: number | string, courtId: number | string, status: string) => {
    const res = await apiClient.patch(`/api/tournaments/${id}/courts/${courtId}/status`, { status })
    return res.data.data
  },
  deleteCourt: async (id: number | string, courtId: number | string) => {
    const res = await apiClient.delete(`/api/tournaments/${id}/courts/${courtId}`)
    return res.data.data
  },
  listVenues: async () => {
    const res = await apiClient.get('/api/tournaments/venues')
    return res.data.data
  },
  getDashboard: async (id: number | string) => {
    const res = await apiClient.get(`/api/tournaments/${id}/dashboard`)
    return res.data.data
  }
}

// @ts-ignore
if (typeof window !== 'undefined') window.tournamentApi = tournamentApi;

export const competitionApi = {
  listMatches: async (params?: any) => {
    const res = await apiClient.get('/api/competition/matches', { params })
    return res.data as Paginated<any>
  },
  getMatch: async (id: number | string) => {
    const res = await apiClient.get(`/api/competition/matches/${id}`)
    return res.data.data
  },
  createMatch: async (data: any) => {
    const res = await apiClient.post('/api/competition/matches', data)
    return res.data.data
  },
  updateMatch: async (id: number | string, data: any) => {
    const res = await apiClient.put(`/api/competition/matches/${id}`, data)
    return res.data.data
  },
  scheduleMatch: async (id: number | string, data: any) => {
    const res = await apiClient.patch(`/api/competition/matches/${id}/schedule`, data)
    return res.data.data
  },
  addParticipant: async (matchId: number | string, data: any) => {
    const res = await apiClient.post(`/api/competition/matches/${matchId}/participants`, data)
    return res.data.data
  },
  addSetScore: async (id: number | string, data: any) => {
    const res = await apiClient.post(`/api/competition/matches/${id}/sets`, data)
    return res.data.data
  },
  generateDraw: async (eventId: number | string) => {
    const res = await apiClient.post(`/api/competition/events/${eventId}/draw`)
    return res.data.data
  },
  startMatch: async (id: number | string) => {
    const res = await apiClient.patch(`/api/competition/matches/${id}/start`)
    return res.data.data
  },
  completeMatch: async (id: number | string) => {
    const res = await apiClient.patch(`/api/competition/matches/${id}/complete`)
    return res.data.data
  },
  setResult: async (id: number | string, data: { resultType: string; winnerSide: 'A' | 'B'; note?: string }) => {
    const res = await apiClient.patch(`/api/competition/matches/${id}/result`, data)
    return res.data.data
  },
  getScoreEvents: async (id: number | string) => {
    const res = await apiClient.get(`/api/competition/matches/${id}/score-events`)
    return res.data.data
  },
  addScoreEvent: async (id: number | string, data: any) => {
    const res = await apiClient.post(`/api/competition/matches/${id}/score-events`, data)
    return res.data.data
  },
  undoScore: async (id: number | string) => {
    const res = await apiClient.post(`/api/competition/matches/${id}/undo`)
    return res.data.data
  }
}

export const participationApi = {
  listParticipants: async (eventId: number | string, params?: any) => {
    const res = await apiClient.get(`/api/participation/events/${eventId}/participants`, { params })
    return res.data as Paginated<any>
  },
  listAllParticipants: async (params?: any) => {
    const res = await apiClient.get(`/api/participation/participants`, { params })
    return res.data as Paginated<any>
  },
  register: async (eventId: number | string, data?: { playerId?: number; partnerId?: number }) => {
    const res = await apiClient.post(`/api/participation/events/${eventId}/register`, data)
    return res.data.data
  },
  confirmPartner: async (participantId: number | string) => {
    const res = await apiClient.post(`/api/participation/participants/${participantId}/confirm-partner`)
    return res.data.data
  },
  rejectPartner: async (participantId: number | string) => {
    const res = await apiClient.post(`/api/participation/participants/${participantId}/reject-partner`)
    return res.data.data
  },
  autoSeed: async (eventId: number | string) => {
    const res = await apiClient.post(`/api/participation/events/${eventId}/auto-seed`)
    return res.data.data
  },
  getParticipant: async (id: number | string) => {
    const res = await apiClient.get(`/api/participation/participants/${id}`)
    return res.data.data
  },
  updateStatus: async (id: number | string, status: string) => {
    const res = await apiClient.patch(`/api/participation/participants/${id}/status`, { status })
    return res.data.data
  },
  assignSeed: async (id: number | string, seed: number) => {
    const res = await apiClient.patch(`/api/participation/participants/${id}/seed`, { seed })
    return res.data.data
  },
  withdraw: async (id: number | string) => {
    const res = await apiClient.delete(`/api/participation/participants/${id}`)
    return res.data
  }
}

export const notificationApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/api/notifications', { params })
    return res.data as Paginated<any>
  },
  getUnreadCount: async () => {
    const res = await apiClient.get('/api/notifications/unread-count')
    return res.data.data
  },
  markAsRead: async (id: number | string) => {
    const res = await apiClient.patch(`/api/notifications/${id}/read`)
    return res.data.data
  },
}

export const paymentApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/api/payments', { params })
    return res.data as Paginated<any>
  },
  getById: async (id: number | string) => {
    const res = await apiClient.get(`/api/payments/${id}`)
    return res.data.data
  },
  create: async (data: any) => {
    const res = await apiClient.post('/api/payments', data)
    return res.data.data
  },
  updateStatus: async (id: number | string, status: string) => {
    const res = await apiClient.patch(`/api/payments/${id}/status`, { status })
    return res.data.data
  },
  createExpense: async (data: any) => {
    const res = await apiClient.post('/api/payments/expenses', data)
    return res.data.data
  },
  getRevenueStats: async () => {
    const res = await apiClient.get('/api/payments/revenue-stats')
    return res.data.data
  }
}

export const reportingApi = {
  getInventory: async () => {
    const res = await apiClient.get('/api/reports/inventory')
    return res.data.data  // returns array directly
  },
  getActivityLog: async (params?: any) => {
    const res = await apiClient.get('/api/reports/activity-log', { params })
    return res.data as Paginated<any>
  },
  getLeaderboard: async (params?: any) => {
    const res = await apiClient.get('/api/reports/leaderboard', { params })
    return res.data.data
  },
  getNews: async (params?: any) => {
    const res = await apiClient.get('/api/reports/news', { params })
    return res.data as Paginated<any>
  },
  createNews: async (data: any) => {
    const res = await apiClient.post('/api/reports/news', data)
    return res.data.data
  },
  updateNews: async (id: number | string, data: any) => {
    const res = await apiClient.put(`/api/reports/news/${id}`, data)
    return res.data.data
  },
  createInventory: async (data: any) => {
    const res = await apiClient.post('/api/reports/inventory', data)
    return res.data.data
  },
  updateInventory: async (sku: string, data: any) => {
    const res = await apiClient.put(`/api/reports/inventory/${sku}`, data)
    return res.data.data
  },
  issueInventory: async (sku: string, data: any) => {
    const res = await apiClient.post(`/api/reports/inventory/${sku}/issue`, data)
    return res.data.data
  }
}

export const configApi = {
  get: async () => {
    const res = await apiClient.get('/api/config')
    return res.data.data
  },
  update: async (data: any) => {
    const res = await apiClient.patch('/api/config', data)
    return res.data.data
  }
}
