"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, BookOpen, DollarSign, Calendar, Users, Image, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CreateProductPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    authors: "",
    year: new Date().getFullYear(),
    price: 0,
    coverImage: "",
    pdfUrl: "",
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: any) => {
    const errors: Record<string, string> = { ...validationErrors }
    
    switch (name) {
      case "title":
        if (!value || value.trim().length < 3) {
          errors.title = "El título debe tener al menos 3 caracteres"
        } else {
          delete errors.title
        }
        break
      case "synopsis":
        if (!value || value.trim().length < 20) {
          errors.synopsis = "La sinopsis debe tener al menos 20 caracteres"
        } else {
          delete errors.synopsis
        }
        break
      case "authors":
        if (!value || value.trim().length < 3) {
          errors.authors = "Debe ingresar al menos un autor"
        } else {
          delete errors.authors
        }
        break
      case "year":
        const yearNum = Number(value)
        if (!yearNum || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
          errors.year = "Ingrese un año válido"
        } else {
          delete errors.year
        }
        break
      case "price":
        const priceNum = Number(value)
        if (!priceNum || priceNum <= 0) {
          errors.price = "El precio debe ser mayor a 0"
        } else {
          delete errors.price
        }
        break
      case "coverImage":
        if (!value || !value.startsWith("http")) {
          errors.coverImage = "Debe ser una URL válida"
        } else {
          delete errors.coverImage
        }
        break
    }
    
    setValidationErrors(errors)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newValue = name === "year" || name === "price" ? Number.parseFloat(value) || 0 : value
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))
    
    validateField(name, newValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validar todos los campos
    Object.keys(formData).forEach(key => {
      if (key !== "pdfUrl") {
        validateField(key, formData[key as keyof typeof formData])
      }
    })

    if (Object.keys(validationErrors).length > 0) {
      setError("Por favor corrige los errores en el formulario")
      return
    }

    setIsLoading(true)

    try {
      if (token) {
        apiClient.setToken(token)
      }

      const payload = {
        title: formData.title.trim(),
        synopsis: formData.synopsis.trim(),
        authors: formData.authors.split(",").map((a) => a.trim()).filter(a => a.length > 0),
        year: formData.year,
        price: formData.price,
        coverImage: formData.coverImage.trim(),
        pdfUrl: formData.pdfUrl?.trim() || undefined,
      }

      await apiClient.adminCreateProduct(payload)
      setSuccess(true)
      
      setTimeout(() => {
        router.push("/admin/productos")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el producto")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <Link href="/admin/productos">
          <Button variant="ghost" size="sm" className="mb-4 text-slate-700 hover:text-slate-900 hover:bg-slate-100 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Productos
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Crear Nuevo Libro</h1>
            <p className="text-slate-600">Completa la información del producto</p>
          </div>
        </div>
      </div>
        {/* Success Message */}
        {success && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">¡Producto creado exitosamente!</p>
                <p className="text-sm text-green-700">Redirigiendo al listado...</p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Error al crear el producto</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="shadow-xl border-slate-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-8">
              {/* Información Básica */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Información Básica</h2>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                      Título del Libro <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Ej: Domina Python en 30 Días"
                      required
                      disabled={isLoading}
                      className={`h-11 ${validationErrors.title ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {validationErrors.title && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {validationErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="synopsis" className="block text-sm font-semibold text-slate-700 mb-2">
                      Sinopsis <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="synopsis"
                      name="synopsis"
                      value={formData.synopsis}
                      onChange={handleChange}
                      placeholder="Describe el contenido, objetivos y beneficios del libro..."
                      rows={5}
                      required
                      disabled={isLoading}
                      className={`resize-none ${validationErrors.synopsis ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      {validationErrors.synopsis ? (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {validationErrors.synopsis}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">Mínimo 20 caracteres</p>
                      )}
                      <p className="text-sm text-slate-500">{formData.synopsis.length} caracteres</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Autores y Publicación */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Autores y Publicación</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="authors" className="block text-sm font-semibold text-slate-700 mb-2">
                      Autores <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="authors"
                      type="text"
                      name="authors"
                      value={formData.authors}
                      onChange={handleChange}
                      placeholder="Juan Pérez, María García"
                      required
                      disabled={isLoading}
                      className={`h-11 ${validationErrors.authors ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {validationErrors.authors ? (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {validationErrors.authors}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-sm text-slate-500">Separa múltiples autores con comas</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-semibold text-slate-700 mb-2">
                      Año de Publicación <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="year"
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="2024"
                        required
                        disabled={isLoading}
                        className={`h-11 pl-10 ${validationErrors.year ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                    </div>
                    {validationErrors.year && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {validationErrors.year}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Precio */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Precio</h2>
                </div>
                
                <div className="max-w-xs">
                  <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-2">
                    Precio en USD <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                    <Input
                      id="price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="29.99"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLoading}
                      className={`h-11 pl-7 ${validationErrors.price ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {validationErrors.price}
                    </p>
                  )}
                </div>
              </section>

              {/* Contenido Multimedia */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Image className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Contenido Multimedia</h2>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="coverImage" className="block text-sm font-semibold text-slate-700 mb-2">
                      URL de la Portada <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="coverImage"
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/portada.jpg"
                      required
                      disabled={isLoading}
                      className={`h-11 ${validationErrors.coverImage ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {validationErrors.coverImage ? (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {validationErrors.coverImage}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-sm text-slate-500">Formato recomendado: JPG o PNG (min. 800x1200px)</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pdfUrl" className="block text-sm font-semibold text-slate-700 mb-2">
                      URL del PDF <span className="text-slate-500 font-normal">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="pdfUrl"
                        type="url"
                        name="pdfUrl"
                        value={formData.pdfUrl}
                        onChange={handleChange}
                        placeholder="https://ejemplo.com/libro.pdf"
                        disabled={isLoading}
                        className="h-11 pl-10"
                      />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-500">Si no especificas un PDF, se generará automáticamente</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-8 mt-8 border-t border-slate-200">
              <Link href="/admin/productos" className="flex-1 sm:flex-none">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full sm:w-auto px-8 h-11 bg-white hover:bg-slate-50" 
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 sm:flex-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-11 shadow-lg shadow-blue-500/30 font-semibold" 
                disabled={isLoading || Object.keys(validationErrors).length > 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creando Libro...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Crear Libro
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }
