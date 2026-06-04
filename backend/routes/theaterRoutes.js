import express from 'express';
import { getTheatersByCinema, getTheaterById, createTheater, updateTheaterMap, updateTheater, deleteTheater } from '../controllers/theaterController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/cinema/:cinemaId', getTheatersByCinema);
router.get('/:id', getTheaterById);

// Admin and Staff can manage theaters
router.post('/', protect, authorize('admin', 'staff'), createTheater);
router.put('/:id/map', protect, authorize('admin', 'staff'), updateTheaterMap);
router.put('/:id/info', protect, authorize('admin', 'staff'), updateTheater);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteTheater);

export default router;
