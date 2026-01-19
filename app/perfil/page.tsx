"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, User, Shield, ShoppingBag, FileText, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

interface Order {
  _id: string
  amount: number
  paymentStatus: string
  createdAt: string
  products: Array<{
    title: string
    price: number
    quantity: number
  }>
}

export default function ProfilePage() {
  const { user, logout, isLoading, token } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) return

      try {
        apiClient.setToken(token)
        const response = await apiClient.getMyOrders()
        const allOrders = response.data || response || []
        // Mostrar solo las últimas 5 órdenes
        setOrders(allOrders.slice(0, 5))
      } catch (err) {
        console.error("Error cargando órdenes:", err)
      } finally {
        setOrdersLoading(false)
      }
    }

    if (user && token) {
      fetchOrders()
    }
  }, [user, token])

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-[#4a90e2] animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID")
  const totalSpent = paidOrders.reduce((acc, o) => acc + o.amount, 0)

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-[#1f3a5f] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Mi Perfil</h1>
          <p className="text-gray-300 mt-2">Gestiona tu cuenta y revisa tu historial de compras</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#4a90e2] to-[#2ecc71] rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f3a5f]">{user.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
              <div className="mt-4 inline-block px-3 py-1 bg-blue-50 rounded-full">
                <p className="text-[#4a90e2] text-xs font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                </p>
              </div>
              <Button onClick={handleLogout} className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white gap-2">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </Card>

            {/* Stats Card */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#1f3a5f] mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#4a90e2]" />
                    <span className="text-sm text-gray-600">Compras</span>
                  </div>
                  <span className="text-xl font-bold text-[#1f3a5f]">{paidOrders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#2ecc71]" />
                    <span className="text-sm text-gray-600">Libros</span>
                  </div>
                  <span className="text-xl font-bold text-[#1f3a5f]">
                    {paidOrders.reduce(
                      (acc, o) => acc + o.products.reduce((sum, p) => sum + p.quantity, 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Total invertido</span>
                  <span className="text-xl font-bold text-[#2ecc71]">${totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Account Details and Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[#1f3a5f] mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre Completo</label>
                  <p className="text-lg font-semibold text-[#1f3a5f]">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-[#1f3a5f]">{user.email}</p>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                      Verificado
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo de Cuenta</label>
                  <p className="text-lg font-semibold text-[#1f3a5f]">
                    {user.role === "ADMIN" ? "Administrador" : "Usuario Regular"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recent Orders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#1f3a5f] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Compras Recientes
                </h3>
                <Link href="/biblioteca" className="text-[#4a90e2] hover:underline text-sm font-semibold">
                  Ver todas →
                </Link>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[#4a90e2] animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Aún no has realizado ninguna compra</p>
                  <Link
                    href="/catalogo"
                    className="inline-block bg-[#4a90e2] hover:bg-[#3a7fcf] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Explorar Catálogo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1f3a5f]">
                            Orden #{order._id.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("es-EC", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.paymentStatus === "PAID"
                            ? "Pagado"
                            : order.paymentStatus === "PENDING"
                            ? "Pendiente"
                            : "Fallido"}
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        {order.products.map((product, idx) => (
                          <p key={idx} className="text-sm text-gray-700">
                            • {product.title}{" "}
                            {product.quantity > 1 && <span className="text-gray-500">(x{product.quantity})</span>}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-lg font-bold text-[#2ecc71]">${order.amount.toFixed(2)}</span>
                        {order.paymentStatus === "PAID" && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://18.221.14.186:3001/api"}/orders/${
                              order._id
                            }/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4a90e2] hover:text-[#3a7fcf] text-sm font-semibold flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Descargar
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[#1f3a5f] mb-6">Acciones de Cuenta</h3>
              <div className="space-y-3">
                {user.role === "ADMIN" && (
                  <>
                    <Link href="/admin/dashboard">
                      <Button className="w-full bg-[#4a90e2] hover:bg-[#3a7bd5] text-white justify-start">
                        Ir al Panel de Administración
                      </Button>
                    </Link>
                    <Link href="/admin/productos">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        Gestionar Productos
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/biblioteca">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Mi Biblioteca Digital
                  </Button>
                </Link>
                <Link href="/catalogo">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Ver Catálogo Completo
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Security Section */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-xl font-bold text-[#1f3a5f] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad y Pagos
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Tu cuenta está protegida con autenticación JWT. Los pagos se procesan de forma segura con Payphone.
              </p>
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">Autenticación JWT habilitada</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">Pagos seguros con Payphone</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">Datos encriptados en tránsito</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
