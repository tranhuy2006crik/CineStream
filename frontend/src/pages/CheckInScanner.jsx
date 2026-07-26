import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { ScanLine, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const T = {
  en: { title: 'Ticket Check-in', manual: 'Enter booking ID from QR code', placeholder: 'Booking ID...', check: 'Verify', valid: 'Valid Ticket', invalid: 'Invalid Ticket', seats: 'Seats', combos: 'Combos', movie: 'Movie', cinema: 'Cinema' },
  vi: { title: 'Quét Vé Check-in', manual: 'Nhập mã booking từ QR vé', placeholder: 'Mã booking...', check: 'Xác minh', valid: 'Vé hợp lệ', invalid: 'Vé không hợp lệ', seats: 'Ghế', combos: 'Combo', movie: 'Phim', cinema: 'Rạp' }
};

export default function CheckInScanner() {
  const { token, isAdmin } = useAuth();
  const { lang } = useLang();
  const t = T[lang];
  const [bookingId, setBookingId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyBooking = async (e) => {
    e?.preventDefault();
    if (!bookingId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId.trim()}/check-in`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, message: 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-red-400">
        Staff/Admin access required
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <div className="flex-1 max-w-[600px] w-full mx-auto px-4 py-12 pt-32">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3"><ScanLine className="text-primary-container" /> {t.title}</h1>
        <p className="text-sm text-on-surface-variant mb-4">{t.manual}</p>
        <form onSubmit={verifyBooking} className="flex gap-2 mb-6">
          <input value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder={t.placeholder}
            className="flex-1 bg-surface-container border border-white/10 rounded-lg px-4 py-3 font-mono text-sm" />
          <button type="submit" disabled={loading}
            className="bg-primary-container text-white px-6 rounded-lg font-semibold disabled:opacity-50">{t.check}</button>
        </form>

        {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-container" size={32} /></div>}

        {result && (
          <div className={`rounded-2xl p-6 border ${result.valid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.valid ? <CheckCircle className="text-green-400" size={32} /> : <XCircle className="text-red-400" size={32} />}
              <span className="text-xl font-bold">{result.valid ? t.valid : t.invalid}</span>
            </div>
            {result.valid && result.booking && (
              <div className="space-y-2 text-sm">
                <p><strong>{t.movie}:</strong> {result.booking.movie}</p>
                <p><strong>{t.cinema}:</strong> {result.booking.cinema}</p>
                <p><strong>{t.seats}:</strong> {result.booking.seats?.join(', ')}</p>
                {result.booking.combos?.length > 0 && (
                  <p><strong>{t.combos}:</strong> {result.booking.combos.map(c => `${c.name} x${c.quantity}`).join(', ')}</p>
                )}
              </div>
            )}
            {!result.valid && <p className="text-red-400">{result.message}</p>}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
