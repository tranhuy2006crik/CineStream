import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const translations = {
  en: {
    heroTitle: 'Cinema and Movie Discovery',
    searchMovies: 'Search Movies',
    searchBtn: 'Search',
    location: 'Location (e.g., New York)',
    cinemaChain: 'Cinema Chain (CGV, Galaxy, Lotte)',
    moviesCategory: 'Movies',
    nowPlaying: 'Movies Now Playing',
    nearbyCinemas: 'Nearby Cinemas Showing Movies',
    quickFilters: 'Quick Filters:',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    milesAway: '1.2 miles away',
    open: 'OPEN',
    details: 'Details',
    bookNow: 'Book Now',
    mapView: 'Map View',
    exploreLoc: 'Explore nearby locations',
    expand: 'Expand'
  },
  vi: {
    heroTitle: 'Khám Phá Rạp và Phim',
    searchMovies: 'Tìm kiếm phim...',
    searchBtn: 'Tìm kiếm',
    location: 'Khu vực (VD: TP.HCM, Hà Nội)',
    cinemaChain: 'Cụm rạp (CGV, Galaxy, Lotte)',
    moviesCategory: 'Phim',
    nowPlaying: 'Phim Đang Chiếu',
    nearbyCinemas: 'Rạp Gần Nhất Chiếu Phim',
    quickFilters: 'Lọc nhanh:',
    morning: 'Sáng',
    afternoon: 'Chiều',
    evening: 'Tối',
    milesAway: 'Cách đây 2.0 km',
    open: 'ĐANG MỞ',
    details: 'Chi tiết',
    bookNow: 'Đặt vé',
    mapView: 'Bản đồ',
    exploreLoc: 'Khám phá cụm rạp lân cận',
    expand: 'Mở rộng'
  }
};

function MapLocationButton({ onLocationFound }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  const handleLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      map.flyTo([latitude, longitude], 13);
      if (onLocationFound) onLocationFound([latitude, longitude]);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
      alert('Cannot get your location. Please check browser permissions.');
    });
  };
  return (
    <button 
      onClick={handleLocation}
      className="absolute top-4 right-4 z-[1000] w-10 h-10 bg-surface-container-highest border border-white/10 rounded-lg flex items-center justify-center text-on-surface hover:text-primary-container transition-colors cursor-pointer shadow-lg"
      title="Current Location"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="material-symbols-outlined text-[20px]">my_location</span>}
    </button>
  );
}

