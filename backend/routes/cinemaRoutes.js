import express from 'express';
import { getAllCinemas, createCinema, updateCinema, deleteCinema } from '../controllers/cinemaController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET all cinemas is public (or protect if you want only logged in users to see them)
router.get('/', getAllCinemas);

// POST create cinema is Admin only
router.post('/', protect, authorize('admin'), createCinema);

// PUT update cinema is Admin only
router.put('/:id', protect, authorize('admin'), updateCinema);

// DELETE cinema is Admin only
router.delete('/:id', protect, authorize('admin'), deleteCinema);

export default router;
