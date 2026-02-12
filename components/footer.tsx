import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#1f3a5f] text-white mt-20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-[#2ecc71] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              DigitalBooks
            </Link>
            <p className="text-gray-300 text-sm">
              Empoderndo a los estudiantes modernos con guías digitales concisas y de alto impacto.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/catalogo" className="hover:text-[#2ecc71] transition">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/biblioteca" className="hover:text-[#2ecc71] transition">
                  Mi Biblioteca
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="hover:text-[#2ecc71] transition">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#2ecc71] transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="font-bold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/ayuda" className="hover:text-[#2ecc71] transition">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-[#2ecc71] transition">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-[#2ecc71] transition">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="hover:text-[#2ecc71] transition">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Sociales */}
          <div>
            <h4 className="font-bold mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#2ecc71] transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#2ecc71] transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#2ecc71] transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#2ecc71] transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#4a90e2] py-6 text-center text-sm text-gray-300">
          <p>© 2026 DigitalBooks. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
