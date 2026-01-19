"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit2, Trash2, Plus, Search, BookOpen, Filter, CheckCircle, XCircle, Package } from "lucide-react"
import Link from "next/link"

interface Product {
  _id: string
  title: string
  price: number
  authors: string[]
  year: number
  active: boolean
  synopsis: string
  coverImage: string
}

export default function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (token) {
          apiClient.setToken(token)
        }
        const response = await apiClient.adminGetProducts()
        setProducts(response.data || response || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchProducts()
    }
  }, [token])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

    try {
      if (token) {
        apiClient.setToken(token)
      }
      await apiClient.adminDeleteProduct(id)
      setProducts(products.filter((p) => p._id !== id))
    } catch (error) {
      alert("Error al eliminar el producto")
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authors.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && p.active) ||
      (filterActive === "inactive" && !p.active)
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.active).length,
    inactive: products.filter(p => !p.active).length,
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
              <p className="text-slate-600">{stats.total} libros • {stats.active} activos</p>
            </div>
          </div>
          <Link href="/admin/productos/crear">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2 shadow-lg shadow-blue-500/30 font-semibold">
              <Plus className="w-4 h-4" />
              Nuevo Libro
            </Button>
          </Link>
        </div>
      </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Libros</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Libros Activos</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Libros Inactivos</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 p-4 shadow-sm border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterActive === "all" ? "default" : "outline"}
                onClick={() => setFilterActive("all")}
                className={`h-10 ${filterActive === "all" ? "bg-blue-600 hover:bg-blue-700" : "bg-white"}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Todos
              </Button>
              <Button
                variant={filterActive === "active" ? "default" : "outline"}
                onClick={() => setFilterActive("active")}
                className={`h-10 ${filterActive === "active" ? "bg-green-600 hover:bg-green-700" : "bg-white"}`}
              >
                Activos
              </Button>
              <Button
                variant={filterActive === "inactive" ? "default" : "outline"}
                onClick={() => setFilterActive("inactive")}
                className={`h-10 ${filterActive === "inactive" ? "bg-red-600 hover:bg-red-700" : "bg-white"}`}
              >
                Inactivos
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card className="overflow-hidden shadow-xl border-slate-200">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-96">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-700 mb-2">No hay productos disponibles</p>
              <p className="text-slate-500 mb-6">
                {searchTerm ? "No se encontraron resultados para tu búsqueda" : "Crea tu primer libro para comenzar"}
              </p>
              {!searchTerm && (
                <Link href="/admin/productos/crear">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Libro
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="text-slate-900 font-bold">Título</TableHead>
                    <TableHead className="text-slate-900 font-bold">Autores</TableHead>
                    <TableHead className="text-slate-900 font-bold">Año</TableHead>
                    <TableHead className="text-slate-900 font-bold">Precio</TableHead>
                    <TableHead className="text-slate-900 font-bold">Estado</TableHead>
                    <TableHead className="text-slate-900 font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-900 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={product.coverImage}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                          <span className="line-clamp-2">{product.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{product.authors.join(", ")}</TableCell>
                      <TableCell className="text-slate-600">{product.year}</TableCell>
                      <TableCell className="font-semibold text-green-700">${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            product.active
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          } font-semibold border`}
                        >
                          {product.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/admin/productos/${product._id}/editar`}>
                            <Button size="sm" variant="outline" className="gap-2 bg-white hover:bg-blue-50 hover:border-blue-300">
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:border-red-300 bg-white"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
