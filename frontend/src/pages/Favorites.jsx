import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LanguageContext';
import useAuth from '../context/AuthContext';
import { Loader2, Heart, Film } from 'lucide-react';
import FavoriteButton from '../components/FavoriteButton';

const T = {
  en: { title: 'My Favorites', empty: 'No favorite movies yet', browse: 'Browse Movies', loading: 'Loading...' },
  vi: { title: 'Phim Yêu Thích', empty: 'Chưa có phim yêu thích', browse: 'Khám phá phim', loading: 'Đang tải...' }
};

export default function Favorites() {
  const { lang } = useLang();
  const { token } = useAuth();
  const t = T[lang];
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setMovies(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-12 pt-32">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Heart className="text-primary-container" size={32} /> {t.title}
        </h1>
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-container" size={40} /></div>
        ) : movies.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-12 text-center border border-white/5">
            <Film className="mx-auto text-on-surface-variant mb-4 opacity-50" size={60} />
            <p className="text-on-surface-variant mb-6">{t.empty}</p>
            <Link to="/" className="inline-block bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 px-6 rounded-xl">{t.browse}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(movie => (
              <div key={movie._id} className="group relative bg-surface-container rounded-xl overflow-hidden border border-white/5">
                <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                <div className="absolute top-2 right-2"><FavoriteButton movieId={movie._id} /></div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
                  {movie.averageRating > 0 && <p className="text-xs text-yellow-400">★ {movie.averageRating.toFixed(1)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
