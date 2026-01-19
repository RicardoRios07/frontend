"use client"

import type React from "react"

import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProductData {
  _id: string
  title: string
  synopsis: string
  authors: string[]
  year: number
  price: number
  coverImage: string
  pdfUrl?: string
  active: boolean
}

export default function EditProductPage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<ProductData | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (token) {
          apiClient.setToken(token)
        }
        const response = await apiClient.adminGetProducts()
        const product = (response.data || response || []).find((p: ProductData) => p._id === productId)
        if (product) {
          setFormData(product)
        } else {
          setError("Producto no encontrado")
        }
      } catch (err) {
        setError("Error al cargar el producto")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchProduct()
    }
  }, [token, productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev!,
      [name]: name === "year" || name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setError("")
    setIsSaving(true)

    try {
      if (token) {
        apiClient.setToken(token)
      }

      const payload = {
        title: formData.title,
        synopsis: formData.synopsis,
        authors: formData.authors,
        year: formData.year,
        price: formData.price,
        coverImage: formData.coverImage,
        pdfUrl: formData.pdfUrl || undefined,
        active: formData.active,
      }

      await apiClient.adminUpdateProduct(productId, payload)
      router.push("/admin/productos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el producto")
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || !user || user.role !== "ADMIN") {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4a90e2] animate-spin" />
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-[#f2f2f2]">
        <header className="bg-[#1f3a5f] text-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/admin/productos">
            <Button>Volver a Productos</Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      {/* Header */}
      <header className="bg-[#1f3a5f] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/productos">
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#4a90e2] gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Editar Producto</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Título del Libro *</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Precio (USD) *</label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Sinopsis *</label>
              <Textarea
                name="synopsis"
                value={formData.synopsis}
                onChange={handleChange}
                rows={4}
                required
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Autores (separados por coma) *</label>
                <Input
                  type="text"
                  name="authors"
                  value={formData.authors.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev!,
                      authors: e.target.value.split(",").map((a) => a.trim()),
                    }))
                  }
                  required
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Año de Publicación *</label>
                <Input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">URL de Portada (Imagen) *</label>
              <Input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">URL del PDF (Opcional)</label>
              <Input
                type="url"
                name="pdfUrl"
                value={formData.pdfUrl || ""}
                onChange={handleChange}
                disabled={isSaving}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 bg-[#4a90e2] hover:bg-[#3a7bd5] text-white" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              <Link href="/admin/productos" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent" disabled={isSaving}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
