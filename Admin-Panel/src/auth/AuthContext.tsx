import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  clearTokens,
  getRefreshToken,
  setTokens,
} from "@/api/client"
import * as api from "@/api/endpoints"
import type { User } from "@/types/api"

const USER_KEY = "admin_user"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"])

function loadStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password)
    if (!ADMIN_ROLES.has(result.user.role)) {
      clearTokens()
      localStorage.removeItem(USER_KEY)
      throw new Error("Access denied. Admin credentials required.")
    }
    setTokens(result.accessToken, result.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await api.logout(refreshToken)
    } catch {
      // ignore logout errors
    } finally {
      clearTokens()
      localStorage.removeItem(USER_KEY)
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user ? ADMIN_ROLES.has(user.role) : false,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
