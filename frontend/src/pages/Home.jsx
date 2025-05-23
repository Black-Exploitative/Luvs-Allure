import Hero from "../components/Hero";
import OfferSection from "../components/OfferSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <OfferSection />
      <Footer/>
    </div>
  );
}