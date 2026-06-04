import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  // Ticketing Pricing Configuration
  pricing: {
    normalPrice: { type: Number, required: true },
    vipPrice: { type: Number, required: true },
    couplePrice: { type: Number, required: true }
  },

  // Track booked seats (Array of strings like 'A1', 'B2')
  bookedSeats: [{ type: String }]
}, { timestamps: true });

const Showtime = mongoose.model('Showtime', showtimeSchema);
export default Showtime;
