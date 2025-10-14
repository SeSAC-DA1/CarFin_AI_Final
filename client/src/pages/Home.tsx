import Navigation from "@/components/layout/Navigation";
import Hero from "@/components/layout/Hero";
import Stats from "@/components/layout/Stats";
import Features from "@/components/layout/Features";
import PaperBasedWorkflow from "@/components/layout/PaperBasedWorkflow";
import PapersSection from "@/components/layout/PapersSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen landing-page">
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <PaperBasedWorkflow />
      <PapersSection />
      <Footer />
    </div>
  );
}
