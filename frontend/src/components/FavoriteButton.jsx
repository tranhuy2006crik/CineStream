import useFavorites from '../hooks/useFavorites';
import useAuth from '../hooks/useAuth';

export default function FavoriteButton({ movieId, className = '' }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { user } = useAuth();
  const favorite = isFavorite(movieId);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      return;
    }
    if (favorite) removeFromFavorites(movieId);
    else addToFavorites(movieId);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full bg-black/50 backdrop-blur-sm transition-all ${className}`}
      title={favorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      {favorite ? (
        <span className="material-symbols-outlined text-primary-container text-xl">favorite</span>
      ) : (
        <span className="material-symbols-outlined text-white text-xl">favorite_border</span>
      )}
    </button>
  );
}
