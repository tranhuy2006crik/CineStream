import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    movies: 'Movies',
    cinemas: 'Cinemas',
    vod: 'VOD',
    activeProfile: 'Active Profile',
    switchProfile: 'Switch Profile',
    signOut: 'Sign Out',
    login: 'Sign in',
  },
  vi: {
    movies: 'Phim',
    cinemas: 'Rạp chiếu',
    vod: 'Thuê phim',
    activeProfile: 'Hồ sơ hiện tại',
    switchProfile: 'Đổi hồ sơ',
    signOut: 'Đăng xuất',
    login: 'Đăng nhập',
  }
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);
  const dropdownRef = useRef(null);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const { lang, toggleLang } = useLang();
  const t = translations[lang];

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

    // Load active profile from storage
    const profile = localStorage.getItem('activeProfile');
    if (profile) {
      setActiveProfile(JSON.parse(profile));
    }

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSwitchProfile = () => {
    localStorage.removeItem('activeProfile');
    navigate('/login');
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeProfile');
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
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {/* Language Toggle */}
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
                  className="absolute right-0 mt-3 w-56 rounded-lg shadow-2xl border border-white/10 overflow-hidden transform origin-top-right transition-all z-[100]"
                  style={{ backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">{t.activeProfile}</p>
                    <p className="text-sm font-bold text-on-surface mt-0.5 truncate">{activeProfile.name}</p>
                  </div>
                  <div className="py-1">
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
