import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { adminTranslations } from '../../utils/adminTranslations';
import { LayoutDashboard, Film, Ticket, Users, Settings, LogOut, Menu, X, Bell, MapPin, Clapperboard, ArrowLeft, Search } from 'lucide-react';

const FilmReelIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({ Cinemas: false, Movies: false });
  const [user, setUser] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageHeader, setPageHeader] = useState({ title: '', description: '', backLink: null, rightContent: null });
  const { lang, toggleLang } = useLang();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  const t = adminTranslations[lang] || adminTranslations.en;

  const handleLangSwitch = () => {
    setIsTransitioning(true);
    // Wait for the overlay to fully fade in (500ms) and linger a bit
    setTimeout(() => {
      toggleLang();
      // Keep it black for another 150ms before fading out
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 500);
  };

  const toggleSubMenu = (menuName, e) => {
    e.preventDefault();
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const menuItems = [
    { name: 'Dashboard', label: t.dashboard, icon: <LayoutDashboard size={20} />, path: '/admin' },
    { 
      name: 'Movies', 
      label: t.movies,
      icon: <Film size={20} />, 
      path: '/admin/movies',
      subItems: [
        { name: 'Cinematic Movies', label: t.cinematicMovies, path: '/admin/movies/cinematic' },
        { name: 'VOD Streaming', label: t.vodStreaming, path: '/admin/movies/vod' },
        { name: 'VOD Packages', label: t.vodPackages, path: '/admin/movies/packages' }
      ]
    },
    { 
      name: 'Cinemas', 
      label: t.cinemas,
      icon: <MapPin size={20} />, 
      path: '/admin/cinemas',
      subItems: [
        { name: 'Overview', label: t.overview, path: '/admin/cinemas' },
        { name: 'Add Cinema', label: t.addCinema, path: '/admin/cinemas/add' }
      ]
    },
    { name: 'Showtimes', label: t.showtimes, icon: <Ticket size={20} />, path: '/admin/showtimes' },
    { name: 'Users', label: t.users, icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Settings', label: t.settings, icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-on-surface font-body-base overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-surface-container-high border-r border-white/5 transition-all duration-500 ease-in-out flex flex-col flex-shrink-0 relative ${isSidebarOpen ? 'w-64' : 'w-20'} z-30`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 overflow-hidden">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-1 rounded-lg hover:bg-white/10 text-on-surface-variant cursor-pointer transition-colors flex-shrink-0"
          >
            <Menu size={22} />
          </button>
          <div className={`transition-all duration-500 overflow-hidden flex items-center whitespace-nowrap ${isSidebarOpen ? 'opacity-100 ml-3 w-32' : 'opacity-0 w-0'}`}>
            <Link to="/admin" className="font-bold text-xl text-primary-container tracking-wider">
              CINE<span className="text-on-surface">ADMIN</span>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={(e) => toggleSubMenu(item.name, e)}
                    className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden group text-on-surface-variant hover:bg-white/5 hover:text-on-surface ${openMenus[item.name] ? 'bg-white/5 text-on-surface' : ''}`}
                    title={!isSidebarOpen ? item.label : ''}
                  >
                    <div className="flex-shrink-0 px-4 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className={`flex-1 text-left font-medium whitespace-nowrap transition-all duration-500 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
                      {item.label}
                    </span>
                    {isSidebarOpen && (
                      <div className="pr-4 flex items-center justify-center">
                        <div 
                          className="transition-transform duration-500 flex items-center justify-center text-on-surface-variant group-hover:text-primary-container"
                          style={{ transform: openMenus[item.name] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          <FilmReelIcon size={14} />
                        </div>
                      </div>
                    )}
                  </button>
                  {/* Sub Menu Items */}
                  <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen && openMenus[item.name] ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                    {item.subItems.map(sub => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        end={sub.path === '/admin/cinemas' || sub.path === '/admin/movies'}
                        className={({ isActive }) =>
                          `flex items-center py-2.5 pl-14 pr-4 rounded-xl transition-all duration-300 cursor-pointer ${
                            isActive 
                              ? 'text-primary-container font-bold' 
                              : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                          }`
                        }
                      >
                        <span className="font-medium truncate">{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden group ${
                      isActive 
                        ? 'bg-primary-container/10 text-primary-container shadow-[inset_3px_0_0_0_#e50914]' 
                        : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                    }`
                  }
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <div className="flex-shrink-0 px-4 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-all duration-500 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
                    {item.label}
                  </span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/5">
          <Link to="/" className="flex items-center space-x-3 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-red-400 transition-all cursor-pointer">
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">{t.exitAdmin}</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f]">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-surface-container-high/50 border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center">
            {pageHeader.title ? (
              <div className="flex items-center gap-4">
                {pageHeader.backLink && (
                  <Link to={pageHeader.backLink} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface-variant transition-colors">
                    <ArrowLeft size={18} />
                  </Link>
                )}
                <div>
                  <h1 className="text-lg font-bold text-on-surface leading-tight">{pageHeader.title}</h1>
                  {pageHeader.description && <p className="text-xs text-on-surface-variant">{pageHeader.description}</p>}
                </div>
              </div>
            ) : (
              <div className="flex items-center bg-black/20 rounded-lg px-3 py-1.5 border border-white/5 w-64 md:w-96">
                <Search className="w-4 h-4 text-on-surface-variant mr-2" />
                <input type="text" placeholder={t.search} className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-0" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            {pageHeader.rightContent && (
              <div className="hidden md:block mr-4">
                {pageHeader.rightContent}
              </div>
            )}
            {/* Language Toggle */}
            <button
              onClick={handleLangSwitch}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              title={lang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
            >
              <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
              </svg>
              <span className="text-xs font-semibold text-on-surface uppercase">{lang === 'en' ? 'VI' : 'EN'}</span>
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer rounded-full hover:bg-white/5">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-container rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-on-surface">{user?.email ? user.email.split('@')[0] : 'Admin'}</span>
                <span className="text-xs text-on-surface-variant capitalize">{user?.role ? user.role : 'Manager'}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-container to-purple-600 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:shadow-primary-container/30 transition-shadow">
                {user?.email ? user.email[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content (Outlet) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-full mx-auto">
            <Outlet context={{ setPageHeader }} />
          </div>
        </div>
      </main>

      {/* Cinematic Transition Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black pointer-events-none transition-opacity ease-in-out duration-500 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: isTransitioning
            ? 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)'
            : 'none',
        }}
      >
        {isTransitioning && (
          <>
            <div style={{
              position: 'absolute', left: '20px', top: 0, bottom: 0, width: '30px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', alignItems: 'center',
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`l${i}`} style={{ width: '16px', height: '10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
            <div style={{
              position: 'absolute', right: '20px', top: 0, bottom: 0, width: '30px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', alignItems: 'center',
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`r${i}`} style={{ width: '16px', height: '10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              color: 'rgba(229, 9, 20, 0.8)', fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: '700',
              letterSpacing: '4px', textTransform: 'uppercase', animation: 'pulse 1s ease-in-out infinite',
            }}>
              CINESTREAM
            </div>
          </>
        )}
      </div>
    </div>
  );
}
