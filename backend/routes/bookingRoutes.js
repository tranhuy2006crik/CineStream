import express from 'express';
import { 
  getShowtimeSeats, 
  createBookingAndPaymentUrl, 
  vnpayReturn, 
  getMyTickets,
  createPackagePaymentUrl,
  createVODRentalPaymentUrl,
  getMySubscription
} from '../controllers/bookingController.js';
import {
  holdSeats,
  getBookingById,
  checkoutBooking,
  getAllBookings,
  checkInBooking,
  momoReturn
} from '../controllers/bookingExtrasController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Static routes MUST come before /:id
router.get('/showtimes/:id/seats', getShowtimeSeats);
router.get('/my-tickets', protect, getMyTickets);
router.get('/my-subscription', protect, getMySubscription);
router.get('/vnpay_return', vnpayReturn);
router.get('/momo_return', momoReturn);
router.get('/momo_ipn', (req, res) => res.json({ success: true, message: 'MoMo IPN received' }));
router.post('/momo_ipn', (req, res) => res.json({ resultCode: 0, message: 'MoMo IPN received' }));
router.get('/admin/all', protect, authorize('admin', 'staff'), getAllBookings);

router.post('/hold', protect, holdSeats);
router.post('/create_payment_url', protect, createBookingAndPaymentUrl);
router.post('/packages/create_payment_url', protect, createPackagePaymentUrl);
router.post('/vod/create_payment_url', protect, createVODRentalPaymentUrl);

// Dynamic /:id routes last
router.get('/:id', protect, getBookingById);
router.post('/:id/checkout', protect, checkoutBooking);
router.post('/:id/check-in', protect, authorize('admin', 'staff'), checkInBooking);

export default router;
