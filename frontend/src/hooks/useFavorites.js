import { useState, useEffect } from 'react';
import useAuth from '../context/AuthContext';

export default function useFavorites() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!token) { setFavorites([]); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data || []);
      }
    } catch (e) {
      console.error('Error fetching favorites:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, [token]);

  const addToFavorites = async (movieId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/favorites/${movieId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setFavorites(await res.json());
    } catch (e) {
      console.error('Error adding to favorites:', e);
    }
  };

  const removeFromFavorites = async (movieId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/favorites/${movieId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setFavorites(await res.json());
    } catch (e) {
      console.error('Error removing from favorites:', e);
    }
  };

  const isFavorite = (movieId) => favorites.some(m => m._id === movieId);

  return { favorites, loading, addToFavorites, removeFromFavorites, isFavorite, fetchFavorites };
}
