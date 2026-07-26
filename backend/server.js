import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';

import User from './models/User.js';
import Combo from './models/Combo.js';
import Voucher from './models/Voucher.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { initCache } from './config/cache.js';
import { initSeatSocket } from './socket/seatSocket.js';
import { listenWithFallback } from './utils/serverListen.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});
initSeatSocket(io);

app.use(generalLimiter);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes.js';
import cinemaRoutes from './routes/cinemaRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import comboRoutes from './routes/comboRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/vouchers', voucherRoutes);

app.get('/', (req, res) => {
  res.send('🎬 MERN Cinema API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function seedDefaults() {
  const comboCount = await Combo.countDocuments();
  if (comboCount === 0) {
    await Combo.insertMany([
      { name: 'Combo Classic', description: 'Bắp ngọt + Nước ngọt size M', price: 65000, isActive: true },
      { name: 'Combo Couple', description: '2 Bắp + 2 Nước size L', price: 120000, isActive: true },
      { name: 'Combo VIP', description: 'Bắp caramel + Nước + Hotdog', price: 95000, isActive: true }
    ]);
    console.log('🌱 Seeded default combos');
  }

  const voucherCount = await Voucher.countDocuments();
  if (voucherCount === 0) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    await Voucher.insertMany([
      { code: 'CINE10', description: 'Giảm 10% tổng đơn', discountType: 'percent', discountValue: 10, minOrderAmount: 100000, maxUses: 100, expiresAt: nextMonth },
      { code: 'SAVE50K', description: 'Giảm 50.000đ', discountType: 'fixed', discountValue: 50000, minOrderAmount: 200000, maxUses: 50, expiresAt: nextMonth }
    ]);
    console.log('🌱 Seeded default vouchers');
  }
}

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-cinema';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await initCache();

    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.create({ email: 'admin@cinestream.com', password: 'password123', role: 'admin' });
        console.log('🌱 Seeded default user: admin@cinestream.com / password123');
      }
      await seedDefaults();
    } catch (seedErr) {
      console.error('❌ Failed to seed defaults:', seedErr.message);
    }

    try {
      const actualPort = await listenWithFallback(server, PORT);
      console.log(`🚀 Server running on port ${actualPort} (HTTP + WebSocket)`);
    } catch (listenErr) {
      console.error('❌ Failed to start server:', listenErr.message);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

export { io };
