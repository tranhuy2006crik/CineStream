import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
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
app.use('/api/auth', authRoutes);

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
