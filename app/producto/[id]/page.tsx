import { notFound } from "next/navigation"
import Link from "next/link"
import AddToCartButton from "@/components/add-to-cart-button"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

// Solo usar productos reales del API de MongoDB - sin fallbacks

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error("not found")
    const data = await res.json()
    // API responde { success, data }
    const product = data.data || data
    return {
      id: product._id || product.id || id,  // Priorizar _id de MongoDB
      title: product.title,
      description: product.synopsis || product.description || "",
      price: product.price || 0,
      category: product.category || "libros",
      image: product.coverImage || "/placeholder.svg",
    }
  } catch (err) {
    console.error(`Error al cargar producto ${id}:`, err)
    return null
  }
}

interface PageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: PageProps) {
  const product = await fetchProduct(params.id)
  if (!product) return notFound()

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f4ff] to-white">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-[#4a90e2] font-semibold uppercase">{product.category}</p>
            <h1 className="text-3xl font-bold text-[#1f3a5f]">{product.title}</h1>
          </div>

          <p className="text-gray-700 leading-relaxed">{product.description || "Libro digital en formato PDF."}</p>

          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-[#1f3a5f]">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500">PDF descargable después del pago</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AddToCartButton id={product.id as any} title={product.title} price={product.price} image={product.image} />
            <Link href="/catalogo" className="text-[#1f3a5f] underline text-sm">
              Volver al catálogo
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
            <p>• Formato: PDF</p>
            <p>• Enlace de pago gestionado con Payphone</p>
            <p>• Descarga disponible tras confirmar el pago</p>
          </div>
        </div>
      </div>
    </main>
  )
}
