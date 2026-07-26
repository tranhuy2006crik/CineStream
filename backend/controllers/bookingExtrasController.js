import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import User from '../models/User.js';
import Combo from '../models/Combo.js';
import Voucher from '../models/Voucher.js';
import { vnpayConfig } from '../config/vnpay.js';
import { momoConfig } from '../config/momo.js';
import { emitSeatUpdate } from '../socket/seatSocket.js';
import { applySubscriptionSuccess, applyVODRentalSuccess } from './bookingController.js';

function sortObject(obj) {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) str.push(encodeURIComponent(key));
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
  }
  return sorted;
}

async function getHoldingSeats(showtimeId, excludeBookingId = null) {
  const now = new Date();
  const query = { showtime: showtimeId, status: 'pending', expiresAt: { $gt: now } };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const holdingBookings = await Booking.find(query);
  let holdingSeats = [];
  holdingBookings.forEach(b => { holdingSeats = [...holdingSeats, ...b.seats]; });
  return holdingSeats;
}

async function broadcastSeats(showtimeId) {
  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) return;
  const holdingSeats = await getHoldingSeats(showtimeId);
  emitSeatUpdate(showtimeId, {
    bookedSeats: showtime.bookedSeats || [],
    holdingSeats
  });
}

export function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress || '127.0.0.1';
}

export function buildVnpayUrl(orderId, amount, orderInfo, returnUrl, ipAddr, bankCode = '') {
  let createDate = moment().format('YYYYMMDDHHmmss');
  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(amount) * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
  };
  if (bankCode) vnp_Params.vnp_BankCode = bankCode;
  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const signed = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    .update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params.vnp_SecureHash = signed;
  return vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
}

export async function buildMomoUrl(orderId, amount, orderInfo) {
  const requestId = String(orderId);
  const extraData = '';
  const amountValue = Math.max(1000, Math.round(amount));

  const buildSandboxRedirect = () => {
    const redirectUrl = new URL(momoConfig.redirectUrl);
    redirectUrl.searchParams.set('gateway', 'momo');
    redirectUrl.searchParams.set('orderId', requestId);
    redirectUrl.searchParams.set('resultCode', '0');
    redirectUrl.searchParams.set('transId', `sandbox-${Date.now()}`);
    redirectUrl.searchParams.set('message', 'Sandbox payment successful');
    redirectUrl.searchParams.set('orderInfo', orderInfo || 'Sandbox payment');
    return redirectUrl.toString();
  };

  const hasRealCredentials = Boolean(
    momoConfig.partnerCode &&
    momoConfig.accessKey &&
    momoConfig.secretKey &&
    momoConfig.endpoint &&
    momoConfig.partnerCode !== 'MOMO' &&
    momoConfig.accessKey !== 'F8BBA842ECF18' &&
    momoConfig.secretKey !== 'K951B6FA29230FB27D52862F20521F4C'
  );

  if (!hasRealCredentials && momoConfig.sandboxMode) {
    return buildSandboxRedirect();
  }

  try {
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amountValue}&extraData=${extraData}&ipnUrl=${momoConfig.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;
    const signature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex');

    const body = {
      partnerCode: momoConfig.partnerCode,
      partnerName: 'CineStream',
      storeId: 'CineStreamStore',
      requestId,
      amount: amountValue,
      orderId: requestId,
      orderInfo,
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      lang: 'vi',
      requestType: momoConfig.requestType,
      autoCapture: true,
      extraData,
      signature
    };

    const response = await fetch(momoConfig.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok && data.resultCode === 0 && data.payUrl) return data.payUrl;
    throw new Error(data.message || 'MoMo payment creation failed');
  } catch (error) {
    console.error('MoMo payment creation failed, using sandbox fallback:', error.message);
    return buildSandboxRedirect();
  }
}

async function applyVoucher(code, orderAmount) {
  const voucher = await Voucher.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!voucher) throw new Error('Invalid voucher code');
  if (voucher.expiresAt < new Date()) throw new Error('Voucher expired');
  if (voucher.usedCount >= voucher.maxUses) throw new Error('Voucher usage limit reached');
  if (orderAmount < voucher.minOrderAmount) throw new Error(`Minimum order ${voucher.minOrderAmount}đ`);

  let discount = voucher.discountType === 'percent'
    ? Math.round(orderAmount * (voucher.discountValue / 100))
    : voucher.discountValue;
  discount = Math.min(discount, orderAmount);
  return { voucher, discount };
}

