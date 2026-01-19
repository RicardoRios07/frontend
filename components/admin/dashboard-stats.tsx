"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Loader2, Users, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"

interface DashboardData {
  usersCount: number
  productsCount: number
  ordersCount: number
  revenue: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (token) {
          apiClient.setToken(token)
        }
        const response = await apiClient.adminGetDashboard()
        console.log("Dashboard response:", response)
        setStats(response)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchStats()
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse bg-white border-slate-200">
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Usuarios",
      value: stats?.usersCount || 0,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-white",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Productos",
      value: stats?.productsCount || 0,
      icon: Package,
      gradient: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-white",
      borderColor: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Total Órdenes",
      value: stats?.ordersCount || 0,
      icon: ShoppingCart,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-white",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Ingresos Totales",
      value: `$${(stats?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-white",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      isRevenue: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            className={`p-6 bg-gradient-to-br ${stat.bgColor} ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {stat.isRevenue && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
