import express from 'express';
import { getShowtimeSeats, createBookingAndPaymentUrl, vnpayReturn, getMyTickets } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/showtimes/:id/seats', getShowtimeSeats);
router.post('/create_payment_url', protect, createBookingAndPaymentUrl);
router.get('/vnpay_return', vnpayReturn); // For frontend to call when returning
router.get('/my-tickets', protect, getMyTickets);

export default router;
