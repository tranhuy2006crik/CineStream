import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  role: {
    type: String,
    enum: ['user', 'staff', 'admin'],
    default: 'user'
  },
  cinemaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    default: null
  },
  profiles: {
    type: [profileSchema],
    default: [
      {
        name: 'Alex',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoaxqDa9tiqBwh_IIwp1iuzBLGZObCw1YDPCnt1mxTpqaQRGseQzZMzzsQWZW_7ZF-DMfuQgH--xJUcaONEpYIeQM7kPxjeF0DqxczdVOMQP3uGkR1RAC3XwDIR_G98WuDmL-kwVhVJ_W4Wb1mBT4CdiZ9tR4RGh3aOdQmaN5zwBOkuLi2z71oWkft-AHJv_A0BipjD9Bpe-kAU4CJ1hu6z9hvf66t04nlwu5BiC-DGFiTCCWDq93-F2fyzPeEol1nCPfrTPG5OBs',
      },
      {
        name: 'Sam',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm2yBKwJxcjMwvbpi5tZjXY-CThB92pnuc7tYt62ZmbjspAQwnx3aspKWqhOZyI1X3YxTiw28NBsosKqgiYe6jJSqzoxPXAg_xv-HxGgMfGGxYUxlm_04CoPrwXaorhe_01NKmiDB1i8se6jjGc_tDUSmdTdFtzsB6ZqzTssqS82NC7c4X8e8PQQakOnwO9A3H9tFbhVPvpBXcH3zGp-jCoWBSU47U0feRWl7m8GnDajZbKfr6tGBAxofzIbjE8YtbyfMjRpsmwqc',
      },
      {
        name: 'Guest',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOdW-FiudtRQGcMp8aUUXFqRzLOFikSjHssghPKt6r2trbkDjplnMyaMcXcjs7gz-fx3XDUtonBZfpKBKVhote08zzdX-aXQwv73-HS4_zUM1R6G4kmZRL6ill0kGL_v-tzxF4i_sRlbpjVsZLFRqVPsW0em2u4_tS1aEPdlp3OzNX1QDpbtmWFiprztLYv3O1F5ivBn2erhs283PlN3pA0FRfdAQbpoB2JJZoxHw_5627zexNLDjPf14b7To7Q-4HW8J0UGLenVs',
      }
    ]
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],

  // ====== VOD / SUBSCRIPTION FIELDS (Module 4 Task 4.2) ======
  activePackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    default: null
  },
  packageExpiresAt: {
    type: Date,
    default: null
  },
  // Highest allowed VOD tier derived from activePackage.allowedTiers (cached for quick check)
  vodTier: {
    type: String,
    enum: ['none', 'standard', 'premium', 'exclusive'],
    default: 'none'
  },

  // Lịch sử mua gói cước (Subscription history)
  subscriptions: [{
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    packageSnapshot: { // Snapshot thông tin gói tại thời điểm mua để tránh thay đổi sau này
      name: String,
      price: Number,
      durationDays: Number,
      allowedTiers: [{ type: String }],
      features: [{ type: String }]
    },
    purchasedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    amount: { type: Number, required: true }, // Tổng tiền (VND)
    paymentMethod: { type: String, enum: ['VNPay', 'Momo'], default: 'VNPay' },
    paymentId: { type: String }, // Mã giao dịch VNPay
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'failed', 'refunded'],
      default: 'pending'
    }
  }],

  // Lịch sử thuê phim lẻ (VOD Rental history) - cho Task 4.4 (kiểm tra quyền xem)
  vodRentals: [{
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    movieSnapshot: {
      title: String,
      poster: String,
      rentalPrice: Number
    },
    purchasedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // Thời gian thuê (ví dụ 48h)
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['VNPay', 'Momo'], default: 'VNPay' },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'failed', 'refunded'],
      default: 'pending'
    }
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
