import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Package from '../models/Package.js';

// Get comprehensive statistics for the Admin Dashboard
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Core Counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalPackages = await Package.countDocuments();
    
    // For now we don't have a real transactions/tickets model, 
    // so we'll aggregate users based on their active packages to estimate revenue/subscriptions.
    // In a full production system, you'd aggregate a Transaction collection.
    
    // 2. Revenue (Mock calculated from User active packages, just for chart demonstration since we lack transaction history)
    // Actually, let's just send some dynamic mock data for the 12 months for the chart 
    // since building a full transaction engine is out of scope right now, BUT we will use real counts.
    
    const revenueData = [
      45000000, 52000000, 38000000, 65000000, 
      48000000, 70000000, 85000000, 92000000, 
      78000000, 88000000, 95000000, 110000000
    ];

    // 3. User Demographics / Roles
    const normalUsers = await User.countDocuments({ role: 'user' });
    const staffUsers = await User.countDocuments({ role: 'staff' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // 4. Movie Distribution
    const showingMovies = await Movie.countDocuments({ status: 'Showing' });
    const upcomingMovies = await Movie.countDocuments({ status: 'Upcoming' });
    const endedMovies = await Movie.countDocuments({ status: 'Ended' });
    const vodMovies = await Movie.countDocuments({ status: 'VOD' });

    res.json({
      summary: {
        totalUsers,
        totalMovies,
        totalPackages,
        totalRevenue: revenueData.reduce((a, b) => a + b, 0),
      },
      charts: {
        revenue: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: revenueData
        },
        users: {
          labels: ['Normal Users', 'Staff', 'Admins'],
          data: [normalUsers, staffUsers, adminUsers]
        },
        movies: {
          labels: ['Showing', 'Upcoming', 'Ended', 'VOD Only'],
          data: [showingMovies, upcomingMovies, endedMovies, vodMovies]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
