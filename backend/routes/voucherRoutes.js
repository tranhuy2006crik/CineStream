import express from 'express';
import { validateVoucher, getVouchers, createVoucher, updateVoucher, deleteVoucher } from '../controllers/voucherController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/validate', validateVoucher);
router.get('/', protect, authorize('admin'), getVouchers);
router.post('/', protect, authorize('admin'), createVoucher);
router.put('/:id', protect, authorize('admin'), updateVoucher);
router.delete('/:id', protect, authorize('admin'), deleteVoucher);

export default router;
