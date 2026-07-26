import { useState, useEffect, useMemo, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import SkeletonFeatureReel from './SkeletonFeatureReel';
import FavoriteButton from './FavoriteButton';
import QuickViewModal from './QuickViewModal';

const DEFAULT_POSTER_URL = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

export default function FeatureReel({ title, queryParams = {}, showAllLink = false }) {
  const { lang } = useLang();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams(queryParams).toString();
    return params ? `?${params}` : '';
  }, [queryParams]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/movies${queryString}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.movies)) {
          setMovies(data.movies);
        } else if (Array.isArray(data)) {
          setMovies(data);
        }
      })
      .catch(err => console.error('Error fetching feature reel movies:', err))
      .finally(() => setLoading(false));
  }, [queryString]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) return <SkeletonFeatureReel />;
  if (movies.length === 0) return null;

  return (
    <section className="py-stack-lg bg-background overflow-hidden animate-fade-in relative">
      <div className="px-margin-mobile md:px-margin-desktop mb-stack-md flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md text-on-surface border-l-4 border-primary-container pl-4">{title}</h2>
      </div>

      {/* Left Scroll Button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 md:left-6 top-1/2 z-20 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-surface-container-highest/80 hover:bg-primary-container backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10"
        aria-label={lang === 'vi' ? 'Phim trước' : 'Previous movies'}
      >
        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
      </button>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-2 md:right-6 top-1/2 z-20 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-surface-container-highest/80 hover:bg-primary-container backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10"
        aria-label={lang === 'vi' ? 'Phim sau' : 'Next movies'}
      >
        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
      </button>

      <div ref={scrollRef} className="flex gap-gutter px-16 md:px-20 overflow-x-auto hide-scrollbar py-10 scroll-smooth">
        {movies.map((movie) => (
          <div
            key={movie._id}
            onClick={() => setSelectedMovie(movie)}
            className="flex-none w-64 md:w-80 cursor-pointer group"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl poster-3d transition-all duration-500">
              <img
                className="w-full h-full object-cover"
                src={movie.poster || DEFAULT_POSTER_URL}
                alt={movie.title}
                onError={(e) => {
                  if (e.currentTarget.src !== DEFAULT_POSTER_URL) {
                    e.currentTarget.src = DEFAULT_POSTER_URL;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-3 left-3 flex gap-2">
                {movie.averageRating > 0 && (
                  <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-white text-xs font-bold">{movie.averageRating.toFixed(1)}</span>
                  </div>
                )}
                {movie.isSeries && (
                  <div className="bg-primary-container px-2 py-1 rounded-full">
                    <span className="text-white text-xs font-bold">Series</span>
                  </div>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <FavoriteButton movieId={movie._id} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary-container text-[10px] px-2 py-0.5 rounded font-black text-white">{movie.status || "NEW"}</span>
                  <span className="bg-surface-container-highest text-[10px] px-2 py-0.5 rounded text-white">{movie.duration} min</span>
                </div>
                <h3 className="font-headline-md text-body-base text-on-surface font-bold truncate">{movie.title}</h3>
                {movie.genres && movie.genres.length > 0 && (
                  <p className="text-on-surface-variant text-xs mt-1 truncate">{movie.genres.slice(0, 2).join(' • ')}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <QuickViewModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </section>
  );
}
