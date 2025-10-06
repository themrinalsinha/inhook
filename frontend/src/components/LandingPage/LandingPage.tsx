import { useEffect } from "react";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { NavBar } from "./NavBar";
import { Container } from "../Container";

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
