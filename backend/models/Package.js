import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  durationDays: { type: Number, required: true }, // e.g., 30 for 1 month
  maxResolution: { type: String, default: '1080p' },
  
  // Tiers this package can access (e.g., ['standard'] or ['standard', 'premium', 'exclusive'])
  allowedTiers: [{ 
    type: String, 
    enum: ['standard', 'premium', 'exclusive'] 
  }],
  
  features: [{ type: String }],
  isPopular: { type: Boolean, default: false },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
export default Package;
