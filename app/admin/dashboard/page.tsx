"use client"

import { DashboardStats } from "@/components/admin/dashboard-stats"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { BookOpen, Plus, Store, ArrowRight, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Vista general de tu tienda</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="mb-8">
        <DashboardStats />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Gestionar Productos */}
          <Link href="/admin/productos" className="group">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 bg-white h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gestionar Productos</h3>
              <p className="text-sm text-slate-600">Ver, editar y administrar todos tus libros digitales</p>
            </Card>
          </Link>

          {/* Crear Nuevo Producto */}
          <Link href="/admin/productos/crear" className="group">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 bg-white h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Crear Nuevo Libro</h3>
              <p className="text-sm text-slate-600">Añade un nuevo producto al catálogo de la tienda</p>
            </Card>
          </Link>

          {/* Ver Tienda */}
          <Link href="/" className="group">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 bg-white h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ver Tienda</h3>
              <p className="text-sm text-slate-600">Visita el sitio web público y catálogo de productos</p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
