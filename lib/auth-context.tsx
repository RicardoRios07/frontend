"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "./api-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

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
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth-token")
    const savedUser = localStorage.getItem("auth-user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      apiClient.setToken(savedToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(email, password)

      // La API devuelve { user, token }
      const newToken = response.token
      const newUser = response.user

      setToken(newToken)
      setUser(newUser)
      apiClient.setToken(newToken)
      localStorage.setItem("auth-token", newToken)
      localStorage.setItem("auth-user", JSON.stringify(newUser))

      console.log("[v0] Login successful for user:", newUser.email)
    } catch (error) {
      console.error("[v0] Login error:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.register(email, password, name)

      console.log("[v0] Registration successful for user:", email)

      // Auto-login after registration
      await login(email, password)
    } catch (error) {
      console.error("[v0] Register error:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Error en el registro")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    apiClient.setToken(null)
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
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
