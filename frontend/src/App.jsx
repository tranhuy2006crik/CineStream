import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
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

            {/* Protected — cần đăng nhập mới vào được */}
            {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}
            {/* <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} /> */}
          </Routes>
        </PageTransition>
        <ScrollToTop />
      </div>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
