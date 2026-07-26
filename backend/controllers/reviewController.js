import Review from '../models/Review.js';
import Movie from '../models/Movie.js';

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
export const getReviewsForMovie = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ user: req.user._id, movie: movieId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    const review = new Review({
      user: req.user._id,
      movie: movieId,
      rating,
      comment
    });

    await review.save();

    // Recalculate average rating for movie
    const movie = await Movie.findById(movieId);
    if (movie) {
      await movie.calculateAverageRating();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment !== undefined ? req.body.comment : review.comment;
    
    await review.save();

    // Recalculate average rating for movie
    const movie = await Movie.findById(review.movie);
    if (movie) {
      await movie.calculateAverageRating();
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const movieId = review.movie;
    await review.deleteOne();

    // Recalculate average rating for movie
    const movie = await Movie.findById(movieId);
    if (movie) {
      await movie.calculateAverageRating();
    }

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
