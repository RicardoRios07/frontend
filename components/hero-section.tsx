import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-[#1f3a5f] to-[#2a4a7f] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
            Domina Nuevas <br />
            <span className="text-[#2ecc71]">Habilidades</span> <br />
            en Minutos
          </h1>

          <p className="text-xl text-gray-100 text-balance">
            Explora nuestra colección curada de micro-ebooks y guías digitales diseñados para el aprendizaje moderno.
            Conciso, impactante y listo para cualquier dispositivo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-[#2ecc71] hover:bg-[#27a85f] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Catálogo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 border-2 border-white hover:bg-white hover:text-[#1f3a5f] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Cómo Funciona
            </button>
          </div>

          <div className="flex gap-8 pt-8 text-sm">
            <div>
              <p className="font-bold text-2xl">500+</p>
              <p className="text-gray-300">Guías disponibles</p>
            </div>
            <div>
              <p className="font-bold text-2xl">10K+</p>
              <p className="text-gray-300">Estudiantes activos</p>
            </div>
            <div>
              <p className="font-bold text-2xl">4.8★</p>
              <p className="text-gray-300">Calificación promedio</p>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="flex-1 hidden md:flex justify-center">
          <img src="/ebook-stack-visual.jpg" alt="Stack of digital ebooks" className="rounded-lg shadow-2xl" />
        </div>
      </div>
    </section>
  )
}
