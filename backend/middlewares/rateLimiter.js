import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate limiter chung - giới hạn 100 request/15 phút cho mỗi IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 request
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút!'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req);
  }
});

/**
 * Rate limiter cho API review - stricter hơn (chỉ cho 5 review/ngày cho mỗi user/IP)
 */
export const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 ngày
  max: 5, // Tối đa 5 request tạo/sửa/xóa review/ngày
  message: {
    success: false,
    message: 'Bạn đã đạt giới hạn đánh giá cho hôm nay (tối đa 5 đánh giá/ngày)!'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Nếu đã đăng nhập, dùng userId làm key, còn không dùng IP
    return req.user?._id?.toString() || ipKeyGenerator(req);
  }
});
