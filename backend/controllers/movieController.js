import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';
import { cacheDel } from '../config/cache.js';

// @desc    Get all movies with filtering, searching, and pagination
// @route   GET /api/movies
// @access  Public
export const getAllMovies = async (req, res) => {
  try {
    const { 
      status, isVOD, search, genre, country, 
      minRating, maxRating, minYear, maxYear, 
      isSeries, isFeatured, sortBy, page = 1, limit = 12 
    } = req.query;

    let query = {};

    // Basic filters
    if (status && status !== 'all') query.status = status;
    if (isVOD === 'true') query.isVOD = true;
    if (isVOD === 'false') query.isVOD = false;
    if (isSeries === 'true') query.isSeries = true;
    if (isSeries === 'false') query.isSeries = false;
    if (isFeatured === 'true') query.isFeatured = true;

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Genre filter (supports multiple genres separated by comma)
    if (genre) {
      const genresArray = genre.split(',').map(g => g.trim());
      query.genres = { $in: genresArray };
    }

    // Country filter
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    // Rating range filter
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = Number(minRating);
      if (maxRating) query.rating.$lte = Number(maxRating);
    }

    // Release year range filter
    if (minYear || maxYear) {
      query.releaseYear = {};
      if (minYear) query.releaseYear.$gte = Number(minYear);
      if (maxYear) query.releaseYear.$lte = Number(maxYear);
    }

    // Sorting
    let sortOption = { releaseDate: -1 }; // Default: newest first
    if (sortBy === 'rating') sortOption = { rating: -1 };
    if (sortBy === 'views') sortOption = { views: -1 };
    if (sortBy === 'ticketsSold') sortOption = { ticketsSold: -1 };
    if (sortBy === 'title') sortOption = { title: 1 };

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination metadata
    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Server error fetching movies' });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    
    // Increment views
    movie.views += 1;
    await movie.save();
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching movie' });
  }
};

// @desc    Get related movies (same genres)
// @route   GET /api/movies/:id/related
// @access  Public
export const getRelatedMovies = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    
    // Find movies with at least one matching genre, exclude the current movie
    const relatedMovies = await Movie.find({
      _id: { $ne: movie._id },
      genres: { $in: movie.genres },
      status: { $in: ['Showing', 'VOD'] }
    })
    .sort({ views: -1, averageRating: -1 })
    .limit(10);
    
    res.json(relatedMovies);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching related movies' });
  }
};

// @desc    Personalized recommendations based on booking history & favorites
// @route   GET /api/movies/recommendations/for-me
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId, status: 'paid' })
      .populate({ path: 'showtime', populate: { path: 'movie', select: 'genres' } })
      .limit(20);

    const genreCounts = {};
    bookings.forEach(b => {
      const genres = b.showtime?.movie?.genres || [];
      genres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);

    let query = { status: { $in: ['Showing', 'VOD'] } };
    if (topGenres.length > 0) {
      query.genres = { $in: topGenres };
    }

    const watchedMovieIds = bookings.map(b => b.showtime?.movie?._id).filter(Boolean);
    if (watchedMovieIds.length) query._id = { $nin: watchedMovieIds };

    const recommendations = await Movie.find(query)
      .sort({ averageRating: -1, views: -1 })
      .limit(12);

    if (recommendations.length < 6) {
      const fallback = await Movie.find({ status: { $in: ['Showing', 'VOD'] } })
        .sort({ views: -1 })
        .limit(12);
      const ids = new Set(recommendations.map(m => String(m._id)));
      fallback.forEach(m => { if (!ids.has(String(m._id))) recommendations.push(m); });
    }

    res.json(recommendations.slice(0, 12));
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res) => {
  try {
    const { 
      title, director, duration, releaseDate, description, 
      status, isVOD, vodTier, rentalPrice, trailerUrl, vodVideoUrl,
      rating, country, genres, isSeries, isFeatured, cast
    } = req.body;

    let poster = '';
    let banner = '';

    if (req.files) {
      if (req.files.poster) poster = req.files.poster[0].path;
      if (req.files.banner) banner = req.files.banner[0].path;
    }

    // Parse genres if it's a string
    let parsedGenres = genres;
    if (typeof genres === 'string') {
      parsedGenres = genres.split(',').map(g => g.trim());
    }

    // Parse cast if it's a string
    let parsedCast = cast;
    if (typeof cast === 'string') {
      parsedCast = cast.split(',').map(c => c.trim());
    }

    const movie = await Movie.create({
      title, director, duration: Number(duration), releaseDate, description,
      status, trailerUrl,
      isVOD: isVOD === 'true' || isVOD === true,
      vodTier,
      rentalPrice: Number(rentalPrice) || 0,
      vodVideoUrl,
      poster, banner,
      rating: Number(rating) || 0,
      country: country || '',
      genres: parsedGenres || [],
      isSeries: isSeries === 'true' || isSeries === true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      cast: parsedCast || []
    });

    res.status(201).json(movie);
    cacheDel('/api/movies').catch(() => {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating movie' });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const { 
      title, director, duration, releaseDate, description, 
      status, isVOD, vodTier, rentalPrice, trailerUrl, vodVideoUrl,
      rating, country, genres, isSeries, isFeatured, cast
    } = req.body;

    if (title !== undefined) movie.title = title;
    if (director !== undefined) movie.director = director;
    if (duration !== undefined) movie.duration = Number(duration);
    if (releaseDate !== undefined) movie.releaseDate = releaseDate;
    if (description !== undefined) movie.description = description;
    if (status !== undefined) movie.status = status;
    if (trailerUrl !== undefined) movie.trailerUrl = trailerUrl;
    if (isVOD !== undefined) movie.isVOD = isVOD === 'true' || isVOD === true;
    if (vodTier !== undefined) movie.vodTier = vodTier;
    if (rentalPrice !== undefined) movie.rentalPrice = Number(rentalPrice) || 0;
    if (vodVideoUrl !== undefined) movie.vodVideoUrl = vodVideoUrl;
    if (rating !== undefined) movie.rating = Number(rating) || 0;
    if (country !== undefined) movie.country = country;
    if (isSeries !== undefined) movie.isSeries = isSeries === 'true' || isSeries === true;
    if (isFeatured !== undefined) movie.isFeatured = isFeatured === 'true' || isFeatured === true;

    if (req.files) {
      if (req.files.poster) movie.poster = req.files.poster[0].path;
      if (req.files.banner) movie.banner = req.files.banner[0].path;
    }

    if (genres !== undefined) {
      movie.genres = typeof genres === 'string' 
        ? genres.split(',').map(g => g.trim()) 
        : genres;
    }
    if (cast !== undefined) {
      movie.cast = typeof cast === 'string' 
        ? cast.split(',').map(c => c.trim()) 
        : cast;
    }

    const updatedMovie = await movie.save();
    res.json(updatedMovie);
    cacheDel('/api/movies').catch(() => {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating movie' });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    
    await movie.deleteOne();
    res.json({ message: 'Movie removed' });
    cacheDel('/api/movies').catch(() => {});
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting movie' });
  }
};
