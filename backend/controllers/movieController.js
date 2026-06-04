import Movie from '../models/Movie.js';

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
export const getAllMovies = async (req, res) => {
  try {
    const { status, isVOD } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (isVOD === 'true') query.isVOD = true;
    if (isVOD === 'false') query.isVOD = false;

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json(movies);
  } catch (error) {
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
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching movie' });
  }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res) => {
  try {
    const { 
      title, director, duration, releaseDate, description, 
      status, isVOD, vodTier, rentalPrice, trailerUrl, vodVideoUrl 
    } = req.body;

    let poster = '';
    let banner = '';

    if (req.files) {
      if (req.files.poster) poster = req.files.poster[0].path;
      if (req.files.banner) banner = req.files.banner[0].path;
    }

    const movie = await Movie.create({
      title, director, duration: Number(duration), releaseDate, description,
      status, trailerUrl,
      isVOD: isVOD === 'true' || isVOD === true,
      vodTier,
      rentalPrice: Number(rentalPrice) || 0,
      vodVideoUrl,
      poster, banner
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating movie' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting movie' });
  }
};
