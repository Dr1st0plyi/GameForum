import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthenticatedUser } from '../../api/client'
import { createApiClient } from '../../api/client'

interface AuthContextValue {
  user: AuthenticatedUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (token: string, user: AuthenticatedUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'graygay_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState<boolean>(!!token)
  const [error, setError] = useState<string | null>(null)

  const api = useMemo(() => createApiClient(() => token), [token])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    api
      .getMe()
      .then((me) => {
        if (!cancelled) {
          setUser(me)
          setError(null)
        }
      })
      .catch((e: unknown) => {
        console.error(e)
        if (!cancelled) {
          setUser(null)
          setToken(null)
          localStorage.removeItem(TOKEN_KEY)
          setError('Не удалось получить профиль, войдите заново')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, api])

  const value: AuthContextValue = {
    user,
    token,
    loading,
    error,
    login: (newToken, newUser) => {
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem(TOKEN_KEY, newToken)
      setError(null)
    },
    logout: () => {
      setToken(null)
      setUser(null)
      localStorage.removeItem(TOKEN_KEY)
      setError(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
