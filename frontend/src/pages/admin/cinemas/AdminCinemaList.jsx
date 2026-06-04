import { useState, useEffect } from 'react';
import { Plus, MapPin as MapPinIcon, Building2, Trash2, Edit3, Grid3X3, Users } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AdminCinemaList() {
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setPageHeader } = useOutletContext();

  useEffect(() => {
    setPageHeader({
      title: 'Cinema Dashboard',
      description: 'Overview of your branches, locations, and facilities.',
      rightContent: (
        <Link 
          to="/admin/cinemas/add"
          className="flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-container/80 transition-all shadow-lg text-sm"
        >
          <Plus size={16} /> Add New Cinema
        </Link>
      )
    });
    return () => setPageHeader({ title: '', description: '', backLink: null, rightContent: null });
  }, [setPageHeader]);

  // Filters
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('theaters');
  
  // Staff State
  const [cinemaStaff, setCinemaStaff] = useState([]);
  const [unassignedStaff, setUnassignedStaff] = useState([]);
  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState('');

  // Stats
  const totalTheaters = cinemas.reduce((acc, curr) => acc + (curr.theaters ? curr.theaters.length : 0), 0);
  const totalStaff = cinemas.reduce((acc, curr) => acc + (curr.staffCount || 0), 0);

  const [showAddTheater, setShowAddTheater] = useState(false);
  const [isSubmittingTheater, setIsSubmittingTheater] = useState(false);



  const fetchCinemas = async () => {
    try {
      let url = 'http://localhost:5000/api/cinemas?';
      if (regionFilter) url += `region=${encodeURIComponent(regionFilter)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCinemas(data);
      } else if (data.cinemas) {
        setCinemas(data.cinemas);
      } else {
        setCinemas([]);
      }
    } catch (err) {
      console.error('Failed to fetch cinemas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, [regionFilter, statusFilter]);

  const handleSelectCinema = (cinema) => {
    setSelectedCinema(cinema);
    setActiveTab('theaters');
    fetchTheaters(cinema._id);
    fetchStaff(cinema._id);
  };

  const fetchStaff = async (cinemaId) => {
    try {
      // Get staff assigned to this cinema
      const res = await fetch(`http://localhost:5000/api/users/staff/cinema/${cinemaId}`);
      if (res.ok) setCinemaStaff(await res.json());

      // Get all staff to filter unassigned ones
      const resAll = await fetch(`http://localhost:5000/api/users?role=staff`);
      if (resAll.ok) {
        const allStaff = await resAll.json();
        setUnassignedStaff(allStaff.filter(s => !s.cinemaId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffToAssign) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${selectedStaffToAssign}/assign-cinema`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cinemaId: selectedCinema._id })
      });
      if (res.ok) {
        fetchStaff(selectedCinema._id);
        setSelectedStaffToAssign('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassignStaff = async (userId) => {
    if (!window.confirm('Remove this staff from the cinema?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/unassign-cinema`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchStaff(selectedCinema._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTheaters = async (cinemaId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/theaters/cinema/${cinemaId}`);
      if (res.ok) {
        const data = await res.json();
        setTheaters(Array.isArray(data) ? data : []);
      } else {
        setTheaters([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTheater = async (e) => {
    e.preventDefault();
    if (!selectedCinema) return;
    
    setIsSubmittingTheater(true);
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const theaterType = formData.get('theaterType');

    try {
      const res = await fetch('http://localhost:5000/api/theaters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cinemaId: selectedCinema._id, name, theaterType })
      });

      if (res.ok) {
        setShowAddTheater(false);
        fetchTheaters(selectedCinema._id);
      }
    } catch (err) {
      console.error('Error adding theater:', err);
    } finally {
      setIsSubmittingTheater(false);
    }
  };

  if (isLoading) {
    return <div className="text-on-surface-variant p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-high p-6 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-container/20 text-primary-container rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Total Branches</p>
              <h2 className="text-3xl font-black text-on-surface">{cinemas.length}</h2>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high p-6 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Grid3X3 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Total Theaters</p>
              <h2 className="text-3xl font-black text-on-surface">{totalTheaters}</h2>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high p-6 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Total Staff</p>
              <h2 className="text-3xl font-black text-on-surface">{totalStaff}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cinemas List */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Branches List</h2>
            <div className="flex gap-2">
              <select 
                value={regionFilter} 
                onChange={e => setRegionFilter(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-on-surface outline-none focus:border-primary-container"
              >
                <option value="">All Regions</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP.HCM">TP.HCM</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-on-surface outline-none focus:border-primary-container"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="bg-surface-container p-2 rounded-2xl border border-white/5 space-y-2 h-[600px] overflow-y-auto custom-scrollbar">
            {cinemas.map(cinema => (
              <div 
                key={cinema._id}
                onClick={() => handleSelectCinema(cinema)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  selectedCinema?._id === cinema._id 
                    ? 'bg-primary-container/10 border-primary-container/50' 
                    : 'bg-surface-container-high border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-on-surface text-lg leading-tight flex items-center gap-2">
                      {cinema.name}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        cinema.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        cinema.status === 'Maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {cinema.status || 'Active'}
                      </span>
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-on-surface-variant hover:text-blue-400"><Edit3 size={16} /></button>
                    <button className="text-on-surface-variant hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mb-1">
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{cinema.region || 'TP.HCM'}</span>
                  <MapPinIcon size={14} />
                  <span className="truncate">{cinema.address || 'No address provided'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mb-3">
                  <Users size={14} />
                  <span>{cinema.staffCount || 0} Staff</span>
                  <span className="mx-2 text-white/20">|</span>
                  <span>{cinema.operatingHours?.open || '08:00'} - {cinema.operatingHours?.close || '23:30'}</span>
                </div>
              </div>
            ))}
            
            {cinemas.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                <Building2 size={48} className="mb-4 opacity-20" />
                <p>No cinemas found.</p>
                <Link to="/admin/cinemas/add" className="text-primary-container mt-2 hover:underline">Add your first cinema</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map & Theaters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Map View */}
          <div className="bg-surface-container-high rounded-2xl border border-white/5 overflow-hidden h-[350px] relative z-0">
            <MapContainer 
              center={[10.762622, 106.660172]} // Default center HCMC
              zoom={12} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {cinemas.map(c => c.location && c.location.lat && c.location.lng && (
                <Marker key={c._id} position={[c.location.lat, c.location.lng]}>
                  <Popup>
                    <div className="text-black font-sans">
                      <strong>{c.name}</strong><br/>
                      {c.address}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Theaters List for Selected Cinema */}
          {!selectedCinema ? (
            <div className="flex-1 min-h-[200px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-on-surface-variant">
              <p>Select a cinema branch from the list to manage its theaters.</p>
            </div>
          ) : (
            <div className="bg-surface-container p-6 rounded-2xl border border-white/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedCinema.name}</h2>
                  <p className="text-sm text-on-surface-variant">Manage theaters and staff allocation.</p>
                </div>
                
                {/* Tabs */}
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setActiveTab('theaters')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'theaters' ? 'bg-surface-container-highest text-white shadow-sm' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
                  >
                    Theaters
                  </button>
                  <button 
                    onClick={() => setActiveTab('staff')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'staff' ? 'bg-surface-container-highest text-white shadow-sm' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
                  >
                    Staff Allocation
                  </button>
                </div>
              </div>

              {activeTab === 'theaters' && (
                <>
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={() => setShowAddTheater(true)}
                      className="flex items-center gap-1 text-sm bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Plus size={16} /> Add Theater
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {theaters.map(theater => (
                  <div key={theater._id} className="bg-surface-container-high p-5 rounded-2xl border border-white/5 flex flex-col relative overflow-hidden group hover:border-primary-container/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-white group-hover:text-primary-container group-hover:opacity-20 transition-all">
                      <Grid3X3 size={64} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1 z-10 flex items-center gap-2">
                      {theater.name}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        theater.theaterType === 'IMAX' ? 'bg-blue-900/40 text-blue-300 border-blue-500/30' :
                        theater.theaterType === '4DX' ? 'bg-red-900/40 text-red-300 border-red-500/30' :
                        theater.theaterType === 'Sweetbox' ? 'bg-pink-900/40 text-pink-300 border-pink-500/30' :
                        'bg-white/5 text-on-surface-variant border-white/10'
                      }`}>
                        {theater.theaterType || 'Standard'}
                      </span>
                    </h3>
                    <p className="text-sm text-on-surface-variant mb-6 z-10">
                      Layout: {theater.layout?.rows || 10} rows × {theater.layout?.columns || 14} cols
                    </p>
                    
                    <div className="mt-auto z-10">
                      <Link 
                        to={`/admin/cinemas/${selectedCinema._id}/theater/${theater._id}/builder`}
                        className="inline-flex items-center justify-center w-full bg-primary-container hover:bg-primary-container/80 text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        Open Seat Builder
                      </Link>
                    </div>
                  </div>
                ))}

                {theaters.length === 0 && (
                  <div className="col-span-full p-10 border border-dashed border-white/10 rounded-2xl text-center text-on-surface-variant">
                    No theaters configured yet.
                  </div>
                )}
                </div>
              </>
              )}

              {activeTab === 'staff' && (
                <div className="space-y-6">
                  {/* Assign Staff Row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                      value={selectedStaffToAssign}
                      onChange={(e) => setSelectedStaffToAssign(e.target.value)}
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-on-surface outline-none focus:border-primary-container"
                    >
                      <option value="">-- Select Unassigned Staff --</option>
                      {unassignedStaff.map(staff => (
                        <option key={staff._id} value={staff._id}>
                          {staff.profiles[0]?.name} ({staff.email})
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAssignStaff}
                      disabled={!selectedStaffToAssign}
                      className="bg-primary-container text-white px-4 py-2 rounded-xl font-bold disabled:opacity-50 hover:bg-primary-container/80 transition-all"
                    >
                      Assign Staff
                    </button>
                  </div>

                  {/* Staff List */}
                  <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 border-b border-white/5 text-on-surface-variant">
                        <tr>
                          <th className="p-4 font-semibold">Staff Name</th>
                          <th className="p-4 font-semibold">Email</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cinemaStaff.map(staff => (
                          <tr key={staff._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                            <td className="p-4 font-medium flex items-center gap-3">
                              <img src={staff.profiles[0]?.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                              {staff.profiles[0]?.name}
                            </td>
                            <td className="p-4 text-on-surface-variant">{staff.email}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleUnassignStaff(staff._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                        {cinemaStaff.length === 0 && (
                          <tr>
                            <td colSpan="3" className="p-8 text-center text-on-surface-variant">
                              No staff assigned to this cinema yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Theater Modal */}
      {showAddTheater && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleAddTheater} className="bg-surface-container-high p-6 rounded-2xl border border-white/10 w-[400px] shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-on-surface">Add New Theater (Room)</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Theater Name</label>
                <input name="name" required placeholder="e.g. IMAX 1 or Premium Room 2" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-on-surface outline-none focus:border-primary-container" />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant mb-1 block">Theater Type</label>
                <select name="theaterType" required className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-on-surface outline-none focus:border-primary-container">
                  <option value="Standard">Standard</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                  <option value="Premium">Premium</option>
                  <option value="Sweetbox">Sweetbox</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddTheater(false)} className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-white/5">Cancel</button>
              <button type="submit" disabled={isSubmittingTheater} className="px-4 py-2 rounded-lg bg-primary-container text-white font-bold disabled:opacity-50">
                {isSubmittingTheater ? 'Adding...' : 'Add Theater'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
