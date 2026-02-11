"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AddToCartButton from "@/components/add-to-cart-button"
import { Search, Filter } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

type CatalogProduct = {
  id: string | number
  title: string
  description: string
  price: number
  category: string
  image?: string
  rating?: number
  reviews?: number
}

// NO usar productos fallback - solo productos reales del API de MongoDB

const categories = ["Todos", "Programación", "Negocios", "Diseño", "Datos", "Finanzas", "Gestión", "Marketing"]

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [sortBy, setSortBy] = useState("relevance")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log('[Catálogo] Cargando productos desde:', `${API_BASE}/products`)
        const res = await fetch(`${API_BASE}/products?page=1&limit=100`, { cache: "no-store" })
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: No se pudieron cargar los productos`)
        }
        
        const json = await res.json()
        console.log('[Catálogo] Respuesta del servidor:', json)

        // Manejar diferentes formatos de respuesta
        let items = []
        if (json.success && Array.isArray(json.data)) {
          // Formato: { success: true, data: [...] }
          items = json.data
        } else if (Array.isArray(json.data)) {
          // Formato: { data: [...] }
          items = json.data
        } else if (Array.isArray(json)) {
          // Formato directo: [...]
          items = json
        } else if (json.success && json.data && typeof json.data === 'object') {
          // Formato: { success: true, data: {...} } - un solo producto
          items = [json.data]
        } else if (json.data && typeof json.data === 'object') {
          // Formato: { data: {...} } - un solo producto
          items = [json.data]
        }

        console.log('[Catálogo] Productos procesados:', items.length)

        const mapped: CatalogProduct[] = items.map((p) => ({
          id: p._id || p.id,
          title: p.title || 'Sin título',
          description: p.synopsis || p.description || '',
          price: parseFloat(p.price) || 0,
          category: p.category || 'Libros',
          image: p.coverImage || '/placeholder.svg',
          rating: 4.7,
          reviews: 120,
        }))

        if (mounted) {
          setProducts(mapped)
          console.log('[Catálogo] Productos cargados exitosamente:', mapped.length)
        }
      } catch (err: any) {
        console.error('[Catálogo] Error al cargar productos:', err)
        if (mounted) {
          setError(err.message || "Error al cargar productos. Verifica que el backend esté corriendo.")
          setProducts([])
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((p) => 
        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by price range
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    return filtered
  }, [products, selectedCategory, searchTerm, priceRange, sortBy])

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#1f3a5f] to-[#2d5a8f] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-3">Catálogo de Libros Digitales</h1>
          <p className="text-blue-100 text-lg">
            {isLoading 
              ? "Cargando productos..." 
              : `${products.length} ${products.length === 1 ? 'libro disponible' : 'libros disponibles'}${
                  filteredProducts.length !== products.length 
                    ? ` (${filteredProducts.length} ${filteredProducts.length === 1 ? 'resultado' : 'resultados'} con filtros)` 
                    : ''
                }`
            }
          </p>
          {error && (
            <div className="mt-3 bg-red-500/20 border border-red-300 rounded-lg p-3">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar libros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a90e2] bg-white text-[#333333]"
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-bold text-[#1f3a5f] mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categorías
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#2ecc71] text-white font-semibold"
                          : "bg-[#f2f2f2] text-[#333333] hover:bg-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-bold text-[#1f3a5f] mb-4">Rango de Precio</h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                      className="w-full accent-[#2ecc71]"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    ${priceRange[0].toFixed(2)} - ${priceRange[1].toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-bold text-[#1f3a5f] mb-4">Ordenar por</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a90e2] bg-white text-[#333333]"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor Calificación</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card-product bg-white">
                    <Link href={`/producto/${product.id}`} className="block overflow-hidden bg-gray-200 h-48 relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-[#2ecc71] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {product.category}
                      </div>
                    </Link>
                    <div className="p-4 space-y-3">
                      <div>
                        <Link href={`/producto/${product.id}`} className="hover:underline">
                          <h3 className="font-bold text-[#1f3a5f] line-clamp-2">{product.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-2xl font-bold text-[#1f3a5f]">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2 items-center">
                          <Link
                            href={`/producto/${product.id}`}
                            className="text-sm text-[#1f3a5f] underline"
                          >
                            Ver detalle
                          </Link>
                          <AddToCartButton
                            id={product.id}
                            title={product.title}
                            price={product.price}
                            image={product.image}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2ecc71] mx-auto"></div>
                    <p className="text-gray-600">Cargando productos...</p>
                  </div>
                ) : products.length === 0 && !error ? (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#1f3a5f]">No hay productos disponibles</h3>
                    <p className="text-gray-600">Pronto agregaremos nuevos libros digitales</p>
                  </div>
                ) : error ? (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-red-600">Error al cargar productos</h3>
                    <p className="text-gray-600">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-6 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-[#1f3a5f]">No se encontraron productos</h3>
                    <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("Todos")
                        setPriceRange([0, 100])
                      }}
                      className="mt-4 px-6 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
