import { useState, useEffect, useRef, useCallback } from 'react';
import { useLang } from '../context/LanguageContext';
import SkeletonMovieGrid from './SkeletonMovieGrid';
import FavoriteButton from './FavoriteButton';
import QuickViewModal from './QuickViewModal';

const DEFAULT_POSTER_URL = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

export default function MovieGrid({ filters, title }) {
  const { lang } = useLang();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const observer = useRef();
  const lastMovieElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreMovies();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const buildQueryString = (page = 1) => {
    const params = new URLSearchParams({ ...filters, page, limit: 12 });
    Object.keys(filters).forEach(key => {
      if (!filters[key]) params.delete(key);
    });
    return params.toString() ? `?${params.toString()}` : '';
  };

  const fetchMovies = async (page = 1, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/movies${buildQueryString(page)}`);
      const data = await res.json();
      if (data && data.movies) {
        if (reset) {
          setMovies(data.movies);
        } else {
          setMovies(prev => [...prev, ...data.movies]);
        }
        setHasMore(data.page < data.totalPages);
        setCurrentPage(data.page);
      } else if (Array.isArray(data)) {
        if (reset) {
          setMovies(data);
        } else {
          setMovies(prev => [...prev, ...data]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = () => {
    fetchMovies(currentPage + 1, false);
  };

  useEffect(() => {
    setMovies([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchMovies(1, true);
  }, [filters]);

  if (loading && movies.length === 0) return <SkeletonMovieGrid />;

  if (movies.length === 0 && !loading) {
    return (
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop animate-fade-in">
        <div className="text-center text-on-surface-variant py-12 bg-surface-container-lowest rounded-xl mx-4">
          <span className="text-4xl mb-4 block">🎬</span>
          Không tìm thấy phim nào phù hợp!
        </div>
      </section>
    );
  }

  return (
    <section className="py-stack-lg bg-background animate-fade-in">
      <div className="px-margin-mobile md:px-margin-desktop">
        {title && <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md">{title}</h2>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              ref={index === movies.length - 1 ? lastMovieElementRef : null}
              onClick={() => setSelectedMovie(movie)}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
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
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-2 left-2 flex gap-1">
                  {movie.averageRating > 0 && (
                    <div className="bg-black/70 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-white text-xs font-bold">{movie.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                  {movie.isSeries && (
                    <div className="bg-primary-container px-2 py-1 rounded-full">
                      <span className="text-white text-xs font-bold">Series</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <FavoriteButton movieId={movie._id} />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-on-surface font-semibold text-sm truncate">{movie.title}</h3>
                {movie.releaseYear && (
                  <p className="text-on-surface-variant text-xs">{movie.releaseYear}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center text-on-surface py-8">Đang tải...</div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreMovies}
              className="px-8 py-3 bg-primary-container text-white rounded-full hover:opacity-90 transition-opacity"
            >
              {lang === 'en' ? 'Load More' : 'Tải thêm'}
            </button>
          </div>
        )}

        {!hasMore && movies.length > 0 && (
          <div className="text-center text-on-surface-variant py-8">Đã hiển thị tất cả phim</div>
        )}
      </div>

      {selectedMovie && (
        <QuickViewModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </section>
  );
}
