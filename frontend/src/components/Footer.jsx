import { useLang } from '../context/LanguageContext';

const translations = {
  en: {
    slogan: 'Redefining the way you experience movies, one frame at a time.',
    company: 'COMPANY',
    help: 'Help Center',
    terms: 'Terms of Use',
    legal: 'LEGAL',
    privacy: 'Privacy',
    cookie: 'Cookie Preferences',
    connect: 'CONNECT'
  },
  vi: {
    slogan: 'Tái định nghĩa cách bạn trải nghiệm điện ảnh, qua từng khung hình.',
    company: 'CÔNG TY',
    help: 'Trung tâm trợ giúp',
    terms: 'Điều khoản sử dụng',
    legal: 'PHÁP LÝ',
    privacy: 'Quyền riêng tư',
    cookie: 'Tùy chọn Cookie',
    connect: 'KẾT NỐI'
  }
};

export default function Footer() {
  const { lang } = useLang();
  const t = translations[lang];
  return (
    <footer className="relative bg-surface overflow-hidden pt-10 border-t border-outline-variant reveal">
      <div className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none">
        <svg className="w-full h-24" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#e50914"></path>
        </svg>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10 pb-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-headline-md text-headline-md text-on-surface-variant mb-stack-md uppercase font-black tracking-tighter">CINESTREAM</div>
          <p className="text-body-sm text-on-secondary-container max-w-[200px]">{t.slogan}</p>
        </div>
        <div>
          <h4 className="font-label-bold text-label-bold text-on-surface mb-stack-sm">{t.company}</h4>
          <ul className="space-y-2">
            <li><a className="text-on-surface-variant hover:underline font-body-sm" href="#">{t.help}</a></li>
            <li><a className="text-on-surface-variant hover:underline font-body-sm" href="#">{t.terms}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-bold text-label-bold text-on-surface mb-stack-sm">{t.legal}</h4>
          <ul className="space-y-2">
            <li><a className="text-on-surface-variant hover:underline font-body-sm" href="#">{t.privacy}</a></li>
            <li><a className="text-on-surface-variant hover:underline font-body-sm" href="#">{t.cookie}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-bold text-label-bold text-on-surface mb-stack-sm">{t.connect}</h4>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary-container transition-colors">public</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary-container transition-colors">share</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary-container transition-colors">videocam</span>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-variant/30 py-6 text-center relative z-10">
        <p className="text-body-sm text-on-surface-variant">© 2024 CineStream, Inc.</p>
      </div>
    </footer>
  );
}
