import { useLang } from '../context/LanguageContext';

const translations = {
  en: { nowStreaming: 'Now Streaming' },
  vi: { nowStreaming: 'Đang khởi chiếu' }
};

export default function FeatureReel() {
  const { lang } = useLang();
  const t = translations[lang];
  const movies = [
    { title: "Neon Odyssey", tag: "4K HDR", rating: "9.2 Rating", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAoFA5WSNmGmXJfi7UQxgn5N2XKlYPHVbR5j2LGRzMwLO4rEw1J7I_Oe3cXePXWEdkiZQfmOAKJBI9jIDj2uHxvqtu2s2lIfuGL5wUjmukkAAAdqxXP5dUstWv9JgizUyURvHTTPUUpsMpvoXS0JCD0EhDWhgYEeJFo2qanQBDGfUaztkFs4a5hI7H1qh1AFXPcfqGieave-M5JR310OGFCYMuUTR_AHIO2cPqCxHWeuhQkzDXrKDrUTXCsU3WWz6EscmhvCiUdhY" },
    { title: "Shadow Protocol", tag: "PREMIUM", rating: "8.8 Rating", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6wKfyaIzJrFqeJ_NevH5juqR7vRNUC7ruIgd6ZQjXZZSwDMBPHZbK3f6I0x2bFk6yOXzWlTsPXWEoIhXYixSTklHLtcBHONOhY_sgdx09CUuTJszcf9iURzLq78vO9-n0bcx_a1LQgREY8REXql6vW331tjSInAqiq5tR-Wyuelzj5NZ_Kc60X6eFm7WswPPiYqkkbTwyqLfilouq3UAJtOM6oPQTajsB3htFQbRdAFFI9qC2EpRG8hfbuE5iMQMrWh0FwgntaxY" },
    { title: "Velocity Red", tag: "NEW", rating: "9.5 Rating", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV1-Ujp7-1w9L8LgVDprbgzt81BmMhCfsHIDzqQz7os7zIYRHu0YR8HxkiiBqHw5ZwAOP6fJ935lftuhJFFUX118pzibMRSRmCyptu8WvtdnYoO2plUC4JoqkEyXHDMc30giUL1E4nG6EPs0s3SUXOGYoHc2yxzLWlzrOrJaBj25QWeJGRGszThZfOLHJgT_BVVDaeSwE9FXxsd6q9_KryAvXSftBFM5MHcy32LR6Mdxdm4pwk4OB1fPOLHZgRG6go_VzoHEuQNqA" },
    { title: "Eternal Gate", tag: "TRENDING", rating: "9.0 Rating", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_raFaCK6dkcjok_TpGMelSWCcQFooT6bRmTrkVvi_WEt4KO87KgR8kFVrp0XfSF_mXgLqodpf6VNmjqmmEAFY48f2CrTXtKQKrlHO4MqGxH5EyMpKhvwXVECXgRJ9GPsUoJEgUf2yFy_dZYIyuKg3Hl5RKfl0NspI8uTyJ7uSvnNBOfiMptv_VzzKnv3zwzJGbGLNf7x3ogaWMgjTJpCbwbfulKyxUltUJXnutNQfQ23uxj4gM2zzrYNKpkcHRzdYKMJhhkQupWg" }
  ];

  return (
    <section className="py-stack-lg bg-background overflow-hidden reveal">
      <div className="px-margin-mobile md:px-margin-desktop mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-on-surface border-l-4 border-primary-container pl-4">{t.nowStreaming}</h2>
      </div>
      <div className="flex gap-gutter px-margin-mobile md:px-margin-desktop overflow-x-auto hide-scrollbar py-10">
        {movies.map((movie, idx) => (
          <div key={idx} className="flex-none w-64 md:w-80 cursor-pointer group">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl poster-3d transition-all duration-500">
              <img className="w-full h-full object-cover" src={movie.img} alt={movie.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 right-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary-container text-[10px] px-2 py-0.5 rounded font-black text-white">{movie.tag}</span>
                  <span className="bg-surface-container-highest text-[10px] px-2 py-0.5 rounded text-white">{movie.rating}</span>
                </div>
                <h3 className="font-headline-md text-body-base text-on-surface font-bold truncate">{movie.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
