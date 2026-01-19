import { BookOpen, Zap, Users, Award } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Contenido de Calidad",
    description: "Nuestras guías están revisadas por expertos del sector educativo",
  },
  {
    icon: Zap,
    title: "Aprendizaje Rápido",
    description: "Micro-guías diseñadas para maximizar el aprendizaje en poco tiempo",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Conecta con otros estudiantes y comparte experiencias",
  },
  {
    icon: Award,
    title: "Certificados",
    description: "Obtén certificados digitales al completar tus cursos",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#2ecc71] rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#1f3a5f] text-lg">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
