import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LanguageContext';
import useAuth from '../context/AuthContext';
import { Loader2, User, Lock, CreditCard, Ticket } from 'lucide-react';

const T = {
  en: {
    title: 'My Profile', save: 'Save Changes', saving: 'Saving...',
    name: 'Display Name', avatar: 'Avatar URL', changePassword: 'Change Password',
    currentPassword: 'Current Password', newPassword: 'New Password',
    subscription: 'Subscription', tickets: 'My Tickets', favorites: 'Favorites',
    saved: 'Profile updated!', passwordChanged: 'Password changed!',
    history: 'Transaction History', noHistory: 'No transactions yet'
  },
  vi: {
    title: 'Hồ Sơ Của Tôi', save: 'Lưu thay đổi', saving: 'Đang lưu...',
    name: 'Tên hiển thị', avatar: 'URL Avatar', changePassword: 'Đổi mật khẩu',
    currentPassword: 'Mật khẩu hiện tại', newPassword: 'Mật khẩu mới',
    subscription: 'Gói đăng ký', tickets: 'Vé của tôi', favorites: 'Yêu thích',
    saved: 'Đã cập nhật hồ sơ!', passwordChanged: 'Đã đổi mật khẩu!',
    history: 'Lịch sử giao dịch', noHistory: 'Chưa có giao dịch'
  }
};

export default function Profile() {
  const { lang } = useLang();
  const { token, user, activeProfile, updateUser } = useAuth();
  const t = T[lang];
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeProfile) {
      setName(activeProfile.name || '');
      setAvatar(activeProfile.avatar || '');
    }
    if (token) {
      fetch('/api/bookings/my-subscription', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(setSubscription)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, activeProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileId: activeProfile?._id, name, avatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUser({ ...user, profiles: data.profiles });
      localStorage.setItem('activeProfile', JSON.stringify(data.profiles.find(p => p._id === activeProfile?._id) || data.profiles[0]));
      setMessage(t.saved);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setMessage(t.passwordChanged);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary-container" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <div className="flex-1 max-w-[900px] w-full mx-auto px-4 py-12 pt-32">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <User className="text-primary-container" size={32} /> {t.title}
        </h1>

        {message && <div className="mb-4 p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">{message}</div>}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to="/my-tickets" className="bg-surface-container p-6 rounded-2xl border border-white/5 hover:border-primary-container/50 transition flex items-center gap-4">
            <Ticket className="text-primary-container" size={28} />
            <span className="font-semibold">{t.tickets}</span>
          </Link>
          <Link to="/favorites" className="bg-surface-container p-6 rounded-2xl border border-white/5 hover:border-primary-container/50 transition flex items-center gap-4">
            <CreditCard className="text-primary-container" size={28} />
            <span className="font-semibold">{t.favorites}</span>
          </Link>
        </div>

        <form onSubmit={handleSaveProfile} className="bg-surface-container rounded-2xl p-6 border border-white/5 mb-6 space-y-4">
          <div>
            <label className="text-sm text-on-surface-variant">{t.name}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="text-sm text-on-surface-variant">{t.avatar}</label>
            <input value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full mt-1 bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          </div>
          {avatar && <img src={avatar} alt="" className="w-16 h-16 rounded-full object-cover" />}
          <button type="submit" disabled={saving} className="bg-primary-container hover:bg-primary-container/80 text-white font-bold py-2 px-6 rounded-xl disabled:opacity-50">
            {saving ? t.saving : t.save}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="bg-surface-container rounded-2xl p-6 border border-white/5 mb-6 space-y-4">
          <h2 className="font-bold flex items-center gap-2"><Lock size={18} /> {t.changePassword}</h2>
          <input type="password" placeholder={t.currentPassword} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          <input type="password" placeholder={t.newPassword} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-4 py-2" />
          <button type="submit" disabled={saving} className="bg-white/10 hover:bg-white/20 font-bold py-2 px-6 rounded-xl disabled:opacity-50">{t.changePassword}</button>
        </form>

        <div className="bg-surface-container rounded-2xl p-6 border border-white/5">
          <h2 className="font-bold mb-4">{t.subscription}</h2>
          {subscription?.activePackage ? (
            <div>
              <p className="text-primary-container font-semibold">{subscription.activePackage.name}</p>
              <p className="text-sm text-on-surface-variant">Tier: {subscription.vodTier} · Expires: {subscription.packageExpiresAt ? new Date(subscription.packageExpiresAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          ) : (
            <p className="text-on-surface-variant">{lang === 'vi' ? 'Chưa có gói đăng ký' : 'No active subscription'} · <Link to="/pricing" className="text-primary-container">View plans</Link></p>
          )}

          <h3 className="font-bold mt-6 mb-2">{t.history}</h3>
          {(subscription?.subscriptions?.length || subscription?.vodRentals?.length) ? (
            <ul className="space-y-2 text-sm">
              {subscription?.subscriptions?.filter(s => s.status === 'active' || s.status === 'expired').slice(0, 5).map(s => (
                <li key={s._id} className="flex justify-between border-b border-white/5 pb-2">
                  <span>{s.packageSnapshot?.name || 'Package'}</span>
                  <span className="text-on-surface-variant">{s.status} · {new Intl.NumberFormat('vi-VN').format(s.amount)}đ</span>
                </li>
              ))}
              {subscription?.vodRentals?.filter(r => r.status === 'active' || r.status === 'expired').slice(0, 5).map(r => (
                <li key={r._id} className="flex justify-between border-b border-white/5 pb-2">
                  <span>{r.movieSnapshot?.title || 'VOD Rental'}</span>
                  <span className="text-on-surface-variant">{r.status} · {new Intl.NumberFormat('vi-VN').format(r.amount)}đ</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-surface-variant text-sm">{t.noHistory}</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
