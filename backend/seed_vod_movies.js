import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-cinema';

const seedVODMovies = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for Seeding VOD Movies');

    // VOD Movies Data
    const vodMovies = [
      {
        title: 'Deadpool & Wolverine',
        director: 'Shawn Levy',
        duration: 128,
        releaseDate: new Date('2024-07-26'),
        releaseYear: 2024,
        description: 'Deadpool is offered a chance to be part of the Marvel Cinematic Universe. He teams up with an unwilling Wolverine to rescue his family and save the world.',
        poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        banner: 'https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/yF1eUbmpCDYL92Me3jLMNvPsagI.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin'],
        genres: ['Action', 'Comedy', 'Superhero'],
        country: 'USA',
        rating: 8.2,
        averageRating: 4.1,
        views: 45000,
        ticketsSold: 18000,
        status: 'VOD',
        isVOD: true,
        vodTier: 'premium',
        rentalPrice: 45000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        title: 'Inside Out 2',
        director: 'Kelsey Mann',
        duration: 96,
        releaseDate: new Date('2024-06-14'),
        releaseYear: 2024,
        description: 'Returning to the world of Inside Out, Pixar explores the inner workings of the teenage mind, introducing new emotions and complex feelings.',
        poster: 'https://image.tmdb.org/t/p/w500/dhMWznMklseFHSwLogorsrecurved.jpg',
        banner: 'https://image.tmdb.org/t/p/original/kfPDvYCt9u9ZKKNkVmYVHkwMEgs.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/kfPDvYCt9u9ZKKNkVmYVHkwMEgs.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=RhMnmq4sH8g',
        cast: ['Amy Poehler', 'Maya Hawke', 'Phyllis Smith'],
        genres: ['Animation', 'Comedy', 'Family'],
        country: 'USA',
        rating: 7.9,
        averageRating: 3.95,
        views: 38000,
        ticketsSold: 15000,
        status: 'VOD',
        isVOD: true,
        vodTier: 'standard',
        rentalPrice: 35000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        title: 'Dune: Part Two',
        director: 'Denis Villeneuve',
        duration: 166,
        releaseDate: new Date('2024-02-29'),
        releaseYear: 2024,
        description: 'Paul Atreides travels to the dangerous planet Arrakis to ensure the future of his family and people in this continuation of the epic saga.',
        poster: 'https://image.tmdb.org/t/p/w500/eu0QSr63eWklBSa3V6iV2Fy5b0K.jpg',
        banner: 'https://image.tmdb.org/t/p/original/d5NXSklXo96JsRZYk92Johnson.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/d5NXSklXo96JsRZYk92Johnson.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        cast: ['Timothée Chalamet', 'Zendaya', 'Oscar Isaac'],
        genres: ['Science Fiction', 'Adventure', 'Drama'],
        country: 'USA',
        rating: 8.1,
        averageRating: 4.05,
        views: 52000,
        ticketsSold: 21000,
        status: 'VOD',
        isVOD: true,
        vodTier: 'exclusive',
        rentalPrice: 55000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        title: 'Godzilla x Kong: The New Empire',
        director: 'Adam Wingard',
        duration: 115,
        releaseDate: new Date('2024-03-29'),
        releaseYear: 2024,
        description: 'The fearsome Godzilla and the mighty Kong clash once again in an epic battle as humanity looks on. Both titans face a new threat.',
        poster: 'https://image.tmdb.org/t/p/w500/z1p34vh_psrvOW577oHJEJHiXSH.jpg',
        banner: 'https://image.tmdb.org/t/p/original/iuFNMS8U5cb6xn4FNVgc4azilCc.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/iuFNMS8U5cb6xn4FNVgc4azilCc.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=Go8nTmfrjA8',
        cast: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens'],
        genres: ['Action', 'Science Fiction', 'Adventure'],
        country: 'USA',
        rating: 7.5,
        averageRating: 3.75,
        views: 41000,
        ticketsSold: 17000,
        status: 'VOD',
        isVOD: true,
        vodTier: 'premium',
        rentalPrice: 50000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        title: 'Kung Fu Panda 4',
        director: 'Mike Mitchell',
        duration: 94,
        releaseDate: new Date('2024-03-08'),
        releaseYear: 2024,
        description: 'Po must train a new generation of kung fu warriors when a powerful ancient evil resurfaces that only the Dragon Warrior can face.',
        poster: 'https://image.tmdb.org/t/p/w500/kDp1vHWzNrEuw8AgWIc1DwHAD2O.jpg',
        banner: 'https://image.tmdb.org/t/p/original/gryffIndLMa2LS10UJKxXvbYnyB.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/gryffIndLMa2LS10UJKxXvbYnyB.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=VHsjBMUC-a8',
        cast: ['Jack Black', 'Furong Zeng', 'Viola Davis'],
        genres: ['Animation', 'Action', 'Comedy'],
        country: 'USA',
        rating: 7.3,
        averageRating: 3.65,
        views: 35000,
        ticketsSold: 14000,
        status: 'VOD',
        isVOD: true,
        vodTier: 'standard',
        rentalPrice: 40000,
        vodVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      }
    ];

    // Insert or update VOD movies
    for (let movie of vodMovies) {
      // Ensure releaseYear is set
      if (movie.releaseDate && !movie.releaseYear) {
        movie.releaseYear = new Date(movie.releaseDate).getFullYear();
      }
      
      const exists = await Movie.findOne({ title: movie.title });
      if (exists) {
        // Update existing movie to be VOD
        Object.assign(exists, movie);
        if (!exists.releaseYear && exists.releaseDate) {
          exists.releaseYear = new Date(exists.releaseDate).getFullYear();
        }
        await exists.save();
        console.log(`✓ Updated: ${movie.title}`);
      } else {
        // Create new VOD movie
        const newMovie = new Movie(movie);
        if (!newMovie.releaseYear && newMovie.releaseDate) {
          newMovie.releaseYear = new Date(newMovie.releaseDate).getFullYear();
        }
        await newMovie.save();
        console.log(`✓ Created: ${movie.title}`);
      }
    }

    console.log('\n✅ VOD Movies seeded successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding VOD movies:', error);
    process.exit(1);
  }
};

seedVODMovies();
