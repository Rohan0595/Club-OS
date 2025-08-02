"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  name: string
  email: string
  role: string
  club?: string
  id?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper functions for cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing authentication on app load
    const checkAuth = () => {
      try {
        const storedUser = getCookie('user')
        const storedAuth = getCookie('isAuthenticated')
        
        if (storedUser && storedAuth === 'true') {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear invalid data
        deleteCookie('user')
        deleteCookie('isAuthenticated')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: User) => {
    console.log('AuthContext: Logging in user:', userData)
    setUser(userData)
    setIsAuthenticated(true)
    setCookie('user', JSON.stringify(userData))
    setCookie('isAuthenticated', 'true')
    console.log('AuthContext: Cookies set, redirecting to dashboard')
    router.push('/dashboard')
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    deleteCookie('user')
    deleteCookie('isAuthenticated')
    router.push('/auth/login')
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 