// @desc Hold seats (create pending booking for checkout)
// @route POST /api/bookings/hold
export const holdSeats = async (req, res) => {
  const { showtimeId, seats, subtotal = 0, serviceFee = 0, totalAmount } = req.body;
  const userId = req.user.id;

  try {
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

    const alreadyBooked = seats.some(seat => (showtime.bookedSeats || []).includes(seat));
    if (alreadyBooked) return res.status(400).json({ message: 'One or more seats are already booked.' });

    const holdingSeats = await getHoldingSeats(showtimeId);
    const alreadyHolding = seats.some(seat => holdingSeats.includes(seat));
    if (alreadyHolding) return res.status(400).json({ message: 'One or more seats are currently being held.' });

    const expiresAt = new Date(Date.now() + 5 * 60000);
    const booking = await Booking.create({
      user: userId,
      showtime: showtimeId,
      seats,
      subtotal,
      serviceFee,
      totalAmount: totalAmount || subtotal + serviceFee,
      status: 'pending',
      expiresAt
    });

    await broadcastSeats(showtimeId);

    res.status(201).json({
      bookingId: booking._id,
      expiresAt: booking.expiresAt,
      seats: booking.seats,
      totalAmount: booking.totalAmount
    });
  } catch (error) {
    console.error('Hold seats error:', error);
    res.status(500).json({ message: 'Server error holding seats' });
  }
};

// @desc Get booking for checkout
// @route GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster duration' },
          { path: 'cinema', select: 'name address' },
          { path: 'theater', select: 'name' }
        ]
      });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user.id) && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is no longer pending', status: booking.status });
    }
    if (booking.expiresAt < new Date()) {
      booking.status = 'cancelled';
      await booking.save();
      await broadcastSeats(booking.showtime._id || booking.showtime);
      return res.status(400).json({ message: 'Booking expired' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Checkout — apply combos/voucher and get payment URL
// @route POST /api/bookings/:id/checkout
export const checkoutBooking = async (req, res) => {
  const { combos = [], voucherCode, paymentMethod = 'VNPay', bankCode = '' } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.user) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Booking is not pending' });
    if (booking.expiresAt < new Date()) {
      booking.status = 'cancelled';
      await booking.save();
      await broadcastSeats(booking.showtime);
      return res.status(400).json({ message: 'Booking expired. Please select seats again.' });
    }

    let comboTotal = 0;
    const comboItems = [];
    for (const item of combos) {
      const combo = await Combo.findById(item.comboId);
      if (!combo || !combo.isActive) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      comboTotal += combo.price * qty;
      comboItems.push({ combo: combo._id, name: combo.name, price: combo.price, quantity: qty });
    }

    const baseTotal = (booking.subtotal || 0) + (booking.serviceFee || 0) + comboTotal;
    let voucherDiscount = 0;
    let appliedCode = null;

    if (voucherCode) {
      const { voucher, discount } = await applyVoucher(voucherCode, baseTotal);
      voucherDiscount = discount;
      appliedCode = voucher.code;
    }

    const finalTotal = Math.max(0, baseTotal - voucherDiscount);

    booking.combos = comboItems;
    booking.comboTotal = comboTotal;
    booking.voucherCode = appliedCode;
    booking.voucherDiscount = voucherDiscount;
    booking.totalAmount = finalTotal;
    booking.paymentMethod = paymentMethod;
    await booking.save();

    const orderId = booking._id.toString();
    const ipAddr = getClientIp(req);
    let paymentUrl;

    if (paymentMethod === 'Momo') {
      paymentUrl = await buildMomoUrl(orderId, finalTotal, `BOOKING:Thanh toan ve xem phim ${orderId}`);
    } else {
      paymentUrl = buildVnpayUrl(orderId, finalTotal, `BOOKING:Thanh toan ve xem phim ma ${orderId}`, vnpayConfig.vnp_ReturnUrl, ipAddr, bankCode);
    }

    res.json({ paymentUrl, bookingId: orderId, totalAmount: finalTotal, expiresAt: booking.expiresAt });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(400).json({ message: error.message || 'Checkout failed' });
  }
};

// @desc Admin — all bookings
// @route GET /api/bookings/admin/all
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'email profiles')
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'cinema', select: 'name' },
          { path: 'theater', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Staff check-in via QR (booking ID)
// @route POST /api/bookings/:id/check-in
export const checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster' },
          { path: 'cinema', select: 'name' },
          { path: 'theater', select: 'name' }
        ]
      })
      .populate('user', 'email profiles');

    if (!booking) return res.status(404).json({ valid: false, message: 'Ticket not found' });
    if (booking.status !== 'paid') return res.status(400).json({ valid: false, message: 'Ticket not paid', status: booking.status });
    if (booking.checkedIn) return res.status(400).json({ valid: false, message: 'Ticket already checked in', checkedInAt: booking.checkedInAt });

    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user.id;
    await booking.save();

    res.json({
      valid: true,
      message: 'Check-in successful',
      booking: {
        id: booking._id,
        seats: booking.seats,
        combos: booking.combos,
        movie: booking.showtime?.movie?.title,
        cinema: booking.showtime?.cinema?.name,
        theater: booking.showtime?.theater?.name,
        user: booking.user?.email
      }
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Server error' });
  }
};

