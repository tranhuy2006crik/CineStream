import Voucher from '../models/Voucher.js';

export const validateVoucher = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Voucher code required' });

    const voucher = await Voucher.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!voucher) return res.json({ valid: false, message: 'Invalid voucher code' });
    if (voucher.expiresAt < new Date()) return res.json({ valid: false, message: 'Voucher expired' });
    if (voucher.usedCount >= voucher.maxUses) return res.json({ valid: false, message: 'Voucher usage limit reached' });
    if (orderAmount < voucher.minOrderAmount) {
      return res.json({ valid: false, message: `Minimum order ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ` });
    }

    let discount = 0;
    if (voucher.discountType === 'percent') {
      discount = Math.round(orderAmount * (voucher.discountValue / 100));
    } else {
      discount = voucher.discountValue;
    }
    discount = Math.min(discount, orderAmount);

    res.json({
      valid: true,
      code: voucher.code,
      discount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      description: voucher.description
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
};

export const getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json({ message: 'Voucher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
