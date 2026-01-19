"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ShoppingCart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  BarChart3,
  Package
} from "lucide-react"
import { useState } from "react"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      description: "Vista general",
    },
    {
      title: "Productos",
      icon: Package,
      href: "/admin/productos",
      description: "Gestionar libros",
    },
    {
      title: "Órdenes",
      icon: ShoppingCart,
      href: "/admin/ordenes",
      description: "Pedidos de clientes",
    },
    {
      title: "Usuarios",
      icon: Users,
      href: "/admin/usuarios",
      description: "Administrar usuarios",
    },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm">Admin Panel</span>
                <span className="text-xs text-slate-500">E-commerce</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            )}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  title={isCollapsed ? item.title : ""}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"}`} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      <p className={`text-xs truncate ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                  {!isCollapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <Link href="/">
          <Button
            variant="outline"
            className={`w-full ${isCollapsed ? "px-0" : ""} justify-start gap-3 bg-white hover:bg-slate-50 border-slate-300`}
            title={isCollapsed ? "Ver Tienda" : ""}
          >
            <Store className="w-5 h-5 text-slate-600" />
            {!isCollapsed && <span className="text-sm font-medium">Ver Tienda</span>}
          </Button>
        </Link>
        
        <Button
          variant="outline"
          onClick={handleLogout}
          className={`w-full ${isCollapsed ? "px-0" : ""} justify-start gap-3 bg-white hover:bg-red-50 border-slate-300 hover:border-red-300 text-red-600 hover:text-red-700`}
          title={isCollapsed ? "Cerrar Sesión" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  )
}
