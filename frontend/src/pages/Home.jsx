import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureReel from '../components/FeatureReel';
import ImmersiveSection from '../components/ImmersiveSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function Home() {
  useEffect(() => {
    // Reveal Observer for all sections
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => revealObserver.observe(el));

    return () => {
      elements.forEach(el => revealObserver.unobserve(el));
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <FeatureReel />
      <ImmersiveSection />
      <Pricing />
      <Footer />
    </>
  );
}
