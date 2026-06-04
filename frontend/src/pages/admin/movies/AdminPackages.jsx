import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLang } from '../../../context/LanguageContext';
import { adminTranslations } from '../../../utils/adminTranslations';
import { Plus, Edit2, Trash2, X, Package as PackageIcon, Check, Loader2 } from 'lucide-react';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    maxResolution: '1080p',
    allowedTiers: [],
    features: '',
    isPopular: false,
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const { setPageHeader } = useOutletContext();
  const { lang } = useLang();
  const t = adminTranslations[lang] || adminTranslations.en;

  useEffect(() => {
    setPageHeader({
      title: t.pkgTitle,
      description: t.pkgDesc,
      rightContent: (
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '', description: '', price: '', durationDays: '', maxResolution: '1080p', allowedTiers: [], features: '', isPopular: false, isActive: true
            });
            setIsModalOpen(true);
          }}
          className="bg-primary-container text-on-primary-container font-bold px-4 py-2 rounded-xl flex items-center shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:bg-primary-container/80 transition-all cursor-pointer text-sm"
        >
          <Plus size={16} className="mr-2" />
          {t.addPkgBtn}
        </button>
      )
    });
    return () => setPageHeader({ title: '', description: '', backLink: null, rightContent: null });
  }, [setPageHeader, setIsModalOpen, t]);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách gói cước:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTierToggle = (tier) => {
    setFormData(prev => {
      const isSelected = prev.allowedTiers.includes(tier);
      if (isSelected) {
        return { ...prev, allowedTiers: prev.allowedTiers.filter(t => t !== tier) };
      } else {
        return { ...prev, allowedTiers: [...prev.allowedTiers, tier] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/packages/${editingId}` : '/api/packages';
      const method = editingId ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim() !== '') : []
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
          name: '', description: '', price: '', durationDays: '', maxResolution: '1080p', allowedTiers: [], features: '', isPopular: false, isActive: true
        });
        fetchPackages();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(error);
      alert('Không thể kết nối đến server');
    }
    setIsSubmitting(false);
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg._id);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      durationDays: pkg.durationDays,
      maxResolution: pkg.maxResolution || '1080p',
      allowedTiers: pkg.allowedTiers || [],
      features: pkg.features ? pkg.features.join('\n') : '',
      isPopular: pkg.isPopular || false,
      isActive: pkg.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gói cước này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) fetchPackages();
    } catch (error) {
      console.error(error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="bg-surface-container-high rounded-xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
            <Loader2 className="animate-spin mb-2" size={32} />
            {t.loadingPackages}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-on-surface-variant text-sm border-b border-white/5">
                  <th className="px-6 py-4 font-semibold">{t.colPkgDetails}</th>
                  <th className="px-6 py-4 font-semibold">{t.colPriceDuration}</th>
                  <th className="px-6 py-4 font-semibold">{t.colAllowedTiers}</th>
                  <th className="px-6 py-4 font-semibold">{t.status}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                      <PackageIcon size={48} className="mx-auto mb-3 opacity-20" />
                      <p>{t.noPackagesFound}</p>
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center mr-4">
                            <PackageIcon size={20} className="text-primary-container" />
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-base flex items-center gap-2">
                                {pkg.name}
                                {pkg.isPopular && <span className="text-[10px] bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded-full uppercase tracking-wider font-black">Popular</span>}
                            </div>
                            <div className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{pkg.description || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface">{formatPrice(pkg.price)}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{pkg.durationDays} days / {pkg.maxResolution}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.allowedTiers && pkg.allowedTiers.length > 0 ? (
                            pkg.allowedTiers.map(tier => (
                              <span key={tier} className="text-[10px] bg-white/10 px-2 py-0.5 rounded capitalize font-medium text-on-surface-variant">
                                {tier}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-on-surface-variant">{t.none}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {pkg.isActive ? (
                          <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded">{t.active}</span>
                        ) : (
                          <span className="text-xs font-bold bg-white/10 text-on-surface-variant px-2 py-1 rounded">{t.inactive}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(pkg)} className="p-2 text-on-surface-variant hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(pkg._id)} className="p-2 text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer" title="Delete">
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
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-surface-container-high border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl z-10 animate-scale-up">
            <div className="sticky top-0 bg-surface-container-high/95 backdrop-blur-md px-6 py-4 border-b border-white/5 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold text-on-surface">{editingId ? t.editPackage : t.addNewPackageModal}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.pkgName}</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.price}</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.durationDays}</label>
                  <input required type="number" name="durationDays" value={formData.durationDays} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.description}</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.maxResolution}</label>
                  <select name="maxResolution" value={formData.maxResolution} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors">
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-on-surface-variant">Tính năng / Features (Mỗi dòng một tính năng)</label>
                  <textarea name="features" value={formData.features} onChange={handleInputChange} rows="4" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-on-surface focus:border-primary-container outline-none transition-colors" placeholder="1 Screen access&#10;Full HD Quality" />
                </div>
                
                <div className="space-y-2 flex flex-col justify-center mt-6">
                  <label className="relative inline-flex items-center cursor-pointer mb-4">
                    <input name="isPopular" checked={formData.isPopular} onChange={handleInputChange} type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    <span className="ml-3 text-sm font-medium text-on-surface">Most Popular</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input name="isActive" checked={formData.isActive} onChange={handleInputChange} type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    <span className="ml-3 text-sm font-medium text-on-surface">{t.active}</span>
                  </label>
                </div>

                <div className="space-y-3 md:col-span-2 mt-2">
                  <label className="text-sm font-medium text-on-surface-variant">{t.colAllowedTiers}</label>
                  <div className="flex gap-3">
                    {['standard', 'premium', 'exclusive'].map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleTierToggle(tier)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center transition-all cursor-pointer ${
                          formData.allowedTiers.includes(tier) 
                            ? 'bg-primary-container/20 border-primary-container text-primary-container'
                            : 'bg-black/20 border-white/10 text-on-surface-variant hover:border-white/30'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${formData.allowedTiers.includes(tier) ? 'bg-primary-container border-primary-container' : 'border-white/30'}`}>
                          {formData.allowedTiers.includes(tier) && <Check size={12} className="text-white" />}
                        </div>
                        <span className="capitalize">{tier}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant">{t.allowedTiersDesc}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-on-surface bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">{t.cancel}</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-on-primary-container bg-primary-container hover:bg-primary-container/80 rounded-lg transition-colors shadow-[0_0_10px_rgba(229,9,20,0.3)] cursor-pointer disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin mr-2" /> {t.saving}...</> : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
