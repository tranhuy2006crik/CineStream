import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import User from '../models/User.js';
import Package from '../models/Package.js';
import Movie from '../models/Movie.js';
import Voucher from '../models/Voucher.js';
import { vnpayConfig } from '../config/vnpay.js';
import { emitSeatUpdate } from '../socket/seatSocket.js';
import { buildMomoUrl, getClientIp, buildVnpayUrl } from './bookingExtrasController.js';

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
    vnp_Params['vnp_OrderInfo'] = 'BOOKING:Thanh toan ve xem phim ma ' + orderId;
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
    emitSeatUpdate(showtimeId, { action: 'hold', seats });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error during booking' });
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

// ============================================================
//  MODULE 4 TASK 4.2 — PACKAGE SUBSCRIPTION PURCHASE FLOW
// ============================================================

// Helper: Determine highest tier user should have based on allowedTiers
const tierRank = { none: 0, standard: 1, premium: 2, exclusive: 3 };
const computeHighestTier = (allowedTiers = []) => {
  let highest = 'none';
  allowedTiers.forEach(t => {
    if ((tierRank[t] || 0) > tierRank[highest]) highest = t;
  });
  return highest;
};

// @desc    Create Package Purchase + VNPay URL
// @route   POST /api/bookings/packages/create_payment_url
// @access  Private
export const createPackagePaymentUrl = async (req, res) => {
  const { packageId, bankCode = '' } = req.body;
  const userId = req.user.id;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.isActive) return res.status(404).json({ message: 'Package not found or unavailable' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Snapshot package info & create pending subscription entry (embedded in user.subscriptions)
    const durationDays = Number(pkg.durationDays) || 30;
    const expiresAt = new Date(Date.now() + (durationDays * 24 * 60 * 60 * 1000) + (15 * 60 * 1000)); // +15m grace for payment
    const amount = Number(pkg.price) || 0;

    const subEntry = {
      package: pkg._id,
      packageSnapshot: {
        name: pkg.name,
        price: pkg.price,
        durationDays: pkg.durationDays,
        allowedTiers: pkg.allowedTiers || [],
        features: pkg.features || []
      },
      purchasedAt: new Date(),
      expiresAt,
      amount,
      status: 'pending'
    };

    user.subscriptions.push(subEntry);
    await user.save();

    // Order id = the subscription sub-document ID
    const orderId = user.subscriptions[user.subscriptions.length - 1]._id.toString();

    // Build VNPay
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 (req.connection.socket ? req.connection.socket.remoteAddress : '');

    let tmnCode = vnpayConfig.vnp_TmnCode;
    let secretKey = vnpayConfig.vnp_HashSecret;
    let vnpUrl = vnpayConfig.vnp_Url;
    let returnUrl = vnpayConfig.vnp_ReturnUrl;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'PACKAGE:' + pkg.name + ' - ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = Math.round(amount) * 100; // VND x100
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl: vnpUrl, orderId });
  } catch (error) {
    console.error('Package payment error:', error);
    res.status(500).json({ message: 'Server error during package purchase' });
  }
};

// @desc    Activate subscription on user (called after VNPay success)
export const applySubscriptionSuccess = async (user, subscriptionId, transactionNo) => {
  const idx = user.subscriptions.findIndex(s => String(s._id) === String(subscriptionId));
  if (idx === -1) return null;

  const sub = user.subscriptions[idx];
  if (sub.status === 'active') return sub; // Idempotent

  sub.status = 'active';
  sub.paymentId = transactionNo;
  sub.expiresAt = new Date(sub.purchasedAt.getTime() + ((sub.packageSnapshot?.durationDays || 30) * 24 * 60 * 60 * 1000));

  // Upgrade user activePackage/vodTier if this subscription is BETTER than what they currently have
  const newTier = computeHighestTier(sub.packageSnapshot?.allowedTiers || []);
  const currentTier = user.vodTier || 'none';
  if (tierRank[newTier] >= tierRank[currentTier]) {
    user.vodTier = newTier;
    user.activePackage = sub.package;
    // Set expire date to the FARTHEST among active overlapping packages to be user-friendly
    if (!user.packageExpiresAt || sub.expiresAt > user.packageExpiresAt) {
      user.packageExpiresAt = sub.expiresAt;
    }
  } else if (!user.packageExpiresAt || user.packageExpiresAt < sub.expiresAt) {
    user.packageExpiresAt = sub.expiresAt;
  }

  await user.save();
  return sub;
};

// ============================================================
//  MODULE 4 — VOD RENTAL FLOW (Mua phim lẻ)
// ============================================================

const DEFAULT_RENTAL_DURATION_HOURS = 48;

