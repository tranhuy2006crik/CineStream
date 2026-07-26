import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLang } from '../../../context/LanguageContext';
import { adminTranslations } from '../../../utils/adminTranslations';
import { Loader2, Tag, Plus, Trash2 } from 'lucide-react';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discountType: 'percent', discountValue: 10, minOrderAmount: 100000, maxUses: 100, expiresAt: '' });
  const { setPageHeader } = useOutletContext();
  const { lang } = useLang();
  const t = adminTranslations[lang] || adminTranslations.en;

  useEffect(() => {
    setPageHeader({ title: t.vouchersTitle || 'Vouchers', description: t.vouchersDesc || 'Manage promo codes' });
    return () => setPageHeader({ title: '', description: '', backLink: null, rightContent: null });
  }, [setPageHeader, t]);

  const fetchVouchers = () => {
    const token = localStorage.getItem('token');
    fetch('/api/vouchers', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setVouchers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) { setShowForm(false); fetchVouchers(); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this voucher?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/vouchers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchVouchers();
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} className="mb-6 flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-xl font-semibold">
        <Plus size={18} /> Add Voucher
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface-container rounded-2xl p-6 border border-white/5 mb-6 grid md:grid-cols-2 gap-4">
          <input required placeholder="Code (e.g. CINE20)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}
            className="bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2">
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed (VND)</option>
          </select>
          <input type="number" placeholder="Discount value" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
            className="bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          <input type="number" placeholder="Min order amount" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
            className="bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          <input type="date" required value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
            className="bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          <button type="submit" className="md:col-span-2 bg-primary-container text-white py-2 rounded-xl font-bold">Create</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-container" size={32} /></div>
      ) : (
        <div className="grid gap-4">
          {vouchers.map(v => (
            <div key={v._id} className="bg-surface-container rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Tag className="text-primary-container" size={24} />
                <div>
                  <p className="font-bold font-mono">{v.code}</p>
                  <p className="text-sm text-on-surface-variant">{v.description}</p>
                  <p className="text-xs text-on-surface-variant">
                    {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`} off · Used {v.usedCount}/{v.maxUses}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(v._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