export default function Booking() {
  const { lang } = useLang();
  const t = translations[lang];
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, morning, afternoon, evening
  const [selectedMovie, setSelectedMovie] = useState(null);
  const cinemaSectionRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [rankingTab, setRankingTab] = useState('views');
  const carouselRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchChain, setSearchChain] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedSearchLocation, setAppliedSearchLocation] = useState('');
  const [appliedSearchChain, setAppliedSearchChain] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 300);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHeaderHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        if (carouselRef.current.scrollLeft + carouselRef.current.clientWidth >= carouselRef.current.scrollWidth - 10) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const topMovies = [...movies].sort((a, b) => rankingTab === 'views' ? b.views - a.views : b.ticketsSold - a.ticketsSold).slice(0, 5);


  // Scroll to top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, showtimesRes] = await Promise.all([
          fetch('/api/movies?status=Showing'),
          fetch('/api/showtimes')
        ]);
        const moviesData = await moviesRes.json();
        const showtimesData = await showtimesRes.json();
        
        setMovies(Array.isArray(moviesData.movies) ? moviesData.movies : []);
        setShowtimes(Array.isArray(showtimesData) ? showtimesData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group showtimes by Cinema
  const cinemasMap = {};
  showtimes.forEach(st => {
    if (st.cinema && st.movie) {
      if (selectedMovie && st.movie._id !== selectedMovie) return;
      if (appliedSearchQuery && !st.movie.title.toLowerCase().includes(appliedSearchQuery.toLowerCase())) return;
      if (appliedSearchLocation && appliedSearchLocation !== 'nearest' && !st.cinema.region?.toLowerCase().includes(appliedSearchLocation.toLowerCase())) return;
      if (appliedSearchChain && !st.cinema.name?.toLowerCase().includes(appliedSearchChain.toLowerCase())) return;
      
      if (timeFilter !== 'all') {
        const hour = new Date(st.startTime).getHours();
        if (timeFilter === 'morning' && (hour < 5 || hour >= 12)) return;
        if (timeFilter === 'afternoon' && (hour < 12 || hour >= 18)) return;
        if (timeFilter === 'evening' && (hour < 18)) return;
      }
      
      const cinemaId = st.cinema._id;
      if (!cinemasMap[cinemaId]) {
        cinemasMap[cinemaId] = {
          cinema: st.cinema,
          showtimes: []
        };
      }
      cinemasMap[cinemaId].showtimes.push(st);
    }
  });

  const cinemasList = Object.values(cinemasMap);
  
  if (appliedSearchLocation === 'nearest' && userLocation) {
    cinemasList.sort((a, b) => {
      const lat1 = Array.isArray(userLocation) ? userLocation[0] : userLocation.lat;
      const lon1 = Array.isArray(userLocation) ? userLocation[1] : userLocation.lng;
      
      const getDist = (lat2, lon2) => {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const aVal = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
        return R * (2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1-aVal)));
      };
      
      return getDist(a.cinema.location?.lat, a.cinema.location?.lng) - getDist(b.cinema.location?.lat, b.cinema.location?.lng);
    });
  }
  return (
    <>
      <Navbar />
      <div className="animate-fade-in relative z-10">
        
        {/* Premium Floating Search Island */}
        <div className={`sticky ${headerHidden ? 'top-4' : 'top-[84px]'} left-0 right-0 z-[100] w-[95%] max-w-5xl mx-auto mb-6 transition-all duration-300 ease-in-out`}>
          <div className="bg-black/50 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl md:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center gap-3 md:gap-4 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary-container/10 before:to-transparent before:pointer-events-none before:rounded-2xl md:before:rounded-[32px]">
            
            <div className="flex-1 w-full relative group" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
              <span className="absolute inset-y-0 left-5 flex items-center text-white/50 group-focus-within:text-primary-container transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </span>
              <input 
                value={searchQuery} 
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => { if(searchQuery) setShowSuggestions(true); }}
                className="w-full bg-white/5 hover:bg-white/10 border border-transparent text-white pl-14 py-4 md:py-3.5 rounded-xl md:rounded-[20px] text-base focus:bg-white/10 focus:border-primary-container/50 focus:ring-1 focus:ring-primary-container outline-none placeholder-white/40 transition-all shadow-inner" 
                placeholder="Tên phim..." 
                type="text" 
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim() && (
                <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-high/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[150] max-h-80 overflow-y-auto">
                  {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(movie => (
                    <div 
                      key={movie._id} 
                      className="flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(movie.title);
                        setShowSuggestions(false);
                      }}
                    >
                      <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-md" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-bold text-white truncate">{movie.title}</span>
                        <span className="text-xs text-on-surface-variant truncate">{movie.genres?.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                  {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="p-4 text-center text-on-surface-variant text-sm">
                      Không tìm thấy phim phù hợp
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-[220px] relative group" tabIndex={0} onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}>
              <span className="absolute inset-y-0 left-5 flex items-center text-white/50 group-focus-within:text-white transition-colors pointer-events-none">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path></svg>
              </span>
              <div 
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full h-full bg-white/5 hover:bg-white/10 border border-transparent text-white pl-12 pr-10 py-4 md:py-3.5 rounded-xl md:rounded-[20px] text-base focus:bg-white/10 focus:border-white/20 cursor-pointer transition-all shadow-inner flex items-center"
              >
                {searchLocation ? [{value: 'nearest', label: 'Gần nhất'}, {value: 'TP.HCM', label: 'Hồ Chí Minh'}, {value: 'Hà Nội', label: 'Hà Nội'}, {value: 'Đồng Nai', label: 'Đồng Nai'}, {value: 'Bình Dương', label: 'Bình Dương'}].find(o => o.value === searchLocation)?.label : 'Mọi khu vực'}
              </div>
              <span className="absolute inset-y-0 right-4 flex items-center text-white/50 pointer-events-none">
                <span className={`material-symbols-outlined transition-transform duration-300 ${showLocationDropdown ? 'rotate-180' : ''}`}>expand_more</span>
              </span>
              
              {showLocationDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-high/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[150] max-h-60 overflow-y-auto">
                  {[{value: '', label: 'Mọi khu vực'}, {value: 'nearest', label: '🎞️ Gần nhất'}, {value: 'TP.HCM', label: 'Hồ Chí Minh'}, {value: 'Hà Nội', label: 'Hà Nội'}, {value: 'Đồng Nai', label: 'Đồng Nai'}, {value: 'Bình Dương', label: 'Bình Dương'}].map(opt => (
                    <div 
                      key={opt.value}
                      className={`px-4 py-3 cursor-pointer transition-colors flex items-center ${searchLocation === opt.value ? 'bg-primary-container/20 text-primary-container font-bold' : (opt.value === 'nearest' ? 'text-blue-400 hover:bg-white/10 font-medium' : 'text-white hover:bg-white/10')}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (opt.value === 'nearest' && !userLocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                          }, (err) => {
                            console.error(err);
                            alert('Vui lòng cấp quyền truy cập vị trí để tìm rạp gần nhất.');
                          });
                        }
                        setSearchLocation(opt.value);
                        setShowLocationDropdown(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-[220px] relative group" tabIndex={0} onBlur={() => setTimeout(() => setShowChainDropdown(false), 200)}>
              <span className="absolute inset-y-0 left-5 flex items-center text-white/50 group-focus-within:text-white transition-colors pointer-events-none">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
              </span>
              <div 
                onClick={() => setShowChainDropdown(!showChainDropdown)}
                className="w-full h-full bg-white/5 hover:bg-white/10 border border-transparent text-white pl-12 pr-10 py-4 md:py-3.5 rounded-xl md:rounded-[20px] text-base focus:bg-white/10 focus:border-white/20 cursor-pointer transition-all shadow-inner flex items-center"
              >
                {searchChain || 'Mọi cụm rạp'}
              </div>
              <span className="absolute inset-y-0 right-4 flex items-center text-white/50 pointer-events-none">
                <span className={`material-symbols-outlined transition-transform duration-300 ${showChainDropdown ? 'rotate-180' : ''}`}>expand_more</span>
              </span>
              
              {showChainDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-surface-container-high/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[150] max-h-60 overflow-y-auto">
                  {[{value: '', label: 'Mọi cụm rạp'}, {value: 'CineStream', label: 'CineStream'}].map(opt => (
                    <div 
                      key={opt.value}
                      className={`px-4 py-3 cursor-pointer transition-colors flex items-center ${searchChain === opt.value ? 'bg-primary-container/20 text-primary-container font-bold' : 'text-white hover:bg-white/10'}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchChain(opt.value);
                        setShowChainDropdown(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-[130px]">
              <button 
                onClick={() => {
                  setAppliedSearchQuery(searchQuery);
                  setAppliedSearchLocation(searchLocation);
                  setAppliedSearchChain(searchChain);
                  cinemaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="bg-gradient-to-r from-primary-container to-red-800 w-full h-full text-white font-bold py-4 md:py-3.5 rounded-xl md:rounded-[20px] text-base hover:shadow-[0_0_20px_rgba(229,9,20,0.6)] hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 border border-primary-container/50"
              >
                Tìm ngay
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative min-h-[600px] overflow-hidden reveal active pt-16 pb-12">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(180deg, rgba(229,9,20,0.2) 0%, rgba(10,10,10,1) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOXnR-h_jv6HJREBQWN_-uTdKoLCMJ2pbt2oTufl87AheW8M_3WfQaqnhpKwWtOzvk4vlkHGr7BIfn-fyG4XCiHiZpe0uG6mPhqqoaH40FxsKaO98-OGYCii3vx-dog4UUZCPJxZnzIkAyhod2YpgHoIReqswjHGbxdvJiY0A6jdOrbXMMxjIvOSwfyjJ3JPbqLjtCwdIsj4I1SAC9JXWyALZ-DcMOERq6ndwcXuy_-bVWApcgHZq8zrXI_8quTuN-1ZuHovF227Q')", backgroundPosition: "center top", backgroundSize: "cover" }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-10">
            <h1 className="text-5xl font-bold mb-8 tracking-tight text-on-surface drop-shadow-2xl text-center">{t.heroTitle}</h1>
            
            <div className="w-full max-w-2xl mx-auto">
              {/* Ranking Chart */}
              <div className="bg-surface-container-high/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <h3 className="text-xl font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-2xl">trending_up</span> Bảng xếp hạng phim
                  </h3>
                  <div className="flex bg-surface-container rounded-lg p-1">
                    <button onClick={() => setRankingTab('views')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${rankingTab === 'views' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>Lượt xem</button>
                    <button onClick={() => setRankingTab('tickets')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${rankingTab === 'tickets' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>Vé bán</button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  {topMovies.map((m, idx) => (
                    <div key={m._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : idx === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/50' : idx === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/50' : 'bg-surface-container-highest text-on-surface-variant'}`}>{idx + 1}</div>
                      <img src={m.poster} className="w-14 h-20 object-cover rounded-md shadow-md" />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-base font-bold text-on-surface truncate">{m.title}</h4>
                        <p className="text-sm text-primary-container font-medium">{rankingTab === 'views' ? `${m.views?.toLocaleString()} lượt xem` : `${m.ticketsSold?.toLocaleString()} vé bán`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          {/* Movies Now Playing */}
          <section className="mb-16 reveal active">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-primary-container text-xs font-bold uppercase tracking-widest">{t.moviesCategory}</span>
                <h2 className="text-3xl font-bold mt-1 text-on-surface">{t.nowPlaying}</h2>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-primary-container" size={40} />
              </div>
            ) : (
              <div className="relative group">
                <button 
                  onClick={() => carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-primary-container text-white rounded-r-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div ref={carouselRef} className="flex overflow-x-auto space-x-6 pb-4 hide-scrollbar scroll-smooth relative px-2">
                  {movies.map((movie) => (
                    <div 
                      key={movie._id} 
                      onClick={() => {
                        setSelectedMovie(movie._id);
                        setShowModal(true);
                      }}
                      className={`flex-none w-48 transition-all hover:scale-105 duration-300 cursor-pointer ${selectedMovie === movie._id ? 'ring-4 ring-primary-container scale-105 opacity-100 rounded-lg' : selectedMovie ? 'opacity-50' : 'opacity-100'}`}
                    >
                      <img alt={movie.title} className="w-full h-72 object-cover rounded-lg shadow-2xl mb-3 poster-3d" src={movie.poster} />
                      <h3 className={`text-sm font-bold truncate ${selectedMovie === movie._id ? 'text-primary-container' : 'text-on-surface'}`}>{movie.title}</h3>
                    </div>
                  ))}
                  {movies.length === 0 && (
                    <p className="text-on-surface-variant">No movies currently showing.</p>
                  )}
                </div>
                <button 
                  onClick={() => carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-primary-container text-white rounded-l-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </section>

          {/* Nearby Cinemas Section */}
          <section ref={cinemaSectionRef} className="reveal active scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-3xl font-bold text-on-surface">
                {t.nearbyCinemas}
                {selectedMovie && (
                  <span className="text-primary-container ml-3 text-xl">
                    ({movies.find(m => m._id === selectedMovie)?.title})
                  </span>
                )}
              </h2>
              {selectedMovie && (
                <button 
                  onClick={() => setSelectedMovie(null)}
                  className="mt-3 md:mt-0 px-4 py-2 bg-surface-container text-on-surface text-sm rounded-lg hover:bg-surface-container-high transition border border-white/10"
                >
                  ✕ Bỏ lọc phim
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4 items-center mb-8 text-sm">
              <span className="text-on-surface-variant font-semibold">{t.quickFilters}</span>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setTimeFilter(timeFilter === 'morning' ? 'all' : 'morning')}
                  className={`px-1 cursor-pointer transition ${timeFilter === 'morning' ? 'text-on-surface border-b-2 border-primary-container font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
                >{t.morning}</button>
                <button 
                  onClick={() => setTimeFilter(timeFilter === 'afternoon' ? 'all' : 'afternoon')}
                  className={`px-1 cursor-pointer transition ${timeFilter === 'afternoon' ? 'text-on-surface border-b-2 border-primary-container font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
                >{t.afternoon}</button>
                <button 
                  onClick={() => setTimeFilter(timeFilter === 'evening' ? 'all' : 'evening')}
                  className={`px-1 cursor-pointer transition ${timeFilter === 'evening' ? 'text-on-surface border-b-2 border-primary-container font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
                >{t.evening}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cinema Listings */}
              <div className="lg:col-span-2 space-y-6">
                
                {isLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary-container" size={40} />
                  </div>
                ) : cinemasList.length === 0 ? (
                  <div className="bg-surface-container/50 backdrop-blur-sm rounded-2xl border border-white/5 p-8 text-center text-on-surface-variant">
                    No showtimes available at the moment.
                  </div>
                ) : (
                  cinemasList.map((cinemaGroup, index) => (
                    <div key={index} className="bg-surface-container/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/20 transition-all">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-48 h-32 flex-none bg-surface-container-highest rounded-lg overflow-hidden relative">
                          <img alt={cinemaGroup.cinema.name} className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOXnR-h_jv6HJREBQWN_-uTdKoLCMJ2pbt2oTufl87AheW8M_3WfQaqnhpKwWtOzvk4vlkHGr7BIfn-fyG4XCiHiZpe0uG6mPhqqoaH40FxsKaO98-OGYCii3vx-dog4UUZCPJxZnzIkAyhod2YpgHoIReqswjHGbxdvJiY0A6jdOrbXMMxjIvOSwfyjJ3JPbqLjtCwdIsj4I1SAC9JXWyALZ-DcMOERq6ndwcXuy_-bVWApcgHZq8zrXI_8quTuN-1ZuHovF227Q" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-on-surface">{cinemaGroup.cinema.name}</h3>
                              <p className="text-on-surface-variant text-sm flex items-center mt-1">
                                <svg className="w-4 h-4 mr-1 text-on-surface-variant/80" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path></svg>
                                {cinemaGroup.cinema.address || 'Unknown address'}
                                {userLocation && cinemaGroup.cinema.location ? (
                                  ` • Cách đây ${(() => {
                                    const lat1 = Array.isArray(userLocation) ? userLocation[0] : userLocation.lat;
                                    const lon1 = Array.isArray(userLocation) ? userLocation[1] : userLocation.lng;
                                    const lat2 = cinemaGroup.cinema.location.lat;
                                    const lon2 = cinemaGroup.cinema.location.lng;
                                    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return '--';
                                    const R = 6371;
                                    const dLat = (lat2 - lat1) * Math.PI / 180;
                                    const dLon = (lon2 - lon1) * Math.PI / 180;
                                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
                                    return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))).toFixed(1);
                                  })()} km`
                                ) : ''}
                              </p>
                            </div>
                            <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/20">● {t.open}</span>
                          </div>
                          {/* Features and Buttons */}
                          <div className="flex flex-wrap items-center justify-between mt-4">
                            <div className="flex space-x-3 text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]" title="Ticket">confirmation_number</span>
                              <span className="material-symbols-outlined text-[18px]" title="Movie">movie</span>
                              <span className="material-symbols-outlined text-[18px]" title="Parking">directions_car</span>
                              <span className="material-symbols-outlined text-[18px]" title="Cafe">local_cafe</span>
                            </div>
                            <div className="flex space-x-3 mt-4 sm:mt-0">
                              <button className="px-4 py-2 bg-surface-container-high text-on-surface text-sm font-medium rounded-lg hover:bg-surface-container-highest transition cursor-pointer">{t.details}</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Showtimes */}
                      <div className="mt-6">
                        <h4 className="text-sm font-bold text-on-surface mb-3">Available Showtimes</h4>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {cinemaGroup.showtimes.map(st => {
                            const startDate = new Date(st.startTime);
                            const timeStr = startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            return (
                              <button 
                                key={st._id} 
                                onClick={() => navigate(`/seat-selection/${st._id}`)}
                                className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer flex flex-col items-center justify-center"
                              >
                                <div className="text-xs font-bold text-on-surface">{timeStr}</div>
                                <div className="text-[9px] text-on-surface-variant group-hover:text-primary-container truncate w-full px-1">{st.movie?.title}</div>
                                <div className="text-[9px] text-primary-container font-bold mt-1">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(st.pricing?.normalPrice || 0)}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Map View Sidebar */}
              <div className="lg:col-span-1">
                {isMapExpanded && (
                  <div className="fixed inset-0 z-[40] bg-background/80 backdrop-blur-sm" onClick={() => setIsMapExpanded(false)}></div>
                )}
                <div className={
                  isMapExpanded 
                    ? "fixed inset-4 md:inset-10 z-[50] transition-all duration-500 ease-in-out shadow-2xl"
                    : "sticky top-24 h-[600px] w-full transition-all duration-500 ease-in-out"
                }>
                  <div className="w-full h-full bg-surface-container rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative z-0">
                    {isMapExpanded && (
                      <button onClick={() => setIsMapExpanded(false)} className="absolute top-4 left-4 z-[1001] w-10 h-10 bg-surface-container-highest border border-white/10 rounded-lg flex items-center justify-center text-on-surface hover:text-primary-container transition-colors cursor-pointer shadow-lg">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    )}
                    
                    <MapContainer 
                      center={[10.762622, 106.660172]} 
                      zoom={12} 
                      style={{ height: '100%', width: '100%' }}
                      className="z-0"
                    >
                      <MapLocationButton onLocationFound={setUserLocation} />
                      <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      />
                      
                      {/* User Location Marker */}
                      {userLocation && (
                        <Marker 
                          position={userLocation}
                          icon={
                            new L.DivIcon({
                              html: `
                                <div class="relative flex items-center justify-center w-8 h-8">
                                  <div class="absolute w-full h-full rounded-full bg-blue-500 opacity-40 animate-ping"></div>
                                  <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.9)]"></div>
                                </div>
                              `,
                              className: '',
                              iconSize: [32, 32],
                              iconAnchor: [16, 16],
                              popupAnchor: [0, -16]
                            })
                          }
                        >
                          <Popup>
                            <div className="font-bold text-sm text-gray-800">Vị trí của bạn</div>
                          </Popup>
                        </Marker>
                      )}
                    {cinemasList.map((cinemaGroup, index) => {
                      const lat = cinemaGroup.cinema?.location?.lat || 10.762622;
                      const lng = cinemaGroup.cinema?.location?.lng || 106.660172;
                      
                      const pulseIcon = new L.DivIcon({
                        html: `
                          <div class="relative flex items-center justify-center w-6 h-6">
                            <div class="absolute w-full h-full rounded-full bg-primary-container opacity-50 animate-ping"></div>
                            <div class="relative w-3 h-3 rounded-full bg-primary-container border-2 border-white shadow-[0_0_10px_rgba(229,9,20,0.8)]"></div>
                          </div>
                        `,
                        className: '',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                        popupAnchor: [0, -12]
                      });

                      return (
                        <Marker 
                          key={cinemaGroup.cinema?._id || index} 
                          position={[lat, lng]}
                          icon={pulseIcon}
                        >
                          <Popup>
                            <div className="font-body-base text-gray-800">
                              <h3 className="font-bold text-sm">{cinemaGroup.cinema?.name}</h3>
                              <p className="text-xs">{cinemaGroup.cinema?.address || 'Unknown address'}</p>
                              <p className="text-xs font-semibold mt-1 text-primary-container">{cinemaGroup.showtimes?.length} Showtimes</p>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                  
                  {/* Map UI Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-container/20 text-primary-container flex items-center justify-center rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{t.mapView}</p>
                          <p className="text-[10px] text-on-surface-variant">{t.exploreLoc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        className="text-primary-container text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      >
                        {isMapExpanded ? 'COLLAPSE' : t.expand}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            </div>
          </section>
        </main>
      </div>


        {/* Movie Details Modal */}
        {showModal && selectedMovie && createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-surface-container rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl border border-white/10 animate-fade-in">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-primary-container text-white rounded-full flex items-center justify-center transition cursor-pointer backdrop-blur">
                <span className="material-symbols-outlined">close</span>
              </button>
              
              {/* Trailer Section */}
              <div className="w-full md:w-1/2 bg-black flex flex-col">
                <div className="aspect-video w-full">
                  <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${movies.find(m => m._id === selectedMovie)?.trailerUrl?.split('v=')[1] || '73_1biulkYk'}?autoplay=1&mute=1`}
                    title="Trailer" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
                  </iframe>
                </div>
                <div className="p-6 hidden md:block">
                  <h3 className="text-lg font-bold text-on-surface mb-2">Diễn viên chính</h3>
                  <div className="flex flex-wrap gap-2">
                    {movies.find(m => m._id === selectedMovie)?.cast?.map((actor, i) => (
                      <span key={i} className="px-3 py-1 bg-surface-container-highest rounded-full text-xs text-on-surface-variant border border-white/5">{actor}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Info Section */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-surface-container">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 bg-primary-container/20 text-primary-container text-xs font-bold rounded uppercase tracking-wider">Đang chiếu</span>
                    <span className="text-on-surface-variant text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {movies.find(m => m._id === selectedMovie)?.duration} phút</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">{movies.find(m => m._id === selectedMovie)?.title}</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                    {movies.find(m => m._id === selectedMovie)?.description || 'Một siêu phẩm không thể bỏ lỡ tại CineStream. Đặt vé ngay hôm nay để thưởng thức những thước phim đỉnh cao.'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-8">
                    <div><span className="font-bold text-on-surface">Đạo diễn:</span> {movies.find(m => m._id === selectedMovie)?.director}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setTimeout(() => cinemaSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
                  }}
                  className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl text-lg hover:bg-primary-container/80 transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">confirmation_number</span>
                  Tìm rạp đang chiếu phim này
                </button>
              </div>
            </div>
          </div>, document.body
        )}
      <Footer />
    </>
  );
}
