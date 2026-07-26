import Showtime from '../models/Showtime.js';

const augmentTheater = (t) => {
  if (!t) return t;
  const obj = typeof t.toObject === 'function' ? t.toObject() : JSON.parse(JSON.stringify(t));
  return {
    ...obj,
    type: obj.theaterType || obj.type || 'Standard',
    capacity: Number(obj.capacity || 0) > 0
      ? Number(obj.capacity)
      : (Number(obj.rows) || 0) * (Number(obj.cols) || 0)
  };
};

export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title poster duration trailerUrl')
      .populate('cinema', 'name address location region')
      .populate('theater', 'name theaterType capacity seatMap rows cols');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    const result = showtime.toObject();
    result.theater = augmentTheater(result.theater);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movie', 'title poster duration')
      .populate('cinema', 'name location address region')
      .populate('theater', 'name theaterType capacity rows cols')
      .sort({ startTime: 1 });
    const results = showtimes.map(st => {
      const obj = st.toObject();
      obj.theater = augmentTheater(obj.theater);
      return obj;
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShowtime = async (req, res) => {
  try {
    const { movie, cinema, theater, startTime, endTime, pricing } = req.body;

    const showtime = new Showtime({
      movie,
      cinema,
      theater,
      startTime,
      endTime,
      pricing,
      bookedSeats: []
    });

    const createdShowtime = await showtime.save();
    
    // Return populated data so frontend can display immediately
    const populatedShowtime = await Showtime.findById(createdShowtime._id)
      .populate('movie', 'title poster duration')
      .populate('cinema', 'name location address region')
      .populate('theater', 'name theaterType capacity rows cols');
    const obj = populatedShowtime.toObject();
    obj.theater = augmentTheater(obj.theater);
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShowtime = async (req, res) => {
  try {
    const { movie, cinema, theater, startTime, endTime, pricing } = req.body;

    const showtime = await Showtime.findById(req.params.id);

    if (showtime) {
      showtime.movie = movie;
      showtime.cinema = cinema;
      showtime.theater = theater;
      showtime.startTime = startTime;
      showtime.endTime = endTime;
      showtime.pricing = pricing;

      await showtime.save();
      
      const populatedShowtime = await Showtime.findById(showtime._id)
        .populate('movie', 'title poster duration')
        .populate('cinema', 'name location address region')
        .populate('theater', 'name theaterType capacity rows cols');
      const obj = populatedShowtime.toObject();
      obj.theater = augmentTheater(obj.theater);
      res.json(obj);
    } else {
      res.status(404).json({ message: 'Showtime not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);

    if (showtime) {
      await showtime.deleteOne();
      res.json({ message: 'Showtime removed' });
    } else {
      res.status(404).json({ message: 'Showtime not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
