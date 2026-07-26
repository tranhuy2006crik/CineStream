import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import useAuth from '../context/AuthContext';
import FavoriteButton from './FavoriteButton';

const translations = {
  en: {
    close: 'Close', watchTrailer: 'Watch Trailer', buyTickets: 'Buy Tickets', rating: 'Rating',
    genres: 'Genres', duration: 'Duration', reviews: 'Reviews', writeReview: 'Write a review',
    submit: 'Submit', noReviews: 'No reviews yet', loginToReview: 'Login to review', yourRating: 'Your rating'
  },
  vi: {
    close: 'Đóng', watchTrailer: 'Xem Trailer', buyTickets: 'Mua Vé', rating: 'Đánh giá',
    genres: 'Thể loại', duration: 'Thời lượng', reviews: 'Đánh giá', writeReview: 'Viết đánh giá',
    submit: 'Gửi', noReviews: 'Chưa có đánh giá', loginToReview: 'Đăng nhập để đánh giá', yourRating: 'Điểm của bạn'
  }
};

export default function QuickViewModal({ movie, onClose }) {
  const { lang } = useLang();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const t = translations[lang];
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [onClose]);

  useEffect(() => {
    if (!movie?._id) return;
    fetch(`/api/reviews/movie/${movie._id}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [movie?._id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: movie._id, rating: newRating, comment: newComment })
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => [data, ...prev]);
        setNewComment('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl bg-surface-container rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full">
          <span className="material-symbols-outlined text-white text-2xl">close</span>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 flex-shrink-0 relative">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover min-h-[300px]" />
            <div className="absolute top-4 left-4"><FavoriteButton movieId={movie._id} /></div>
          </div>
          <div className="md:w-2/3 p-6 md:p-8">
            <h2 className="font-display text-3xl text-white mb-2">{movie.title}</h2>
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-on-surface-variant">
              {movie.releaseYear && <span>{movie.releaseYear}</span>}
              {movie.duration && <span>{movie.duration} {lang === 'vi' ? 'phút' : 'min'}</span>}
              {movie.averageRating > 0 && <span className="text-yellow-400">★ {movie.averageRating.toFixed(1)} ({movie.reviewCount || reviews.length})</span>}
            </div>
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g, i) => <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">{g}</span>)}
              </div>
            )}
            {movie.description && <p className="text-on-surface-variant mb-6 leading-relaxed">{movie.description}</p>}

            <div className="flex flex-wrap gap-3 mb-8">
              {movie.status === 'Showing' && (
                <button onClick={() => { onClose(); navigate('/booking'); }} className="flex items-center gap-2 px-6 py-3 bg-primary-container hover:bg-primary-container/90 rounded-full font-semibold">
                  {t.buyTickets}
                </button>
              )}
              {movie.isVOD && (
                <button onClick={() => { onClose(); navigate(`/vod/${movie._id}`); }} className="flex items-center gap-2 px-6 py-3 border border-white/30 hover:bg-white/10 rounded-full font-semibold">
                  VOD
                </button>
              )}
            </div>

            <h3 className="font-bold mb-3">{t.reviews}</h3>
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.yourRating}:</span>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setNewRating(n)} className={`text-lg ${n <= newRating ? 'text-yellow-400' : 'text-white/20'}`}>★</button>
                  ))}
                </div>
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={t.writeReview} rows={2}
                  className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <button type="submit" disabled={submitting} className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold">{t.submit}</button>
              </form>
            ) : (
              <p className="text-sm text-on-surface-variant mb-4">{t.loginToReview}</p>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{t.noReviews}</p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {reviews.map(r => (
                  <div key={r._id} className="bg-white/5 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{r.user?.email?.split('@')[0] || 'User'}</span>
                      <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                    </div>
                    {r.comment && <p className="text-on-surface-variant">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
