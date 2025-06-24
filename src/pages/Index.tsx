
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeShare from "@/components/WhatWeShare";
import WhoItsFor from "@/components/WhoItsFor";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen scroll-snap-container">
      <Navigation />
      <Hero />
      <div className="space-y-8">
        <About />
        <WhatWeShare />
        <WhoItsFor />
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
