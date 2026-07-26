import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are private
router.route('/')
  .get(protect, getFavorites);

router.route('/:movieId')
  .post(protect, addFavorite)
  .delete(protect, removeFavorite);

export default router;
