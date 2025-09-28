import { NavBar } from './NavBar'
import { Hero } from './Hero'
import { Footer } from './Footer'
import { Container } from '../Container'

export const LandingPage = () => {
  return (
    <Container className="bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto relative bg-linear-to-b to-white from-white rounded-3xl">
        <NavBar />
        <Hero />
        <Footer />
      </div>
    </Container>
  );
}
