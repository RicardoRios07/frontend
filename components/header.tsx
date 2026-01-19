"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, Menu, X, LogOut, LogIn } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-[#1f3a5f] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <div className="w-8 h-8 bg-[#2ecc71] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">DB</span>
          </div>
          <span>DigitalBooks</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/catalogo" className="hover:text-[#4a90e2] transition-colors">
            Catálogo
          </Link>
          <Link href="/biblioteca" className="hover:text-[#4a90e2] transition-colors">
            Mi Biblioteca
          </Link>
          <Link href="/soporte" className="hover:text-[#4a90e2] transition-colors">
            Soporte
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="hover:text-[#2ecc71] transition-colors font-semibold">
              Panel Admin
            </Link>
          )}
        </nav>

        {/* Cart, Auth and Mobile Menu */}
        <div className="flex items-center gap-4">
          <Link href="/carrito" className="relative p-2 hover:bg-[#4a90e2] rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2ecc71] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="hidden md:flex text-white hover:bg-[#4a90e2] gap-2"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button size="sm" className="bg-[#2ecc71] hover:bg-[#27ae60] text-white gap-2">
                <LogIn className="w-4 h-4" />
                Ingresar
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[#1a2a45] border-t border-[#4a90e2]">
          <Link href="/catalogo" className="block px-4 py-3 hover:bg-[#4a90e2]">
            Catálogo
          </Link>
          <Link href="/biblioteca" className="block px-4 py-3 hover:bg-[#4a90e2]">
            Mi Biblioteca
          </Link>
          <Link href="/soporte" className="block px-4 py-3 hover:bg-[#4a90e2]">
            Soporte
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="block px-4 py-3 hover:bg-[#2ecc71] font-semibold">
              Panel Admin
            </Link>
          )}
          <div className="border-t border-[#4a90e2]">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-[#4a90e2] flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            ) : (
              <Link href="/login" className="block px-4 py-3 hover:bg-[#4a90e2]">
                Ingresar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