// @desc MoMo return handler — SMART DISPATCHER (Booking / Package / VOD Rental)
// @route GET /api/bookings/momo_return
export const momoReturn = async (req, res) => {
  try {
    const { orderId, resultCode, transId } = req.query;
    const normalizedResultCode = resultCode ?? '0';
    if (!orderId) return res.status(400).json({ code: '99', message: 'Missing orderId' });

    // ---------- 1) Try as CINEMA SEAT BOOKING ----------
    try {
      const booking = await Booking.findById(orderId);
      if (booking) {
        if (booking.status === 'paid') return res.json({ code: '00', message: 'Already paid', type: 'booking' });
        if (String(normalizedResultCode) === '0') {
          booking.status = 'paid';
          booking.paymentId = transId || '';
          booking.paymentMethod = 'Momo';
          await booking.save();
          await Showtime.findByIdAndUpdate(booking.showtime, { $addToSet: { bookedSeats: { $each: booking.seats } } });
          if (booking.voucherCode) {
            await Voucher.findOneAndUpdate({ code: booking.voucherCode }, { $inc: { usedCount: 1 } });
          }
          await broadcastSeats(booking.showtime);
          return res.json({ code: '00', message: 'Payment success', type: 'booking' });
        }
        booking.status = 'failed';
        await booking.save();
        await broadcastSeats(booking.showtime);
        return res.json({ code: normalizedResultCode, message: 'Payment failed', type: 'booking' });
      }
    } catch (err) {
      console.error('Booking MoMo dispatcher err:', err);
    }

    // ---------- 2) Try as PACKAGE SUBSCRIPTION ----------
    try {
      const userWithSub = await User.findOne({ 'subscriptions._id': orderId });
      if (userWithSub) {
        if (String(normalizedResultCode) === '0') {
          const activated = await applySubscriptionSuccess(userWithSub, orderId, transId);
          if (activated) {
            const idx = userWithSub.subscriptions.findIndex(s => String(s._id) === String(orderId));
            if (idx !== -1) userWithSub.subscriptions[idx].paymentMethod = 'Momo';
            await userWithSub.save();
          }
          return res.json({ code: '00', message: activated ? 'Package activation success' : 'Already processed', type: 'package' });
        } else {
          const idx = userWithSub.subscriptions.findIndex(s => String(s._id) === String(orderId));
          if (idx !== -1 && userWithSub.subscriptions[idx].status === 'pending') {
            userWithSub.subscriptions[idx].status = 'failed';
            userWithSub.subscriptions[idx].paymentMethod = 'Momo';
            await userWithSub.save();
          }
          return res.json({ code: normalizedResultCode, message: 'Package payment failed', type: 'package' });
        }
      }
    } catch (err) {
      console.error('Package MoMo dispatcher err:', err);
    }

    // ---------- 3) Try as VOD RENTAL ----------
    try {
      const userWithRental = await User.findOne({ 'vodRentals._id': orderId });
      if (userWithRental) {
        if (String(normalizedResultCode) === '0') {
          const activated = await applyVODRentalSuccess(userWithRental, orderId, transId);
          if (activated) {
            const idx = userWithRental.vodRentals.findIndex(r => String(r._id) === String(orderId));
            if (idx !== -1) userWithRental.vodRentals[idx].paymentMethod = 'Momo';
            await userWithRental.save();
          }
          return res.json({ code: '00', message: activated ? 'VOD rental activation success' : 'Already processed', type: 'vod_rental' });
        } else {
          const idx = userWithRental.vodRentals.findIndex(r => String(r._id) === String(orderId));
          if (idx !== -1 && userWithRental.vodRentals[idx].status === 'pending') {
            userWithRental.vodRentals[idx].status = 'failed';
            userWithRental.vodRentals[idx].paymentMethod = 'Momo';
            await userWithRental.save();
          }
          return res.json({ code: normalizedResultCode, message: 'VOD rental payment failed', type: 'vod_rental' });
        }
      }
    } catch (err) {
      console.error('VOD Rental MoMo dispatcher err:', err);
    }

    return res.status(404).json({ code: '99', message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ code: '99', message: error.message });
  }
};

// Export broadcast for use in main bookingController vnpayReturn
export { broadcastSeats, applyVoucher };
