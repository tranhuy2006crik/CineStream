import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const T = {
  en: { title: 'Reset Password', password: 'New Password', confirm: 'Confirm Password', submit: 'Reset Password', success: 'Password reset! Redirecting...', mismatch: 'Passwords do not match' },
  vi: { title: 'Đặt Lại Mật Khẩu', password: 'Mật khẩu mới', confirm: 'Xác nhận mật khẩu', submit: 'Đặt lại', success: 'Đã đặt lại! Đang chuyển hướng...', mismatch: 'Mật khẩu không khớp' }
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = T[lang];
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError(t.mismatch); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setError('');
      alert(t.success);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-400">Invalid reset link. <Link to="/forgot-password" className="text-primary-container">Request new link</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 border border-white/5">
        <h1 className="text-2xl font-bold mb-6">{t.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder={t.password}
            className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-4 py-3" />
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t.confirm}
            className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-4 py-3" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary-container text-white font-bold py-3 rounded-xl disabled:opacity-50">{t.submit}</button>
        </form>
      </div>
    </div>
  );
}
