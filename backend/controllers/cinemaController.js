import Cinema from '../models/Cinema.js';
import Theater from '../models/Theater.js';

export const getAllCinemas = async (req, res) => {
  try {
    const filter = {};
    if (req.query.region) filter.region = req.query.region;
    if (req.query.status) filter.status = req.query.status;

    const cinemas = await Cinema.find(filter).sort({ createdAt: -1 });
    const cinemasWithStats = await Promise.all(cinemas.map(async (cinema) => {
      const theaterDocs = await Theater.find({ cinemaId: cinema._id }).sort({ createdAt: 1 });
      const theaters = theaterDocs.map(t => ({
        ...t._doc,
        type: t.theaterType || 'Standard',
        capacity: (Number(t.rows) || 0) * (Number(t.cols) || 0)
      }));
      return {
        ...cinema._doc,
        theatersCount: theaters.length,
        theaters
      };
    }));
    res.status(200).json(cinemasWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCinema = async (req, res) => {
  try {
    const { name, address, hotline, location, operatingHours, managerEmail, staffCount, region, images, facilities, status, description } = req.body;
    const existing = await Cinema.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Tên cụm rạp đã tồn tại' });
    }
    const newCinema = new Cinema({ 
      name, address, hotline, location, operatingHours, managerEmail, staffCount, 
      region, images, facilities, status, description 
    });
    await newCinema.save();
    res.status(201).json(newCinema);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCinema = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Cinema.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy cụm rạp' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCinema = async (req, res) => {
  try {
    const { id } = req.params;
    await Cinema.findByIdAndDelete(id);
    await Theater.deleteMany({ cinemaId: id });
    res.status(200).json({ message: 'Đã xóa cụm rạp' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
