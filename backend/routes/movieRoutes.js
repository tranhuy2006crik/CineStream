import express from 'express';
import { getAllMovies, createMovie, getMovieById, deleteMovie } from '../controllers/movieController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload, uploadVideo } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getAllMovies);
router.get('/:id', getMovieById);

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

router.delete('/:id', protect, authorize('admin'), deleteMovie);

export default router;
