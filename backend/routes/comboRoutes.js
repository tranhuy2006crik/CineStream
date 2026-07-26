import express from 'express';
import { getCombos, getAllCombosAdmin, createCombo, updateCombo, deleteCombo } from '../controllers/comboController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCombos);
router.get('/admin/all', protect, authorize('admin', 'staff'), getAllCombosAdmin);
router.post('/', protect, authorize('admin'), createCombo);
router.put('/:id', protect, authorize('admin'), updateCombo);
router.delete('/:id', protect, authorize('admin'), deleteCombo);

export default router;
