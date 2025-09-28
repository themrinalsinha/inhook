import { NavBar } from './NavBar'
import { Hero } from './Hero'
import { Footer } from './Footer'

export const LandingPage = () => {
  return (
    <div className="max-w-6xl mx-auto relative">
      <NavBar />
      <Hero />
      <Footer />
    </div>
  )
}
