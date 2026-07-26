import Combo from '../models/Combo.js';

export const getCombos = async (req, res) => {
  try {
    const combos = await Combo.find({ isActive: true }).sort({ price: 1 });
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCombosAdmin = async (req, res) => {
  try {
    const combos = await Combo.find().sort({ createdAt: -1 });
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCombo = async (req, res) => {
  try {
    const combo = await Combo.create(req.body);
    res.status(201).json(combo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCombo = async (req, res) => {
  try {
    const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    res.json(combo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCombo = async (req, res) => {
  try {
    const combo = await Combo.findByIdAndDelete(req.params.id);
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    res.json({ message: 'Combo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
