
import { Footer } from './Footer';
import { Hero } from './Hero';
import { NavBar } from './NavBar';

export const LandingPage = () => {
  return (
    <div className="h-screen bg-linear-to-b from-blue-50 to-white px-2 py-5">
      <NavBar />
      <Hero />
      <Footer />
    </div>
  );
}
