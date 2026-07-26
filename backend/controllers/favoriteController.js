import User from '../models/User.js';
import Movie from '../models/Movie.js';

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add movie to favorites
// @route   POST /api/favorites/:movieId
// @access  Private
export const addFavorite = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if already in favorites
    if (user.favorites.includes(req.params.movieId)) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    user.favorites.push(req.params.movieId);
    await user.save();
    
    // Return updated favorites
    await user.populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/favorites/:movieId
// @access  Private
export const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Remove movie from favorites
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.movieId);
    await user.save();
    
    // Return updated favorites
    await user.populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
