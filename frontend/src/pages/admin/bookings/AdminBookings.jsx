import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLang } from '../../../context/LanguageContext';
import { adminTranslations } from '../../../utils/adminTranslations';
import { Loader2, Ticket, Search } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { setPageHeader } = useOutletContext();
  const { lang } = useLang();
  const t = adminTranslations[lang] || adminTranslations.en;

  useEffect(() => {
    setPageHeader({ title: t.bookingsTitle || 'Bookings', description: t.bookingsDesc || 'Manage all ticket orders' });
    return () => setPageHeader({ title: '', description: '', backLink: null, rightContent: null });
  }, [setPageHeader, t]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/bookings/admin/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b =>
    b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    b.showtime?.movie?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b._id?.includes(search)
  );

  const statusColor = (s) => {
    if (s === 'paid') return 'text-green-400 bg-green-400/10';
    if (s === 'pending') return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email, movie, ID..."
          className="w-full bg-surface-container border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-container" size={32} /></div>
      ) : (
        <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-on-surface-variant uppercase text-xs">
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Movie</th>
                <th className="text-left p-4">Seats</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4 font-mono text-xs">{String(b._id).slice(-8)}</td>
                  <td className="p-4">{b.user?.email}</td>
                  <td className="p-4">{b.showtime?.movie?.title || '—'}</td>
                  <td className="p-4">{b.seats?.join(', ')}</td>
                  <td className="p-4">{new Intl.NumberFormat('vi-VN').format(b.totalAmount)}đ</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(b.status)}`}>{b.status}</span></td>
                  <td className="p-4">{b.checkedIn ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-on-surface-variant"><Ticket className="mx-auto mb-2 opacity-50" size={40} />No bookings found</div>
          )}
        </div>
      )}
    </div>
  );
}
