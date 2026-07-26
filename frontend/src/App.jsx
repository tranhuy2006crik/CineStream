import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminCinematic from "./pages/admin/movies/AdminCinematic";
import AdminVOD from "./pages/admin/movies/AdminVOD";
import AdminPackages from "./pages/admin/movies/AdminPackages";
import AdminCinemaList from "./pages/admin/cinemas/AdminCinemaList";
import AdminCinemaForm from "./pages/admin/cinemas/AdminCinemaForm";
import AdminSeatMapBuilder from "./pages/admin/theaters/AdminSeatMapBuilder";
import AdminShowtimes from "./pages/admin/theaters/AdminShowtimes";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminBookings from "./pages/admin/bookings/AdminBookings";
import AdminVouchers from "./pages/admin/vouchers/AdminVouchers";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import MyTickets from "./pages/MyTickets";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CheckInScanner from "./pages/CheckInScanner";
import VOD from "./pages/VOD";
import VODPlayer from "./pages/VODPlayer";
import Pricing from "./components/Pricing";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, activeProfile } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !activeProfile) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/vod" element={<VOD />} />
        <Route path="/vod/:movieId" element={<VODPlayer />} />
        <Route path="/pricing" element={<Pricing standalone={true} />} />
        <Route path="/seat-selection/:showtimeId" element={<SeatSelection />} />
        <Route path="/checkout/:bookingId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment-result" element={<PaymentResult />} />

        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/check-in" element={<AdminRoute><CheckInScanner /></AdminRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies/cinematic" element={<AdminCinematic />} />
          <Route path="movies/vod" element={<AdminVOD />} />
          <Route path="movies/packages" element={<AdminPackages />} />
          <Route path="cinemas" element={<AdminCinemaList />} />
          <Route path="cinemas/add" element={<AdminCinemaForm />} />
          <Route path="cinemas/:cinemaId/theater/:theaterId/builder" element={<AdminSeatMapBuilder />} />
          <Route path="showtimes" element={<AdminShowtimes />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="vouchers" element={<AdminVouchers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="*" element={<div className="p-8 text-on-surface">Module under construction...</div>} />
        </Route>
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <AppRoutes />
            <ScrollToTop />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
