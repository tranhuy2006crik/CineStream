import { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    filters: 'Filters',
    genres: 'Genres',
    year: 'Year',
    country: 'Country',
    rating: 'Rating',
    sortBy: 'Sort By',
    newest: 'Newest',
    ratingDesc: 'Rating',
    mostViewed: 'Most Viewed',
    reset: 'Reset Filters',
    apply: 'Apply'
  },
  vi: {
    filters: 'Bộ lọc',
    genres: 'Thể loại',
    year: 'Năm phát hành',
    country: 'Quốc gia',
    rating: 'Đánh giá',
    sortBy: 'Sắp xếp theo',
    newest: 'Mới nhất',
    ratingDesc: 'Đánh giá',
    mostViewed: 'Xem nhiều nhất',
    alphabetical: 'Theo chữ cái',
    reset: 'Đặt lại',
    apply: 'Áp dụng'
  }
};

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Music', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'War', 'Western'
];

const COUNTRIES = ['USA', 'UK', 'France', 'Japan', 'South Korea', 'China', 'Vietnam', 'India'];
const YEARS = Array.from({ length: 30 }, (_, i) => 2025 - i);

export default function FilterSection({ filters, onFilterChange }) {
  const { lang } = useLang();
  const t = translations[lang];
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  // Sync with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Debounced filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);
    return () => clearTimeout(timer);
  }, [localFilters, onFilterChange]);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleGenreToggle = (genre) => {
    let newGenres = [];
    if (localFilters.genre) {
      const currentGenres = localFilters.genre.split(',');
      if (currentGenres.includes(genre)) {
        newGenres = currentGenres.filter(g => g !== genre);
      } else {
        newGenres = [...currentGenres, genre];
      }
    } else {
      newGenres = [genre];
    }
    handleChange('genre', newGenres.length > 0 ? newGenres.join(',') : '');
  };

  const handleReset = () => {
    const resetFilters = {
      genre: '',
      minYear: '',
      maxYear: '',
      country: '',
      minRating: '',
      sortBy: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const selectedGenres = localFilters.genre ? localFilters.genre.split(',') : [];

  return (
    <section className="py-8 bg-surface-container-lowest animate-fade-in">
      <div className="px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">{t.filters}</h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden px-4 py-2 bg-primary-container text-white rounded-lg"
          >
            {isOpen ? 'Đóng' : 'Mở bộ lọc'}
          </button>
        </div>

        <div className={`${isOpen ? 'block' : 'hidden md:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Genres */}
            <div className="lg:col-span-2">
              <label className="block text-on-surface font-semibold mb-2">{t.genres}</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary-container text-white'
                        : 'bg-surface-container-highest text-on-surface-variant hover:bg-white/10'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-on-surface font-semibold mb-2">{t.year}</label>
              <div className="flex gap-2">
                <select
                  value={localFilters.minYear}
                  onChange={(e) => handleChange('minYear', e.target.value)}
                  className="flex-1 bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg border border-white/10"
                >
                  <option value="">Từ năm</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={localFilters.maxYear}
                  onChange={(e) => handleChange('maxYear', e.target.value)}
                  className="flex-1 bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg border border-white/10"
                >
                  <option value="">Đến năm</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-on-surface font-semibold mb-2">{t.country}</label>
              <select
                value={localFilters.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg border border-white/10"
              >
                <option value="">Tất cả quốc gia</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-on-surface font-semibold mb-2">{t.rating}</label>
              <select
                value={localFilters.minRating}
                onChange={(e) => handleChange('minRating', e.target.value)}
                className="w-full bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg border border-white/10"
              >
                <option value="">Tất cả đánh giá</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating}+ ★</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <label className="text-on-surface font-semibold">{t.sortBy}:</label>
            {[
              { value: '', label: lang === 'en' ? 'Newest' : 'Mới nhất' },
              { value: 'rating', label: lang === 'en' ? 'Rating' : 'Đánh giá' },
              { value: 'views', label: lang === 'en' ? 'Most Viewed' : 'Xem nhiều' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange('sortBy', option.value)}
                className={`px-4 py-1 rounded-full text-sm transition-all ${
                  localFilters.sortBy === option.value
                    ? 'bg-primary-container text-white'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}

            <div className="ml-auto">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.reset}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
