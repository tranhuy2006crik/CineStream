import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema({
  cinemaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  theaterType: {
    type: String,
    enum: ['Standard', 'IMAX', '4DX', 'Sweetbox', 'Premium'],
    default: 'Standard'
  },
  rows: {
    type: Number,
    default: 10
  },
  cols: {
    type: Number,
    default: 14
  },
  customSeatTypes: [{
    id: String,
    name: String,
    bg: String,
    border: String,
    text: String,
    shadow: String,
    icon: String,
    dashed: Boolean
  }],
  seatMap: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Theater', theaterSchema);
