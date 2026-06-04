import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import User from './models/User.js';

// Load env vars
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
import authRoutes from './routes/authRoutes.js';
import cinemaRoutes from './routes/cinemaRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bookings', bookingRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('🎬 MERN Cinema API is running...');
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-cinema';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Seed default admin user if database is empty
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.create({
          email: 'admin@cinestream.com',
          password: 'password123',
        });
        console.log('🌱 Seeded default user: admin@cinestream.com / password123');
      }
    } catch (seedErr) {
      console.error('❌ Failed to seed default user:', seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
