import Theater from '../models/Theater.js';

export const getTheatersByCinema = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const theaters = await Theater.find({ cinemaId }).sort({ name: 1 });
    res.status(200).json(theaters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTheaterById = async (req, res) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id);
    if (!theater) return res.status(404).json({ message: 'Phòng chiếu không tồn tại' });
    res.status(200).json(theater);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTheater = async (req, res) => {
  try {
    const { cinemaId, name, theaterType } = req.body;
    const rows = 10;
    const cols = 14;
    const seatMap = Array(rows).fill(null).map((_, r) => 
      Array(cols).fill(null).map((_, c) => ({
        id: `${String.fromCharCode(65 + r)}${c + 1}`,
        row: String.fromCharCode(65 + r),
        col: c + 1,
        type: c === 6 || c === 7 ? 'aisle' : 'standard'
      }))
    );
    const defaultBrushes = [
      { id: 'standard', name: 'Standard', bg: '#2a2a2a', border: 'rgba(255,255,255,0.1)', text: '#a1a1aa' },
      { id: 'vip', name: 'VIP', bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.8)', text: '#eab308', shadow: '0 0 10px rgba(234,179,8,0.2)' },
      { id: 'disabled', name: 'Broken', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'rgba(239, 68, 68, 0.5)', icon: 'X' },
      { id: 'aisle', name: 'Aisle', bg: 'transparent', border: 'rgba(255,255,255,0.1)', text: 'transparent', dashed: true },
    ];
    const newTheater = new Theater({ cinemaId, name, theaterType, rows, cols, customSeatTypes: defaultBrushes, seatMap });
    await newTheater.save();
    res.status(201).json(newTheater);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTheaterMap = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows, cols, customSeatTypes, seatMap } = req.body;
    const updated = await Theater.findByIdAndUpdate(id, { rows, cols, customSeatTypes, seatMap }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTheater = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, theaterType } = req.body;
    const updated = await Theater.findByIdAndUpdate(id, { name, theaterType }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTheater = async (req, res) => {
  try {
    const { id } = req.params;
    await Theater.findByIdAndDelete(id);
    res.status(200).json({ message: 'Đã xóa phòng chiếu' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
