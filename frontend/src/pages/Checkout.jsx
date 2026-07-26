import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuth from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Loader2, Clock, Minus, Plus, Tag } from 'lucide-react';

const T = {
  en: {
    title: 'Checkout', combos: 'Snacks & Combos', voucher: 'Promo Code', apply: 'Apply',
    subtotal: 'Subtotal', serviceFee: 'Service Fee', comboTotal: 'Combos', discount: 'Discount',
    total: 'Total', pay: 'Pay Now', vnpay: 'VNPay', momo: 'MoMo', expired: 'Session expired',
    timeLeft: 'Time remaining', processing: 'Processing...', invalidVoucher: 'Invalid voucher'
  },
  vi: {
    title: 'Thanh Toán', combos: 'Bắp Nước & Combo', voucher: 'Mã giảm giá', apply: 'Áp dụng',
    subtotal: 'Tiền vé', serviceFee: 'Phí dịch vụ', comboTotal: 'Combo', discount: 'Giảm giá',
    total: 'Tổng cộng', pay: 'Thanh Toán', vnpay: 'VNPay', momo: 'MoMo', expired: 'Phiên hết hạn',
    timeLeft: 'Thời gian còn lại', processing: 'Đang xử lý...', invalidVoucher: 'Mã không hợp lệ'
  }
};

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { lang } = useLang();
  const t = T[lang];

  const [booking, setBooking] = useState(null);
  const [combos, setCombos] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('VNPay');
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const fmt = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    Promise.all([
      fetch(`/api/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/combos').then(r => r.json())
    ]).then(([bookingData, combosData]) => {
      if (bookingData.message && !bookingData._id) {
        setError(bookingData.message);
      } else {
        setBooking(bookingData);
        setTimeLeft(Math.max(0, new Date(bookingData.expiresAt) - Date.now()));
      }
      setCombos(Array.isArray(combosData) ? combosData : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [bookingId, token, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) { clearInterval(timer); return 0; }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  const comboTotal = combos.reduce((sum, c) => {
    const qty = selectedCombos[c._id] || 0;
    return sum + c.price * qty;
  }, 0);

  const baseTotal = (booking?.subtotal || 0) + (booking?.serviceFee || 0) + comboTotal;
  const finalTotal = Math.max(0, baseTotal - voucherDiscount);

  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    const res = await fetch('/api/vouchers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: voucherCode, orderAmount: baseTotal })
    });
    const data = await res.json();
    if (data.valid) setVoucherDiscount(data.discount);
    else { setVoucherDiscount(0); setError(data.message || t.invalidVoucher); }
  };

  const updateComboQty = (id, delta) => {
    setSelectedCombos(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) { const copy = { ...prev }; delete copy[id]; return copy; }
      return { ...prev, [id]: next };
    });
  };

  const handlePay = async () => {
    if (timeLeft <= 0) { setError(t.expired); return; }
    setProcessing(true);
    setError('');
    try {
      const comboPayload = Object.entries(selectedCombos).map(([comboId, quantity]) => ({ comboId, quantity }));
      const res = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ combos: comboPayload, voucherCode: voucherDiscount ? voucherCode : '', paymentMethod })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.paymentUrl) window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary-container" size={40} /></div>;
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><p className="text-red-400">{error || 'Booking not found'}</p></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <div className="flex-1 max-w-[800px] w-full mx-auto px-4 py-12 pt-28">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft < 60000 ? 'text-red-400' : 'text-yellow-400'}`}>
            <Clock size={20} /> {t.timeLeft}: {formatTime(timeLeft)}
          </div>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}

        <div className="bg-surface-container rounded-2xl p-6 border border-white/5 mb-6">
          <h2 className="font-bold mb-2">{booking.showtime?.movie?.title}</h2>
          <p className="text-sm text-on-surface-variant">{booking.showtime?.cinema?.name} · {booking.showtime?.theater?.name}</p>
          <p className="text-sm mt-1">Seats: <span className="text-primary-container font-semibold">{booking.seats?.join(', ')}</span></p>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-white/5 mb-6">
          <h2 className="font-bold mb-4">{t.combos}</h2>
          <div className="space-y-3">
            {combos.map(combo => (
              <div key={combo._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{combo.name}</p>
                  <p className="text-xs text-on-surface-variant">{combo.description}</p>
                  <p className="text-sm text-primary-container">{fmt(combo.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateComboQty(combo._id, -1)} className="p-1 rounded bg-white/10"><Minus size={16} /></button>
                  <span className="w-6 text-center">{selectedCombos[combo._id] || 0}</span>
                  <button onClick={() => updateComboQty(combo._id, 1)} className="p-1 rounded bg-white/10"><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-white/5 mb-6">
          <h2 className="font-bold mb-4 flex items-center gap-2"><Tag size={18} /> {t.voucher}</h2>
          <div className="flex gap-2">
            <input value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} placeholder="CINE10" className="flex-1 bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2 uppercase" />
            <button onClick={applyVoucher} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold">{t.apply}</button>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-white/5 mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span>{t.subtotal}</span><span>{fmt(booking.subtotal)}</span></div>
          <div className="flex justify-between"><span>{t.serviceFee}</span><span>{fmt(booking.serviceFee)}</span></div>
          {comboTotal > 0 && <div className="flex justify-between"><span>{t.comboTotal}</span><span>{fmt(comboTotal)}</span></div>}
          {voucherDiscount > 0 && <div className="flex justify-between text-green-400"><span>{t.discount}</span><span>-{fmt(voucherDiscount)}</span></div>}
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10"><span>{t.total}</span><span className="text-primary-container">{fmt(finalTotal)}</span></div>
        </div>

        <div className="flex gap-3 mb-4">
          {['VNPay', 'Momo'].map(method => (
            <button key={method} onClick={() => setPaymentMethod(method)}
              className={`flex-1 py-3 rounded-xl font-semibold border transition ${paymentMethod === method ? 'border-primary-container bg-primary-container/20 text-primary-container' : 'border-white/10 bg-surface-container'}`}>
              {method === 'VNPay' ? t.vnpay : t.momo}
            </button>
          ))}
        </div>

        <button onClick={handlePay} disabled={processing || timeLeft <= 0}
          className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold py-4 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2">
          {processing ? <><Loader2 className="animate-spin" size={20} /> {t.processing}</> : `${t.pay} · ${fmt(finalTotal)}`}
        </button>
      </div>
      <Footer />
    </div>
  );
}
