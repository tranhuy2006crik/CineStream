import mongoose from 'mongoose';
import Review from './Review.js';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String },
  duration: { type: Number, required: true }, // in minutes
  releaseDate: { type: Date, required: true },
  releaseYear: { type: Number }, // Year extracted from releaseDate for easier filtering
  description: { type: String },
  poster: { type: String }, // Cloudinary URL
  banner: { type: String }, // Cloudinary URL
  trailerUrl: { type: String },
  cast: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  ticketsSold: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 10 }, // Old rating field for compatibility
  averageRating: { type: Number, default: 0, min: 0, max: 5 }, // New average rating 0-5
  reviewCount: { type: Number, default: 0 }, // Number of reviews
  country: { type: String, default: '' }, // Country of origin
  genres: { type: [String], default: [] }, // Genres: Action, Romance, Sci-fi, etc.
  isSeries: { type: Boolean, default: false }, // True for phim bộ, false for phim lẻ
  isFeatured: { type: Boolean, default: false }, // True for banner nổi bật
  
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

// Pre-save hook to extract releaseYear from releaseDate
movieSchema.pre('save', function() {
  if (this.releaseDate) {
    this.releaseYear = this.releaseDate.getFullYear();
  }
});

// Method to recalculate average rating
movieSchema.methods.calculateAverageRating = async function() {
  const reviews = await Review.find({ movie: this._id });
  this.reviewCount = reviews.length;
  
  if (reviews.length > 0) {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / reviews.length;
  } else {
    this.averageRating = 0;
  }
  
  await this.save();
};

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
