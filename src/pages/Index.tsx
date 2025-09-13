import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedBillboards from "@/components/FeaturedBillboards";
import HowItWorks from "@/components/HowItWorks";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedBillboards />
      <HowItWorks />
      <ScrollToTop />
    </div>
  );
};

export default Index;