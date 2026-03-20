"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

export type UserBet = {
  id: string
  optionId: string
  choice: "over" | "under" | "yes" | "no"
  amount: number
  odds: number
  status: "pending" | "won" | "lost"
  potentialWin: number
  city: string
  description: string
  createdAt: string
}

export type User = {
  id: string
  username: string
  passwordHash: string
  coins: number
  loginStreak: number
  lastLoginDate: string | null
  bets: UserBet[]
  createdAt: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => { success: boolean; error?: string }
  register: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  claimDailyBonus: () => { success: boolean; coins?: number; streak?: number; error?: string }
  canClaimBonus: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "weather_app_users_v2"
const SESSION_KEY = "weather_app_session_v2"

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

export function getDailyBonusAmount(streak: number): number {
  return Math.floor(100 * Math.pow(1.1, streak - 1))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY)
      if (sessionId) {
        const usersData = localStorage.getItem(STORAGE_KEY)
        if (usersData) {
          const users: User[] = JSON.parse(usersData)
          const found = users.find((u) => u.id === sessionId)
          if (found) setUser(found)
        }
      }
    } catch (e) {
      console.error("Auth load error:", e)
    }
    setIsLoading(false)
  }, [])

  const getUsers = (): User[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  const saveUsers = (users: User[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }

  const login = useCallback((username: string, password: string) => {
    const users = getUsers()
    const hash = simpleHash(password)
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.passwordHash === hash
    )
    if (!found)
      return { success: false, error: "Tên đăng nhập hoặc mật khẩu không đúng" }
    localStorage.setItem(SESSION_KEY, found.id)
    setUser(found)
    return { success: true }
  }, [])

  const register = useCallback((username: string, password: string) => {
    if (username.length < 3)
      return { success: false, error: "Tên đăng nhập phải có ít nhất 3 ký tự" }
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return {
        success: false,
        error: "Tên đăng nhập chỉ dùng chữ cái, số và dấu _",
      }
    if (password.length < 6)
      return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" }

    const users = getUsers()
    if (users.find((u) => u.username.toLowerCase() === username.toLowerCase()))
      return { success: false, error: "Tên đăng nhập đã tồn tại" }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      passwordHash: simpleHash(password),
      coins: 10000,
      loginStreak: 0,
      lastLoginDate: null,
      bets: [],
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveUsers(users)
    localStorage.setItem(SESSION_KEY, newUser.id)
    setUser(newUser)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!user) return
      const users = getUsers()
      const idx = users.findIndex((u) => u.id === user.id)
      if (idx === -1) return
      const updated = { ...users[idx], ...updates }
      users[idx] = updated
      saveUsers(users)
      setUser(updated)
    },
    [user]
  )

  const canClaimBonus = !isToday(user?.lastLoginDate ?? null)

  const claimDailyBonus = useCallback(() => {
    if (!user) return { success: false, error: "Chưa đăng nhập" }
    if (isToday(user.lastLoginDate))
      return { success: false, error: "Bạn đã điểm danh hôm nay rồi" }

    let newStreak = 1
    if (user.lastLoginDate && isYesterday(user.lastLoginDate)) {
      newStreak = user.loginStreak >= 7 ? 1 : user.loginStreak + 1
    }

    const bonus = getDailyBonusAmount(newStreak)
    updateUser({
      coins: user.coins + bonus,
      loginStreak: newStreak,
      lastLoginDate: new Date().toISOString(),
    })
    return { success: true, coins: bonus, streak: newStreak }
  }, [user, updateUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        canClaimBonus,
        claimDailyBonus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
