"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShoppingCart, Search, Package, Calendar, DollarSign } from "lucide-react"

interface Order {
  _id: string
  userId: {
    name: string
    email: string
  }
  products: Array<{
    productId: string
    price: number
    qty: number
  }>
  amount: number
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  payphoneTransactionId: string
  createdAt: string
}

export default function AdminOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (token) {
          apiClient.setToken(token)
        }
        const response = await fetch("http://18.221.14.186:3001/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchOrders()
    }
  }, [token])

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      order._id.toLowerCase().includes(searchLower) ||
      order.userId?.name?.toLowerCase().includes(searchLower) ||
      order.userId?.email?.toLowerCase().includes(searchLower) ||
      order.payphoneTransactionId?.toLowerCase().includes(searchLower)
    )
  })

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.paymentStatus === "PAID").length,
    pending: orders.filter((o) => o.paymentStatus === "PENDING").length,
    failed: orders.filter((o) => o.paymentStatus === "FAILED").length,
    revenue: orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.amount, 0),
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Órdenes</h1>
            <p className="text-slate-600">{stats.total} órdenes totales • {stats.paid} pagadas</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Órdenes</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pagadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.paid}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">${stats.revenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6 p-4 shadow-sm border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por ID, usuario, email o transacción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-white"
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden shadow-xl border-slate-200">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Cargando órdenes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700 mb-2">No hay órdenes disponibles</p>
            <p className="text-slate-500">
              {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Las órdenes aparecerán aquí cuando los clientes realicen compras"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="text-slate-900 font-bold">ID Orden</TableHead>
                  <TableHead className="text-slate-900 font-bold">Cliente</TableHead>
                  <TableHead className="text-slate-900 font-bold">Productos</TableHead>
                  <TableHead className="text-slate-900 font-bold">Total</TableHead>
                  <TableHead className="text-slate-900 font-bold">Estado</TableHead>
                  <TableHead className="text-slate-900 font-bold">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-sm text-slate-600">
                      {order._id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{order.userId?.name || "Usuario eliminado"}</p>
                        <p className="text-xs text-slate-500">{order.userId?.email || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {order.products.length} {order.products.length === 1 ? "producto" : "productos"}
                    </TableCell>
                    <TableCell className="font-semibold text-green-700">
                      ${order.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          order.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : order.paymentStatus === "PENDING"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        } font-semibold border`}
                      >
                        {order.paymentStatus === "PAID" ? "Pagada" : order.paymentStatus === "PENDING" ? "Pendiente" : "Fallida"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
