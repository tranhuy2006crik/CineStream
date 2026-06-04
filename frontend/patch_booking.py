import sys
import re

with open(r'd:\MINDX-PNL-X42\project_webfilm\frontend\src\pages\Booking.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
state_addition = '''  const [showModal, setShowModal] = useState(false);
  const [rankingTab, setRankingTab] = useState('views');
  const carouselRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
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
'''
content = content.replace('  const cinemaSectionRef = useRef(null);', '  const cinemaSectionRef = useRef(null);\n' + state_addition)

# 2. Modify Hero Section
hero_start = content.find('<header className="relative h-[600px] overflow-hidden reveal active">')
hero_end = content.find('</header>') + len('</header>')

new_hero = '''        <header className="relative min-h-[700px] overflow-hidden reveal active pt-24 pb-12">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(180deg, rgba(229,9,20,0.2) 0%, rgba(10,10,10,1) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOXnR-h_jv6HJREBQWN_-uTdKoLCMJ2pbt2oTufl87AheW8M_3WfQaqnhpKwWtOzvk4vlkHGr7BIfn-fyG4XCiHiZpe0uG6mPhqqoaH40FxsKaO98-OGYCii3vx-dog4UUZCPJxZnzIkAyhod2YpgHoIReqswjHGbxdvJiY0A6jdOrbXMMxjIvOSwfyjJ3JPbqLjtCwdIsj4I1SAC9JXWyALZ-DcMOERq6ndwcXuy_-bVWApcgHZq8zrXI_8quTuN-1ZuHovF227Q')", backgroundPosition: "center top", backgroundSize: "cover" }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-10">
            <h1 className="text-5xl font-bold mb-8 tracking-tight text-on-surface drop-shadow-2xl text-center">{t.heroTitle}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
              {/* Ranking Chart */}
              <div className="lg:col-span-1 bg-surface-container-high/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container">trending_up</span> Bảng xếp hạng
                  </h3>
                  <div className="flex bg-surface-container rounded-lg p-1">
                    <button onClick={() => setRankingTab('views')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${rankingTab === 'views' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>Lượt xem</button>
                    <button onClick={() => setRankingTab('tickets')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${rankingTab === 'tickets' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}>Vé bán</button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  {topMovies.map((m, idx) => (
                    <div key={m._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : idx === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/50' : idx === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/50' : 'bg-surface-container-highest text-on-surface-variant'}`}>{idx + 1}</div>
                      <img src={m.poster} className="w-10 h-14 object-cover rounded" />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-on-surface truncate">{m.title}</h4>
                        <p className="text-xs text-primary-container font-medium">{rankingTab === 'views' ? `${m.views?.toLocaleString()} lượt` : `${m.ticketsSold?.toLocaleString()} vé`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky Filter */}
              <div className="lg:col-span-2 flex items-end">
                <div className={`w-full transition-all duration-500 z-50 ${isScrolled ? 'fixed top-[70px] left-0 right-0 px-4 md:px-10 lg:px-[15%] shadow-2xl' : ''}`}>
                  <div className={`w-full bg-surface-container-high/95 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${isScrolled ? 'scale-100 ring-2 ring-primary-container/30' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="md:col-span-2 relative">
                        <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </span>
                        <input className="w-full bg-transparent border-none text-on-surface pl-12 py-3 focus:ring-0 outline-none placeholder-on-surface-variant/50" placeholder={t.searchMovies} type="text" />
                      </div>
                      <div className="md:col-span-1">
                        <button className="bg-primary-container w-full h-full text-on-primary-container font-bold py-3 rounded-lg hover:bg-primary-container/80 transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] cursor-pointer">{t.searchBtn}</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 px-2 pb-1">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-4 flex items-center text-primary-container">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path></svg>
                        </span>
                        <select className="w-full bg-surface-container-highest border-none text-on-surface pl-10 py-2.5 rounded-lg focus:ring-0 appearance-none outline-none cursor-pointer">
                          <option>{t.location}</option>
                        </select>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                        </span>
                        <select className="w-full bg-surface-container-highest border-none text-on-surface pl-10 py-2.5 rounded-lg focus:ring-0 appearance-none outline-none cursor-pointer">
                          <option>{t.cinemaChain}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>'''

content = content[:hero_start] + new_hero + content[hero_end:]

# 3. Add Modal and modify onClick of movie poster
poster_onclick = '''onClick={() => {
                      setSelectedMovie(movie._id === selectedMovie ? null : movie._id);
                      setTimeout(() => cinemaSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}'''
new_poster_onclick = '''onClick={() => {
                      setSelectedMovie(movie._id);
                      setShowModal(true);
                    }}'''
content = content.replace(poster_onclick, new_poster_onclick)
content = content.replace('<div className="flex overflow-x-auto space-x-6 pb-4 hide-scrollbar">', '<div ref={carouselRef} className="flex overflow-x-auto space-x-6 pb-4 hide-scrollbar scroll-smooth relative">')

# 4. Add Modal Component to the bottom before Footer
modal_ui = '''
        {/* Movie Details Modal */}
        {showModal && selectedMovie && (
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
          </div>
        )}
'''
content = content.replace('      <Footer />', modal_ui + '      <Footer />')

with open(r'd:\MINDX-PNL-X42\project_webfilm\frontend\src\pages\Booking.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
