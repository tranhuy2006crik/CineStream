import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import useAuth from '../hooks/useAuth';
import { Loader2, RefreshCw, CreditCard } from 'lucide-react';

const translations = {
  en: {
    title: 'Choose Your Experience',
    subtitle: 'Simple pricing for endless entertainment.',
    basic: 'Basic',
    basicDesc: 'Standard quality streaming',
    selectBasic: 'Select Basic',
    screen1: '1 Screen access',
    fhd: 'Full HD Quality',
    popular: 'MOST POPULAR',
    premium: 'Premium',
    premiumDesc: '4K Ultra HD Experience',
    screen2: '2 Screens simultaneously',
    ultra: '4K Ultra HD + HDR',
    sound: 'Dolby Atmos Sound',
    getPremium: 'Get Premium',
    vip: 'VIP',
    vipDesc: 'Ultimate cinema privilege',
    screen4: '4 Screens simultaneously',
    early: 'Cinema Early Access',
    noAds: 'Zero Ads & Offline Mode',
    goVip: 'Go VIP',
    buy: 'Subscribe',
    pleaseLogin: 'Please login first to subscribe',
    month: 'mo',
    processing: 'Processing...'
  },
  vi: {
    title: 'Chọn Gói Dịch Vụ',
    subtitle: 'Bảng giá đơn giản, giải trí bất tận.',
    basic: 'Cơ bản',
    basicDesc: 'Chất lượng tiêu chuẩn',
    selectBasic: 'Chọn Cơ bản',
    screen1: 'Xem trên 1 thiết bị',
    fhd: 'Chất lượng Full HD',
    popular: 'PHỔ BIẾN NHẤT',
    premium: 'Cao cấp',
    premiumDesc: 'Trải nghiệm 4K Siêu nét',
    screen2: 'Xem trên 2 thiết bị',
    ultra: 'Siêu nét 4K + HDR',
    sound: 'Âm thanh Dolby Atmos',
    getPremium: 'Mua Cao cấp',
    vip: 'VIP',
    vipDesc: 'Đặc quyền điện ảnh tối thượng',
    screen4: 'Xem trên 4 thiết bị',
    early: 'Xem sớm tại rạp',
    noAds: 'Không quảng cáo & Xem ngoại tuyến',
    goVip: 'Lên VIP',
    buy: 'Đăng ký ngay',
    pleaseLogin: 'Vui lòng đăng nhập để đăng ký gói',
    month: 'tháng',
    processing: 'Đang xử lý...'
  }
};

export default function Pricing({ standalone = false }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { lang } = useLang();
  const t = translations[lang];
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/packages?isActive=true');
        const data = await res.json();
        setPackages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách gói cước:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleSubscribe = async (pkg) => {
    if (!token) {
      setToast(t.pleaseLogin);
      setTimeout(() => setToast(''), 3500);
      setTimeout(() => navigate('/login'), 800);
      return;
    }
    try {
      setProcessingId(pkg._id);
      const res = await fetch('/api/bookings/packages/create_payment_url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageId: pkg._id })
      });
      const data = await res.json();
      if (data.paymentUrl) {
        localStorage.setItem('pending_package', JSON.stringify({
          packageId: pkg._id,
          name: pkg.name,
          at: Date.now()
        }));
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.message || 'Error');
      }
    } catch (err) {
      console.error(err);
      setToast(err.message || (lang === 'vi' ? 'Lỗi trong quá trình tạo đơn. Vui lòng thử lại.' : 'Error creating order, please retry.'));
      setTimeout(() => setToast(''), 4000);
    } finally {
      setProcessingId(null);
    }
  };

  const fmtPrice = (v) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) || 0);
    } catch (e) { return v; }
  };

  return (
    <section className={`${standalone ? 'min-h-screen' : ''} py-24 bg-background reveal relative`}>
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-danger text-white px-4 py-3 rounded-lg shadow-xl border border-danger/30 flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
          <RefreshCw className="animate-spin" size={18} /> {toast}
        </div>
      )}

      {standalone && (
        <div className="px-margin-mobile md:px-margin-desktop max-w-6xl mx-auto mb-6">
          <button onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:text-on-surface transition-colors font-body-base cursor-pointer">
            ← {lang === 'vi' ? 'Quay lại' : 'Back'}
          </button>
        </div>
      )}

      <div className="px-margin-mobile md:px-margin-desktop text-center mb-stack-lg">
        <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-on-surface">{t.title}</h2>
        <p className="font-body-base text-on-surface-variant">{t.subtitle}</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-primary-container" size={48} />
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center text-on-surface-variant py-12">
          Không có gói cước nào khả dụng lúc này.
        </div>
      ) : (
        <div className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-6xl mx-auto items-center">
          {packages.map((pkg, index) => {
            const isPopular = pkg.isPopular;
            const isProcessing = processingId === pkg._id;
            const durationDays = Number(pkg.durationDays) || 30;
            const durationLabel = durationDays === 30
              ? `/${t.month}`
              : `/${durationDays} ${lang === 'vi' ? 'ngày' : 'days'}`;
            
            return (
              <div 
                key={pkg._id} 
                className={`${
                  isPopular 
                    ? 'relative p-stack-lg rounded-2xl flex flex-col bg-surface-container-high border-2 border-primary-container shadow-[0_0_40px_rgba(229,9,20,0.15)] group scale-105 z-10' 
                    : 'glass-card p-stack-lg rounded-2xl flex flex-col transition-all duration-300 hover:border-primary-container group'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-label-bold whitespace-nowrap">
                    {t.popular}
                  </div>
                )}
                
                <div className="mb-stack-md">
                  <h3 className="font-headline-md text-on-surface">{pkg.name}</h3>
                  <p className="text-on-surface-variant text-body-sm min-h-[40px]">{pkg.description}</p>
                </div>
                
                <div className="mb-stack-lg">
                  <span className="text-4xl font-black text-on-surface">{fmtPrice(pkg.price)}</span>
                  <span className="text-on-surface-variant">{durationLabel}</span>
                </div>
                
                <ul className="flex-grow space-y-4 mb-stack-lg">
                  {pkg.features && pkg.features.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-2 text-body-sm ${isPopular ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> 
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleSubscribe(pkg)}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-lg font-label-bold transition-all flex items-center justify-center gap-2 ${
                    isPopular 
                      ? 'bg-primary-container text-on-primary-container shadow-lg hover:shadow-primary-container/20 cursor-pointer disabled:opacity-70' 
                      : 'border border-outline-variant text-on-surface group-hover:bg-primary-container group-hover:text-on-primary-container group-hover:border-transparent cursor-pointer disabled:opacity-70'
                  }`}
                >
                  {isProcessing ? (
                    <><RefreshCw size={18} className="animate-spin" /> {t.processing}</>
                  ) : (
                    <><CreditCard size={18} /> {t.buy} {pkg.name}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
