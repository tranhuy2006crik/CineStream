import { useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    title1: 'Beyond the Screen. ',
    title2: 'Total Immersion.',
    desc: 'Our platform uses advanced spatial algorithms to bring you closer to the story. Interact with exclusive behind-the-scenes content and 3D previews of upcoming releases.',
    feature1: '360° Viewing',
    feature2: 'Dolby Atmos',
  },
  vi: {
    title1: 'Vượt Mọi Giới Hạn. ',
    title2: 'Nhập Vai Hoàn Toàn.',
    desc: 'Nền tảng sử dụng thuật toán không gian tiên tiến mang bạn đến gần hơn với câu chuyện. Tương tác độc quyền với nội dung hậu trường và xem trước 3D các tựa phim sắp ra mắt.',
    feature1: 'Góc nhìn 360°',
    feature2: 'Âm thanh Atmos',
  }
};

export default function ImmersiveSection() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ctx = canvas.getContext('2d');
      let animationFrameId;
      let particles = [];
      
      const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      window.addEventListener('resize', resize);
      resize();

      class Particle {
        constructor() { this.reset(); }
        reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 1;
          this.speedX = Math.random() * 0.5 - 0.25;
          this.speedY = Math.random() * 0.5 - 0.25;
          this.opacity = Math.random() * 0.5;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        }
        draw() {
          ctx.fillStyle = `rgba(229, 9, 20, ${this.opacity})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < 50; i++) particles.push(new Particle());

      const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animationFrameId = requestAnimationFrame(animateParticles);
      };
      animateParticles();

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  const handleMouseMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const moveX = (clientX - innerWidth / 2) / 30;
    const moveY = (clientY - innerHeight / 2) / 30;
    
    const items = containerRef.current.querySelectorAll('.floating-item');
    items.forEach((item, index) => {
      const speed = (index + 1) * 0.5;
      item.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
    });
  };

  const handleMouseLeave = () => {
    const items = containerRef.current?.querySelectorAll('.floating-item') || [];
    items.forEach((item) => {
      item.style.transform = `translate(0, 0)`;
    });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="py-24 relative overflow-hidden bg-surface-container-lowest reveal"
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40 w-full h-full"></canvas>
      <div className="px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center gap-stack-lg relative z-10">
        <div className="w-full md:w-1/2">
          <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-on-surface mb-stack-md leading-tight">
            {t.title1} <br/><span className="text-primary-container">{t.title2}</span>
          </h2>
          <p className="font-body-base text-body-base text-on-surface-variant mb-stack-lg">
            {t.desc}
          </p>
          <div className="flex gap-stack-md">
            <div className="p-4 glass-card rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">3d_rotation</span>
              <span className="font-label-bold text-label-bold">{t.feature1}</span>
            </div>
            <div className="p-4 glass-card rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">spatial_audio</span>
              <span className="font-label-bold text-label-bold">{t.feature2}</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 relative h-80 md:h-[500px]">
          <div className="floating-item absolute top-10 left-10 w-24 h-24 md:w-32 md:h-32 bg-primary-container/20 glass-card rounded-full flex items-center justify-center animate-float" style={{animationDelay: "0s"}}>
            <span className="material-symbols-outlined text-4xl text-primary-container">confirmation_number</span>
          </div>
          <div className="floating-item absolute bottom-10 right-20 w-32 h-32 md:w-48 md:h-48 glass-card rounded-2xl flex items-center justify-center animate-float" style={{animationDelay: "-2s"}}>
            <img className="w-full h-full object-cover rounded-2xl opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkZzmLiE0F3a4K4dml8glhNXgkS0l75ChNXSc-rbD4IEDIL_N6ucNxvuZOEf88ZAiWAbKTq0XgaKsGcDEwYo590FnwRhG8w94NP0VBsFS1kI-A7iz14V7DHLR9Lg3Fv0BZiXleE_dYQuN_7w1Ubxu_vifb8T_8VgeJsq1cKGudvkOERh6ol3iA6VV_bphmn_laAexOS83tujY1ZwuZSy2INS4ZdH1iNrhaPb2LqVrO7pmJ_QTmE6x-PcWPXYw6p3p4ZKha9k5Xy3o" alt="Popcorn bucket" />
          </div>
          <div className="floating-item absolute top-40 right-10 w-20 h-20 glass-card rounded-full flex items-center justify-center animate-float" style={{animationDelay: "-4s"}}>
            <span className="material-symbols-outlined text-3xl text-primary-container">movie_filter</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/5 blur-[120px] rounded-full"></div>
    </section>
  );
}
