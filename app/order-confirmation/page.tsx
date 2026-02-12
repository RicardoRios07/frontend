"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Download, FileText, CheckCircle, ArrowRight, XCircle, Loader2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useCart } from "@/lib/cart-context"

interface OrderConfirmation {
  success: boolean
  message: string
  order?: {
    _id: string
    amount: number
    paymentStatus: string
    products: Array<{
      title: string
      price: number
      quantity: number
    }>
  }
  transaction?: {
    transactionId: number
    authorizationCode: string
    cardBrand: string
    lastDigits: string
    date: string
  }
}

function OrderConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const confirmPayment = async () => {
      // Obtener parámetros de la URL enviados por Payphone
      const id = searchParams.get('id')
      const clientTransactionId = searchParams.get('clientTransactionId')

      if (!id || !clientTransactionId) {
        setError('Parámetros de confirmación no encontrados')
        setIsLoading(false)
        return
      }

      try {
        // Confirmar pago con el backend
        const response = await apiClient.request("/payment/payphone/confirm", {
          method: "POST",
          body: JSON.stringify({
            id: parseInt(id),
            clientTransactionId
          }),
        })

        if (response.success) {
          setConfirmation(response)
          // Limpiar el carrito solo si el pago fue exitoso
          clearCart()
        } else {
          setError(response.message || 'Error al confirmar el pago')
        }
      } catch (err: any) {
        console.error('Error confirmando pago:', err)
        setError(err.message || 'Error al procesar la confirmación del pago')
      } finally {
        setIsLoading(false)
      }
    }

    confirmPayment()
  }, [searchParams, clearCart])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <Loader2 className="w-16 h-16 text-[#4a90e2] animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-[#1f3a5f] mb-2">Confirmando tu pago...</h2>
          <p className="text-gray-600 text-center">Por favor espera mientras procesamos tu transacción</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !confirmation?.success) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        
        {/* Error Banner */}
        <section className="bg-gradient-to-r from-red-500 to-red-600 text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Pago no completado</h1>
            <p className="text-red-50 text-lg">
              {error || confirmation?.message || 'Hubo un problema al procesar tu pago'}
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-amber-900 mb-2">¿Qué pasó?</h3>
            <p className="text-amber-800 mb-4">
              Tu pago no pudo ser procesado. Esto puede ocurrir si:
            </p>
            <ul className="text-left text-amber-800 space-y-2 max-w-md mx-auto">
              <li>• Cancelaste la transacción</li>
              <li>• Hubo un problema con tu tarjeta</li>
              <li>• La sesión expiró (límite de 10 minutos)</li>
            </ul>
          </div>

          <div className="space-x-4">
            <Link
              href="/checkout"
              className="inline-block bg-[#4a90e2] hover:bg-[#3a7fcf] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Intentar nuevamente
            </Link>
            <Link
              href="/catalogo"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Volver al catálogo
            </Link>
          </div>
        </div>
        
        <Footer />
      </main>
    )
  }

  const { order, transaction } = confirmation

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Success Banner */}
      <section className="bg-gradient-to-r from-[#2ecc71] to-[#27a85f] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#2ecc71]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">¡Gracias por tu compra!</h1>
          <p className="text-green-50 text-lg">
            Tu pedido ha sido procesado con éxito. Recibirás un email con los detalles y acceso a tus libros.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Order Details Card */}
        <div className="bg-[#f2f2f2] rounded-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Order Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Número de Orden</h3>
              <p className="text-lg font-bold text-[#1f3a5f] mb-4">{order?._id}</p>
              
              {transaction && (
                <>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">ID de Transacción</h3>
                  <p className="text-lg font-bold text-[#1f3a5f]">{transaction.transactionId}</p>
                </>
              )}
            </div>

            {/* Payment Info */}
            {transaction && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Detalles de Pago</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Tarjeta:</span> {transaction.cardBrand}</p>
                  <p><span className="font-semibold">Últimos dígitos:</span> ****{transaction.lastDigits}</p>
                  <p><span className="font-semibold">Código autorización:</span> {transaction.authorizationCode}</p>
                  <p><span className="font-semibold">Fecha:</span> {new Date(transaction.date).toLocaleString('es-EC')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-300 pt-6">
            <h3 className="text-lg font-bold text-[#1f3a5f] mb-4">Libros Adquiridos</h3>
            <div className="space-y-3">
              {order?.products.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-[#4a90e2]" />
                    <div>
                      <p className="font-semibold text-[#1f3a5f]">{item.title}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#1f3a5f]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-300">
              <span className="text-xl font-bold text-[#1f3a5f]">Total Pagado</span>
              <span className="text-2xl font-bold text-[#2ecc71]">
                ${order?.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Access Instructions */}
        <div className="bg-blue-50 border border-[#4a90e2] rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-[#1f3a5f] mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Acceso a tus libros digitales
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p className="flex items-start gap-2">
              <span className="text-[#2ecc71] font-bold">1.</span>
              <span>Revisa tu correo electrónico. Hemos enviado un email con el recibo y enlaces de descarga.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#2ecc71] font-bold">2.</span>
              <span>También puedes acceder a tus libros desde tu perfil en cualquier momento.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#2ecc71] font-bold">3.</span>
              <span>Los libros estarán disponibles en formato PDF y ePub para tu comodidad.</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/perfil"
            className="bg-[#4a90e2] hover:bg-[#3a7fcf] text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Ir a Mi Biblioteca
          </Link>
          <Link
            href="/catalogo"
            className="bg-white border-2 border-[#4a90e2] text-[#4a90e2] hover:bg-[#4a90e2] hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Explorar más libros
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">¿Tienes alguna pregunta sobre tu orden?</p>
          <Link
            href="/soporte"
            className="text-[#4a90e2] hover:text-[#3a7fcf] font-semibold inline-flex items-center gap-2"
          >
            Contacta con Soporte
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#4a90e2] animate-spin" />
      </main>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
