import { useLang } from '../context/LanguageContext';

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
    goVip: 'Go VIP'
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
    goVip: 'Lên VIP'
  }
};

export default function Pricing() {
  const { lang } = useLang();
  const t = translations[lang];
  return (
    <section className="py-24 bg-background reveal">
      <div className="px-margin-mobile md:px-margin-desktop text-center mb-stack-lg">
        <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-on-surface">{t.title}</h2>
        <p className="font-body-base text-on-surface-variant">{t.subtitle}</p>
      </div>
      <div className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-6xl mx-auto">
        <div className="glass-card p-stack-lg rounded-2xl flex flex-col transition-all duration-300 hover:border-primary-container group">
          <div className="mb-stack-md">
            <h3 className="font-headline-md text-on-surface">{t.basic}</h3>
            <p className="text-on-surface-variant text-body-sm">{t.basicDesc}</p>
          </div>
          <div className="mb-stack-lg">
            <span className="text-4xl font-black text-on-surface">$9.99</span>
            <span className="text-on-surface-variant">/mo</span>
          </div>
          <ul className="flex-grow space-y-4 mb-stack-lg">
            <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.screen1}
            </li>
            <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.fhd}
            </li>
          </ul>
          <button className="w-full py-3 rounded-lg border border-outline-variant text-on-surface font-label-bold group-hover:bg-primary-container group-hover:text-on-primary-container group-hover:border-transparent transition-all">{t.selectBasic}</button>
        </div>
        <div className="relative p-stack-lg rounded-2xl flex flex-col bg-surface-container-high border-2 border-primary-container shadow-[0_0_40px_rgba(229,9,20,0.15)] group scale-105 z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-label-bold whitespace-nowrap">{t.popular}</div>
          <div className="mb-stack-md">
            <h3 className="font-headline-md text-on-surface">{t.premium}</h3>
            <p className="text-on-surface-variant text-body-sm">{t.premiumDesc}</p>
          </div>
          <div className="mb-stack-lg">
            <span className="text-4xl font-black text-on-surface">$15.99</span>
            <span className="text-on-surface-variant">/mo</span>
          </div>
          <ul className="flex-grow space-y-4 mb-stack-lg">
            <li className="flex items-center gap-2 text-body-sm text-on-surface">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.screen2}
            </li>
            <li className="flex items-center gap-2 text-body-sm text-on-surface">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.ultra}
            </li>
            <li className="flex items-center gap-2 text-body-sm text-on-surface">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.sound}
            </li>
          </ul>
          <button className="w-full py-3 rounded-lg bg-primary-container text-on-primary-container font-label-bold shadow-lg hover:shadow-primary-container/20 transition-all">{t.getPremium}</button>
        </div>
        <div className="glass-card p-stack-lg rounded-2xl flex flex-col transition-all duration-300 hover:border-primary-container group">
          <div className="mb-stack-md">
            <h3 className="font-headline-md text-on-surface">{t.vip}</h3>
            <p className="text-on-surface-variant text-body-sm">{t.vipDesc}</p>
          </div>
          <div className="mb-stack-lg">
            <span className="text-4xl font-black text-on-surface">$24.99</span>
            <span className="text-on-surface-variant">/mo</span>
          </div>
          <ul className="flex-grow space-y-4 mb-stack-lg">
            <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.screen4}
            </li>
            <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.early}
            </li>
            <li className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span> {t.noAds}
            </li>
          </ul>
          <button className="w-full py-3 rounded-lg border border-outline-variant text-on-surface font-label-bold group-hover:bg-primary-container group-hover:text-on-primary-container group-hover:border-transparent transition-all">{t.goVip}</button>
        </div>
      </div>
    </section>
  );
}
