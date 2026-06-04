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
import SeatSelection from "./pages/SeatSelection";
import PaymentResult from "./pages/PaymentResult";
import MyTickets from "./pages/MyTickets";
import VOD from "./pages/VOD";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";
import { LanguageProvider } from "./context/LanguageContext";

// ProtectedRoute — chỉ dùng cho các trang cần đăng nhập (mua vé, profile, admin...)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const activeProfile = localStorage.getItem('activeProfile');

  if (!token || !activeProfile) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// AdminRoute — chỉ dùng cho ban quản trị (Admin hoặc Staff)
function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.role !== 'staff') {
    // Nếu là user bình thường, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <div className="min-h-screen">
        <PageTransition>
          <Routes>
            {/* Public — ai cũng xem được */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/vod" element={<VOD />} />
            <Route path="/seat-selection/:showtimeId" element={<SeatSelection />} />
            <Route path="/payment-result" element={<PaymentResult />} />

            {/* Protected — cần đăng nhập mới vào được */}
            <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
            {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}
            
            {/* Khối quản trị (Admin) - Hoàn toàn độc lập với giao diện Home */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies/cinematic" element={<AdminCinematic />} />
              <Route path="movies/vod" element={<AdminVOD />} />
              <Route path="movies/packages" element={<AdminPackages />} />
              <Route path="cinemas" element={<AdminCinemaList />} />
              <Route path="cinemas/add" element={<AdminCinemaForm />} />
              <Route path="cinemas/:cinemaId/theater/:theaterId/builder" element={<AdminSeatMapBuilder />} />
              <Route path="showtimes" element={<AdminShowtimes />} />
              <Route path="users" element={<AdminUsers />} />
              {/* Placeholder cho các route tương lai */}
              <Route path="*" element={<div className="p-8 text-on-surface">Module under construction...</div>} />
            </Route>
          </Routes>
        </PageTransition>
        <ScrollToTop />
      </div>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
