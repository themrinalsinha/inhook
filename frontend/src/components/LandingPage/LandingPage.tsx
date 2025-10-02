import { useEffect } from 'react'
import { NavBar } from './NavBar'
import { Hero } from './Hero'
import { Footer } from './Footer'
import { Container } from '../Container'

export const LandingPage = () => {

  useEffect(() => {
    document.title = 'InHook - Webhook Inspector & Debugger'
  }, [])

  return (
    <Container className="h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto relative bg-linear-to-b to-white from-white rounded-3xl h-full">
        <NavBar />
        <Hero />
        <Footer />
      </div>
    </Container>
  );
}
