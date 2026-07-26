import 'dotenv/config.js';
import mongoose from 'mongoose';
import Movie from './models/Movie.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-cinema';

const NEW_VOD_MOVIES = [
  {
    title: "The Midnight Library",
    director: "Greta Gerwig",
    duration: 128,
    releaseDate: new Date('2024-09-15'),
    description: "A woman discovers a mysterious midnight library where each book contains a different life she could have lived.",
    poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=the%20midnight%20library%20fantasy%20mysterious%20books%20movie%20poster&image_size=square_hd",
    banner: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=midnight%20library%20magic%20bookshelf%20fantasy%20movie%20banner&image_size=landscape_16_9",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    cast: ["Florence Pugh","Timothée Chalamet","Meryl Streep"],
    views: 34000,
    rating: 8.7,
    country: "USA",
    genres: ["Fantasy","Drama"],
    isFeatured: true,
    status: 'VOD',
    isVOD: true,
    vodTier: 'exclusive',
    rentalPrice: 95000,
    vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    title: "Operation Neptune",
    director: "Christopher Nolan",
    duration: 152,
    releaseDate: new Date('2025-03-07'),
    description: "A crew of astronauts embarks on humanity's last hope mission to find an ocean world beyond our solar system.",
    poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=space%20neptune%20mission%20astronaut%20sci-fi%20epic%20movie%20poster&image_size=square_hd",
    banner: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=neptune%20ocean%20planet%20spaceship%20cinematic%20epic%20movie%20banner&image_size=landscape_16_9",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    cast: ["Cillian Murphy","Robert Downey Jr.","Anne Hathaway"],
    views: 72000,
    rating: 8.9,
    country: "USA",
    genres: ["Sci-Fi","Adventure","Drama"],
    isFeatured: true,
    status: 'VOD',
    isVOD: true,
    vodTier: 'premium',
    rentalPrice: 75000,
    vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    title: "Hanoi After Rain",
    director: "Trần Anh Hùng",
    duration: 112,
    releaseDate: new Date('2024-12-20'),
    description: "An intimate story about love and memory set in the wet, quiet streets of Hanoi after a November monsoon.",
    poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=hanoi%20old%20quarter%20rainy%20street%20vietnam%20romantic%20movie%20poster&image_size=square_hd",
    banner: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=hanoi%20hoan%20kiem%20lake%20after%20rain%20vietnamese%20cinematic%20banner&image_size=landscape_16_9",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    cast: ["Trần Nữ Yên Khê","Ngô Thanh Vân","Trường Giang"],
    views: 45000,
    rating: 8.3,
    country: "Vietnam",
    genres: ["Romance","Drama"],
    status: 'VOD',
    isVOD: true,
    vodTier: 'premium',
    rentalPrice: 65000,
    vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    title: "Cyber Samurai 2099",
    director: "James Cameron",
    duration: 141,
    releaseDate: new Date('2025-06-06'),
    description: "In Neo-Tokyo 2099, a rogue samAI hunts down the Yakuza syndicate that once created her to save the last human child.",
    poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk%20samurai%20katana%20neon%20tokyo%20action%20movie%20poster&image_size=square_hd",
    banner: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=neon%20tokyo%20night%20cyberpunk%20future%20city%20cinematic%20movie%20banner&image_size=landscape_16_9",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    cast: ["Zendaya","Keanu Reeves","Ana de Armas"],
    views: 98000,
    rating: 8.0,
    country: "USA",
    genres: ["Action","Sci-Fi","Cyberpunk"],
    status: 'VOD',
    isVOD: true,
    vodTier: 'standard',
    rentalPrice: 45000,
    vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    title: "The Chef's Recipe",
    director: "Lee Isaac Chung",
    duration: 118,
    releaseDate: new Date('2024-11-08'),
    description: "A young Korean-American chef returns to Seoul to rediscover the secret jajangmyeon recipe her late grandmother hid from everyone.",
    poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=korean%20chef%20warm%20food%20restaurant%20family%20drama%20movie%20poster&image_size=square_hd",
    banner: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=seoul%20street%20food%20market%20night%20cozy%20cinematic%20movie%20banner&image_size=landscape_16_9",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    cast: ["Steven Yeun","Han Ye-ri","Youn Yuh-jung"],
    views: 31000,
    rating: 8.5,
    country: "South Korea",
    genres: ["Drama","Food","Family"],
    status: 'VOD',
    isVOD: true,
    vodTier: 'standard',
    rentalPrice: 35000,
    vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  }
];

async function main() {
  try {
    console.log('🔗 Connecting to MongoDB:', MONGO_URI.replace(/\/\/(.*):(.*)@/, '//***:***@'));
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const totalBefore = await Movie.countDocuments();
    const vodBefore = await Movie.countDocuments({ isVOD: true });
    console.log(`\n📊 Trước khi thêm:`);
    console.log(`  - Tổng phim: ${totalBefore}`);
    console.log(`  - Phim VOD (isVOD=true): ${vodBefore}`);

    const inserted = [];
    const skipped = [];
    for (const m of NEW_VOD_MOVIES) {
      const dup = await Movie.findOne({ title: m.title });
      if (dup) {
        skipped.push(m.title);
        continue;
      }
      const doc = new Movie(m);
      await doc.save();
      inserted.push(m.title);
    }

    const totalAfter = await Movie.countDocuments();
    const vodAfter = await Movie.countDocuments({ isVOD: true });
    console.log(`\n✅ Kết quả:`);
    console.log(`  - Thêm mới thành công: ${inserted.length} phim`);
    inserted.forEach(t => console.log(`    ✨ ${t}`));
    if (skipped.length) {
      console.log(`  - Bỏ qua (trùng title): ${skipped.length}`);
      skipped.forEach(t => console.log(`    ⚠️  ${t} (đã tồn tại)`));
    }
    console.log(`\n📊 Sau khi thêm:`);
    console.log(`  - Tổng phim: ${totalAfter}`);
    console.log(`  - Phim VOD (isVOD=true): ${vodAfter}`);

    console.log('\n🎉 Phim VOD đã có mặt ở cả trang admin (/admin/movies/vod) và user (/vod).');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

main();
