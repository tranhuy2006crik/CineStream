import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LanguageContext';
import useAuth from '../hooks/useAuth';
import { Lock, Play, RefreshCw, AlertCircle, CreditCard, Package, Check, Info, Loader2, Maximize, Volume2, VolumeX, X } from 'lucide-react';

const T = {
  en: {
    loading: 'Loading...',
    backToVOD: '← Back to VOD',
    watch: 'Watch Now',
    rent: 'Rent',
    buyPackage: 'Get Package',
    freeTrial: 'Free with your plan',
    accessDenied: 'Premium Content',
    accessDeniedMsg: 'This title requires a higher subscription tier or a one-time rental.',
    yourTier: 'Your tier',
    requiredTier: 'Required tier',
    rentalPrice: 'Rental price',
    rentFor48h: 'Rent for 48 hours',
    orPackage: 'Or unlock with a subscription package',
    notFound: 'Movie not found',
    notVOD: 'This movie is not available for VOD streaming',
    pleaseLogin: 'Please login to watch',
    login: 'Login',
    rentalActive: 'Rental active',
    hoursLeft: 'hours remaining',
    packageActive: 'Included in your subscription',
    hd: 'HD',
    uhd: '4K UHD',
    trailer: 'Watch Trailer',
    paymentTitle: 'Choose Payment Method',
    paymentDesc: 'Select your preferred payment method to complete the rental.',
    vnpay: 'VNPay',
    momo: 'MoMo',
    confirmPay: 'Confirm Payment',
    cancel: 'Cancel',
    processing: 'Processing...',
    total: 'Total'
  },
  vi: {
    loading: 'Đang tải...',
    backToVOD: '← Quay lại VOD',
    watch: 'Xem ngay',
    rent: 'Thuê phim',
    buyPackage: 'Mua gói',
    freeTrial: 'Đã bao gồm trong gói của bạn',
    accessDenied: 'Nội dung trả phí',
    accessDeniedMsg: 'Bộ phim này yêu cầu gói thuê bao cao hơn hoặc thuê riêng lẻ.',
    yourTier: 'Gói của bạn',
    requiredTier: 'Cần gói',
    rentalPrice: 'Giá thuê',
    rentFor48h: 'Thuê trong 48 giờ',
    orPackage: 'Hoặc mở khóa bằng gói thành viên',
    notFound: 'Không tìm thấy phim',
    notVOD: 'Phim này không hỗ trợ xem VOD',
    pleaseLogin: 'Vui lòng đăng nhập để xem',
    login: 'Đăng nhập',
    rentalActive: 'Đã thuê',
    hoursLeft: 'giờ còn lại',
    packageActive: 'Bao gồm trong gói đăng ký',
    hd: 'HD',
    uhd: '4K UHD',
    trailer: 'Xem Trailer',
    paymentTitle: 'Chọn Phương Thức Thanh Toán',
    paymentDesc: 'Vui lòng chọn phương thức thanh toán để hoàn tất việc thuê phim.',
    vnpay: 'VNPay',
    momo: 'MoMo',
    confirmPay: 'Xác Nhận Thanh Toán',
    cancel: 'Hủy',
    processing: 'Đang xử lý...',
    total: 'Tổng cộng'
  }
};

const tierLabel = {
  none: { en: 'None', vi: 'Không có' },
  standard: { en: 'Standard', vi: 'Cơ bản' },
  premium: { en: 'Premium', vi: 'Cao cấp' },
  exclusive: { en: 'Exclusive', vi: 'Độc quyền' }
};

const fallbackVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function VODPlayer() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const t = T[lang] || T.en;

  const [movie, setMovie] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VNPay'); // VNPay | Momo
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Video player UI state
  const videoRef = useRef(null);
  const [showCustomControls, setShowCustomControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const controlsTimerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (authLoading) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');

        const movieReq = fetch(`/api/movies/${movieId}`).then(async (r) => {
          if (!r.ok) throw new Error(`Movie API ${r.status}: ${r.statusText}`);
          const payload = await r.json();
          return payload?.data || payload;
        });

        const accessReq = token
          ? fetch(`/api/movies/${movieId}/check-access`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(async (r) => {
              if (!r.ok && r.status !== 403 && r.status !== 401) {
                throw new Error(`Access API ${r.status}: ${r.statusText}`);
              }
              const payload = await r.json().catch(() => ({}));
              return payload || { access: false, reason: 'denied' };
            })
          : Promise.resolve({
              access: false,
              reason: 'unauth',
              requiredTier: null,
              userTier: 'none'
            });

        const [loadedMovie, loadedAccess] = await Promise.all([movieReq, accessReq]);

        if (cancelled) return;

        if (!loadedMovie || (!loadedMovie._id && !loadedMovie.id)) {
          throw new Error(lang === 'vi'
            ? 'Dữ liệu phim không hợp lệ từ server'
            : 'Invalid movie payload from server');
        }

        setMovie(loadedMovie);
        setAccess(loadedAccess || { access: false, reason: 'denied' });
      } catch (err) {
        console.error('VOD load error:', err);
        if (!cancelled) {
          setError(
            err?.message ||
            (lang === 'vi' ? 'Không thể tải dữ liệu phim. Vui lòng thử lại sau.' : 'Failed to load movie data.')
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [movieId, token, authLoading, lang]);

  // Auto-hide video controls after 3s idle
  const onMouseMoveVideo = () => {
    setShowCustomControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowCustomControls(false), 3000);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const el = videoRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const handleRent = async (selectedMethod = paymentMethod) => {
    if (!token) return navigate('/login');
    if (!movie) return;
    try {
      setPaymentLoading(true);
      setError('');
      const res = await fetch('/api/bookings/vod/create_payment_url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movieId: movie._id || movieId, paymentMethod: selectedMethod })
      });
      const data = await res.json();
      if (data.paymentUrl) {
        localStorage.setItem('pending_rental', JSON.stringify({
          movieId: movie._id || movieId,
          title: movie.title,
          at: Date.now()
        }));
        setPaymentModalOpen(false);
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.message || 'Error creating payment');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || (lang === 'vi' ? 'Lỗi khi tạo đơn thuê. Vui lòng thử lại.' : 'Error creating rental. Please retry.'));
    } finally {
      setPaymentLoading(false);
    }
  };

  // ================ RENDER HELPERS ================

  if (authLoading || loading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary-container" size={60} />
            <p className="text-on-surface-variant">{t.loading}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertCircle size={52} className="text-danger" />
          <h2 className="text-2xl font-bold">{t.notFound}</h2>
          <p className="text-on-surface-variant max-w-md">{error}</p>
          <button onClick={() => navigate('/vod')}
            className="bg-primary-container text-white px-6 py-2.5 rounded hover:brightness-110 transition">
            {t.backToVOD}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isVOD = movie && (movie.isVOD || movie.status === 'VOD');
  const hasAccess = !!(access && access.access);
  const hasActiveRental = access?.accessType === 'rental';
  const hasActivePackage = access?.accessType === 'package';

  const resolvedVideoUrl = hasAccess && (movie?.vodVideoUrl || fallbackVideo);

  return (
    <div className="bg-background text-on-background font-body-base overflow-x-hidden min-h-screen flex flex-col">
      <Navbar />

      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-16 py-6 flex-1">
        <button onClick={() => navigate('/vod')}
          className="text-on-surface-variant hover:text-on-surface transition-colors font-body-base mb-6 animate-fade-in cursor-pointer">
          {t.backToVOD}
        </button>

        {/* ==== A: VIDEO PLAYER SECTION (IF ACCESS) ==== */}
        {hasAccess && resolvedVideoUrl && (
          <div className="animate-fade-in">
            <div
              className="relative w-full aspect-video bg-black rounded-xl overflow-hidden ring-1 ring-outline-variant/40 shadow-2xl group"
              onMouseMove={onMouseMoveVideo}
              onMouseLeave={() => setShowCustomControls(false)}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-contain bg-black"
                controls
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                poster={movie?.banner || movie?.poster}
              >
                <source src={resolvedVideoUrl} type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>

              {!isPlaying && showCustomControls && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition cursor-pointer"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 hover:bg-primary-container/40 transition-all duration-300">
                    <Play size={44} className="text-white ml-1" fill="white" />
                  </div>
                </button>
              )}

              {showCustomControls && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none">
                  <div className="flex items-end justify-between pointer-events-auto">
                    <div>
                      <h3 className="text-white text-lg md:text-xl font-bold drop-shadow">{movie?.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded border border-white/10">
                          {(movie?.duration || 120) + ' ' + (lang === 'vi' ? 'phút' : 'min')}
                        </span>
                        <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded border border-white/10">
                          {movie?.vodTier === 'exclusive' ? t.uhd : t.hd}
                        </span>
                        {hasActiveRental && (
                          <span className="bg-success-container/90 text-white text-xs px-2 py-0.5 rounded border border-success/20">
                            ✓ {t.rentalActive} · {access?.remainingRentalHours ?? 48}h {t.hoursLeft}
                          </span>
                        )}
                        {hasActivePackage && (
                          <span className="bg-primary-container/80 text-white text-xs px-2 py-0.5 rounded border border-white/10">
                            ✓ {t.packageActive}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer">
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <button onClick={toggleFullscreen} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer">
                        <Maximize size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata panel under video */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="md:col-span-2">
                <h1 className="text-3xl md:text-4xl font-black text-on-surface">{movie?.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-yellow-500 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {movie?.averageRating || movie?.rating || '7.8'}
                  </span>
                  <span className="text-on-surface-variant">·</span>
                  <span className="text-on-surface-variant">{movie?.releaseYear || new Date(movie?.releaseDate).getFullYear()}</span>
                  <span className="text-on-surface-variant">·</span>
                  <span className="text-on-surface-variant capitalize">{(movie?.genres || []).join(', ')}</span>
                  <span className="text-on-surface-variant">·</span>
                  <span className="px-2 py-0.5 rounded text-xs uppercase border border-outline-variant text-on-surface-variant">
                    {movie?.vodTier || 'standard'}
                  </span>
                </div>
                <p className="mt-4 text-on-surface-variant leading-relaxed text-base max-w-2xl">
                  {movie?.description}
                </p>
              </div>
              <div className="md:col-span-1">
                <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-4">
                  <h4 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                    <Info size={16} /> {lang === 'vi' ? 'Thông tin phát' : 'Playback Info'}
                  </h4>
                  <ul className="space-y-1.5 text-sm text-on-surface-variant">
                    <li className="flex justify-between">
                      <span>{lang === 'vi' ? 'Chất lượng tối đa' : 'Max quality'}</span>
                      <span className="text-on-surface font-semibold">{movie?.vodTier === 'exclusive' ? '4K HDR' : 'Full HD'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{lang === 'vi' ? 'Thiết bị' : 'Devices'}</span>
                      <span className="text-on-surface font-semibold">{lang === 'vi' ? 'Không giới hạn' : 'All'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{lang === 'vi' ? 'Phụ đề' : 'Subtitles'}</span>
                      <span className="text-on-surface font-semibold">VI / EN</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==== B: NO ACCESS SECTION (Show Rent Button / Buy Package / Login) ==== */}
        {!hasAccess && movie && (
          <div className="animate-fade-in">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden ring-1 ring-outline-variant/40">
              <img
                src={movie?.banner || movie?.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80"}
                alt={movie?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95"></div>

              {/* Lock + callout */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                  <div className="md:col-span-3 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary-container/40 text-primary-container text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                      <Lock size={14} /> {t.accessDenied}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                      {movie?.title}
                    </h1>
                    <p className="text-white/75 max-w-xl">{movie?.description || t.accessDeniedMsg}</p>
                    <div className="flex flex-wrap items-center gap-2 text-white/60 text-sm">
                      <span>{movie?.releaseYear}</span>
                      <span>·</span>
                      <span>{(movie?.duration || 120) + ' ' + (lang === 'vi' ? 'phút' : 'min')}</span>
                      <span>·</span>
                      <span className="capitalize">{(movie?.genres || []).join(', ')}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    {!token ? (
                      <div className="bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/40 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-on-surface mb-2">{t.pleaseLogin}</h3>
                        <p className="text-on-surface-variant text-sm mb-4">
                          {lang === 'vi' ? 'Đăng nhập để thuê hoặc xem nội dung này với gói của bạn.' : 'Login to rent or stream with your subscription.'}
                        </p>
                        <button onClick={() => navigate('/login')}
                          className="w-full bg-primary-container hover:brightness-110 text-white py-3 rounded-lg font-bold transition cursor-pointer">
                          {t.login}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/40 rounded-2xl p-6 shadow-2xl space-y-4">
                        {!isVOD ? (
                          <div>
                            <h3 className="text-lg font-bold text-on-surface mb-1">{t.notVOD}</h3>
                            <p className="text-on-surface-variant text-sm">
                              {lang === 'vi' ? 'Hãy xem lịch chiếu rạp để đặt vé xem tại rạp.' : 'Visit booking page to get cinema tickets for this movie.'}
                            </p>
                            <button onClick={() => navigate('/booking')}
                              className="mt-3 w-full bg-primary-container hover:brightness-110 text-white py-3 rounded-lg font-bold transition cursor-pointer">
                              {lang === 'vi' ? 'Đặt vé rạp' : 'Book Cinema Ticket'}
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Tier information */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-surface rounded-lg p-3 border border-outline-variant/30">
                                <div className="text-on-surface-variant text-xs">{t.yourTier}</div>
                                <div className="mt-1 font-bold text-on-surface">
                                  {tierLabel[access?.userTier || 'none']?.[lang] || (access?.userTier || 'none')}
                                </div>
                              </div>
                              <div className="bg-surface rounded-lg p-3 border border-outline-variant/30">
                                <div className="text-on-surface-variant text-xs">{t.requiredTier}</div>
                                <div className="mt-1 font-bold text-primary-container">
                                  {tierLabel[access?.requiredTier || 'standard']?.[lang] || (access?.requiredTier || 'standard')}
                                </div>
                              </div>
                            </div>

                            {/* RENT OPTION */}
                            <button
                              onClick={() => setPaymentModalOpen(true)}
                              disabled={paymentLoading}
                              className="w-full bg-primary-container hover:brightness-110 disabled:opacity-70 disabled:cursor-wait text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {paymentLoading ? <RefreshCw className="animate-spin" size={18} /> : <CreditCard size={18} />}
                              {t.rentFor48h} · {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(access?.rentalPrice || movie?.rentalPrice || 45000)}
                            </button>

                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-outline-variant/30"></div>
                              <span className="text-xs text-on-surface-variant uppercase">{t.orPackage}</span>
                              <div className="h-px flex-1 bg-outline-variant/30"></div>
                            </div>

                            {/* PACKAGE OPTION */}
                            <button
                              onClick={() => navigate('/pricing')}
                              className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20"
                            >
                              <Package size={18} />
                              {t.buyPackage}
                            </button>

                            {(movie?.trailerUrl) && (
                              <button
                                onClick={() => {
                                  if (window.open) window.open(movie.trailerUrl, '_blank', 'noopener');
                                }}
                                className="w-full bg-white/5 hover:bg-white/10 text-on-surface border border-outline-variant/30 py-2.5 rounded-lg font-semibold transition text-sm cursor-pointer">
                                ▶ {t.trailer}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Movie details below locked card */}
            {isVOD && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold text-on-surface mb-3">{lang === 'vi' ? 'Tóm tắt nội dung' : 'Synopsis'}</h2>
                  <p className="text-on-surface-variant leading-relaxed">{movie?.description}</p>
                  {movie?.director && (
                    <p className="mt-4 text-on-surface-variant"><span className="font-semibold text-on-surface">{lang === 'vi' ? 'Đạo diễn: ' : 'Director: '}</span>{movie.director}</p>
                  )}
                  {movie?.cast?.length > 0 && (
                    <p className="mt-2 text-on-surface-variant"><span className="font-semibold text-on-surface">{lang === 'vi' ? 'Diễn viên: ' : 'Cast: '}</span>{movie.cast.join(', ')}</p>
                  )}
                </div>
                <div>
                  <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-5">
                    <h4 className="font-bold text-on-surface mb-3">{lang === 'vi' ? 'Tại sao chọn gói?' : 'Why subscribe?'}</h4>
                    <ul className="space-y-2.5 text-sm">
                      {[
                        lang === 'vi' ? 'Xem không giới hạn tiêu đề trong gói' : 'Unlimited titles in your tier',
                        lang === 'vi' ? 'Chất lượng 4K HDR với gói Exclusive' : '4K HDR with Exclusive tier',
                        lang === 'vi' ? 'Thoát khỏi quảng cáo' : 'Ad-free playback',
                        lang === 'vi' ? 'Hủy bất cứ lúc nào' : 'Cancel any time'
                      ].map((ft, i) => (
                        <li key={i} className="flex items-start gap-2 text-on-surface-variant">
                          <Check size={16} className="text-success-container mt-0.5 flex-none" />
                          <span>{ft}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============== DEFENSIVE FALLBACK (avoid black screen) ============== */}
        {!movie && !loading && (
          <div className="py-28 flex flex-col items-center justify-center text-center gap-4 px-6">
            <AlertCircle size={56} className="text-danger" />
            <h2 className="text-2xl md:text-3xl font-black text-on-surface">
              {error || t.notFound}
            </h2>
            <p className="text-on-surface-variant max-w-md">
              {error || (lang === 'vi'
                ? 'Không thể tải dữ liệu phim này. Vui lòng thử lại hoặc quay lại trang VOD.'
                : 'We could not load this movie. Please try again or return to the VOD listing.')}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <button
                onClick={() => navigate('/vod')}
                className="bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold hover:brightness-110 transition shadow-[0_0_15px_rgba(229,9,20,0.3)] cursor-pointer"
              >
                {t.backToVOD}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-white/5 hover:bg-white/10 text-on-surface px-6 py-2.5 rounded-xl font-semibold border border-white/10 transition cursor-pointer"
              >
                {lang === 'vi' ? 'Tải lại trang' : 'Reload page'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================ PAYMENT METHOD MODAL (VNPay / MoMo) ================ */}
      {paymentModalOpen && movie && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => !paymentLoading && setPaymentModalOpen(false)}
        >
          <div
            className="w-full max-w-[520px] bg-surface-container rounded-2xl border border-outline-variant/40 shadow-2xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-primary-container/10 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 border border-primary-container/30 flex items-center justify-center">
                    <CreditCard size={22} className="text-primary-container" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-on-surface">{t.paymentTitle}</h2>
                    <p className="text-sm text-on-surface-variant">{t.paymentDesc}</p>
                  </div>
                </div>
                <button
                  onClick={() => !paymentLoading && setPaymentModalOpen(false)}
                  disabled={paymentLoading}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition disabled:opacity-40 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order summary */}
              <div className="mt-4 p-4 rounded-xl bg-black/25 border border-white/5 flex items-center gap-3">
                <img
                  src={movie?.poster || movie?.banner}
                  alt={movie?.title}
                  className="w-14 h-20 object-cover rounded-md ring-1 ring-white/10 flex-none"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=60'; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface truncate">{movie?.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t.rentFor48h}</p>
                  <p className="text-lg font-black text-primary-container mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(access?.rentalPrice || movie?.rentalPrice || 45000)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body — Payment method selector (same UX as Checkout.jsx) */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wide">
                  {lang === 'vi' ? 'Phương thức thanh toán' : 'Payment method'}
                </label>
                <div className="flex gap-3">
                  {['VNPay', 'Momo'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      disabled={paymentLoading}
                      className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === method
                          ? 'border-primary-container bg-primary-container/15 text-primary-container shadow-[0_0_0_3px_rgba(229,9,20,0.12)]'
                          : 'border-white/10 bg-surface-container-highest/60 text-on-surface hover:border-outline-variant hover:bg-surface-container-highest'
                      }`}
                    >
                      {method === 'VNPay' ? (
                        <CreditCard size={18} />
                      ) : (
                        <Package size={18} />
                      )}
                      <span>{method === 'VNPay' ? t.vnpay : t.momo}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              {/* Total + Confirm */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wide">{t.total || (lang === 'vi' ? 'Tổng cộng' : 'Total')}</p>
                  <p className="text-2xl font-black text-primary-container mt-0.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(access?.rentalPrice || movie?.rentalPrice || 45000)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => !paymentLoading && setPaymentModalOpen(false)}
                    disabled={paymentLoading}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-on-surface font-semibold border border-white/10 transition disabled:opacity-40 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRent(paymentMethod)}
                    disabled={paymentLoading}
                    className="px-6 py-3 rounded-xl bg-primary-container hover:brightness-110 text-white font-bold transition disabled:opacity-60 disabled:cursor-wait flex items-center gap-2 shadow-[0_0_18px_rgba(229,9,20,0.35)] cursor-pointer"
                  >
                    {paymentLoading ? (
                      <><RefreshCw className="animate-spin" size={18} /> {t.processing}</>
                    ) : (
                      <><CreditCard size={18} /> {t.confirmPay}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
