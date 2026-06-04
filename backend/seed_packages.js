import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package from './models/Package.js';

dotenv.config();

const seedPackages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing
    await Package.deleteMany({});
    
    const packages = [
      {
        name: 'Basic',
        description: 'Standard quality streaming',
        price: 9.99,
        durationDays: 30,
        maxResolution: '1080p',
        allowedTiers: ['standard'],
        features: ['1 Screen access', 'Full HD Quality'],
        isPopular: false,
        isActive: true
      },
      {
        name: 'Premium',
        description: '4K Ultra HD Experience',
        price: 15.99,
        durationDays: 30,
        maxResolution: '4K',
        allowedTiers: ['standard', 'premium'],
        features: ['2 Screens simultaneously', '4K Ultra HD + HDR', 'Dolby Atmos Sound'],
        isPopular: true,
        isActive: true
      },
      {
        name: 'VIP',
        description: 'Ultimate cinema privilege',
        price: 24.99,
        durationDays: 30,
        maxResolution: '4K',
        allowedTiers: ['standard', 'premium', 'exclusive'],
        features: ['4 Screens simultaneously', 'Cinema Early Access', 'Zero Ads & Offline Mode'],
        isPopular: false,
        isActive: true
      }
    ];

    await Package.insertMany(packages);
    console.log('Packages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding packages:', error);
    process.exit(1);
  }
};

seedPackages();
