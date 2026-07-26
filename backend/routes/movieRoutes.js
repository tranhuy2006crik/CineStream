import express from 'express';
import { getAllMovies, createMovie, getMovieById, updateMovie, deleteMovie, getRelatedMovies, getRecommendations } from '../controllers/movieController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload, uploadVideo } from '../config/cloudinary.js';
import { checkVODAccess } from '../controllers/bookingController.js';
import { cacheMiddleware } from '../config/cache.js';

const router = express.Router();

router.get('/', cacheMiddleware('movies', 300), getAllMovies);
router.get('/recommendations/for-me', protect, getRecommendations);
router.get('/:id', getMovieById);
router.get('/:id/related', getRelatedMovies);

// VOD Access Check - kiểm tra user có được xem phim VOD này không (package tier hoặc rental)
router.get('/:id/check-access', protect, checkVODAccess);

// Video Upload Route (For VOD)
router.post(
  '/upload-video',
  protect,
  authorize('admin'),
  uploadVideo.single('video'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }
    res.status(200).json({ 
      message: 'Video uploaded successfully', 
      url: req.file.path 
    });
  }
);

// Admin routes
router.post(
  '/', 
  protect, 
  authorize('admin'), 
  upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), 
  createMovie
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'banner', maxCount: 1 }]),
  updateMovie
);

router.delete('/:id', protect, authorize('admin'), deleteMovie);

export default router;
