import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapUpdater({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14, { animate: true });
    }
  }, [location, map]);
  return null;
}

function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

export default function AdminCinemaForm() {
  const navigate = useNavigate();
  const { setPageHeader } = useOutletContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPageHeader({
      title: 'Add New Cinema',
      description: 'Configure details, location, and management info.',
      backLink: '/admin/cinemas'
    });
    return () => setPageHeader({ title: '', description: '', backLink: null, rightContent: null });
  }, [setPageHeader]);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [hotline, setHotline] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [staffCount, setStaffCount] = useState(0);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('23:30');
  const [location, setLocation] = useState({ lat: 10.762622, lng: 106.660172 }); // Default HCMC
  
  // New scaling fields
  const [region, setRegion] = useState('TP.HCM');
  const [status, setStatus] = useState('Active');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [facilities, setFacilities] = useState('');

  // Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=vn`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };

  const handleSelectSuggestion = (sugg) => {
    setAddress(sugg.display_name);
    setLocation({ lat: parseFloat(sugg.lat), lng: parseFloat(sugg.lon) });
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name,
      address,
      hotline,
      managerEmail,
      staffCount: Number(staffCount),
      operatingHours: { open: openTime, close: closeTime },
      location,
      region,
      status,
      description,
      images: images.split(',').map(i => i.trim()).filter(Boolean),
      facilities: facilities.split(',').map(f => f.trim()).filter(Boolean)
    };

    try {
      const res = await fetch('http://localhost:5000/api/cinemas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure we pass token if needed later
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create cinema');
      }

      // Success
      navigate('/admin/cinemas');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="bg-surface-container-high p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg">
            <h2 className="text-xl font-bold border-b border-white/10 pb-2 mb-4">General Info</h2>
            
            <div>
              <label className="text-sm text-on-surface-variant mb-1 block">Cinema Branch Name <span className="text-red-500">*</span></label>
              <input 
                value={name} onChange={e => setName(e.target.value)} required 
                placeholder="e.g. CineStream Landmark 81" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors" 
              />
            </div>
            
            <div>
              <label className="text-sm text-on-surface-variant mb-1 block">Description</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="A short description about this cinema..." 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors min-h-[80px]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-sm text-on-surface-variant mb-1 block">Region</label>
                <select 
                  value={region} onChange={e => setRegion(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP.HCM">TP.HCM</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Status</label>
                <select 
                  value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div className="relative">
              <label className="text-sm text-on-surface-variant mb-1 block">Address</label>
              <div className="relative">
                <input 
                  value={address} onChange={handleAddressChange} 
                  placeholder="e.g. 720A Dien Bien Phu, Binh Thanh, HCMC" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors" 
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-container animate-spin" size={18} />
                )}
              </div>
              
              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-[1000] mt-1 w-full bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {suggestions.map((sugg, i) => (
                    <div 
                      key={i}
                      onClick={() => handleSelectSuggestion(sugg)}
                      className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 text-sm transition-colors flex items-start gap-3"
                    >
                      <MapPin size={16} className="text-primary-container mt-0.5 shrink-0" />
                      <span className="text-on-surface line-clamp-2">{sugg.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Hotline</label>
                <input 
                  value={hotline} onChange={e => setHotline(e.target.value)} 
                  placeholder="e.g. 1900 1234" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors" 
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Manager Email</label>
                <input 
                  type="email"
                  value={managerEmail} onChange={e => setManagerEmail(e.target.value)} 
                  placeholder="manager.landmark@cinestream.vn" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors" 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Staff Count</label>
                <input 
                  type="number" min="0"
                  value={staffCount} onChange={e => setStaffCount(e.target.value)} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors" 
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Open Time</label>
                <input 
                  type="time"
                  value={openTime} onChange={e => setOpenTime(e.target.value)} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors [color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Close Time</label>
                <input 
                  type="time"
                  value={closeTime} onChange={e => setCloseTime(e.target.value)} 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors [color-scheme:dark]" 
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-on-surface-variant mb-1 block">Images (Comma separated URLs)</label>
              <input 
                value={images} onChange={e => setImages(e.target.value)} 
                placeholder="https://image1.jpg, https://image2.jpg" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors" 
              />
            </div>

            <div>
              <label className="text-sm text-on-surface-variant mb-1 block">Facilities (Comma separated)</label>
              <input 
                value={facilities} onChange={e => setFacilities(e.target.value)} 
                placeholder="Wifi, Free Parking, IMAX, Waiting Lounge" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Location Map */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-surface-container-high p-6 rounded-2xl border border-white/5 flex-1 flex flex-col shadow-lg">
            <h2 className="text-xl font-bold border-b border-white/10 pb-2 mb-4">Location Coordinates</h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Click on the map to pin the exact location of the cinema branch.
            </p>
            
            <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative min-h-[300px]">
              <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater location={location} />
                <LocationPicker location={location} setLocation={setLocation} />
              </MapContainer>
            </div>

            <div className="mt-4 flex gap-4 text-sm font-mono bg-black/40 p-3 rounded-lg border border-white/5 text-on-surface-variant">
              <div><span className="text-white/50">LAT:</span> {location.lat.toFixed(6)}</div>
              <div><span className="text-white/50">LNG:</span> {location.lng.toFixed(6)}</div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                <Save size={20} />
                Save Cinema Branch
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
