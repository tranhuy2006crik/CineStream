import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: { nowStreaming: 'Now Streaming' },
  vi: { nowStreaming: 'Đang khởi chiếu' }
};

export default function FeatureReel() {
  const { lang } = useLang();
  const t = translations[lang];
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('/api/movies?status=Showing')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMovies(data);
        }
      })
      .catch(err => console.error('Error fetching feature reel movies:', err));
  }, []);

  if (movies.length === 0) return null;

  return (
    <section className="py-stack-lg bg-background overflow-hidden reveal">
      <div className="px-margin-mobile md:px-margin-desktop mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-on-surface border-l-4 border-primary-container pl-4">{t.nowStreaming}</h2>
      </div>
      <div className="flex gap-gutter px-margin-mobile md:px-margin-desktop overflow-x-auto hide-scrollbar py-10">
        {movies.map((movie) => (
          <div key={movie._id} className="flex-none w-64 md:w-80 cursor-pointer group">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl poster-3d transition-all duration-500">
              <img className="w-full h-full object-cover" src={movie.poster || "https://lh3.googleusercontent.com/aida-public/AB6AXuDDYWxPR00xg0VZmIsE8rB6Szb_aRK898t-t-FZcFs0D0gk5bKTvms3Sfs2oge425J6DCCoSRBvU65IFAklDS3eRkN0x5YW2L9RCBFIGEZfVKXrl3mD3xJPuZpCG3lRLhmRh_yxqDjduk9igar8bi0p2MhuYz8VnYqynM1qGfNDVB9XZ3g7shbb1d54gGe_UCfuQw1SxhE-sG_zMlC7vqBxuyvPiCOOV_XeJhoIkjVrSQi1efy5JAm8am7L7qmz746UcPDugIMcn7o"} alt={movie.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 right-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary-container text-[10px] px-2 py-0.5 rounded font-black text-white">{movie.status || "NEW"}</span>
                  <span className="bg-surface-container-highest text-[10px] px-2 py-0.5 rounded text-white">{movie.duration} min</span>
                </div>
                <h3 className="font-headline-md text-body-base text-on-surface font-bold truncate">{movie.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
