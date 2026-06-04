import { useEffect, useLayoutEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureReel from '../components/FeatureReel';
import VODReel from '../components/VODReel';
import ImmersiveSection from '../components/ImmersiveSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import { useLang } from '../context/LanguageContext';

export default function Home() {
  const { lang } = useLang();

  useLayoutEffect(() => {
    // When language changes, React re-renders child components and resets their className,
    // which strips the '.active' class added by the IntersectionObserver.
    // We synchronously restore it for elements currently in the viewport to avoid flickering.
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('active');
      }
    });
  }, [lang]);
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
      <VODReel />
      <ImmersiveSection />
      <Pricing />
      <Footer />
    </>
  );
}
