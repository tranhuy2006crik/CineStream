import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    heroTitle: 'Cinema and Movie Discovery',
    searchMovies: 'Search Movies',
    searchBtn: 'Search',
    location: 'Location (e.g., New York)',
    cinemaChain: 'Cinema Chain (CGV, Galaxy, Lotte)',
    moviesCategory: 'Movies',
    nowPlaying: 'Movies Now Playing',
    nearbyCinemas: 'Nearby Cinemas Showing Dune: Part Two',
    quickFilters: 'Quick Filters:',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    milesAway: '1.2 miles away',
    open: 'OPEN',
    details: 'Details',
    bookNow: 'Book Now',
    mapView: 'Map View',
    exploreLoc: 'Explore 12 nearby locations',
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
    nearbyCinemas: 'Rạp Gần Nhất Chiếu: Dune: Part Two',
    quickFilters: 'Lọc nhanh:',
    morning: 'Sáng',
    afternoon: 'Chiều',
    evening: 'Tối',
    milesAway: 'Cách đây 2.0 km',
    open: 'ĐANG MỞ',
    details: 'Chi tiết',
    bookNow: 'Đặt vé',
    mapView: 'Bản đồ',
    exploreLoc: 'Khám phá 12 cụm rạp lân cận',
    expand: 'Mở rộng'
  }
};

