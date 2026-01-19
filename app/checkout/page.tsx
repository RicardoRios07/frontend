"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { Lock, AlertCircle, Loader2 } from "lucide-react"
import Script from "next/script"

// Declarar tipos globales para Payphone
declare global {
  interface Window {
    PPaymentButtonBox: any;
  }
}

interface FormData {
  fullName: string
  email: string
  phoneNumber: string
  documentId: string
}

interface FormErrors {
  [key: string]: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { user, token } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [payphoneLoaded, setPayphoneLoaded] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    documentId: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    // Pre-llenar datos del usuario si están disponibles
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        fullName: user.name || ""
      }))
    }
  }, [user])

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#1f3a5f] mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">Agrega productos antes de proceder al checkout</p>
          <Link href="/catalogo" className="inline-block bg-[#4a90e2] text-white px-8 py-3 rounded-lg font-semibold">
            Volver al Catálogo
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido"
    }

    if (!formData.email.includes("@")) {
      newErrors.email = "Por favor ingresa un email válido"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "El teléfono es requerido"
    } else if (!formData.phoneNumber.startsWith("+")) {
      newErrors.phoneNumber = "El teléfono debe incluir código de país (ej: +593999999999)"
    }

    if (!formData.documentId.trim()) {
      newErrors.documentId = "La cédula/pasaporte es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user) {
      router.push("/login")
      return
    }

    if (!payphoneLoaded) {
      alert("El sistema de pagos aún está cargando. Por favor espera un momento.")
      return
    }

    if (!window.PPaymentButtonBox) {
      alert("El sistema de pagos no se cargó correctamente. Por favor recarga la página.")
      return
    }

    setIsProcessing(true)

    try {
      if (token) {
        apiClient.setToken(token)
      }

      // Preparar productos para el backend
      const products = items.map(item => ({
        productId: String(item.id), // Asegurar que sea string para MongoDB
        quantity: item.quantity
      }))

      console.log("Sending payment request with:", {
        products,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        documentId: formData.documentId
      })

      // Obtener configuración de pago desde el backend
      const response = await apiClient.request("/payment/payphone/config", {
        method: "POST",
        body: JSON.stringify({
          products,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          documentId: formData.documentId
        }),
      })

      console.log("Response from backend:", response)
      
      if (!response.success) {
        throw new Error(response.message || "Error al obtener configuración de pago")
      }

      const { paymentConfig } = response

      console.log("Payment config:", paymentConfig)

      // Inicializar la Cajita de Pagos de Payphone
      const ppb = new window.PPaymentButtonBox(paymentConfig)

      // Renderizar el botón en el contenedor (ahora visible)
      ppb.render('pp-button')

      console.log("Payphone button rendered successfully")
      
      // Cambiar el estado para mostrar el botón de Payphone
      setIsProcessing(false)

    } catch (error: any) {
      console.error("Error processing payment:", error)
      alert(error.message || "Error al procesar el pago. Por favor intenta de nuevo.")
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Cargar scripts de Payphone */}
      <Script
        src="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Payphone script loaded successfully")
          setPayphoneLoaded(true)
        }}
        onError={(e) => {
          console.error("Error loading Payphone script:", e)
        }}
      />
      <Script
        strategy="afterInteractive"
        id="payphone-css"
        dangerouslySetInnerHTML={{
          __html: `
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css';
            document.head.appendChild(link);
          `
        }}
      />
      <style jsx global>{`
        .payphone-button-container {
          margin-top: 1rem;
        }
        
        /* Hide submit button when Payphone button is rendered */
        #pp-button:not(:empty) ~ #submit-button {
          display: none;
        }
        
        /* Style Payphone button */
        #pp-button button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1.125rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(46, 204, 113, 0.3);
        }
        
        #pp-button button:hover {
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(46, 204, 113, 0.4);
        }
        
        #pp-button button:active {
          transform: translateY(0);
        }
      `}</style>

      <main className="min-h-screen bg-white">
        <Header />

        {/* Page Header */}
        <section className="bg-[#1f3a5f] text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Carrito y Proceso de Pago</h1>
            <p className="text-gray-300 mt-2">Revisa tus artículos e ingresa tus datos para completar la compra</p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información de Contacto */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-[#1f3a5f] mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Información de Contacto
                  </h2>

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1f3a5f] mb-2">Nombre completo</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Tu nombre y apellidos"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.fullName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#4a90e2]"
                        }`}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1f3a5f] mb-2">Correo electrónico</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="correo@ejemplo.com"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#4a90e2]"
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      <p className="text-xs text-gray-600 mt-1">Recibirás el acceso a tus libros digitales aquí</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1f3a5f] mb-2">Teléfono</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+593999999999"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.phoneNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#4a90e2]"
                        }`}
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                      <p className="text-xs text-gray-600 mt-1">Formato: +código_país + número (ej: +593999999999)</p>
                    </div>

                    {/* Document ID */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1f3a5f] mb-2">Cédula/Pasaporte</label>
                      <input
                        type="text"
                        name="documentId"
                        value={formData.documentId}
                        onChange={handleInputChange}
                        placeholder="1234567890"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.documentId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#4a90e2]"
                        }`}
                      />
                      {errors.documentId && <p className="text-red-500 text-xs mt-1">{errors.documentId}</p>}
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-[#4a90e2] rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[#4a90e2] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#4a90e2]">
                    <p className="font-semibold mb-1">PAGO 100% SEGURO CON PAYPHONE</p>
                    <p>Acepta pagos con tarjetas Visa, MasterCard, Diners Club, Discover o saldo Payphone.</p>
                  </div>
                </div>

                {/* Container for Payphone button */}
                <div id="pp-button" className="payphone-button-container"></div>

                {/* Submit Button - only show if Payphone button is not rendered */}
                <button
                  type="submit"
                  disabled={isProcessing || !payphoneLoaded}
                  className="w-full bg-[#2ecc71] hover:bg-[#27a85f] disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
                  id="submit-button"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando pago...
                    </>
                  ) : !payphoneLoaded ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cargando sistema de pagos...
                    </>
                  ) : (
                    `Pagar con Payphone - $${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#f2f2f2] rounded-lg p-6 sticky top-24 space-y-6">
                <div>
                  <h3 className="font-bold text-[#1f3a5f] mb-4">Resumen de Compra</h3>
                  <div className="space-y-3 border-b border-gray-300 pb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-semibold text-[#1f3a5f]">{item.title}</p>
                          <p className="text-gray-600 text-xs">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-[#1f3a5f]">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-[#1f3a5f]">${total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos digitales</span>
                    <span className="font-semibold text-[#2ecc71]">Gratis</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-300 flex justify-between text-lg font-bold">
                  <span className="text-[#1f3a5f]">Total</span>
                  <span className="text-[#2ecc71]">${total.toFixed(2)}</span>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#1f3a5f]">Lo que recibirás:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Acceso digital inmediato</li>
                    <li>✓ Descarga en PDF y ePub</li>
                    <li>✓ Acceso de por vida</li>
                    <li>✓ Actualizaciones futuras</li>
                  </ul>
                </div>

                <Link
                  href="/carrito"
                  className="block text-center text-[#4a90e2] hover:text-[#3a7fcf] text-sm font-semibold"
                >
                  ← Volver al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
