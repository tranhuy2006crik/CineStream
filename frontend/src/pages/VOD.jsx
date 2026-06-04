import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';

export default function VOD() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/movies?status=VOD')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMovies(data);
        }
      })
      .catch(err => console.error('Error fetching VOD movies:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const heroMovie = movies.length > 0 ? movies[0] : null;
  const listMovies = movies.length > 0 ? movies.slice(1) : [];

  return (
    <div className="bg-background text-on-background font-body-base overflow-x-hidden min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full h-[716px] md:h-[870px] mt-0 flex items-center justify-start overflow-hidden bg-surface-container-highest">
        {heroMovie ? (
          <>
            <div className="absolute inset-0 z-0">
              <img 
                alt={heroMovie.title} 
                className="w-full h-full object-cover object-center" 
                src={heroMovie.backdrop || heroMovie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80"}
              />
              {/* Gradient Overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 md:px-16">
              <div className="max-w-2xl flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="bg-primary-container text-white font-label-bold text-xs px-2 py-1 rounded uppercase tracking-wider">New to VOD</span>
                  <span className="text-on-surface-variant font-label-bold text-xs border border-outline-variant px-2 py-1 rounded">4K HDR</span>
                </div>
                <h1 className="font-display-lg text-[48px] md:text-[72px] md:leading-[1.1] font-black text-on-surface tracking-tighter" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {heroMovie.title}
                </h1>
                <p className="font-body-base text-base text-on-surface-variant max-w-xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {heroMovie.description || "The most anticipated thriller of the year is now available to rent. Experience the magic of cinema right from your living room."}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <button className="bg-primary-container text-white font-headline-md text-base px-8 py-3 rounded hover:brightness-110 transition-colors flex items-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    Rent Now {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(heroMovie.price || 50000)}
                  </button>
                  <button className="bg-white/10 text-white font-headline-md text-base px-8 py-3 rounded hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/10 cursor-pointer">
                    <span className="material-symbols-outlined">movie</span>
                    Watch Trailer
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-container" size={60} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-xl">
            No VOD movies currently available.
          </div>
        )}
      </header>

      {/* Main Content Canvas */}
      <main className="w-full pb-8">
        {/* Search & Filter Sub-nav */}
        <section className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-md border-b border-outline-variant/30 py-4">
          <div className="max-w-[1440px] mx-auto px-4 md:px-16 flex flex-col md:flex-row justify-between items-center gap-4">
            <ul className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <li><a className="font-body-base text-base text-on-surface font-bold whitespace-nowrap" href="#">All VOD</a></li>
              <li><a className="font-body-base text-base text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap" href="#">New Releases</a></li>
              <li><a className="font-body-base text-base text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap" href="#">Rentals</a></li>
              <li><a className="font-body-base text-base text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap" href="#">Purchased</a></li>
            </ul>
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10" style={{ fontSize: '20px' }}>search</span>
              <input 
                className="w-full bg-surface-container-high border border-outline-variant/50 rounded-full py-2 pl-10 pr-4 font-body-sm text-sm text-on-surface focus:border-primary-container focus:ring-0 transition-colors placeholder:text-on-surface-variant/50 outline-none" 
                placeholder="Search VOD titles..." 
                type="text"
              />
            </div>
          </div>
        </section>

        {/* New to VOD Rail */}
        <section className="mt-8 max-w-[1440px] mx-auto pl-4 md:pl-16">
          <h2 className="font-headline-md text-2xl text-on-surface mb-4 px-0 font-bold">New to VOD</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 pr-4 md:pr-16 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-none w-[160px] md:w-[220px] aspect-[2/3] rounded-lg bg-[#181818] animate-pulse snap-start"></div>
              ))
            ) : listMovies.length > 0 ? (
              listMovies.map(movie => (
                <div key={movie._id} className="group relative flex-none w-[160px] md:w-[220px] aspect-[2/3] rounded-lg overflow-hidden bg-surface-container hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer shadow-none hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] snap-start">
                  <img 
                    alt={movie.title} 
                    className="w-full h-full object-cover" 
                    src={movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80"}
                  />
                  {/* Scrim & Metadata */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-2 left-2 bg-primary-container text-white font-label-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm">VOD</div>
                  <div className="absolute top-2 right-2 bg-surface-dim/80 backdrop-blur-sm text-on-surface border border-outline-variant font-label-bold text-[10px] px-1.5 py-0.5 rounded">4K HDR</div>
                  <div className="absolute bottom-0 left-0 w-full p-3 flex flex-col gap-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-headline-md text-base text-on-surface truncate font-bold">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-[12px]">
                      <span className="flex items-center text-yellow-500">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 7.8
                      </span>
                      <span>2024</span>
                    </div>
                    <button className="mt-2 w-full bg-primary-container/90 hover:bg-primary-container text-white font-label-bold text-[12px] py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase cursor-pointer">
                      Rent {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(movie.price || 50000)}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-on-surface-variant">No other movies found.</div>
            )}
            
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
