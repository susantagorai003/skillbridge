import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'
import { DASHBOARD_ROUTES } from '../utils/constants'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authService.getCurrentUser()
        .then((res) => {
          if (res.data.success) setUser(res.data.user)
        })
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password })
    if (res.data.success) {
      localStorage.setItem('access_token', res.data.tokens.access_token)
      localStorage.setItem('refresh_token', res.data.tokens.refresh_token)
      setUser(res.data.user)
      return res.data
    }
    throw new Error(res.data.errors?.email || 'Login failed')
  }, [])

  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    if (res.data.success) {
      localStorage.setItem('access_token', res.data.tokens.access_token)
      localStorage.setItem('refresh_token', res.data.tokens.refresh_token)
      setUser(res.data.user)
      return res.data
    }
    throw new Error('Registration failed')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout API errors
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getCurrentUser()
      if (res.data.success) setUser(res.data.user)
    } catch {
      // Ignore
    }
  }, [])

  const isAuthenticated = !!user
  const hasRole = useCallback((role) => user?.role === role, [user])
  const getDashboardPath = useCallback(
    () => (user ? DASHBOARD_ROUTES[user.role] || '/' : '/'),
    [user]
  )

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    getDashboardPath,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
