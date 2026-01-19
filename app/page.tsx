import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import CatalogPreview from "@/components/catalog-preview"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CatalogPreview />
      <FeaturesSection />
      <Footer />
    </main>
  )
}