export default function Booking() {
  const { lang } = useLang();
  const t = translations[lang];

  // Scroll to top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <header className="relative h-[600px] overflow-hidden reveal active">
        {/* Visual background representing a cinema screen */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "linear-gradient(180deg, rgba(229,9,20,0.2) 0%, rgba(10,10,10,1) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOXnR-h_jv6HJREBQWN_-uTdKoLCMJ2pbt2oTufl87AheW8M_3WfQaqnhpKwWtOzvk4vlkHGr7BIfn-fyG4XCiHiZpe0uG6mPhqqoaH40FxsKaO98-OGYCii3vx-dog4UUZCPJxZnzIkAyhod2YpgHoIReqswjHGbxdvJiY0A6jdOrbXMMxjIvOSwfyjJ3JPbqLjtCwdIsj4I1SAC9JXWyALZ-DcMOERq6ndwcXuy_-bVWApcgHZq8zrXI_8quTuN-1ZuHovF227Q')",
            backgroundPosition: "center top",
            backgroundSize: "cover"
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-background"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-6">
          <h1 className="text-5xl font-bold mb-10 tracking-tight text-on-surface drop-shadow-2xl">{t.heroTitle}</h1>
          
          {/* Search/Filter Controls */}
          <div className="w-full max-w-5xl bg-surface-container-high/90 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="md:col-span-2 relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </span>
                <input className="w-full bg-transparent border-none text-on-surface pl-12 py-4 focus:ring-0 text-lg outline-none placeholder-on-surface-variant/50" placeholder={t.searchMovies} type="text" />
              </div>
              <div className="md:col-span-1">
                <button className="bg-primary-container w-full h-full text-on-primary-container font-bold py-4 rounded-lg hover:bg-primary-container/80 transition-all text-lg shadow-[0_0_15px_rgba(229,9,20,0.3)] cursor-pointer">{t.searchBtn}</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 px-2 pb-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-primary-container">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path></svg>
                </span>
                <select className="w-full bg-surface-container-highest border-none text-on-surface pl-10 py-3 rounded-lg focus:ring-0 appearance-none outline-none cursor-pointer">
                  <option>{t.location}</option>
                </select>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                </span>
                <select className="w-full bg-surface-container-highest border-none text-on-surface pl-10 py-3 rounded-lg focus:ring-0 appearance-none outline-none cursor-pointer">
                  <option>{t.cinemaChain}</option>
                </select>
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
            <div className="flex space-x-2">
              <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container-high text-on-surface transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>
              <button className="p-2 rounded-full border border-outline-variant hover:bg-surface-container-high text-on-surface transition cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto space-x-6 pb-4 hide-scrollbar">
            {/* Movie Poster Placeholders */}
            {[
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDDYWxPR00xg0VZmIsE8rB6Szb_aRK898t-t-FZcFs0D0gk5bKTvms3Sfs2oge425J6DCCoSRBvU65IFAklDS3eRkN0x5YW2L9RCBFIGEZfVKXrl3mD3xJPuZpCG3lRLhmRh_yxqDjduk9igar8bi0p2MhuYz8VnYqynM1qGfNDVB9XZ3g7shbb1d54gGe_UCfuQw1SxhE-sG_zMlC7vqBxuyvPiCOOV_XeJhoIkjVrSQi1efy5JAm8am7L7qmz746UcPDugIMcn7o",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuC5I3lEwKb2DWAYqb4kUfEibO9wZaTgr15rUYoOCMF6TWyTqxsGcaGN5fmBW_G2m4C-c_2zPo62tzkMYgDC4ooR8_11Md7o0QVvTUlCwjjJVQ3pDHg0_JSz-eUYAidBi6mcQkl7ni7ZTiMIR56GHGbr08-rRoKLTE_fVP4cEySjB8OjQ4uoHI-8wBzheUiFMrOgrCxXvf4tw2kIXuethsOal-bXtnCz7akfbwHEcSZLAt1cDZ9BFG48bt_4rGBqlTWFLONJlXJyEHk",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAibmlKa3UCUtbx-dOOwPvwFOW0gDf6qDzI1cl0JAVuWy96KN8bTgezoAhZVfZNjjKSKB24e6K4kqiNbP_Z0JlPy5VK8KvOdyjV0i585meRWjP9sOvMw0NHsx8S_PeA1YADArJEyQVeiyag_D2gG7tlkKx6pE5DOCEYx-8GT59mjzoaC6_nVNVvEQrGwfaaCNZ8Q5EsXFQZ5qzMkRXqT9CRFrj0fJ3OpusD_0WRdk_PZpCs0vNDsBu-rB8BrtTTO_KjndMsTJ-zKvo",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAQKG0YncIc3sOT0wVDq5EQ8MKTmii5miUrCJFrXHaCGWedtUexFrQCmWPx2_mZNHJpiWTH6ctNDqw2je4RoVsjczL6fYYAuOjkdditc-owfLkaVfuy_6Y83R3VDATGRXRga3Lsfh6lYadNiucmO2Aa40xDaeFBPAeg5-koRUfG_C5y-PDTFfF4BdmFbFpVtRWui-R1dWyg4H7AbAN_CnuSvxswV49A1_yolr0d2NR2k_uYhUX-F04beNBizbl583eyEpupdGUfaGg",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBEmbrg6vU6V5ga1yInDfaShHpKkLof1GMov1-2nsIdvmdjjArrJoeveNvxrQ05rCaUNTseA62weXOOiUnGgeCkreg10RCuHjEFm7DxhpH-c1Y7rQn_Ax1rH2D8G3Yi5tNaOGYpsOPqPwrqtSUSpk9cRMpdJrsiwVycEFVQn1522R5jXIbuIOUznomBMadmhjNo3fwKgImSvGkb8HPALmzLqWHCA7-JWLbCNzkuhJz2y0Adex_WtjRcn4W55QANSxBXOQSmFVcL5Co",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCbC9-oYdYdEI2k0Tqq-e01ak2nXnMuLfvaAP1uTjrOfQc06ar4KOE4bUXmgTVkw3bAqTAh1HJAgRW2vLhodrj7KwwDzrpvyS4fuX8SvmfsJzG7Gp_sqeHVYqNblt1aYzhAEEvf__P0GnyHhsaF9u_Oz7rdrT7ibxk43dH8IV1c33SKm-uz5KzkIkdrHSZ8pxZ2C7AlIYGsjRtVd2vrcQqrfJSvKkaYZBFrUdaHWCIS_IMR4WJrZ1DF8o2525KEJ8lzZZkdgJ_mF3A"
            ].map((src, i) => (
              <div key={i} className="flex-none w-48 transition-transform hover:scale-105 duration-300 cursor-pointer">
                <img alt="Movie Poster" className="w-full h-72 object-cover rounded-lg shadow-2xl mb-3 poster-3d" src={src} />
              </div>
            ))}
          </div>
        </section>

        {/* Nearby Cinemas Section */}
        <section className="reveal active">
          <h2 className="text-3xl font-bold mb-6 text-on-surface">{t.nearbyCinemas}</h2>
          <div className="flex flex-wrap gap-4 items-center mb-8 text-sm">
            <span className="text-on-surface-variant font-semibold">{t.quickFilters}</span>
            <div className="flex space-x-4">
              <button className="text-on-surface border-b-2 border-primary-container font-medium px-1 cursor-pointer">{t.morning}</button>
              <button className="text-on-surface-variant hover:text-on-surface transition px-1 cursor-pointer">{t.afternoon}</button>
              <button className="text-on-surface-variant hover:text-on-surface transition px-1 cursor-pointer">{t.evening}</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cinema Listings */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Cinema Card 1 */}
              <div className="bg-surface-container/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 flex-none bg-surface-container-highest rounded-lg overflow-hidden">
                    <img alt="Cinema" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOXnR-h_jv6HJREBQWN_-uTdKoLCMJ2pbt2oTufl87AheW8M_3WfQaqnhpKwWtOzvk4vlkHGr7BIfn-fyG4XCiHiZpe0uG6mPhqqoaH40FxsKaO98-OGYCii3vx-dog4UUZCPJxZnzIkAyhod2YpgHoIReqswjHGbxdvJiY0A6jdOrbXMMxjIvOSwfyjJ3JPbqLjtCwdIsj4I1SAC9JXWyALZ-DcMOERq6ndwcXuy_-bVWApcgHZq8zrXI_8quTuN-1ZuHovF227Q" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-on-surface">CineStream IMAX - Landmark 81</h3>
                        <p className="text-on-surface-variant text-sm flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-on-surface-variant/80" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path></svg>
                          308 West 42nd Street, NY • {t.milesAway}
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
                        <button className="px-4 py-2 bg-primary-container text-on-primary-container text-sm font-bold rounded-lg hover:bg-primary-container/80 transition cursor-pointer shadow-[0_0_10px_rgba(229,9,20,0.3)]">{t.bookNow}</button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Showtimes */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6">
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">10:30 AM</div>
                    <div className="text-[9px] text-on-surface-variant group-hover:text-primary-container">(IMAX)</div>
                  </button>
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">1:45 PM</div>
                  </button>
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">3:00 PM</div>
                  </button>
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">5:00 PM</div>
                    <div className="text-[9px] text-on-surface-variant group-hover:text-primary-container">(Dolby Atmos)</div>
                  </button>
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">8:15 PM</div>
                  </button>
                </div>
              </div>

              {/* Cinema Card 2 */}
              <div className="bg-surface-container/50 backdrop-blur-sm rounded-2xl border border-white/5 p-5 hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 flex-none bg-surface-container-highest rounded-lg overflow-hidden">
                    <img alt="Cinema" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOXnR-h_jv6HJREBQWN_-uTdKoLCMJ2pbt2oTufl87AheW8M_3WfQaqnhpKwWtOzvk4vlkHGr7BIfn-fyG4XCiHiZpe0uG6mPhqqoaH40FxsKaO98-OGYCii3vx-dog4UUZCPJxZnzIkAyhod2YpgHoIReqswjHGbxdvJiY0A6jdOrbXMMxjIvOSwfyjJ3JPbqLjtCwdIsj4I1SAC9JXWyALZ-DcMOERq6ndwcXuy_-bVWApcgHZq8zrXI_8quTuN-1ZuHovF227Q" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-on-surface">CineStream Boutique - Chelsea</h3>
                        <p className="text-on-surface-variant text-sm flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1 text-on-surface-variant/80" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path></svg>
                          344 West 14th Street, NY • {t.milesAway}
                        </p>
                      </div>
                      <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/20">● {t.open}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-4">
                      <div className="flex space-x-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]" title="Ticket">confirmation_number</span>
                        <span className="material-symbols-outlined text-[18px]" title="Bar">local_bar</span>
                        <span className="material-symbols-outlined text-[18px]" title="Dine-in">restaurant</span>
                      </div>
                      <div className="flex space-x-3 mt-4 sm:mt-0">
                        <button className="px-4 py-2 bg-surface-container-high text-on-surface text-sm font-medium rounded-lg hover:bg-surface-container-highest transition cursor-pointer">{t.details}</button>
                        <button className="px-4 py-2 bg-primary-container text-on-primary-container text-sm font-bold rounded-lg hover:bg-primary-container/80 transition cursor-pointer shadow-[0_0_10px_rgba(229,9,20,0.3)]">{t.bookNow}</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6">
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">10:30 AM</div>
                    <div className="text-[9px] text-on-surface-variant group-hover:text-primary-container">(Gold)</div>
                  </button>
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">2:15 PM</div>
                  </button>
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">5:00 PM</div>
                  </button>
                  <button className="bg-surface-container-highest hover:bg-primary-container/20 border border-transparent hover:border-primary-container transition p-2 rounded-lg text-center group cursor-pointer">
                    <div className="text-xs font-bold text-on-surface">9:30 PM</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Map View Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 h-[600px] w-full bg-surface-container rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCW3DZrwHIzClFXS_Ov2GizLmmTdZxuAhbPJ8FYrAZ_60Ewp6fVextqwsDPQidZjmO4IM0o9dvNJriJHRniqChGmhVIZuw6Wsa6yDsu84p4E76arTbKSeFi_wzfuzu9iQmydtuLXZJmhTnXPsAlxr5j2B62kt5UAsZiam2CoyIezJiX4zyjuHokD-mA2-CMkPSjW9cnnKi2wBCK6vavBzuEqi32x24D3EPKiCwByuQj6hzRxyQFf8HaIeMLLd9tGlEKSTm0FSWpro4')"}}></div>
                {/* Map Markers */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[40%] left-[50%] w-6 h-6 bg-primary-container rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-[0_0_15px_rgba(229,9,20,0.8)]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute top-[30%] left-[65%] w-4 h-4 bg-primary-container/80 rounded-full border-2 border-white/50"></div>
                  <div className="absolute top-[55%] left-[45%] w-4 h-4 bg-primary-container/80 rounded-full border-2 border-white/50"></div>
                  <div className="absolute top-[70%] left-[30%] w-4 h-4 bg-primary-container/80 rounded-full border-2 border-white/50"></div>
                </div>
                {/* Map UI Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-container/20 text-primary-container flex items-center justify-center rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t.mapView}</p>
                        <p className="text-[10px] text-on-surface-variant">{t.exploreLoc}</p>
                      </div>
                    </div>
                    <button className="text-primary-container text-[10px] font-bold uppercase tracking-wider cursor-pointer">{t.expand}</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
