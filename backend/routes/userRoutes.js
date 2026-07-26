import express from 'express';
import { 
  getUsers, 
  createUser, 
  assignCinema, 
  unassignCinema, 
  getStaffByCinema,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, authorize('admin'), getUsers);

// Create a new user (Staff/Admin) (Admin only)
router.post('/', protect, authorize('admin'), createUser);

// Get staff for a specific cinema (Admin and Staff can view)
router.get('/staff/cinema/:cinemaId', protect, authorize('admin', 'staff'), getStaffByCinema);

// Assign/Unassign staff to cinema (Admin only)
router.put('/:userId/assign-cinema', protect, authorize('admin'), assignCinema);
router.put('/:userId/unassign-cinema', protect, authorize('admin'), unassignCinema);

// Update & Delete user (Admin only)
router.put('/:userId', protect, authorize('admin'), updateUser);
router.delete('/:userId', protect, authorize('admin'), deleteUser);

export default router;
