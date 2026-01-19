"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "USER"
}

export function ProtectedRoute({ children, requiredRole = "USER" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && requiredRole === "ADMIN" && user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, isLoading, router, requiredRole])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4a90e2] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1f3a5f] mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    )
  }

  return children
}
