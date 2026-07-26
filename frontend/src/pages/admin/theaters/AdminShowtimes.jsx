import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Plus, Search, MapPin, Film, Trash2, X, Loader2 } from 'lucide-react';

export default function AdminShowtimes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCinema, setFilterCinema] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showtimes, setShowtimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);

  const [formData, setFormData] = useState({
    movie: '',
    cinema: '',
    theater: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '21:30',
    pricing: {
      normalPrice: 90000,
      vipPrice: 130000,
      couplePrice: 180000
    }
  });

  const fetchCinemas = async () => {
    try {
      const res = await fetch('/api/cinemas');
      const data = await res.json();
      setCinemas(Array.isArray(data) ? data : (data.cinemas || []));
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/movies?limit=200');
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : (data.movies || []));
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const res = await fetch('/api/showtimes');
      const data = await res.json();
      setShowtimes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
    fetchCinemas();
    fetchMovies();
  }, []);

  const theatersOfSelectedCinema = useMemo(() => {
    const c = cinemas.find(x => x._id === formData.cinema);
    if (!c || !Array.isArray(c.theaters)) return [];
    return c.theaters;
  }, [formData.cinema, cinemas]);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(st => {
      if (filterCinema !== 'all' && st.cinema?._id !== filterCinema) return false;
      const stDate = new Date(st.startTime).toISOString().split('T')[0];
      if (selectedDate && stDate !== selectedDate) return false;
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const movieTitle = st.movie?.title?.toLowerCase() || '';
        const cinemaName = st.cinema?.name?.toLowerCase() || '';
        if (!movieTitle.includes(q) && !cinemaName.includes(q)) return false;
      }
      return true;
    });
  }, [showtimes, filterCinema, selectedDate, searchQuery]);

  const handleCinemaChange = (cinemaId) => {
    setFormData(prev => {
      const firstTheater = cinemas.find(c => c._id === cinemaId)?.theaters?.[0]?._id || '';
      return { ...prev, cinema: cinemaId, theater: firstTheater };
    });
  };

  const handleMovieChange = (movieId) => {
    setFormData(prev => {
      const next = { ...prev, movie: movieId };
      const mv = movies.find(m => m._id === movieId);
      if (mv && mv.duration) {
        const [h, mm] = prev.startTime.split(':').map(Number);
        const totalMin = h * 60 + mm + Number(mv.duration) + 20;
        const eh = Math.floor(totalMin / 60) % 24;
        const em = totalMin % 60;
        next.endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
      }
      return next;
    });
  };

  const handleStartTimeChange = (t) => {
    setFormData(prev => {
      const next = { ...prev, startTime: t };
      const mv = movies.find(m => m._id === prev.movie);
      if (mv && mv.duration) {
        const [h, mm] = t.split(':').map(Number);
        const totalMin = h * 60 + mm + Number(mv.duration) + 20;
        const eh = Math.floor(totalMin / 60) % 24;
        const em = totalMin % 60;
        next.endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { movie, cinema, theater, date, startTime, endTime, pricing } = formData;
    if (!movie || !cinema || !theater || !date || !startTime || !endTime) {
      alert('Vui lòng điền đầy đủ thông tin suất chiếu (Movie, Cinema, Theater, Date, Time)');
      return;
    }
    if (!pricing.normalPrice || !pricing.vipPrice || !pricing.couplePrice) {
      alert('Vui lòng nhập đủ giá vé 3 hạng ghế (Normal / VIP / Couple)');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        movie,
        cinema,
        theater,
        startTime: new Date(`${date}T${startTime}:00`).toISOString(),
        endTime: new Date(`${date}T${endTime}:00`).toISOString(),
        pricing: {
          normalPrice: Number(pricing.normalPrice),
          vipPrice: Number(pricing.vipPrice),
          couplePrice: Number(pricing.couplePrice)
        }
      };
      const res = await fetch('/api/showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create showtime');
      }
      setIsModalOpen(false);
      setFormData({
        movie: '',
        cinema: '',
        theater: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '19:00',
        endTime: '21:30',
        pricing: { normalPrice: 90000, vipPrice: 130000, couplePrice: 180000 }
      });
      fetchShowtimes();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi tạo suất chiếu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/showtimes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchShowtimes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Showtimes Schedule</h1>
          <p className="text-on-surface-variant mt-1">Manage movie screenings and time slots across all cinemas.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-container text-on-primary-container font-bold px-4 py-2.5 rounded-lg flex items-center shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:bg-primary-container/80 transition-all cursor-pointer"
        >
          <Plus size={20} className="mr-2" />
          Create Showtime
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-surface-container-high p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center shadow-lg">
        <div className="flex items-center bg-black/30 rounded-lg px-4 py-2 border border-white/5">
          <Calendar size={18} className="text-on-surface-variant mr-3" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-on-surface focus:ring-0 [color-scheme:dark]"
          />
        </div>

        <div className="flex items-center bg-black/30 rounded-lg px-3 py-2 border border-white/5 focus-within:border-primary-container/50 transition-colors flex-1 min-w-[200px]">
          <Search className="w-5 h-5 text-on-surface-variant mr-2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search movie or cinema..."
            className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-0"
          />
        </div>

        <select
          value={filterCinema}
          onChange={(e) => setFilterCinema(e.target.value)}
          className="bg-black/30 border border-white/5 rounded-lg px-4 py-2 text-sm text-on-surface outline-none focus:border-primary-container cursor-pointer"
        >
          <option value="all">All Cinemas</option>
          {cinemas.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Showtimes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary-container" size={40} />
          </div>
        ) : filteredShowtimes.length === 0 ? (
          <div className="text-center p-12 text-on-surface-variant bg-surface-container-high rounded-xl border border-white/5">
            {showtimes.length === 0
              ? 'No showtimes found. Click "Create Showtime" to add one.'
              : 'No showtimes match the current filters. Try adjusting date, cinema or search.'}
          </div>
        ) : (
          filteredShowtimes.map((st) => {
            const capacity = st.theater?.capacity || 100;
            const booked = st.bookedSeats?.length || 0;
            const occupancy = Math.min(100, Math.round((booked / capacity) * 100));

            const startDate = new Date(st.startTime);
            const endDate = new Date(st.endTime);
            const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const basePrice = st.pricing?.normalPrice ?? st.pricing?.basePrice ?? 0;

            return (
              <div key={st._id} className="bg-surface-container-high rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-white/5 transition-colors group">
                {/* Time */}
                <div className="flex flex-col items-center justify-center bg-black/30 p-3 rounded-lg min-w-[120px] border border-white/5">
                  <span className="text-xl font-bold text-primary-container">{timeStr}</span>
                  <span className="text-xs text-on-surface-variant flex items-center mt-1"><Clock size={12} className="mr-1" /> to {endTimeStr}</span>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-on-surface">{st.movie?.title || 'Unknown Movie'}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                    <span className="flex items-center"><MapPin size={14} className="mr-1" /> {st.cinema?.name || 'Unknown Cinema'}</span>
                    <span className="flex items-center"><Film size={14} className="mr-1" /> {st.theater?.name || 'Unknown Theater'}</span>
                  </div>
                </div>

                {/* Occupancy */}
                <div className="w-full md:w-48 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Occupancy</span>
                    <span className="font-bold text-on-surface">{occupancy}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${occupancy > 80 ? 'bg-red-500' : occupancy > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-right text-on-surface-variant">{booked} / {capacity} seats</div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end w-full md:w-auto space-x-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <span className="px-3 py-1 bg-black/30 rounded-lg text-sm font-bold text-on-surface mr-2">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(basePrice)}
                  </span>
                  <button onClick={() => handleDelete(st._id)} className="p-2 text-on-surface-variant hover:text-primary-container hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          <form onSubmit={handleSubmit} className="bg-surface-container-high border border-white/10 rounded-2xl w-full max-w-2xl relative shadow-2xl z-10 animate-scale-up overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center sticky top-0 bg-surface-container-high/95 backdrop-blur z-20">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Create New Showtime</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Select movie, cinema, theater and schedule a screening slot.</p>
              </div>
              <button type="button" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-colors cursor-pointer disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Movie & Cinema row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-on-surface-variant mb-1.5 block font-semibold">🎬 Movie</label>
                  <select
                    required
                    value={formData.movie}
                    onChange={(e) => handleMovieChange(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container cursor-pointer appearance-none"
                  >
                    <option value="">— Select a movie —</option>
                    {movies.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.duration ? `${m.duration} min` : '? min'}) — {m.status || 'Draft'}
                      </option>
                    ))}
                  </select>
                  {formData.movie && (() => {
                    const mv = movies.find(m => m._id === formData.movie);
                    return mv ? (
                      <p className="text-xs text-on-surface-variant mt-1.5 px-1">
                        Auto end time = {mv.duration ? `${mv.duration} min` : '??'} + 20 min cleanup.
                      </p>
                    ) : null;
                  })()}
                </div>

                <div>
                  <label className="text-sm text-on-surface-variant mb-1.5 block font-semibold">🏢 Cinema</label>
                  <select
                    required
                    value={formData.cinema}
                    onChange={(e) => handleCinemaChange(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container cursor-pointer appearance-none"
                  >
                    <option value="">— Select a cinema —</option>
                    {cinemas.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.theaters?.length || 0} rooms)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theater row */}
              <div>
                <label className="text-sm text-on-surface-variant mb-1.5 block font-semibold">🎞️ Theater (Room)</label>
                <select
                  required
                  value={formData.theater}
                  onChange={(e) => setFormData(prev => ({ ...prev, theater: e.target.value }))}
                  disabled={!formData.cinema || theatersOfSelectedCinema.length === 0}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary-container cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.cinema
                      ? 'Select a cinema first...'
                      : theatersOfSelectedCinema.length === 0
                      ? 'Cinema has no theaters — add one in Admin > Cinemas'
                      : '— Select a theater —'}
                  </option>
                  {theatersOfSelectedCinema.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name || 'Room'} — {t.type || 'Standard'} — capacity {t.capacity || '?'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date / Start / End row */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-on-surface-variant mb-1.5 block font-semibold">📅 Screening Date</label>
                  <div className="flex items-center bg-black/20 rounded-xl px-4 py-2.5 border border-white/10 focus-within:border-primary-container">
                    <Calendar size={18} className="text-on-surface-variant mr-3 shrink-0" />
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-transparent border-none outline-none w-full text-sm text-on-surface focus:ring-0 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1.5 block font-semibold">🕔 Start Time</label>
                  <div className="flex items-center bg-black/20 rounded-xl px-4 py-2.5 border border-white/10 focus-within:border-primary-container">
                    <Clock size={18} className="text-on-surface-variant mr-3 shrink-0" />
                    <input
                      required
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-on-surface focus:ring-0 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1.5 block font-semibold">🕖 End Time</label>
                  <div className="flex items-center bg-black/20 rounded-xl px-4 py-2.5 border border-white/10 focus-within:border-primary-container">
                    <Clock size={18} className="text-on-surface-variant mr-3 shrink-0" />
                    <input
                      required
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="bg-transparent border-none outline-none w-full text-sm text-on-surface focus:ring-0 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing row */}
              <div>
                <label className="text-sm text-on-surface-variant mb-2 block font-semibold">💵 Ticket Pricing (VND)</label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-black/20 rounded-xl border border-white/10 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Standard</span>
                      <span className="bg-gray-600/60 text-[10px] px-1.5 py-0.5 rounded text-white">Normal seat</span>
                    </div>
                    <input
                      required
                      type="number"
                      min={0}
                      step={1000}
                      value={formData.pricing.normalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, normalPrice: e.target.value } }))}
                      className="bg-black/30 rounded-lg px-3 py-2 w-full border border-white/5 text-on-surface outline-none focus:border-primary-container font-bold"
                    />
                  </div>
                  <div className="bg-black/20 rounded-xl border border-yellow-500/20 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">VIP</span>
                      <span className="bg-yellow-500/30 text-[10px] px-1.5 py-0.5 rounded text-yellow-200">VIP seat</span>
                    </div>
                    <input
                      required
                      type="number"
                      min={0}
                      step={1000}
                      value={formData.pricing.vipPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, vipPrice: e.target.value } }))}
                      className="bg-black/30 rounded-lg px-3 py-2 w-full border border-white/5 text-on-surface outline-none focus:border-primary-container font-bold"
                    />
                  </div>
                  <div className="bg-black/20 rounded-xl border border-pink-500/20 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Couple</span>
                      <span className="bg-pink-500/30 text-[10px] px-1.5 py-0.5 rounded text-pink-200">Double seat</span>
                    </div>
                    <input
                      required
                      type="number"
                      min={0}
                      step={1000}
                      value={formData.pricing.couplePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, couplePrice: e.target.value } }))}
                      className="bg-black/30 rounded-lg px-3 py-2 w-full border border-white/5 text-on-surface outline-none focus:border-primary-container font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 border-t border-white/5 bg-black/40 backdrop-blur-md flex justify-end space-x-3 z-20">
              <button type="button" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-on-surface bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-on-primary-container bg-primary-container hover:bg-primary-container/80 rounded-lg transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] cursor-pointer disabled:opacity-60 flex items-center"
              >
                {isSubmitting ? <><Loader2 size={18} className="animate-spin mr-2" /> Saving...</> : 'Save Showtime'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
