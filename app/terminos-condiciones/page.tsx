import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TerminosCondiciones() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f4ff] to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-[#4a90e2] hover:text-[#2e5c8a] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          
          <h1 className="text-4xl font-bold text-[#1f3a5f] mb-2">Términos y Condiciones de Uso</h1>
          <p className="text-gray-600">DigitalBooks</p>
          <p className="text-sm text-gray-500">Última actualización: 12 de febrero de 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-8 text-gray-700 space-y-8">
          {/* Section 1 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">1. Información General</h2>
            <p className="leading-relaxed mb-3">
              Bienvenido/a a <strong>DigitalBooks</strong>, una plataforma digital enfocada en la comercialización de ebooks y contenido educativo relacionado con tecnología y ciberseguridad.
            </p>
            <p className="leading-relaxed">
              Al acceder y utilizar este sitio web, el usuario acepta cumplir con los presentes Términos y Condiciones. Si no está de acuerdo con alguno de ellos, deberá abstenerse de utilizar la plataforma.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">2. Naturaleza del Servicio</h2>
            <p className="leading-relaxed mb-3">
              DigitalBooks ofrece productos digitales descargables (ebooks).
            </p>
            <p className="leading-relaxed">
              Una vez confirmado el pago, el usuario recibirá acceso inmediato al contenido adquirido mediante descarga directa o enlace habilitado dentro de la plataforma.
            </p>
          </section>

          {/* Section 3 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">3. Registro y Seguridad</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>El usuario deberá proporcionar información veraz y actualizada.</li>
              <li>Es responsabilidad del usuario proteger sus credenciales de acceso.</li>
              <li>DigitalBooks no se responsabiliza por accesos no autorizados derivados del mal uso de contraseñas.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">4. Pagos y Facturación</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Los pagos se procesan mediante la pasarela de pago <strong>PayPhone</strong>.</li>
              <li>DigitalBooks no almacena datos bancarios ni información financiera del usuario.</li>
              <li>El acceso al ebook se habilitará únicamente tras la confirmación exitosa del pago por parte de PayPhone.</li>
              <li>En caso de error en la transacción, el usuario deberá comunicarse primero con la entidad financiera o con PayPhone.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">5. Política de No Reembolso</h2>
            <p className="leading-relaxed mb-4">
              Debido a la naturaleza digital de los productos ofrecidos, no se realizan devoluciones ni reembolsos una vez efectuada la descarga, salvo en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Error técnico comprobable que impida la descarga del archivo.</li>
              <li>Cobro duplicado comprobado.</li>
            </ul>
            <p className="leading-relaxed">
              En estos casos, el usuario deberá contactarse dentro de las <strong>48 horas</strong> posteriores a la compra.
            </p>
          </section>

          {/* Section 6 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">6. Propiedad Intelectual</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Todo el contenido disponible en DigitalBooks está protegido por derechos de autor.</li>
              <li>El usuario adquiere una licencia de uso personal, no exclusiva y no transferible.</li>
              <li>Está estrictamente prohibida la reproducción, distribución, reventa, compartición pública o comercialización del contenido sin autorización expresa.</li>
              <li>El incumplimiento podrá generar acciones legales conforme a la normativa vigente.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">7. Uso Adecuado de la Plataforma</h2>
            <p className="leading-relaxed mb-4">
              El usuario se compromete a:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>No intentar vulnerar la seguridad del sitio web.</li>
              <li>No realizar actividades fraudulentas.</li>
              <li>No distribuir software malicioso.</li>
              <li>No copiar ni redistribuir el contenido adquirido.</li>
            </ul>
            <p className="leading-relaxed">
              DigitalBooks se reserva el derecho de suspender cuentas que incumplan estas disposiciones.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">8. Limitación de Responsabilidad</h2>
            <p className="leading-relaxed mb-4">
              DigitalBooks no garantiza que el servicio esté libre de interrupciones temporales por mantenimiento, fallos técnicos o causas externas.
            </p>
            <p className="leading-relaxed mb-3">
              No nos responsabilizamos por:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Uso indebido del contenido adquirido.</li>
              <li>Problemas derivados de incompatibilidades del dispositivo del usuario.</li>
              <li>Fallas en servicios externos como PayPhone.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">9. Protección de Datos</h2>
            <p className="leading-relaxed mb-3">
              La información personal proporcionada por el usuario será utilizada únicamente para fines relacionados con la compra, acceso y soporte del servicio.
            </p>
            <p className="leading-relaxed">
              DigitalBooks se compromete a no compartir datos personales con terceros, salvo obligación legal.
            </p>
          </section>

          {/* Section 10 */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">10. Modificaciones</h2>
            <p className="leading-relaxed">
              DigitalBooks podrá actualizar estos Términos y Condiciones en cualquier momento. Los cambios serán publicados en esta sección y entrarán en vigor desde su publicación.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-[#1f3a5f] mb-4">11. Legislación Aplicable</h2>
            <p className="leading-relaxed">
              Estos Términos y Condiciones se rigen por las leyes de la <strong>República del Ecuador</strong>.
            </p>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              ¿Tienes preguntas sobre nuestros términos?
            </p>
            <Link href="/soporte" className="inline-block px-6 py-2 bg-[#4a90e2] text-white rounded-lg hover:bg-[#2e5c8a] transition-colors font-medium">
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
