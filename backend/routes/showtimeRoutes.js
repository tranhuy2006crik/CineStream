import express from 'express';
import { getShowtimes, getShowtimeById, createShowtime, updateShowtime, deleteShowtime } from '../controllers/showtimeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getShowtimes)
  .post(protect, authorize('admin'), createShowtime);

router.route('/:id')
  .get(getShowtimeById)
  .put(protect, authorize('admin'), updateShowtime)
  .delete(protect, authorize('admin'), deleteShowtime);

export default router;
