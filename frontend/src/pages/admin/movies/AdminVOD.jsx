import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLang } from '../../../context/LanguageContext';
import { adminTranslations } from '../../../utils/adminTranslations';
import { Plus, Search, Edit2, Trash2, X, UploadCloud, Film, Loader2 } from 'lucide-react';

export default function AdminVOD() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setPageHeader } = useOutletContext();
  const { lang } = useLang();
  const t = adminTranslations[lang] || adminTranslations.en;

  useEffect(() => {
    setPageHeader({
      title: t.vodTitle,
      description: t.vodDesc,
      rightContent: (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-container text-on-primary-container font-bold px-4 py-2 rounded-xl flex items-center shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:bg-primary-container/80 transition-all cursor-pointer text-sm"
        >
          <Plus size={16} className="mr-2" />
          {t.addVodBtn}
        </button>
      )
    });
    return () => setPageHeader({ title: '', description: '', backLink: null, rightContent: null });
  }, [setPageHeader, setIsModalOpen, t]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    duration: '',
    releaseDate: '',
    description: '',
    status: 'VOD',
    trailerUrl: '',
    isVOD: true,
    vodTier: 'standard',
    rentalPrice: '',
    vodVideoUrl: ''
  });
  
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:5000/api/movies';
      const params = [];
      
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      params.push('isVOD=true');
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.movies || data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'poster') setPosterFile(file);
    if (type === 'banner') setBannerFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (posterFile) data.append('poster', posterFile);
      if (bannerFile) data.append('banner', bannerFile);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data // FormData does not need Content-Type header
      });

      if (!res.ok) {
        throw new Error('Failed to save movie');
      }

      // Reset & Close
      setIsModalOpen(false);
      setFormData({
        title: '', director: '', duration: '', releaseDate: '', description: '',
        status: 'VOD', trailerUrl: '', isVOD: true, vodTier: 'standard',
        rentalPrice: '', vodVideoUrl: ''
      });
      setPosterFile(null);
      setBannerFile(null);
      fetchMovies();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/movies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMovies();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toolbar */}
      <div className="bg-surface-container-high p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="flex items-center bg-black/20 rounded-lg px-3 py-2 border border-white/5 w-full md:w-96 focus-within:border-primary-container/50 transition-colors">
          <Search className="w-5 h-5 text-on-surface-variant mr-2" />
          <input 
            type="text" 
            placeholder={t.searchMovie} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-0" 
          />
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/30 border border-white/5 rounded-lg px-4 py-2 text-sm text-on-surface outline-none focus:border-primary-container cursor-pointer w-full md:w-auto"
          >
            <option value="all">{t.allStatus}</option>
            <option value="Showing">{t.showing}</option>
            <option value="Upcoming">{t.upcoming}</option>
            <option value="Ended">{t.ended}</option>
            <option value="VOD">{t.vodOnly}</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-high rounded-xl border border-white/5 shadow-lg overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="animate-spin text-primary-container" size={40} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-on-surface-variant text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">{t.colMovie}</th>
                    <th className="px-6 py-4 font-medium">{t.colDirector}</th>
                    <th className="px-6 py-4 font-medium">{t.colReleaseDate}</th>
                    <th className="px-6 py-4 font-medium">{t.colStatus}</th>
                    <th className="px-6 py-4 font-medium">{t.colVodStatus}</th>
                    <th className="px-6 py-4 font-medium text-right">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredMovies.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">
                        {t.noMoviesFound}
                      </td>
                    </tr>
                  ) : (
                    filteredMovies.map((movie) => (
                      <tr key={movie._id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {movie.poster ? (
                              <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-md border border-white/10" />
                            ) : (
                              <div className="w-12 h-16 bg-black/40 rounded-md border border-white/10 flex items-center justify-center">
                                <Film className="text-white/20" size={20} />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-on-surface text-base">{movie.title}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5">{movie.duration} mins</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{movie.director || 'N/A'}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{new Date(movie.releaseDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            movie.status === 'Showing' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                            movie.status === 'VOD' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                            movie.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {movie.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="flex items-center text-primary-container text-xs font-bold mb-1"><Film size={14} className="mr-1"/> {t.enabled}</span>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded capitalize">{movie.vodTier}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-black/30 hover:bg-white/10 rounded-lg text-blue-400 transition-colors cursor-pointer" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(movie._id)}
                              className="p-2 bg-black/30 hover:bg-red-500/20 rounded-lg text-primary-container transition-colors cursor-pointer" 
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 text-center text-sm text-on-surface-variant">
              {t.showingMoviesCount.replace('{count}', filteredMovies.length)}
            </div>
          </>
        )}
      </div>

      {/* Add Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-surface-container-high border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl z-10 animate-scale-up">
            <div className="sticky top-0 bg-surface-container-high/95 backdrop-blur-md px-6 py-4 border-b border-white/5 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold text-on-surface">{t.addNewMovie}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.movieTitle} <span className="text-red-500">*</span></label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="e.g. Dune: Part Two" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.colDirector}</label>
                  <input name="director" value={formData.director} onChange={handleInputChange} type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="e.g. Denis Villeneuve" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.duration} <span className="text-red-500">*</span></label>
                  <input required name="duration" value={formData.duration} onChange={handleInputChange} type="number" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="e.g. 166" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.colReleaseDate} <span className="text-red-500">*</span></label>
                  <input required name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} type="date" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors [color-scheme:dark]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant">{t.description}</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="Movie synopsis..."></textarea>
              </div>

              {/* Media Uploads */}
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-3 border-b border-white/5 pb-2">{t.mediaAssets}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Poster Upload */}
                  <label className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary-container/50 hover:bg-primary-container/5 transition-all cursor-pointer relative overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'poster')} />
                    {posterFile ? (
                      <div className="text-primary-container font-bold flex items-center"><Film className="mr-2"/> Selected</div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                          <UploadCloud className="text-on-surface-variant" size={24} />
                        </div>
                        <p className="text-sm font-medium text-on-surface">{t.uploadPoster}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{t.posterHint}</p>
                      </>
                    )}
                  </label>

                  {/* Banner Upload */}
                  <label className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary-container/50 hover:bg-primary-container/5 transition-all cursor-pointer relative overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'banner')} />
                    {bannerFile ? (
                      <div className="text-primary-container font-bold flex items-center"><Film className="mr-2"/> Selected</div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                          <UploadCloud className="text-on-surface-variant" size={24} />
                        </div>
                        <p className="text-sm font-medium text-on-surface">{t.uploadBanner}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{t.bannerHint}</p>
                      </>
                    )}
                  </label>

                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.trailerUrl}</label>
                  <input name="trailerUrl" value={formData.trailerUrl} onChange={handleInputChange} type="url" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>

              {/* VOD Settings */}
              <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-on-surface flex items-center"><Film size={18} className="mr-2 text-primary-container"/> {t.vodConfig}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{t.vodConfigDesc}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">{t.vodTier}</label>
                    <select name="vodTier" value={formData.vodTier} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors">
                      <option value="none">{t.none}</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">{t.rentalPrice}</label>
                    <input name="rentalPrice" value={formData.rentalPrice} onChange={handleInputChange} type="number" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="e.g. 50000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">{t.fullVideoUrl}</label>
                    <input name="vodVideoUrl" value={formData.vodVideoUrl} onChange={handleInputChange} type="url" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="Stream URL" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-on-surface bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">{t.cancel}</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-on-primary-container bg-primary-container hover:bg-primary-container/80 rounded-lg transition-colors shadow-[0_0_10px_rgba(229,9,20,0.3)] cursor-pointer disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin mr-2" /> {t.saving}</> : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
