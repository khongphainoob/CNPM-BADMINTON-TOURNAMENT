import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from './api'
import apiClient from '../lib/api-client'

export type UserStatus = 'approved' | 'pending' | 'rejected' | 'incomplete'
export type UserRole = 'admin' | 'btc' | 'referee' | 'athlete' | 'spectator' | null

export type User = {
  id: string | number
  name: string
  email: string
  phone: string | null
  role?: UserRole
  primary_role_code?: UserRole
  roles?: UserRole[]
  status: UserStatus
  created_at: string
  note?: string
}

export type Session = {
  userId: string | number
  role: UserRole
  name: string
  email: string
  clubId?: number | string | null
}

type AuthContextValue = {
  session: Session | null
  login: (credential: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  register: (payload: any) => Promise<{ ok: boolean; error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('bad.token')
      if (token) {
        try {
          const user = await authApi.me()
          setSession({
            userId: user.id,
            role: user.primary_role_code || 'spectator',
            name: user.name,
            email: user.email,
            clubId: user.club_id
          })
        } catch (error) {
          console.error('Failed to restore session:', error)
          localStorage.removeItem('bad.token')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credential: string, password: string) => {
    try {
      const { token, user } = await authApi.login(credential, password)
      localStorage.setItem('bad.token', token)
      setSession({
        userId: user.id,
        role: user.primary_role_code || 'spectator',
        name: user.name,
        email: user.email,
        clubId: user.club_id
      })
      return { ok: true }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Lỗi đăng nhập'
      const code = error.response?.data?.error?.code
      if (code === 'ACCOUNT_PENDING') return { ok: false, error: 'pending' }
      return { ok: false, error: msg }
    }
  }

  const logout = () => {
    localStorage.removeItem('bad.token')
    setSession(null)
  }

  const register = async (payload: any) => {
    try {
      await authApi.register(payload)
      return { ok: true }
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.error?.message || 'Đăng ký thất bại' }
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

