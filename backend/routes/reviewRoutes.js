import express from 'express';
import { getReviewsForMovie, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { reviewLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/movie/:movieId', getReviewsForMovie);

// Private routes (with rate limit)
router.post('/', protect, reviewLimiter, createReview);
router.put('/:id', protect, reviewLimiter, updateReview);
router.delete('/:id', protect, reviewLimiter, deleteReview);

export default router;
