import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import Process from "@/components/Process";
import PapersSection from "@/components/PapersSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen landing-page">
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <Process />
      <PapersSection />
      <Footer />
    </div>
  );
}
