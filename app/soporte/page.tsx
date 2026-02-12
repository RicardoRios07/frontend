export default function SoportePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f4ff] to-white">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-[#4a90e2] font-semibold uppercase">Soporte</p>
          <h1 className="text-3xl font-bold text-[#1f3a5f]">¿Necesitas ayuda?</h1>
          <p className="text-gray-600">Estamos aquí para ayudarte con pagos, descargas de PDFs y acceso a tu biblioteca.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[#1f3a5f]">Contacto directo</h2>
            <p className="text-gray-700">Escríbenos y te responderemos en menos de 24 horas.</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>📧 Email: marton2307@gmail.com</li>
              <li>💬 WhatsApp: +593 989370890</li>
              <li>⏰ Horario: L-V 9:00 - 18:00</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-semibold text-[#1f3a5f]">Pagos y descargas</h2>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li>Pagos seguros con Payphone</li>
              <li>Tras el pago exitoso, tu PDF queda disponible para descarga</li>
              <li>Si no ves tu descarga, contáctanos con el número de orden</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-2">
          <h2 className="text-xl font-semibold text-[#1f3a5f]">Preguntas frecuentes</h2>
          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>¿Dónde veo mis libros? En la sección Biblioteca.</li>
            <li>¿Puedo volver a descargar? Sí, mientras la orden esté pagada.</li>
            <li>¿Problemas con el pago? Escríbenos indicando el correo usado y el ID de la orden.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
