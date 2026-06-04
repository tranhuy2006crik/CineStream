import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String },
  duration: { type: Number, required: true }, // in minutes
  releaseDate: { type: Date, required: true },
  description: { type: String },
  poster: { type: String }, // Cloudinary URL
  banner: { type: String }, // Cloudinary URL
  trailerUrl: { type: String },
  cast: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  ticketsSold: { type: Number, default: 0 },
  
  // Status
  status: { 
    type: String, 
    enum: ['Upcoming', 'Showing', 'Ended', 'VOD'], 
    default: 'Upcoming' 
  },
  
  // VOD / Rental properties
  isVOD: { type: Boolean, default: false },
  vodTier: { 
    type: String, 
    enum: ['none', 'standard', 'premium', 'exclusive'], 
    default: 'none' 
  },
  rentalPrice: { type: Number, default: 0 },
  vodVideoUrl: { type: String } // File or encrypted stream url
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
