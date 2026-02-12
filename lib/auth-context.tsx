// auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiClient } from "./api-client" 

export interface User {
  id: string
  email: string
  name: string
  role: "USER" | "ADMIN"
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const apiClientAuth = useMemo(() => new apiClient(), []) // guarantees setToken exists

  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("auth-token")
    const savedUser = localStorage.getItem("auth-user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      apiClientAuth.setToken(savedToken)
    }

    setIsLoading(false)
  }, [apiClient])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClientAuth.login(email, password)

      const newToken = response.token
      const newUser = response.user

      setToken(newToken)
      setUser(newUser)
      apiClientAuth.setToken(newToken)

      localStorage.setItem("auth-token", newToken)
      localStorage.setItem("auth-user", JSON.stringify(newUser))
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      await apiClientAuth.register(email, password, name)
      await login(email, password)
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error("Error en el registro")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    apiClientAuth.setToken(null)
    localStorage.removeItem("auth-token")
    localStorage.removeItem("auth-user")
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
