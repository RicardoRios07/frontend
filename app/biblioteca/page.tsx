"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Download, FileText, BookOpen, ShoppingCart, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Product {
  _id: string
  title: string
  authors: string[]
  coverImage: string
  pdfUrl?: string
}

interface OrderProduct {
  productId: Product
  price: number
  qty: number
}

interface Order {
  _id: string
  amount: number
  paymentStatus: string
  createdAt: string
  products: OrderProduct[]
}

interface PurchasedBook extends Product {
  purchaseDate: string
  pricePaid: number
}

export default function BibliotecaPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<PurchasedBook[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalBooks: 0,
    totalSpent: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user || !token) return

      try {
        apiClient.setToken(token)
        const response = await apiClient.getMyOrders()

        // Filter valid paid orders
        const paidOrders: Order[] = (response.data || response || []).filter(
          (order: any) => order.paymentStatus === "PAID"
        )

        // Calculate stats
        const totalSpent = paidOrders.reduce((sum, order) => sum + order.amount, 0)

        // Flatten to get all books
        const allBooks: PurchasedBook[] = []
        let bookCount = 0

        paidOrders.forEach(order => {
          if (order.products && Array.isArray(order.products)) {
            order.products.forEach(item => {
              if (item.productId) {
                bookCount += item.qty || 1
                // Add to list (we can choose to deduplicate or show multiple copies)
                // Let's deduplicate for the "My Library" view but keep count for stats
                const exists = allBooks.find(b => b._id === item.productId._id)
                if (!exists) {
                  allBooks.push({
                    ...item.productId,
                    purchaseDate: order.createdAt,
                    pricePaid: item.price
                  })
                }
              }
            })
          }
        })

        setBooks(allBooks)
        setStats({
          totalOrders: paidOrders.length,
          totalBooks: bookCount,
          totalSpent
        })

      } catch (err: any) {
        console.error("Error cargando biblioteca:", err)
        setError(err.message || "Error al cargar tu biblioteca")
      } finally {
        setIsLoading(false)
      }
    }

    if (user && token) {
      fetchLibrary()
    }
  }, [user, token])

  const handleDownload = async (book: PurchasedBook) => {
    try {
      setDownloadingId(book._id)
      await apiClient.downloadPurchasedProduct(book._id, book.title)
    } catch (err) {
      console.error("Error al descargar:", err)
      alert("Error al intentar descargar el libro. Asegúrate de que el archivo existe.")
    } finally {
      setDownloadingId(null)
    }
  }

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
        ) : books.length === 0 ? (
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
                <p className="text-4xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="bg-gradient-to-br from-[#2ecc71] to-[#27a85f] text-white rounded-lg p-6">
                <p className="text-green-100 text-sm font-semibold mb-1">Libros Adquiridos</p>
                <p className="text-4xl font-bold">{stats.totalBooks}</p>
              </div>
              <div className="bg-gradient-to-br from-[#f39c12] to-[#e67e22] text-white rounded-lg p-6">
                <p className="text-orange-100 text-sm font-semibold mb-1">Total Invertido</p>
                <p className="text-4xl font-bold">
                  ${stats.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Books Grid */}
            <div>
              <h2 className="text-2xl font-bold text-[#1f3a5f] mb-6">Tus Libros</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <div className="flex p-4 gap-4">
                      {/* Cover */}
                      <div className="w-24 h-36 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={book.coverImage ? apiClient.getFileUrl(book.coverImage) : "/placeholder-book.png"}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-book.png"
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-[#1f3a5f] line-clamp-2 mb-1">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{book.authors?.join(", ")}</p>
                        <p className="text-xs text-gray-400 mt-auto">
                          Adquirido el {new Date(book.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
                      <button
                        onClick={() => handleDownload(book)}
                        className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </button>
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
