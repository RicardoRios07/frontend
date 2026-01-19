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

        if (response.data.success) {
          setConfirmation(response.data)
          // Limpiar el carrito solo si el pago fue exitoso
          clearCart()
        } else {
          setError(response.data.message || 'Error al confirmar el pago')
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
              <p className="text-sm text-gray-600 font-semibold uppercase mb-2">ID de Pedido</p>
              <p className="text-2xl font-bold text-[#1f3a5f] font-mono">{order.id}</p>
            </div>

            {/* Customer Email */}
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Confirmación Enviada a</p>
              <p className="text-lg font-semibold text-[#1f3a5f]">{order.customer.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6">
            <h2 className="font-bold text-[#1f3a5f] mb-4">Artículos Descargables</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-[#1f3a5f]">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Acceso digital inmediato · PDF + ePub + MOBI</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-[#1f3a5f]">${(item.price * item.quantity).toFixed(2)}</span>
                    <button className="bg-[#2ecc71] hover:bg-[#27a85f] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Download Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-[#2ecc71] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-[#1f3a5f] mb-2">Acceso Inmediato</h3>
            <p className="text-sm text-gray-600">
              Descarga tus guías en los formatos PDF, ePub y MOBI compatibles con cualquier dispositivo
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-[#4a90e2] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-[#1f3a5f] mb-2">Acceso de por Vida</h3>
            <p className="text-sm text-gray-600">
              Una vez descargados, tienes acceso permanente a tus guías incluyendo todas las actualizaciones futuras
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-[#2ecc71] rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-[#1f3a5f] mb-2">Próximos Pasos</h3>
            <p className="text-sm text-gray-600">
              Revisa tu email para los enlaces de descarga y comienza tu aprendizaje hoy
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-[#1f3a5f]">${order.total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Impuestos digitales</span>
              <span className="font-semibold text-[#2ecc71]">Gratis</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold py-4 text-[#1f3a5f]">
            <span>Total Pagado</span>
            <span className="text-[#2ecc71]">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-blue-50 border border-[#4a90e2] rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <HelpCircle className="w-6 h-6 text-[#4a90e2] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#1f3a5f] mb-2">¿Tienes problemas con la descarga?</h3>
              <p className="text-[#333333] mb-3">
                Si no puedes descargar tus guías, por favor contacta a nuestro equipo de soporte.
              </p>
              <Link
                href="/soporte"
                className="text-[#4a90e2] hover:text-[#3a7fcf] font-semibold flex items-center gap-2"
              >
                Contactar a Soporte <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/catalogo"
            className="flex-1 text-center bg-[#4a90e2] hover:bg-[#3a7fcf] text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Continuar Comprando
          </Link>

          <Link
            href="/"
            className="flex-1 text-center border-2 border-[#1f3a5f] text-[#1f3a5f] hover:bg-[#f2f2f2] py-3 rounded-lg font-semibold transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
