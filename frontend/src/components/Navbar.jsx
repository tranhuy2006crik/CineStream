import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import useAuth from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';

const translations = {
  en: {
    movies: 'Movies',
    cinemas: 'Cinemas',
    vod: 'VOD',
    activeProfile: 'Active Profile',
    switchProfile: 'Switch Profile',
    viewTickets: 'View My Tickets',
    signOut: 'Sign Out',
    login: 'Sign in',
    searchPlaceholder: 'Search movies...',
    recentSearches: 'Recent Searches',
    clearHistory: 'Clear History'
  },
  vi: {
    movies: 'Phim',
    cinemas: 'Rạp chiếu',
    vod: 'Thuê phim',
    activeProfile: 'Hồ sơ hiện tại',
    switchProfile: 'Đổi hồ sơ',
    viewTickets: 'Xem vé của tôi',
    signOut: 'Đăng xuất',
    login: 'Đăng nhập',
    searchPlaceholder: 'Tìm kiếm phim...',
    recentSearches: 'Tìm kiếm gần đây',
    clearHistory: 'Xóa lịch sử'
  }
};

export default function Navbar({ onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchMovie, setSelectedSearchMovie] = useState(null);
  const [searchHistory, setSearchHistory, clearSearchHistory] = useLocalStorage('searchHistory', []);
  const [activeProfile, setActiveProfile] = useState(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang } = useLang();
  const { activeProfile: authProfile, logout, setProfile } = useAuth();
  const t = translations[lang];

  // Use debounced search query for API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (authProfile) {
      setActiveProfile(authProfile);
    } else {
      const profile = localStorage.getItem('activeProfile');
      if (profile) setActiveProfile(JSON.parse(profile));
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [authProfile]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      fetch(`/api/movies?search=${encodeURIComponent(debouncedSearchQuery)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.movies)) {
            setSearchResults(data.movies);
          } else if (Array.isArray(data)) {
            setSearchResults(data);
          }
        })
        .catch(err => console.error('Error searching movies:', err));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  // Save search to history (with cache)
  const saveSearchToHistory = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Remove duplicate and add to top, keep only last 10
    let newHistory = [trimmedQuery, ...searchHistory.filter(item => item !== trimmedQuery)];
    newHistory = newHistory.slice(0, 10);
    setSearchHistory(newHistory);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery);
      if (onSearch) {
        onSearch({ search: searchQuery });
      } else {
        const params = new URLSearchParams(location.search);
        params.set('search', searchQuery);
        navigate(`/?${params.toString()}`);
      }
      setSearchOpen(false);
      setSearchResults([]);
      setSelectedSearchMovie(null);
    }
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setSelectedSearchMovie(null);
    saveSearchToHistory(query);
    if (onSearch) {
      onSearch({ search: query });
    }
    setSearchOpen(false);
    setSearchResults([]);
  };

  const handleSwitchProfile = () => {
    setProfile(null);
    navigate('/login');
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav id="main-navbar" className={`fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-300 ease-in-out ${hidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'py-2 bg-background/95 border-b border-white/5' : 'py-4 bg-background/80'}`}>
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <Link to="/" className="font-display-lg text-display-lg-mobile md:text-display-lg font-black text-primary-container uppercase tracking-tighter hover:scale-105 transition-transform duration-300 cursor-pointer">
          CINESTREAM
        </Link>
        <div className="hidden md:flex items-center gap-stack-lg font-body-base text-body-base">
          <NavLink 
            to="/" 
            onClick={() => { if (onSearch) onSearch({}); }}
            className={({ isActive }) => isActive ? "text-on-surface font-bold border-b-2 border-primary-container pb-1 transition-all duration-300" : "text-on-surface-variant hover:text-on-surface transition-colors pb-1"}
          >
            {t.movies}
          </NavLink>
          <NavLink 
            to="/booking" 
            className={({ isActive }) => isActive ? "text-on-surface font-bold border-b-2 border-primary-container pb-1 transition-all duration-300" : "text-on-surface-variant hover:text-on-surface transition-colors pb-1"}
          >
            {t.cinemas}
          </NavLink>
          <NavLink 
            to="/vod" 
            className={({ isActive }) => isActive ? "text-on-surface font-bold border-b-2 border-primary-container pb-1 transition-all duration-300" : "text-on-surface-variant hover:text-on-surface transition-colors pb-1"}
          >
            {t.vod}
          </NavLink>
        </div>
        <div className="flex items-center gap-stack-md relative" ref={dropdownRef}>
          <div className="relative" ref={searchRef}>
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-surface-container-highest rounded-full px-4 py-2 border border-white/10 w-64 md:w-80">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="bg-transparent border-none outline-none text-on-surface ml-2 w-full text-sm"
                  autoFocus
                />
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setSelectedSearchMovie(null); }} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                <span className="material-symbols-outlined">search</span>
              </button>
            )}

            {searchOpen && (searchResults.length > 0 || searchHistory.length > 0 || selectedSearchMovie) && (
              <div className="absolute top-full mt-2 right-0 w-80 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-150px)] z-50">
                {selectedSearchMovie ? (
                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <img 
                        src={selectedSearchMovie.poster || "https://lh3.googleusercontent.com/aida-public/AB6AXuDDYWxPR00xg0VZmIsE8rB6Szb_aRK898t-t-FZcFs0D0gk5bKTvms3Sfs2oge425J6DCCoSRBvU65IFAklDS3eRkN0x5YW2L9RCBFIGEZfVKXrl3mD3xJPuZpCG3lRLhmRh_yxqDjduk9igar8bi0p2MhuYz8VnYqynM1qGfNDVB9XZ3g7shbb1d54gGe_UCfuQw1SxhE-sG_zMlC7vqBxuyvPiCOOV_XeJhoIkjVrSQi1efy5JAm8am7L7qmz746UcPDugIMcn7o"}
                        alt={selectedSearchMovie.title}
                        className="w-14 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-on-surface font-semibold truncate">{selectedSearchMovie.title}</p>
                        <p className="text-on-surface-variant text-xs">{selectedSearchMovie.releaseYear || ''} • {selectedSearchMovie.status}</p>
                        <p className="text-on-surface-variant text-xs mt-1 truncate">{selectedSearchMovie.genres?.join(', ')}</p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(`/booking?movie=${selectedSearchMovie._id}`);
                        }}
                        className="w-full px-4 py-3 rounded-full bg-primary-container text-on-primary-container font-semibold hover:bg-primary-container/90 transition"
                      >
                        Book Ticket
                      </button>
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(`/vod/${selectedSearchMovie._id}`);
                        }}
                        className="w-full px-4 py-3 rounded-full bg-surface-container text-on-surface font-semibold border border-white/10 hover:bg-white/5 transition"
                      >
                        VOD
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedSearchMovie(null)}
                      className="w-full text-sm text-on-surface-variant hover:text-on-surface transition text-left"
                    >
                      Change selection
                    </button>
                  </div>
                ) : (
                  <>
                    {searchHistory.length > 0 && searchResults.length === 0 && (
                      <div className="px-4 py-3 border-b border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-on-surface-variant text-xs uppercase tracking-wider">{t.recentSearches}</span>
                          <button onClick={clearSearchHistory} className="text-primary-container text-xs hover:underline">
                            {t.clearHistory}
                          </button>
                        </div>
                        {searchHistory.map((query, index) => (
                          <div 
                            key={index}
                            onClick={() => handleHistoryClick(query)}
                            className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">history</span>
                            <span className="text-on-surface text-sm truncate">{query}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="p-2">
                        {searchResults.map((movie) => (
                          <div 
                            key={movie._id} 
                            className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 cursor-pointer transition-colors rounded-lg"
                            onClick={() => {
                              setSearchQuery(movie.title);
                              setSelectedSearchMovie(movie);
                              saveSearchToHistory(movie.title);
                            }}
                          >
                            <img 
                              src={movie.poster || "https://lh3.googleusercontent.com/aida-public/AB6AXuDDYWxPR00xg0VZmIsE8rB6Szb_aRK898t-t-FZcFs0D0gk5bKTvms3Sfs2oge425J6DCCoSRBvU65IFAklDS3eRkN0x5YW2L9RCBFIGEZfVKXrl3mD3xJPuZpCG3lRLhmRh_yxqDjduk9igar8bi0p2MhuYz8VnYqynM1qGfNDVB9XZ3g7shbb1d54gGe_UCfuQw1SxhE-sG_zMlC7vqBxuyvPiCOOV_XeJhoIkjVrSQi1efy5JAm8am7L7qmz746UcPDugIMcn7o"}
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-on-surface font-semibold truncate">{movie.title}</p>
                              <p className="text-on-surface-variant text-xs">{movie.releaseYear || ''} • {movie.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
            title={lang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-on-surface transition-colors">language</span>
            <span className="text-[11px] font-bold text-on-surface-variant group-hover:text-on-surface uppercase tracking-wide transition-colors">{lang === 'en' ? 'VI' : 'EN'}</span>
          </button>
          
          {activeProfile ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
              >
                <img 
                  alt={activeProfile.name} 
                  className="w-10 h-10 rounded-full border border-outline-variant hover:border-primary-container transition-all cursor-pointer hover:scale-105" 
                  src={activeProfile.avatar} 
                />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-3 w-56 rounded-lg shadow-2xl border border-white/10 overflow-hidden transform origin-top-right transition-all z-100"
                  style={{ backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">{t.activeProfile}</p>
                    <p className="text-sm font-bold text-on-surface mt-0.5 truncate">{activeProfile.name}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => { setDropdownOpen(false); navigate('/my-tickets'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-white/5 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">confirmation_number</span>
                      {t.viewTickets}
                    </button>
                    <button 
                      onClick={handleSwitchProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-white/5 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">switch_account</span>
                      {t.switchProfile}
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary-container hover:bg-white/5 transition-colors text-left cursor-pointer border-t border-white/5"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      {t.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-primary-container hover:bg-primary-container/10 transition-all duration-300 cursor-pointer group"
              style={{ transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(229, 9, 20, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary-container transition-colors">account_circle</span>
              <span className="text-sm font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors hidden sm:inline">{t.login}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}