// @desc    Create VOD Rental Purchase + VNPay/MoMo Payment URL
// @route   POST /api/bookings/vod/create_payment_url
// @access  Private
export const createVODRentalPaymentUrl = async (req, res) => {
  const { movieId, bankCode = '', paymentMethod = 'VNPay' } = req.body;
  const userId = req.user.id;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    if (!movie.isVOD && movie.status !== 'VOD') {
      return res.status(400).json({ message: 'Movie is not available for VOD rental' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const rentalPrice = Number(movie.rentalPrice) || 45000;
    const expiresAt = new Date(Date.now() + (DEFAULT_RENTAL_DURATION_HOURS * 60 * 60 * 1000) + (15 * 60 * 1000));

    const method = String(paymentMethod).toUpperCase() === 'MOMO' ? 'Momo' : 'VNPay';

    const rentalEntry = {
      movie: movie._id,
      movieSnapshot: {
        title: movie.title,
        poster: movie.poster,
        rentalPrice
      },
      purchasedAt: new Date(),
      expiresAt,
      amount: rentalPrice,
      paymentMethod: method,
      status: 'pending'
    };

    user.vodRentals.push(rentalEntry);
    await user.save();

    const orderId = user.vodRentals[user.vodRentals.length - 1]._id.toString();
    const ipAddr = getClientIp(req);
    const orderInfo = 'VOD-RENT:' + orderId + ' - ' + (movie.title || movieId);

    let paymentUrl;
    if (method === 'Momo') {
      paymentUrl = await buildMomoUrl(orderId, rentalPrice, orderInfo);
    } else {
      const returnUrl = vnpayConfig.vnp_ReturnUrl;
      paymentUrl = buildVnpayUrl(orderId, rentalPrice, orderInfo, returnUrl, ipAddr, bankCode);
    }

    res.json({ paymentUrl, orderId });
  } catch (error) {
    console.error('VOD rental payment error:', error);
    res.status(500).json({ message: 'Server error during VOD rental' });
  }
};

export const applyVODRentalSuccess = async (user, rentalId, transactionNo) => {
  const idx = user.vodRentals.findIndex(r => String(r._id) === String(rentalId));
  if (idx === -1) return null;
  const rental = user.vodRentals[idx];
  if (rental.status === 'active') return rental;
  rental.status = 'active';
  rental.paymentId = transactionNo;
  rental.expiresAt = new Date(rental.purchasedAt.getTime() + (DEFAULT_RENTAL_DURATION_HOURS * 60 * 60 * 1000));
  await user.save();
  return rental;
};

// ============================================================
//  MODULE 4 — VNPay RETURN MULTIPLEXER (Booking / Package / VOD)
// ============================================================

// @desc    Handle VNPay Return IPN/URL — SMART DISPATCHER
// @route   GET /api/bookings/vnpay_return
// @access  Public
export const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const secureHash = String(vnp_Params['vnp_SecureHash'] || '');

    delete vnp_Params['gateway'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = sortObject(vnp_Params);
    const secretKey = vnpayConfig.vnp_HashSecret;
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    console.log('VNPay return raw query:', req.query);
    console.log('VNPay return cleaned params:', sortedParams);
    console.log('VNPay secureHash (from VNPay):', secureHash);
    console.log('VNPay computed signature:', signed);

    if (secureHash !== signed) {
      console.error('VNPay signature mismatch', { secureHash, signed, rawQuery: req.query });
      return res.status(400).json({ message: 'Invalid signature', code: '97' });
    }

    const orderId = sortedParams['vnp_TxnRef'];
    const rspCode = sortedParams['vnp_ResponseCode'];
    const txnNo = sortedParams['vnp_TransactionNo'];

    // ---------- 1) Try as CINEMA SEAT BOOKING ----------
    try {
      const booking = await Booking.findById(orderId);
      if (booking) {
        if (booking.status === 'paid') {
          return res.json({ message: 'Order already paid', code: '00', type: 'booking' });
        }
        if (rspCode === '00') {
          booking.status = 'paid';
          booking.paymentId = txnNo;
          await booking.save();
          await Showtime.findByIdAndUpdate(booking.showtime, {
            $addToSet: { bookedSeats: { $each: booking.seats } }
          });
          if (booking.voucherCode) {
            await Voucher.findOneAndUpdate({ code: booking.voucherCode }, { $inc: { usedCount: 1 } });
          }
          const showtime = await Showtime.findById(booking.showtime);
          const now = new Date();
          const holdingBookings = await Booking.find({ showtime: booking.showtime, status: 'pending', expiresAt: { $gt: now } });
          let holdingSeats = [];
          holdingBookings.forEach(b => { holdingSeats = [...holdingSeats, ...b.seats]; });
          emitSeatUpdate(booking.showtime, { bookedSeats: showtime?.bookedSeats || [], holdingSeats });
          return res.json({ message: 'Payment success', code: '00', type: 'booking' });
        } else {
          booking.status = 'failed';
          await booking.save();
          return res.json({ message: 'Payment failed', code: rspCode, type: 'booking' });
        }
      }
    } catch (err) {
      console.error('Booking VNPay dispatcher err:', err);
    }

    // ---------- 2) Try as PACKAGE SUBSCRIPTION (search all users.subscriptions[]._id) ----------
    try {
      const userWithSub = await User.findOne({ 'subscriptions._id': orderId });
      if (userWithSub) {
        if (rspCode === '00') {
          const activated = await applySubscriptionSuccess(userWithSub, orderId, txnNo);
          return res.json({ 
            message: activated ? 'Package activation success' : 'Already processed', 
            code: '00', 
            type: 'package' 
          });
        } else {
          const idx = userWithSub.subscriptions.findIndex(s => String(s._id) === String(orderId));
          if (idx !== -1 && userWithSub.subscriptions[idx].status === 'pending') {
            userWithSub.subscriptions[idx].status = 'failed';
            await userWithSub.save();
          }
          return res.json({ message: 'Package payment failed', code: rspCode, type: 'package' });
        }
      }
    } catch (err) {
      console.error('Package VNPay dispatcher err:', err);
    }

    // ---------- 3) Try as VOD RENTAL (search all users.vodRentals[]._id) ----------
    try {
      const userWithRental = await User.findOne({ 'vodRentals._id': orderId });
      if (userWithRental) {
        if (rspCode === '00') {
          const activated = await applyVODRentalSuccess(userWithRental, orderId, txnNo);
          return res.json({ 
            message: activated ? 'VOD rental activation success' : 'Already processed', 
            code: '00', 
            type: 'vod_rental' 
          });
        } else {
          const idx = userWithRental.vodRentals.findIndex(r => String(r._id) === String(orderId));
          if (idx !== -1 && userWithRental.vodRentals[idx].status === 'pending') {
            userWithRental.vodRentals[idx].status = 'failed';
            await userWithRental.save();
          }
          return res.json({ message: 'VOD rental payment failed', code: rspCode, type: 'vod_rental' });
        }
      }
    } catch (err) {
      console.error('VOD Rental VNPay dispatcher err:', err);
    }

    // 4) No match
    return res.status(404).json({ message: 'Order not found', code: '99' });
  } catch (err) {
    console.error('VNPay return handler error:', err);
    return res.status(500).json({ message: 'Internal Server Error', code: '50' });
  }
};

// ============================================================
//  MODULE 4 — USER SUBSCRIPTION INFO + VOD ACCESS CHECK
// ============================================================

// @desc    Get user subscription status (active package, tier, rentals, subscription history)
// @route   GET /api/bookings/my-subscription
// @access  Private
export const getMySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('activePackage', 'name price durationDays allowedTiers features isPopular maxResolution');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Auto-expire: if packageExpiresAt is past, reset vodTier if applicable
    let needsSave = false;
    if (user.packageExpiresAt && user.packageExpiresAt < new Date()) {
      user.activePackage = null;
      user.packageExpiresAt = null;
      user.vodTier = 'none';
      needsSave = true;
    }
    // Mark expired subscriptions in history
    user.subscriptions.forEach(s => {
      if (s.status === 'active' && s.expiresAt < new Date()) {
        s.status = 'expired';
        needsSave = true;
      }
    });
    user.vodRentals.forEach(r => {
      if (r.status === 'active' && r.expiresAt < new Date()) {
        r.status = 'expired';
        needsSave = true;
      }
    });
    if (needsSave) await user.save();

    res.json({
      activePackage: user.activePackage,
      packageExpiresAt: user.packageExpiresAt,
      vodTier: user.vodTier,
      subscriptions: user.subscriptions,
      vodRentals: user.vodRentals
    });
  } catch (error) {
    console.error('getMySubscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if user can watch a VOD movie (package tier OR active rental)
// @route   GET /api/movies/:id/check-access
// @access  Private
export const checkVODAccess = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ access: false, reason: 'Movie not found' });

    // For non-VOD movies, no access
    if (!(movie.isVOD || movie.status === 'VOD')) {
      return res.json({ access: false, reason: 'Movie is not VOD' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ access: false, reason: 'Unauthenticated' });

    // Expire-check inline
    if (user.packageExpiresAt && user.packageExpiresAt < new Date()) {
      user.vodTier = 'none';
      user.activePackage = null;
      user.packageExpiresAt = null;
      await user.save();
    }

    const now = new Date();
    const tierOkay = tierRank[user.vodTier || 'none'] >= tierRank[movie.vodTier || 'standard'];

    const activeRental = user.vodRentals.find(r =>
      String(r.movie) === String(movie._id) &&
      r.status === 'active' &&
      r.expiresAt > now
    );

    let accessReason = null;
    if (tierOkay) accessReason = 'package';
    else if (activeRental) accessReason = 'rental';

    return res.json({
      access: !!(tierOkay || activeRental),
      accessType: accessReason,
      requiredTier: movie.vodTier || 'standard',
      userTier: user.vodTier || 'none',
      rentalPrice: Number(movie.rentalPrice) || 45000,
      remainingRentalHours: activeRental ? Math.max(0, Math.round((activeRental.expiresAt - now) / 3600000)) : 0,
      vodVideoUrl: (tierOkay || activeRental) ? (movie.vodVideoUrl || '') : null
    });
  } catch (error) {
    console.error('checkVODAccess error:', error);
    res.status(500).json({ access: false, reason: 'Server error' });
  }
};
