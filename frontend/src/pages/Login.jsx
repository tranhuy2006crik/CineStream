import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    getStarted: 'Get Started',
    processing: 'Processing...',
    or: 'OR',
    continueGoogle: 'Continue with Google',
    continueFacebook: 'Continue with Facebook',
    rememberMe: 'Remember me',
    needHelp: 'Need help?',
    alreadyHaveAccount: 'Already have an account?',
    newToCinestream: 'New to Cinestream?',
    signInNow: 'Sign in now.',
    signUpNow: 'Sign up now.',
    recaptcha: "This page is protected by Google reCAPTCHA to ensure you're not a bot.",
    learnMore: 'Learn more.',
    whosWatching: "Who's watching?",
    addProfile: 'Add Profile',
    newProfile: 'New Profile',
    profileName: 'Profile Name',
    saving: 'Saving...',
    add: 'Add',
    confirmPasswordLabel: 'Confirm password',
    passwordMismatch: 'Passwords do not match.',
    cancel: 'Cancel',
    callUs: 'Questions? Call 1-800-CINEMA',
    faq: 'FAQ',
    cookiePrefs: 'Cookie Preferences',
    helpCenter: 'Help Center',
    corpInfo: 'Corporate Information',
    termsOfUse: 'Terms of Use',
    privacy: 'Privacy',
  },
  vi: {
    signIn: 'Đăng Nhập',
    signUp: 'Đăng Ký',
    emailLabel: 'Địa chỉ email',
    passwordLabel: 'Mật khẩu',
    getStarted: 'Bắt Đầu',
    processing: 'Đang xử lý...',
    or: 'HOẶC',
    continueGoogle: 'Tiếp tục với Google',
    continueFacebook: 'Tiếp tục với Facebook',
    rememberMe: 'Ghi nhớ đăng nhập',
    needHelp: 'Cần trợ giúp?',
    alreadyHaveAccount: 'Đã có tài khoản?',
    newToCinestream: 'Mới dùng Cinestream?',
    signInNow: 'Đăng nhập ngay.',
    signUpNow: 'Đăng ký ngay.',
    recaptcha: 'Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo bạn không phải robot.',
    learnMore: 'Tìm hiểu thêm.',
    whosWatching: 'Ai đang xem?',
    addProfile: 'Thêm Hồ Sơ',
    newProfile: 'Hồ Sơ Mới',
    profileName: 'Tên hồ sơ',
    saving: 'Đang lưu...',
    add: 'Thêm',
    confirmPasswordLabel: 'Xác nhận mật khẩu',
    passwordMismatch: 'Mật khẩu không khớp.',
    cancel: 'Hủy',
    callUs: 'Câu hỏi? Gọi 1-800-CINEMA',
    faq: 'Câu hỏi thường gặp',
    cookiePrefs: 'Tùy chọn Cookie',
    helpCenter: 'Trung tâm trợ giúp',
    corpInfo: 'Thông tin doanh nghiệp',
    termsOfUse: 'Điều khoản sử dụng',
    privacy: 'Quyền riêng tư',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang, toggleLang } = useLang();

  // Film-reel transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  const t = translations[lang];
  
  // Auth state
  const [user, setUser] = useState(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [profiles, setProfiles] = useState([]);
  
  // Profile creation state
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  
  const navigate = useNavigate();

  // If already logged in and active profile exists, redirect to home
  useEffect(() => {
    const token = localStorage.getItem('token');
    const activeProfile = localStorage.getItem('activeProfile');
    if (token && activeProfile) {
      navigate('/');
    } else if (token) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
        setProfiles(storedUser.profiles || []);
        setShowProfiles(true);
      }
    }
  }, [navigate]);

  // Film-reel transition handler
  const handleModeSwitch = () => {
    setIsTransitioning(true);
    setPendingMode(!isSignUp);
    // After fade-out completes, switch mode and fade back in
    setTimeout(() => {
      setIsSignUp(prev => !prev);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setTimeout(() => {
        setIsTransitioning(false);
        setPendingMode(null);
      }, 50);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate confirm password for sign up
    if (isSignUp && password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, email: data.email, profiles: data.profiles }));
      
      setUser(data);
      setProfiles(data.profiles || []);
      setShowProfiles(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (profile) => {
    localStorage.setItem('activeProfile', JSON.stringify(profile));
    navigate('/');
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    setError('');
    setLoading(true);

    const randomAvatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDoaxqDa9tiqBwh_IIwp1iuzBLGZObCw1YDPCnt1mxTpqaQRGseQzZMzzsQWZW_7ZF-DMfuQgH--xJUcaONEpYIeQM7kPxjeF0DqxczdVOMQP3uGkR1RAC3XwDIR_G98WuDmL-kwVhVJ_W4Wb1mBT4CdiZ9tR4RGh3aOdQmaN5zwBOkuLi2z71oWkft-AHJv_A0BipjD9Bpe-kAU4CJ1hu6z9hvf66t04nlwu5BiC-DGFiTCCWDq93-F2fyzPeEol1nCPfrTPG5OBs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCm2yBKwJxcjMwvbpi5tZjXY-CThB92pnuc7tYt62ZmbjspAQwnx3aspKWqhOZyI1X3YxTiw28NBsosKqgiYe6jJSqzoxPXAg_xv-HxGgMfGGxYUxlm_04CoPrwXaorhe_01NKmiDB1i8se6jjGc_tDUSmdTdFtzsB6ZqzTssqS82NC7c4X8e8PQQakOnwO9A3H9tFbhVPvpBXcH3zGp-jCoWBSU47U0feRWl7m8GnDajZbKfr6tGBAxofzIbjE8YtbyfMjRpsmwqc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDOdW-FiudtRQGcMp8aUUXFqRzLOFikSjHssghPKt6r2trbkDjplnMyaMcXcjs7gz-fx3XDUtonBZfpKBKVhote08zzdX-aXQwv73-HS4_zUM1R6G4kmZRL6ill0kGL_v-tzxF4i_sRlbpjVsZLFRqVPsW0em2u4_tS1aEPdlp3OzNX1QDpbtmWFiprztLYv3O1F5ivBn2erhs283PlN3pA0FRfdAQbpoB2JJZoxHw_5627zexNLDjPf14b7To7Q-4HW8J0UGLenVs'
    ];
    const avatar = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newProfileName, avatar }),
      });

      const updatedProfiles = await response.json();

      if (!response.ok) {
        throw new Error(updatedProfiles.message || 'Could not add profile');
      }

      setProfiles(updatedProfiles);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.profiles = updatedProfiles;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      setNewProfileName('');
      setIsAddingProfile(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reusable floating-label input — label sits ON the border when active
  const FloatingInput = ({ id, label, type = 'text', value, onChange, required = true }) => {
    const [focused, setFocused] = useState(false);
    const isActive = focused || (value && value.length > 0);

    return (
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          name={id}
          placeholder=" "
          required={required}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            borderRadius: '8px',
            padding: '16px 16px 16px 16px',
            fontSize: '16px',
            lineHeight: '1.5',
            color: '#e5e2e1',
            outline: 'none',
            border: focused ? '2px solid #e50914' : '2px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        <label
          htmlFor={id}
          style={{
            position: 'absolute',
            left: '12px',
            top: isActive ? '-9px' : '50%',
            transform: isActive ? 'translateY(0)' : 'translateY(-50%)',
            fontSize: isActive ? '12px' : '15px',
            color: focused ? '#e50914' : isActive ? '#e5e2e1' : '#a09e9d',
            fontWeight: isActive ? '600' : '400',
            transition: 'all 0.2s ease',
            pointerEvents: 'none',
            fontFamily: 'Inter, sans-serif',
            backgroundColor: isActive ? 'rgba(0,0,0,0.9)' : 'transparent',
            padding: isActive ? '0 6px' : '0',
            borderRadius: '4px',
          }}
        >
          {label}
        </label>
      </div>
    );
  };

  return (
    <div className="bg-background text-on-surface font-body-base min-h-screen relative flex flex-col antialiased selection:bg-primary-container selection:text-white">
      {/* Background — Movie Poster Grid with cinematic overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/login_bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Cinematic overlay matching reference */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%), rgba(0,0,0,0.4)' }}
        ></div>
      </div>

      {/* Film-reel transition overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black pointer-events-none transition-opacity duration-500 ease-in-out ${
          isTransitioning ? 'opacity-80' : 'opacity-0'
        }`}
        style={{
          backgroundImage: isTransitioning
            ? 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 5px)'
            : 'none',
        }}
      ></div>

      {/* Header */}
      <header className="relative z-20 w-full px-4 sm:px-8 md:px-16 py-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <a
            className="inline-block font-display-lg text-[28px] sm:text-[36px] font-black text-primary-container uppercase tracking-tighter"
            href="#"
            style={{ textShadow: '0 0 20px rgba(229, 9, 20, 0.6), 0 0 40px rgba(229, 9, 20, 0.3)' }}
          >
            CINESTREAM
          </a>
          {/* Language Toggle Globe */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            title={lang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
          >
            <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
            </svg>
            <span className="text-xs font-semibold text-white/80 group-hover:text-white uppercase tracking-wide">{lang === 'en' ? 'VI' : 'EN'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 md:py-0">
        {!showProfiles ? (
          /* Auth Box — Glassmorphic */
          <div
            className={`w-full max-w-[450px] bg-black/75 backdrop-blur-xl rounded-xl p-8 md:p-16 border border-red-500/20 transition-all duration-500 ease-out hover:border-red-500/30 ${
              isTransitioning ? 'scale-95 blur-sm opacity-30' : 'scale-100 blur-0 opacity-100'
            }`}
            style={{
              boxShadow: '0 0 30px rgba(229, 9, 20, 0.25), 0 0 60px rgba(229, 9, 20, 0.12), 0 0 120px rgba(229, 9, 20, 0.06), 0 8px 32px rgba(0,0,0,0.5)'
            }}
          >
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-8 font-bold">
              {isSignUp ? t.signUp : t.signIn}
            </h1>

            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6 text-sm border-l-4 border-primary-container">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Email */}
              <FloatingInput
                id="email"
                label={t.emailLabel}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* Password */}
              <FloatingInput
                id="password"
                label={t.passwordLabel}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Confirm Password — only for Sign Up */}
              {isSignUp && (
                <FloatingInput
                  id="confirmPassword"
                  label={t.confirmPasswordLabel}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}

              {/* Submit */}
              <button
                className="mt-4 w-full py-4 bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-lg active:scale-[0.98] cursor-pointer disabled:opacity-50"
                type="submit"
                disabled={loading}
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(229, 9, 20, 0.6), 0 0 40px rgba(229, 9, 20, 0.3), 0 0 80px rgba(229, 9, 20, 0.15)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.filter = 'brightness(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                {loading ? t.processing : (isSignUp ? t.getStarted : t.signIn)}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6 flex items-center justify-between">
              <hr className="w-full border-surface-bright" />
              <span className="px-4 text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold whitespace-nowrap">{t.or}</span>
              <hr className="w-full border-surface-bright" />
            </div>

            {/* Social Buttons */}
            <div className="flex flex-col gap-3">
              <button className="w-full flex items-center justify-center gap-3 py-3 bg-white/10 hover:bg-white/20 text-on-surface font-body-base text-body-base rounded-lg transition-colors border border-transparent hover:border-white/20 cursor-pointer" type="button">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span>{t.continueGoogle}</span>
              </button>
              <button className="w-full flex items-center justify-center gap-3 py-3 bg-white/10 hover:bg-white/20 text-on-surface font-body-base text-body-base rounded-lg transition-colors border border-transparent hover:border-white/20 cursor-pointer" type="button">
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span>{t.continueFacebook}</span>
              </button>
            </div>

            {/* Remember + Help */}
            <div className="flex justify-between items-center mt-6 text-sm">
              <div className="flex items-center">
                <input className="w-4 h-4 rounded bg-[#333333] border-none text-primary-container focus:ring-primary-container cursor-pointer" id="remember" type="checkbox" />
                <label className="ml-2 text-on-surface-variant cursor-pointer select-none" htmlFor="remember">{t.rememberMe}</label>
              </div>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors hover:underline" href="#">{t.needHelp}</a>
            </div>

            {/* Footer Link */}
            <div className="mt-10 pt-6 border-t border-white/5 text-center">
              <p className="font-body-base text-sm text-on-surface-variant">
                {isSignUp ? t.alreadyHaveAccount : t.newToCinestream}
                <button
                  className="ml-1.5 cursor-pointer focus:outline-none font-bold"
                  onClick={handleModeSwitch}
                  style={{
                    color: '#e5e2e1',
                    transition: 'all 0.3s ease',
                    textShadow: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ff4d4d';
                    e.currentTarget.style.textShadow = '0 0 10px rgba(229, 9, 20, 0.8), 0 0 20px rgba(229, 9, 20, 0.4)';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#e5e2e1';
                    e.currentTarget.style.textShadow = 'none';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {isSignUp ? t.signInNow : t.signUpNow}
                </button>
              </p>
              <p className="text-[11px] text-on-surface-variant mt-3 opacity-60 leading-relaxed">
                {t.recaptcha} <a className="text-tertiary hover:underline" href="#">{t.learnMore}</a>
              </p>
            </div>
          </div>
        ) : (
          /* Profiles Box */
          <div className="flex flex-col items-center justify-center w-full max-w-[800px] transition-all duration-500 scale-100 opacity-100" id="profiles-container">
            <h2 className="font-display-lg text-[28px] sm:text-[36px] md:text-[48px] text-on-surface mb-[40px] text-center font-bold tracking-tight">
              {t.whosWatching}
            </h2>

            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded mb-6 text-sm w-full max-w-[500px]">
                {error}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 px-4">
              {profiles.map((profile) => (
                <button 
                  key={profile._id}
                  className="group flex flex-col items-center focus:outline-none cursor-pointer" 
                  onClick={() => handleSelectProfile(profile)}
                >
                  <div className="w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary-container transition-all duration-300 transform group-hover:scale-105 mb-3.5 shadow-2xl">
                    <img alt={profile.name} className="w-full h-full object-cover" src={profile.avatar} />
                  </div>
                  <span className="font-headline-md text-sm sm:text-base md:text-xl text-on-surface-variant group-hover:text-on-surface transition-colors font-medium">
                    {profile.name}
                  </span>
                </button>
              ))}

              {!isAddingProfile ? (
                <button 
                  className="group flex flex-col items-center focus:outline-none cursor-pointer" 
                  onClick={() => setIsAddingProfile(true)}
                >
                  <div className="w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] rounded-xl overflow-hidden border-2 border-dashed border-white/20 group-hover:border-primary-container transition-all duration-300 transform group-hover:scale-105 mb-3.5 shadow-lg bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[40px] sm:text-[50px] md:text-[60px] text-on-surface-variant group-hover:text-on-surface transition-colors">
                      add
                    </span>
                  </div>
                  <span className="font-headline-md text-sm sm:text-base md:text-xl text-on-surface-variant group-hover:text-on-surface transition-colors font-medium">
                    {t.addProfile}
                  </span>
                </button>
              ) : (
                <form onSubmit={handleAddProfile} className="flex flex-col items-center justify-center p-6 bg-surface-container rounded-2xl border border-white/10 w-full max-w-[300px] shadow-2xl">
                  <h3 className="text-base font-bold text-on-surface mb-3.5">{t.newProfile}</h3>
                  <input 
                    type="text" 
                    className="w-full bg-[#333333] text-on-surface text-sm px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-container border-none"
                    placeholder={t.profileName}
                    required
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                  />
                  <div className="flex gap-2 w-full text-xs">
                    <button 
                      type="submit" 
                      className="flex-grow bg-primary-container text-on-primary-container py-2.5 rounded-lg font-bold cursor-pointer hover:brightness-110 transition-all"
                      disabled={loading}
                    >
                      {loading ? t.saving : t.add}
                    </button>
                    <button 
                      type="button" 
                      className="flex-grow bg-white/10 hover:bg-white/20 text-on-surface py-2.5 rounded-lg cursor-pointer transition-all"
                      onClick={() => setIsAddingProfile(false)}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Decorative bottom glow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-primary-container/5 blur-3xl z-0 pointer-events-none"></div>

      {/* Footer */}
      <footer className="w-full py-8 sm:py-12 mt-auto bg-black/60 backdrop-blur-md border-t border-white/5 relative z-10 shrink-0 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 sm:px-8 md:px-16 max-w-[1440px] mx-auto text-on-surface-variant">
          <div className="col-span-2 md:col-span-4 mb-2">
            <p className="font-body-base text-base mb-1">{t.callUs}</p>
          </div>
          <ul className="flex flex-col space-y-2">
            <li><a className="text-[13px] hover:underline hover:text-on-surface transition-colors" href="#">{t.faq}</a></li>
            <li><a className="text-[13px] hover:underline hover:text-on-surface transition-colors" href="#">{t.cookiePrefs}</a></li>
          </ul>
          <ul className="flex flex-col space-y-2">
            <li><a className="text-[13px] hover:underline hover:text-on-surface transition-colors" href="#">{t.helpCenter}</a></li>
            <li><a className="text-[13px] hover:underline hover:text-on-surface transition-colors" href="#">{t.corpInfo}</a></li>
          </ul>
          <ul className="flex flex-col space-y-2">
            <li><a className="text-[13px] hover:underline hover:text-on-surface transition-colors" href="#">{t.termsOfUse}</a></li>
          </ul>
          <ul className="flex flex-col space-y-2">
            <li><a className="text-[13px] hover:underline hover:text-on-surface transition-colors" href="#">{t.privacy}</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
