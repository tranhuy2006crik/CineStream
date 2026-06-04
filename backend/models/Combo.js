import mongoose from 'mongoose';

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // Cloudinary URL
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Combo = mongoose.model('Combo', comboSchema);
export default Combo;
