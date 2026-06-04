import express from 'express';
import { 
  getAllPackages, 
  getPackageById, 
  createPackage, 
  updatePackage, 
  deletePackage 
} from '../controllers/packageController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllPackages)
  .post(protect, authorize('admin'), createPackage);

router.route('/:id')
  .get(getPackageById)
  .put(protect, authorize('admin'), updatePackage)
  .delete(protect, authorize('admin'), deletePackage);

export default router;
