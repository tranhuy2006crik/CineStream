import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Cinema from './models/Cinema.js';
import Theater from './models/Theater.js';
import Movie from './models/Movie.js';
import Showtime from './models/Showtime.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-cinema';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for Seeding');

    // 1. Seed Users
    console.log('Seeding Users...');
    const usersToSeed = [
      { email: 'admin@cine.com', password: 'password123', role: 'admin' },
      { email: 'staff@cine.com', password: 'password123', role: 'staff' },
      { email: 'user@cine.com', password: 'password123', role: 'user' }
    ];

    for (let u of usersToSeed) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
      } else {
        exists.password = u.password;
        exists.role = u.role;
        await exists.save();
      }
    }

    // 2. Clear old theater, cinema, movie, showtime data
    console.log('Clearing old data...');
    await Cinema.deleteMany();
    await Theater.deleteMany();
    await Movie.deleteMany();
    await Showtime.deleteMany();

    // 3. Seed Cinemas
    console.log('Seeding Cinemas...');
    const cinemas = await Cinema.insertMany([
      {
        name: 'CineStream Landmark 81',
        address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM',
        hotline: '1900 1234',
        location: { lat: 10.7946, lng: 106.7219 },
        operatingHours: { open: '08:00', close: '24:00' },
        managerEmail: 'landmark81@cinestream.com',
        staffCount: 25,
        region: 'TP.HCM',
        images: ['https://lh3.googleusercontent.com/p/AF1QipMwB9fXz0dD4d5j9VfMkT6O9c9h1VpX0LpYv3F8=s680-w680-h510'],
        facilities: ['IMAX', '4DX', 'Sweetbox'],
        status: 'Active',
        description: 'Tổ hợp rạp chiếu phim hiện đại bậc nhất Việt Nam.'
      },
      {
        name: 'CineStream Sư Vạn Hạnh',
        address: '11 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM',
        hotline: '1900 1235',
        location: { lat: 10.7744, lng: 106.6669 },
        operatingHours: { open: '08:00', close: '23:30' },
        managerEmail: 'suvanhanh@cinestream.com',
        staffCount: 15,
        region: 'TP.HCM',
        images: ['https://lh3.googleusercontent.com/p/AF1QipN-_B0hK5c8Xp6m5R6QZk2V2yX6qY3J4fF1Q2U2=s680-w680-h510'],
        facilities: ['Sweetbox', 'Dolby Atmos'],
        status: 'Active',
        description: 'Vị trí trung tâm sầm uất.'
      },
      {
        name: 'CineStream Gò Vấp',
        address: '12 Phan Văn Trị, Phường 7, Gò Vấp, TP.HCM',
        hotline: '1900 1236',
        location: { lat: 10.8277, lng: 106.6874 },
        operatingHours: { open: '08:00', close: '23:00' },
        managerEmail: 'govap@cinestream.com',
        staffCount: 10,
        region: 'TP.HCM',
        images: ['https://lh3.googleusercontent.com/p/AF1QipOQ4xT4C_O2V4P4J8J3T1J4H4G4L4X4K4J4T4P4=s680-w680-h510'],
        facilities: ['Standard'],
        status: 'Active',
        description: 'Rạp chiếu phim dành cho sinh viên.'
      },
      {
        name: 'CineStream Vincom Biên Hòa',
        address: '1090 Phạm Văn Thuận, Tân Mai, Biên Hòa, Đồng Nai',
        hotline: '1900 1237',
        location: { lat: 10.9575, lng: 106.8427 },
        operatingHours: { open: '08:30', close: '23:00' },
        managerEmail: 'vincombh@cinestream.com',
        staffCount: 18,
        region: 'Đồng Nai',
        images: ['https://lh3.googleusercontent.com/p/AF1QipN-_B0hK5c8Xp6m5R6QZk2V2yX6qY3J4fF1Q2U2=s680-w680-h510'],
        facilities: ['Standard', 'Sweetbox'],
        status: 'Active',
        description: 'Rạp chiếu phim hiện đại tại trung tâm thương mại Vincom.'
      },
      {
        name: 'CineStream Lotte Biên Hòa',
        address: 'Khu thương mại Amata, Xa Lộ Hà Nội, Long Bình, Biên Hòa, Đồng Nai',
        hotline: '1900 1238',
        location: { lat: 10.9329, lng: 106.8741 },
        operatingHours: { open: '08:00', close: '22:30' },
        managerEmail: 'lottebh@cinestream.com',
        staffCount: 15,
        region: 'Đồng Nai',
        images: ['https://lh3.googleusercontent.com/p/AF1QipOQ4xT4C_O2V4P4J8J3T1J4H4G4L4X4K4J4T4P4=s680-w680-h510'],
        facilities: ['Standard'],
        status: 'Active',
        description: 'Rạp chiếu phim rộng rãi, tiện lợi mua sắm.'
      },
      {
        name: 'CineStream Pegasus Biên Hòa',
        address: '53-55 Võ Thị Sáu, Quyết Thắng, Biên Hòa, Đồng Nai',
        hotline: '1900 1239',
        location: { lat: 10.9458, lng: 106.8242 },
        operatingHours: { open: '08:00', close: '23:30' },
        managerEmail: 'pegasusbh@cinestream.com',
        staffCount: 20,
        region: 'Đồng Nai',
        images: ['https://lh3.googleusercontent.com/p/AF1QipMwB9fXz0dD4d5j9VfMkT6O9c9h1VpX0LpYv3F8=s680-w680-h510'],
        facilities: ['Standard', 'Dolby Atmos'],
        status: 'Active',
        description: 'Điểm giải trí quen thuộc của giới trẻ Biên Hòa.'
      },
      {
        name: 'CineStream Vincom Bà Triệu',
        address: '191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội',
        hotline: '1900 1240',
        location: { lat: 21.0118, lng: 105.8492 },
        operatingHours: { open: '08:00', close: '24:00' },
        managerEmail: 'batrieu@cinestream.com',
        staffCount: 22,
        region: 'Hà Nội',
        images: ['https://lh3.googleusercontent.com/p/AF1QipMwB9fXz0dD4d5j9VfMkT6O9c9h1VpX0LpYv3F8=s680-w680-h510'],
        facilities: ['IMAX', 'Standard'],
        status: 'Active',
        description: 'Trung tâm giải trí hàng đầu Thủ đô.'
      },
      {
        name: 'CineStream Aeon Mall Hà Đông',
        address: 'Phường Dương Nội, Quận Hà Đông, Hà Nội',
        hotline: '1900 1241',
        location: { lat: 20.9818, lng: 105.7533 },
        operatingHours: { open: '08:30', close: '23:30' },
        managerEmail: 'hadong@cinestream.com',
        staffCount: 18,
        region: 'Hà Nội',
        images: ['https://lh3.googleusercontent.com/p/AF1QipN-_B0hK5c8Xp6m5R6QZk2V2yX6qY3J4fF1Q2U2=s680-w680-h510'],
        facilities: ['Standard', 'Sweetbox'],
        status: 'Active',
        description: 'Tổ hợp rạp chiếu phim tiện nghi ở ngoại ô.'
      },
      {
        name: 'CineStream Aeon Mall Bình Dương',
        address: '1 Đại lộ Bình Dương, Khu Phố Bình Giao, Thuận An, Bình Dương',
        hotline: '1900 1242',
        location: { lat: 10.9298, lng: 106.7126 },
        operatingHours: { open: '08:30', close: '23:00' },
        managerEmail: 'binhduong@cinestream.com',
        staffCount: 16,
        region: 'Bình Dương',
        images: ['https://lh3.googleusercontent.com/p/AF1QipOQ4xT4C_O2V4P4J8J3T1J4H4G4L4X4K4J4T4P4=s680-w680-h510'],
        facilities: ['Standard'],
        status: 'Active',
        description: 'Rạp chiếu phim dành cho giới trẻ Bình Dương.'
      }
    ]);

    // 4. Seed Theaters
    console.log('Seeding Theaters...');
    const theatersToInsert = [];
    cinemas.forEach(cinema => {
      // 4 theaters per cinema
      for (let i = 1; i <= 4; i++) {
        theatersToInsert.push({
          cinemaId: cinema._id,
          name: `Room 0${i}`,
          theaterType: i === 1 ? 'IMAX' : 'Standard',
          rows: 10,
          cols: 10,
          seatMap: Array.from({ length: 10 }).map((_, rowIdx) => {
            return {
              row: String.fromCharCode(65 + rowIdx),
              seats: Array.from({ length: 10 }).map((_, colIdx) => ({
                number: colIdx + 1,
                type: rowIdx > 7 ? 'vip' : (rowIdx > 8 ? 'couple' : 'normal'),
                status: 'available'
              }))
            };
          })
        });
      }
    });
    const theaters = await Theater.insertMany(theatersToInsert);

    // 5. Seed Movies
    console.log('Seeding Movies...');
    const moviesData = await Movie.insertMany([
      {
        title: "Deadpool & Wolverine",
        director: "Shawn Levy",
        duration: 90,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Deadpool & Wolverine",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Deadpool%20%26%20Wolverine&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Deadpool%20%26%20Wolverine&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk",
        cast: ["Ryan Reynolds","Hugh Jackman","Emma Corrin"],
        views: 10000,
        ticketsSold: 5000,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Inside Out 2",
        director: "Kelsey Mann",
        duration: 100,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Inside Out 2",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Inside%20Out%202&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Inside%20Out%202&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0",
        cast: ["Amy Poehler","Maya Hawke","Kensington Tallman"],
        views: 11500,
        ticketsSold: 6200,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Dune: Part Two",
        director: "Denis Villeneuve",
        duration: 110,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Dune: Part Two",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Dune%20Part%20Two&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Dune%20Part%20Two&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        cast: ["Timothée Chalamet","Zendaya","Rebecca Ferguson"],
        views: 13000,
        ticketsSold: 7400,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Godzilla x Kong",
        director: "Adam Wingard",
        duration: 120,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Godzilla x Kong",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Godzilla%20x%20Kong&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Godzilla%20x%20Kong&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=lV1OOlGwExM",
        cast: ["Rebecca Hall","Brian Tyree Henry","Dan Stevens"],
        views: 14500,
        ticketsSold: 8600,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Kung Fu Panda 4",
        director: "Mike Mitchell",
        duration: 130,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Kung Fu Panda 4",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Kung%20Fu%20Panda%204&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Kung%20Fu%20Panda%204&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=_inKs4eeHiI",
        cast: ["Jack Black","Awkwafina","Viola Davis"],
        views: 16000,
        ticketsSold: 9800,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Oppenheimer",
        director: "Christopher Nolan",
        duration: 140,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Oppenheimer",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Oppenheimer&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Oppenheimer&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=bK6ldnjE3Y0",
        cast: ["Cillian Murphy","Emily Blunt","Robert Downey Jr."],
        views: 17500,
        ticketsSold: 11000,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Barbie",
        director: "Greta Gerwig",
        duration: 90,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Barbie",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Barbie&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Barbie&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM",
        cast: ["Margot Robbie","Ryan Gosling","America Ferrera"],
        views: 19000,
        ticketsSold: 12200,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        director: "Joaquim Dos Santos",
        duration: 100,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Spider-Man: Across the Spider-Verse",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Spider-Man%20Across%20the%20Spider-Verse&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Spider-Man%20Across%20the%20Spider-Verse&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=shW9i6k8cB0",
        cast: ["Shameik Moore","Hailee Steinfeld","Oscar Isaac"],
        views: 20500,
        ticketsSold: 13400,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "The Batman",
        director: "Matt Reeves",
        duration: 110,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called The Batman",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20The%20Batman&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20The%20Batman&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
        cast: ["Robert Pattinson","Zoë Kravitz","Paul Dano"],
        views: 22000,
        ticketsSold: 14600,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Avatar: The Way of Water",
        director: "James Cameron",
        duration: 120,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Avatar: The Way of Water",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Avatar%20The%20Way%20of%20Water&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Avatar%20The%20Way%20of%20Water&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        cast: ["Sam Worthington","Zoe Saldaña","Sigourney Weaver"],
        views: 23500,
        ticketsSold: 15800,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Fast X",
        director: "Louis Leterrier",
        duration: 130,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Fast X",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Fast%20X&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Fast%20X&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=32RAq6LSotU",
        cast: ["Vin Diesel","Michelle Rodriguez","Jason Momoa"],
        views: 25000,
        ticketsSold: 17000,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Mission: Impossible",
        director: "Christopher McQuarrie",
        duration: 140,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Mission: Impossible",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Mission%20Impossible&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Mission%20Impossible&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=avz06PDqDbM",
        cast: ["Tom Cruise","Hayley Atwell","Ving Rhames"],
        views: 26500,
        ticketsSold: 18200,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Guardians of the Galaxy 3",
        director: "James Gunn",
        duration: 90,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Guardians of the Galaxy 3",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Guardians%20of%20the%20Galaxy%203&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Guardians%20of%20the%20Galaxy%203&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=u3V5KDHRQvk",
        cast: ["Chris Pratt","Zoe Saldaña","Dave Bautista"],
        views: 28000,
        ticketsSold: 19400,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "John Wick 4",
        director: "Chad Stahelski",
        duration: 100,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called John Wick 4",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20John%20Wick%204&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20John%20Wick%204&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4",
        cast: ["Keanu Reeves","Donnie Yen","Bill Skarsgård"],
        views: 29500,
        ticketsSold: 20600,
        status: 'Showing',
        isVOD: false
      },
      {
        title: "Transformers",
        director: "Steven Caple Jr.",
        duration: 110,
        releaseDate: new Date('2024-01-01'),
        description: "A great movie called Transformers",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20poster%20for%20Transformers&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20banner%20for%20Transformers&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=itnqEauWQZM",
        cast: ["Anthony Ramos","Dominique Fishback","Peter Cullen"],
        views: 31000,
        ticketsSold: 21800,
        status: 'Showing',
        isVOD: false
      },
      // ===== VOD Movies =====
      {
        title: "The Witcher: Nightmare of the Wolf",
        director: "Kwang Il Han",
        duration: 82,
        releaseDate: new Date('2023-08-23'),
        description: "The origin story of Vesemir, Geralt of Rivia's mentor.",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20fantasy%20movie%20poster%20witcher%20nightmare%20of%20the%20wolf&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20fantasy%20movie%20banner%20witcher%20cinematic&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=8S6W8GY5XQM",
        cast: ["Kim Bodnia","Theo James","Lara Pulver"],
        views: 42000,
        rating: 8.2,
        country: "USA",
        genres: ["Animation","Action","Fantasy"],
        status: 'VOD',
        isVOD: true,
        vodTier: 'standard',
        rentalPrice: 30000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        title: "Arcane Season 1 Collection",
        director: "Christian Linke",
        duration: 240,
        releaseDate: new Date('2024-02-15'),
        description: "Set in Utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions.",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=arcane%20jinx%20vi%20sci-fi%20anime%20style%20movie%20poster&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=arcane%20league%20of%20legends%20piltover%20city%20movie%20banner&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=3PsUJFEBC74",
        cast: ["Hailee Steinfeld","Ella Purnell","Kevin Alejandro"],
        views: 89000,
        rating: 9.4,
        country: "USA",
        genres: ["Animation","Sci-Fi","Drama"],
        isSeries: true,
        status: 'VOD',
        isVOD: true,
        vodTier: 'premium',
        rentalPrice: 60000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      },
      {
        title: "Stranger Things: The Last Chapter",
        director: "The Duffer Brothers",
        duration: 135,
        releaseDate: new Date('2024-11-20'),
        description: "The final showdown in Hawkins. Vecna returns and the Upside Down threatens to consume everything.",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=stranger%20things%20upside%20down%20horror%20movie%20poster%2080s%20style&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=stranger%20things%20hawkins%20creel%20house%20dark%20banner&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=YFXlO43sT8s",
        cast: ["Millie Bobby Brown","Finn Wolfhard","David Harbour"],
        views: 156000,
        rating: 9.0,
        country: "USA",
        genres: ["Sci-Fi","Horror","Drama"],
        isFeatured: true,
        isSeries: true,
        status: 'VOD',
        isVOD: true,
        vodTier: 'exclusive',
        rentalPrice: 90000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      },
      {
        title: "Glass Onion: A Knives Out Mystery",
        director: "Rian Johnson",
        duration: 139,
        releaseDate: new Date('2023-12-23'),
        description: "Detective Benoit Blanc travels to Greece to peel back the layers of a mystery surrounding a tech billionaire.",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=detective%20mystery%20comedy%20elegant%20movie%20poster%20glass%20onion&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20greek%20island%20mansion%20mystery%20movie%20banner&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=gjqbLBQr2fI",
        cast: ["Daniel Craig","Edward Norton","Janelle Monáe"],
        views: 75000,
        rating: 7.9,
        country: "USA",
        genres: ["Mystery","Comedy","Crime"],
        status: 'VOD',
        isVOD: true,
        vodTier: 'standard',
        rentalPrice: 35000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      },
      {
        title: "Squid Game: The Final Challenge",
        director: "Hwang Dong-hyuk",
        duration: 118,
        releaseDate: new Date('2025-01-10'),
        description: "456 debt-ridden players compete in a series of deadly children's games for a 45.6 billion won prize.",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=squid%20game%20pink%20soldiers%20korean%20thriller%20movie%20poster&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=squid%20game%20arena%20dolls%20dark%20thriller%20movie%20banner&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=oqxAJKy0ur3",
        cast: ["Lee Jung-jae","Park Hae-soo","Wi Ha-joon"],
        views: 210000,
        rating: 9.1,
        country: "South Korea",
        genres: ["Thriller","Drama","Action"],
        isFeatured: true,
        isSeries: true,
        status: 'VOD',
        isVOD: true,
        vodTier: 'exclusive',
        rentalPrice: 100000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
      },
      {
        title: "Love, Rosie",
        director: "Christian Ditter",
        duration: 102,
        releaseDate: new Date('2024-02-14'),
        description: "Rosie and Alex have been best friends since they were 5, so they couldn't possibly be right for one another... or could they?",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=romantic%20comedy%20couple%20london%20warm%20sunset%20movie%20poster&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=romantic%20couple%20sunset%20city%20silhouette%20movie%20banner&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=hzI7E009yCM",
        cast: ["Lily Collins","Sam Claflin","Tamsin Egerton"],
        views: 67000,
        rating: 7.2,
        country: "UK",
        genres: ["Romance","Comedy","Drama"],
        status: 'VOD',
        isVOD: true,
        vodTier: 'standard',
        rentalPrice: 25000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
      },
      {
        title: "Conjuring: The Dark Realm",
        director: "James Wan",
        duration: 115,
        releaseDate: new Date('2023-10-28'),
        description: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence.",
        poster: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=horror%20haunted%20house%20creepy%20doll%20movie%20poster%20dark&image_size=square_hd",
        banner: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=haunted%20farmhouse%20horror%20fog%20night%20movie%20banner&image_size=landscape_16_9',
        trailerUrl: "https://www.youtube.com/watch?v=VFs5Y-3P7R4",
        cast: ["Vera Farmiga","Patrick Wilson","Ron Livingston"],
        views: 98000,
        rating: 7.8,
        country: "USA",
        genres: ["Horror","Mystery","Thriller"],
        status: 'VOD',
        isVOD: true,
        vodTier: 'premium',
        rentalPrice: 55000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
      },
    ]);

    // 6. Seed Showtimes
    console.log('Seeding Showtimes...');
    const showtimesToInsert = [];
    const cinematicMovies = moviesData.filter(m => !m.isVOD);
    
    // Create showtimes for the next 3 days
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      let baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dayOffset);
      baseDate.setHours(0, 0, 0, 0);
      
      let cinemaMovieCounter = {};

      theaters.forEach(theater => {
        if (!cinemaMovieCounter[theater.cinemaId]) cinemaMovieCounter[theater.cinemaId] = 0;

        const times = ['09:00', '13:30', '18:00', '21:00'];
        times.forEach((time) => {
          const [hh, mm] = time.split(':');
          const startTime = new Date(baseDate);
          startTime.setHours(parseInt(hh), parseInt(mm), 0, 0);
          
          const movieIndex = cinemaMovieCounter[theater.cinemaId] % cinematicMovies.length;
          const selectedMovie = cinematicMovies[movieIndex];
          cinemaMovieCounter[theater.cinemaId]++;

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + selectedMovie.duration + 15); // +15m cleanup

          showtimesToInsert.push({
            movie: selectedMovie._id,
            cinema: theater.cinemaId,
            theater: theater._id,
            startTime,
            endTime,
            pricing: {
              normalPrice: theater.theaterType === 'IMAX' ? 120000 : 80000,
              vipPrice: 150000,
              couplePrice: 200000
            }
          });
        });
      });
    }

    await Showtime.insertMany(showtimesToInsert);

    console.log('Seeding Data Complete!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
