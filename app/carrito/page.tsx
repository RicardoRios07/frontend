"use client"

import { useCart } from "@/lib/cart-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-[#1f3a5f] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Tu Carrito</h1>
          <p className="text-gray-300 mt-2">Revisa tus artículos e ingresa tus datos para completar la compra</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-[#f2f2f2]">
                  <h2 className="text-lg font-bold text-[#1f3a5f]">Artículos Seleccionados</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="px-6 py-4 flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-bold text-[#1f3a5f] text-base">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Acceso digital inmediato · PDF + ePub</p>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-bold text-[#1f3a5f]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>

                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4 text-[#1f3a5f]" />
                          </button>
                          <span className="px-3 py-1 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4 text-[#1f3a5f]" />
                          </button>
                        </div>

                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/catalogo" className="inline-block text-[#4a90e2] hover:text-[#3a7fcf] font-semibold">
                  ← Continuar comprando
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#f2f2f2] rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-[#1f3a5f] mb-6">Resumen de Compra</h2>

                <div className="space-y-4 pb-6 border-b border-gray-300">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-[#1f3a5f]">${total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos digitales</span>
                    <span className="font-semibold text-[#2ecc71]">Gratis</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-[#1f3a5f] py-4 mb-6">
                  <span>Total</span>
                  <span className="text-[#2ecc71]">${total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full block text-center bg-[#2ecc71] hover:bg-[#27a85f] text-white py-3 rounded-lg font-semibold transition-colors mb-4"
                >
                  Finalizar Compra
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full text-center bg-white border border-gray-300 text-[#1f3a5f] py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Vaciar Carrito
                </button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-[#4a90e2]">
                  <p className="text-xs text-[#4a90e2] font-semibold">
                    Al hacer clic en "Finalizar Compra", aceptas nuestros términos de uso. El material se enviará
                    automáticamente tras la confirmación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">No has añadido ningún producto todavía</p>
            <Link
              href="/catalogo"
              className="inline-block bg-[#4a90e2] hover:bg-[#3a7fcf] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explorar Catálogo
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
