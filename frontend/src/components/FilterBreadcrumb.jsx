import { useLang } from '../context/LanguageContext';

const translations = {
  en: { clearAll: 'Clear All', search: 'Search', genre: 'Genre', minYear: 'From Year', maxYear: 'To Year', country: 'Country', minRating: 'Min Rating', sortBy: 'Sort By' },
  vi: { clearAll: 'Xóa Tất Cả', search: 'Tìm kiếm', genre: 'Thể loại', minYear: 'Từ năm', maxYear: 'Đến năm', country: 'Quốc gia', minRating: 'Đánh giá tối thiểu', sortBy: 'Sắp xếp' }
};

export default function FilterBreadcrumb({ filters, onRemove, onClearAll }) {
  const { lang } = useLang();
  const t = translations[lang];

  // Parse filters into tags
  const tags = [];

  if (filters.search) tags.push({ key: 'search', label: `${t.search}: "${filters.search}"` });
  if (filters.genre) {
    filters.genre.split(',').forEach(g => tags.push({ key: `genre-${g}`, label: `${t.genre}: ${g}` }));
  }
  if (filters.minYear) tags.push({ key: 'minYear', label: `${t.minYear}: ${filters.minYear}"` });
  if (filters.maxYear) tags.push({ key: 'maxYear', label: `${t.maxYear}: ${filters.maxYear}"` });
  if (filters.country) tags.push({ key: 'country', label: `${t.country}: ${filters.country}"` });
  if (filters.minRating) tags.push({ key: 'minRating', label: `${t.minRating}: ${filters.minRating}★"` });
  if (filters.sortBy) {
    let sortLabel = filters.sortBy;
    if (sortLabel === 'rating') sortLabel = lang === 'vi' ? 'Đánh giá' : 'Rating';
    else if (sortLabel === 'views') sortLabel = lang === 'vi' ? 'Xem nhiều nhất' : 'Most Viewed';
    else sortLabel = lang === 'vi' ? 'Mới nhất' : 'Newest';
    tags.push({ key: 'sortBy', label: `${t.sortBy}: ${sortLabel}"` });
  }

  if (tags.length === 0) return null;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-4 bg-surface-container-lowest border-b border-white/10">
      <div className="flex items-center gap-3 flex-wrap">
        {tags.map(tag => (
          <button
            key={tag.key}
            onClick={() => onRemove(tag.key)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
          >
            {tag.label}
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        ))}
        <button
          onClick={onClearAll}
          className="ml-auto px-3 py-1.5 text-primary-container hover:text-white transition-colors text-sm font-medium"
        >
          {t.clearAll}
        </button>
      </div>
    </div>
  );
}
