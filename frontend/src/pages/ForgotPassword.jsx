import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const T = {
  en: { title: 'Forgot Password', desc: 'Enter your email to receive a reset link.', email: 'Email', submit: 'Send Reset Link', sending: 'Sending...', back: 'Back to Login', success: 'Check your email for reset instructions.' },
  vi: { title: 'Quên Mật Khẩu', desc: 'Nhập email để nhận liên kết đặt lại mật khẩu.', email: 'Email', submit: 'Gửi liên kết', sending: 'Đang gửi...', back: 'Quay lại đăng nhập', success: 'Kiểm tra email để đặt lại mật khẩu.' }
};

export default function ForgotPassword() {
  const { lang } = useLang();
  const t = T[lang];
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || t.success);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch {
      setMessage('Error sending request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 border border-white/5">
        <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
        <p className="text-on-surface-variant text-sm mb-6">{t.desc}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t.email}
            className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-4 py-3" />
          <button type="submit" disabled={loading} className="w-full bg-primary-container hover:bg-primary-container/80 text-white font-bold py-3 rounded-xl disabled:opacity-50">
            {loading ? t.sending : t.submit}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
        {resetUrl && (
          <p className="mt-2 text-xs text-on-surface-variant break-all">
            Dev link: <a href={resetUrl} className="text-primary-container underline">{resetUrl}</a>
          </p>
        )}
        <Link to="/login" className="block mt-6 text-center text-sm text-primary-container hover:underline">{t.back}</Link>
      </div>
    </div>
  );
}
