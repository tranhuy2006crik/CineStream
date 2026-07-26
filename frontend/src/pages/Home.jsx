import { useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureReel from '../components/FeatureReel';
import FilterSection from '../components/FilterSection';
import MovieGrid from '../components/MovieGrid';
import FilterBreadcrumb from '../components/FilterBreadcrumb';
import ImmersiveSection from '../components/ImmersiveSection';
import Footer from '../components/Footer';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    featured: 'Featured Movies',
    nowShowing: 'Now Showing',
    hot: 'Hot Trending',
    newMovies: 'New Releases',
    series: 'TV Series',
    allMovies: 'All Movies'
  },
  vi: {
    featured: 'Phim nổi bật',
    nowShowing: 'Đang chiếu',
    hot: 'Phim hot',
    newMovies: 'Phim mới cập nhật',
    series: 'Phim bộ',
    allMovies: 'Tất cả phim'
  }
};

export default function Home() {
  const { lang } = useLang();
  const t = translations[lang];
  const [searchParams, setSearchParams] = useSearchParams();

  // Memoize query params objects to prevent unnecessary re-renders
  const featuredQuery = useMemo(() => ({ isFeatured: 'true', limit: 10 }), []);
  const showingQuery = useMemo(() => ({ status: 'Showing', limit: 10 }), []);
  const hotQuery = useMemo(() => ({ sortBy: 'views', limit: 10 }), []);
  const newQuery = useMemo(() => ({ sortBy: 'releaseDate', limit: 10 }), []);
  const seriesQuery = useMemo(() => ({ isSeries: 'true', limit: 10 }), []);

  // Initialize filters from URL
  const [filters, setFilters] = useState(() => {
    const initial = {};
    ['search', 'genre', 'minYear', 'maxYear', 'country', 'minRating', 'sortBy'].forEach(key => {
      const value = searchParams.get(key);
      if (value) initial[key] = value;
    });
    return initial;
  });

  // Check if any filters applied
  const hasActiveFilters = Object.keys(filters).some(key => filters[key]);

  useLayoutEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('active');
      }
    });
  }, [lang]);

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => revealObserver.observe(el));

    return () => {
      elements.forEach(el => revealObserver.unobserve(el));
    };
  }, []);

  // Update filters and sync with URL
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => { if (value) params.set(key, value); });
    setSearchParams(params, { replace: true });
  };

  // Handle removing individual filter
  const handleRemoveFilter = (key) => {
    let newFilters;
    if (key.startsWith('genre-')) {
      const genreToRemove = key.replace('genre-', '');
      const genres = filters.genre?.split(',').filter(g => g !== genreToRemove) || [];
      newFilters = { ...filters, genre: genres.length > 0 ? genres.join(',') : '' };
    } else {
      newFilters = { ...filters, [key]: '' };
    }
    // Clean up empty keys
    Object.keys(newFilters).forEach(k => { if (!newFilters[k]) delete newFilters[k]; });
    handleFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearAll = () => {
    handleFilterChange({});
  };

  return (
    <>
      <Navbar onSearch={handleFilterChange} />
      <Hero />

      {/* Breadcrumb for active filters */}
      {hasActiveFilters && <FilterBreadcrumb filters={filters} onRemove={handleRemoveFilter} onClearAll={handleClearAll} />}

      {/* Show filter section and movie grid if filters are applied */}
      {hasActiveFilters ? (
        <>
          <FilterSection filters={filters} onFilterChange={handleFilterChange} />
          <MovieGrid filters={filters} title={t.allMovies} />
        </>
      ) : (
        <>
          <FilterSection filters={filters} onFilterChange={handleFilterChange} />
          
          {/* Featured Movies */}
          <FeatureReel title={t.featured} queryParams={featuredQuery} />

          {/* Now Showing */}
          <FeatureReel title={t.nowShowing} queryParams={showingQuery} />

          {/* Hot Trending */}
          <FeatureReel title={t.hot} queryParams={hotQuery} />

          {/* New Releases */}
          <FeatureReel title={t.newMovies} queryParams={newQuery} />

          {/* TV Series */}
          <FeatureReel title={t.series} queryParams={seriesQuery} />

          <ImmersiveSection />
        </>
      )}

      <Footer />
    </>
  );
}
