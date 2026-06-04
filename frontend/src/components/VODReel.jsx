import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import { PlayCircle } from 'lucide-react';

const translations = {
  en: { 
    vodTitle: 'Premium VOD Movies',
    watchNow: 'Watch Now'
  },
  vi: { 
    vodTitle: 'Phim VOD Đặc Sắc',
    watchNow: 'Xem Ngay'
  }
};

export default function VODReel() {
  const { lang } = useLang();
  const t = translations[lang];
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('/api/movies?status=VOD')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMovies(data);
        }
      })
      .catch(err => console.error('Error fetching VOD movies:', err));
  }, []);

  if (movies.length === 0) return null;

  return (
    <section className="py-stack-lg bg-background overflow-hidden reveal">
      <div className="px-margin-mobile md:px-margin-desktop mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-on-surface border-l-4 border-tertiary pl-4">{t.vodTitle}</h2>
      </div>
      <div className="flex gap-gutter px-margin-mobile md:px-margin-desktop overflow-x-auto hide-scrollbar py-10">
        {movies.map((movie) => (
          <div key={movie._id} className="flex-none w-64 md:w-80 cursor-pointer group">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl transition-all duration-500 border border-white/5 hover:border-tertiary/50">
              <img 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                src={movie.backdrop || movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                alt={movie.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                <PlayCircle className="text-tertiary w-16 h-16 drop-shadow-[0_0_15px_rgba(255,180,0,0.8)]" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-tertiary text-[10px] px-2 py-0.5 rounded font-black text-black">VOD</span>
                  <span className="bg-surface-container-highest text-[10px] px-2 py-0.5 rounded text-white">{movie.duration} min</span>
                </div>
                <h3 className="font-headline-md text-body-base text-white font-bold truncate">{movie.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
