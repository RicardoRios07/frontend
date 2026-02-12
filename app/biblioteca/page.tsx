"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Download, FileText, BookOpen, ShoppingCart, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Order {
  _id: string
  amount: number
  paymentStatus: string
  createdAt: string
  products: Array<{
    productId?: string
    title: string
    price: number
    quantity: number
  }>
  pdfUrl?: string
}

export default function BibliotecaPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) return

      try {
        apiClient.setToken(token)
        const response = await apiClient.getMyOrders()
        
        // Filtrar solo órdenes pagadas
        const paidOrders = (response.data || response || []).filter(
          (order: Order) => order.paymentStatus === "PAID"
        )
        setOrders(paidOrders)
      } catch (err: any) {
        console.error("Error cargando órdenes:", err)
        setError(err.message || "Error al cargar tu biblioteca")
      } finally {
        setIsLoading(false)
      }
    }

    if (user && token) {
      fetchOrders()
    }
  }, [user, token])

  if (authLoading || (!user && !authLoading)) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-[#4a90e2] animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Mi Biblioteca Digital</h1>
          </div>
          <p className="text-blue-100 text-lg">Accede a todos tus libros comprados y descárgalos cuando quieras</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#4a90e2] animate-spin mb-4" />
            <p className="text-gray-600">Cargando tu biblioteca...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-[#4a90e2] hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Tu biblioteca está vacía</h2>
            <p className="text-gray-600 mb-6">
              Aún no has comprado ningún libro. ¡Explora nuestro catálogo y empieza a leer!
            </p>
            <Link
              href="/catalogo"
              className="inline-block bg-[#4a90e2] hover:bg-[#3a7fcf] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#4a90e2] to-[#357abd] text-white rounded-lg p-6">
                <p className="text-blue-100 text-sm font-semibold mb-1">Total de Compras</p>
                <p className="text-4xl font-bold">{orders.length}</p>
              </div>
              <div className="bg-gradient-to-br from-[#2ecc71] to-[#27a85f] text-white rounded-lg p-6">
                <p className="text-green-100 text-sm font-semibold mb-1">Libros Adquiridos</p>
                <p className="text-4xl font-bold">
                  {orders.reduce((acc, order) => 
                    acc + order.products.reduce((sum, p) => sum + p.quantity, 0), 0
                  )}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#f39c12] to-[#e67e22] text-white rounded-lg p-6">
                <p className="text-orange-100 text-sm font-semibold mb-1">Total Invertido</p>
                <p className="text-4xl font-bold">
                  ${orders.reduce((acc, order) => acc + order.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] mb-6">Tus Compras</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-[#4a90e2]/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#4a90e2]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Orden #{order._id.slice(-8)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("es-EC", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="space-y-2 mb-3">
                          {order.products.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {product.title} {product.quantity > 1 && `(x${product.quantity})`}
                              </span>
                              <span className="text-gray-600 font-semibold">
                                ${(product.price * product.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-sm font-semibold text-gray-700">Total:</span>
                          <span className="text-lg font-bold text-[#2ecc71]">${order.amount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:w-48">
                        <button
                          onClick={async () => {
                            try {
                              setDownloadingId(order._id)
                              await apiClient.downloadInvoice(order._id)
                            } catch (err: any) {
                              alert('Error al descargar: ' + err.message)
                            } finally {
                              setDownloadingId(null)
                            }
                          }}
                          disabled={downloadingId === order._id}
                          className="w-full bg-[#2ecc71] hover:bg-[#27a85f] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {downloadingId === order._id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Descargando...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Descargar PDF
                            </>
                          )}
                        </button>
                        <button
                          className="w-full bg-white border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
