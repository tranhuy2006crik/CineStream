import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, MapPin, Film, Edit2, Trash2, X, Loader2 } from 'lucide-react';

export default function AdminShowtimes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showtimes, setShowtimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this showtime?')) {
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
          <input type="text" placeholder="Search movie..." className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-0" />
        </div>

        <select className="bg-black/30 border border-white/5 rounded-lg px-4 py-2 text-sm text-on-surface outline-none focus:border-primary-container cursor-pointer">
          <option value="all">All Cinemas</option>
        </select>
      </div>

      {/* Showtimes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary-container" size={40} />
          </div>
        ) : showtimes.length === 0 ? (
          <div className="text-center p-12 text-on-surface-variant bg-surface-container-high rounded-xl border border-white/5">
            No showtimes found. Click "Create Showtime" to add one.
          </div>
        ) : (
          showtimes.map((st) => {
            const capacity = st.theater?.capacity || 100;
            const booked = st.bookedSeats?.length || 0;
            const occupancy = Math.round((booked / capacity) * 100);
            
            const startDate = new Date(st.startTime);
            const endDate = new Date(st.endTime);
            const timeStr = startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const endTimeStr = endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            return (
              <div key={st._id} className="bg-surface-container-high rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-white/5 transition-colors group">
                {/* Time */}
                <div className="flex flex-col items-center justify-center bg-black/30 p-3 rounded-lg min-w-[120px] border border-white/5">
                  <span className="text-xl font-bold text-primary-container">{timeStr}</span>
                  <span className="text-xs text-on-surface-variant flex items-center mt-1"><Clock size={12} className="mr-1"/> to {endTimeStr}</span>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-on-surface">{st.movie?.title || 'Unknown Movie'}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                    <span className="flex items-center"><MapPin size={14} className="mr-1"/> {st.cinema?.name || 'Unknown Cinema'}</span>
                    <span className="flex items-center"><Film size={14} className="mr-1"/> {st.theater?.name || 'Unknown Theater'}</span>
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
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(st.pricing?.basePrice || 0)}
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-surface-container-high border border-white/10 rounded-2xl w-full max-w-xl relative shadow-2xl z-10 animate-scale-up">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-on-surface">Create New Showtime</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4">
              <p className="text-on-surface-variant text-sm">Form logic will be wired to backend in future updates. Please use Postman or seed script to create showtimes for now.</p>
              <div className="pt-4 border-t border-white/5 flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-on-surface bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
