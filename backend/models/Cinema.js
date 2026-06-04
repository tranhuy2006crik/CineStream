import mongoose from 'mongoose';

const cinemaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  hotline: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    lat: { type: Number, default: 10.762622 }, // Default to HCMC
    lng: { type: Number, default: 106.660172 }
  },
  operatingHours: {
    open: { type: String, default: '08:00' },
    close: { type: String, default: '23:30' }
  },
  managerEmail: {
    type: String,
    trim: true,
    default: ''
  },
  staffCount: {
    type: Number,
    default: 0
  },
  region: {
    type: String,
    trim: true,
    default: 'TP.HCM'
  },
  images: {
    type: [String],
    default: []
  },
  facilities: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Closed'],
    default: 'Active'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Cinema', cinemaSchema);
