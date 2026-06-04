import express from 'express';
import { register, login, getMe, createProfile, socialLogin } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/social-login', socialLogin);
router.get('/me', protect, getMe);
router.post('/profile', protect, createProfile);

export default router;
