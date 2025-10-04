
import { Hero } from './Hero';
import { NavBar } from './NavBar';

export const LandingPage = () => {
  return (
    <div className="h-screen bg-linear-to-b from-blue-50 to-white py-5">
      <NavBar />
      <Hero />
    </div>
  );
}
