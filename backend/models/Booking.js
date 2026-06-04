import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
  seats: [{
    type: String, // e.g. 'A1', 'A2'
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['VNPay', 'Momo'],
    default: 'VNPay'
  },
  paymentId: {
    type: String, // transaction ID from VNPay
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// TTL Index: Tự động xóa hoặc báo hết hạn các booking pending sau 5 phút nếu MongoDB hỗ trợ TTL trực tiếp (ở đây ta tự check logic thay vì xóa hẳn document để giữ lịch sử)
// bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'pending' } });
// Lưu ý: Thay vì để MongoDB xóa cmn mất đơn hàng pending, ta giữ lại để tra cứu lỗi. 
// Việc "hết hạn" sẽ được xử lý bằng logic lúc query (VD: lấy các ghế đang khóa = Booking pending + expiresAt > Date.now())

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
