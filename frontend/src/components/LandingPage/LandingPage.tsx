import { useEffect } from "react";
import { Footer } from "@/components/LandingPage/Footer";
import { Hero } from "@/components/LandingPage/Hero";
import { NavBar } from "@/components/LandingPage/NavBar";
import { Container } from "@/components/Container";

export const LandingPage = () => {
  useEffect(() => {
    document.title = "InHook - Webhook Inspector & Debugger";
  }, []);

  return (
    <Container className="h-full bg-linear-to-b from-blue-100 to-white px-2 py-5">
      <NavBar />
      <Hero />
      <Footer />
    </Container>
  );
};
