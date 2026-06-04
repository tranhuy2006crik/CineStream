import Showtime from '../models/Showtime.js';

export const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movie', 'title poster duration')
      .populate('cinema', 'name location address region')
      .populate('theater', 'name type capacity')
      .sort({ startTime: 1 });
    res.json(showtimes);
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
      .populate('theater', 'name type capacity');
      
    res.status(201).json(populatedShowtime);
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
        .populate('theater', 'name type capacity');
        
      res.json(populatedShowtime);
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
