import { useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    title1: 'Cinema in Your ',
    title2: 'Pocket',
    desc: 'Experience the magic of the silver screen anywhere. Stream thousands of blockbuster movies and exclusive content in breathtaking 4K quality.',
    explore: 'EXPLORE NOW',
  },
  vi: {
    title1: 'Rạp phim trong ',
    title2: 'Tầm tay',
    desc: 'Trải nghiệm phép màu của màn ảnh rộng ở bất cứ đâu. Xem hàng ngàn phim bom tấn và nội dung độc quyền với chất lượng 4K sắc nét.',
    explore: 'KHÁM PHÁ NGAY',
  }
};

export default function Hero() {
  const heroImgRef = useRef(null);
  const heroContentRef = useRef(null);
  const parallaxTitleRef = useRef(null);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      if (heroImgRef.current) heroImgRef.current.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
      if (parallaxTitleRef.current) parallaxTitleRef.current.style.transform = `translateY(${scrolled * -0.1}px)`;
    };
    
    const handleMouseMove = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (clientX - centerX) / 50;
      const moveY = (clientY - centerY) / 50;
      if (heroContentRef.current) heroContentRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <header className="relative h-screen w-full overflow-hidden flex items-center justify-center reveal" id="hero-section">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-10"></div>
        <img ref={heroImgRef} className="w-full h-full object-cover transform scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUiFVWV-5O3mJHHVTX3tE9h-WIwP-LM-Bmt8Ejk05adIG8TwauZXwzXPaX0q6PTsHwyd6_IDnwSGOAU9nrgI1F1WNqpLpPy-M3uVL-sSvI6XKOduDkd0RdgMUz40rPfA33zDLWDtzdglSG8f-OZOAfZlyeb8RSu3hHBThAfgn93Ckun6YgT776015SdYYXuR3GpDM2s0fWgUHxxUk96fk1-aMu3x1nfJtYhc5tU_hCka231T2toujgfwNxFRyXr3VpM9EEW-g5zCY" alt="Hero" />
      </div>
      <div ref={heroContentRef} className="relative z-20 text-center px-margin-mobile max-w-4xl">
        <h1 ref={parallaxTitleRef} className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-stack-md drop-shadow-2xl transition-transform duration-100 ease-out">
          {t.title1}<span className="text-primary-container">{t.title2}</span>
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant mb-stack-lg max-w-2xl mx-auto">
          {t.desc}
        </p>
        <button className="bg-primary-container text-on-primary-container px-10 py-4 font-label-bold text-label-bold rounded-lg shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:scale-105 transition-all duration-300 active:scale-95 group cursor-pointer">
          {t.explore}
          <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </header>
  );
}
