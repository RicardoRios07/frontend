"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AddToCartButton from "@/components/add-to-cart-button"
import { BookOpen, Sparkles, TrendingUp } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

interface Product {
  _id: string
  title: string
  synopsis: string
  price: number
  coverImage: string
  authors: string[]
}

export default function CatalogPreview() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products?page=1&limit=4`, { cache: "no-store" })
        if (!res.ok) throw new Error("Error loading products")
        const json = await res.json()
        const items = (json.data || json) as Product[]
        setProducts(items.slice(0, 4))
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-[#4a90e2]" />
            <Sparkles className="w-6 h-6 text-[#2ecc71]" />
          </div>
          <h2 className="text-4xl font-bold text-[#1f3a5f] mb-4">Libros Destacados</h2>
          <p className="text-gray-600 text-lg">Descubre nuestra colección de libros digitales</p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-product bg-white animate-pulse">
                <div className="bg-gray-200 h-64"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((book) => (
              <Link
                key={book._id}
                href={`/producto/${book._id}`}
                className="group card-product bg-white cursor-pointer hover:shadow-xl transition-shadow duration-300"
              >
                <div className="overflow-hidden bg-gray-200 h-64 relative">
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-[#2ecc71] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Popular
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-[#4a90e2] uppercase tracking-wider">
                    {book.authors?.[0] || "Autor"}
                  </p>
                  <h3 className="font-bold text-[#1f3a5f] mt-2 line-clamp-2 text-lg">{book.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{book.synopsis}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-2xl font-bold text-[#1f3a5f]">${book.price.toFixed(2)}</span>
                    <AddToCartButton
                      id={book._id}
                      title={book.title}
                      price={book.price}
                      image={book.coverImage}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay productos disponibles</p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-[#4a90e2] hover:bg-[#3a7fcf] text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Ver Todo el Catálogo
            <BookOpen className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
