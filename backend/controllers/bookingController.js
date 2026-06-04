import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import { vnpayConfig } from '../config/vnpay.js';

// Helper to sort object by key for VNPay signature
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj){
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// @desc    Get seat status for a showtime (Free, Booked, Holding)
// @route   GET /api/showtimes/:id/seats
// @access  Public
export const getShowtimeSeats = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

    // 1. Get definitely booked seats
    const bookedSeats = showtime.bookedSeats || [];

    // 2. Get seats that are currently being held (pending and not expired)
    const now = new Date();
    const holdingBookings = await Booking.find({
      showtime: showtime._id,
      status: 'pending',
      expiresAt: { $gt: now }
    });

    let holdingSeats = [];
    holdingBookings.forEach(b => {
      holdingSeats = [...holdingSeats, ...b.seats];
    });

    res.json({
      bookedSeats,
      holdingSeats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create Booking & Generate VNPay Payment URL
// @route   POST /api/bookings/create_payment_url
// @access  Private
export const createBookingAndPaymentUrl = async (req, res) => {
  const { showtimeId, seats, totalAmount, bankCode = '' } = req.body;
  const userId = req.user.id; // From protect middleware

  try {
    // 1. Double check if seats are available (Atomic-like check)
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

    // Check booked
    const alreadyBooked = seats.some(seat => (showtime.bookedSeats || []).includes(seat));
    if (alreadyBooked) {
      return res.status(400).json({ message: 'One or more seats are already booked.' });
    }

    // Check holding
    const now = new Date();
    const holdingBookings = await Booking.find({
      showtime: showtimeId,
      status: 'pending',
      expiresAt: { $gt: now }
    });
    
    let holdingSeats = [];
    holdingBookings.forEach(b => { holdingSeats = [...holdingSeats, ...b.seats]; });
    
    const alreadyHolding = seats.some(seat => holdingSeats.includes(seat));
    if (alreadyHolding) {
      return res.status(400).json({ message: 'One or more seats are currently being held by someone else.' });
    }

    // 2. Create Pending Booking (Holds the seat for 5 minutes)
    const expiresAt = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
    
    const newBooking = await Booking.create({
      user: userId,
      showtime: showtimeId,
      seats,
      totalAmount,
      status: 'pending',
      expiresAt
    });

    // 3. Generate VNPay URL
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 req.connection.socket.remoteAddress;

    let tmnCode = vnpayConfig.vnp_TmnCode;
    let secretKey = vnpayConfig.vnp_HashSecret;
    let vnpUrl = vnpayConfig.vnp_Url;
    let returnUrl = vnpayConfig.vnp_ReturnUrl;

    let orderId = newBooking._id.toString();
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan ve xem phim ma ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = totalAmount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl: vnpUrl, bookingId: orderId });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error during booking' });
  }
};

// @desc    Handle VNPay Return IPN/URL
// @route   GET /api/bookings/vnpay_return
// @access  Public
export const vnpayReturn = async (req, res) => {
  let vnp_Params = req.query;

  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = vnpayConfig.vnp_HashSecret;
  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

  if(secureHash === signed){
    // Hợp lệ
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    
    try {
      const booking = await Booking.findById(orderId);
      if (!booking) return res.status(404).json({ message: 'Booking not found', code: '99' });

      if (booking.status === 'paid') {
        // Chống thanh toán đúp
        return res.json({ message: 'Order already paid', code: '00' });
      }

      if (rspCode === '00') {
        // Thanh toán thành công
        booking.status = 'paid';
        booking.paymentId = vnp_Params['vnp_TransactionNo'];
        await booking.save();

        // Đẩy ghế vào Showtime.bookedSeats
        await Showtime.findByIdAndUpdate(booking.showtime, {
          $addToSet: { bookedSeats: { $each: booking.seats } }
        });

        res.json({ message: 'Payment success', code: '00' });
      } else {
        // Thanh toán thất bại
        booking.status = 'failed';
        await booking.save();
        res.json({ message: 'Payment failed', code: rspCode });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error handling VNPay return', code: '99' });
    }
  } else {
    res.status(400).json({ message: 'Invalid signature', code: '97' });
  }
};

// @desc    Get user's tickets (My Tickets)
// @route   GET /api/bookings/my-tickets
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'cinema', select: 'name address' },
          { path: 'theater', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching tickets' });
  }
};
