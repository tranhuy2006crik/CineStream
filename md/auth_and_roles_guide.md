# 🔐 KẾ HOẠCH TRIỂN KHAI CHỨC NĂNG ĐĂNG NHẬP VÀ PHÂN QUYỀN

Tài liệu này mô tả chi tiết luồng xử lý Xác thực (Authentication) và Phân quyền (Authorization) cho dự án CineStream, đảm bảo tính bảo mật và đúng với kế hoạch đã đề ra.

---

## 1. TỔNG QUAN VỀ LUỒNG XÁC THỰC (AUTHENTICATION WORKFLOW)

Hệ thống sẽ sử dụng **JWT (JSON Web Token)** để quản lý phiên đăng nhập thay vì Session truyền thống. Điều này giúp hệ thống hoạt động tốt trên đa nền tảng (Web, Mobile).

### Quy trình đăng nhập cơ bản:
1. **Frontend (`Login.jsx`)**: Người dùng nhập Email và Password, sau đó bấm "Đăng nhập". Hệ thống gửi request `POST /api/auth/login` tới Backend.
2. **Backend (`authController.js`)**: 
   - Tìm kiếm user trong MongoDB bằng Email.
   - So sánh Password (đã được băm bằng `bcrypt`) trong Database với Password người dùng gửi lên.
   - Nếu khớp, Backend tạo ra một chuỗi **JWT Token** chứa thông tin cơ bản của User (`userId`, `role`).
   - Backend gửi trả Token này về Frontend (Lưu ý: Tốt nhất là lưu vào `httpOnly Cookie` để chống tấn công XSS, hoặc lưu tạm vào `localStorage` nếu là dự án nội bộ/demo).
3. **Frontend (`AuthContext.jsx`)**: Nhận Token, lưu trữ và cập nhật state toàn cục (`isLoggedIn = true`, `currentUser = {...}`). Giao diện Navbar sẽ tự động đổi từ "Đăng nhập" sang "Avatar người dùng".

---

## 2. KIẾN TRÚC DATABASE LIÊN QUAN (BẢNG USERS)

Bảng `users` trong MongoDB sẽ được thiết kế để quản lý được cả người dùng thường và quản lý.

```json
{
  "_id": "ObjectId",
  "name": "Trịnh Quốc Bình",
  "email": "binh@example.com",
  "password": "$2b$10$hashed_password_string...", // Không bao giờ lưu raw password
  "avatar": "https://cloudinary...",
  "role": "user", // Phân quyền: "user" hoặc "admin"
  "tier": "Basic", // Gói thành viên: "Basic", "Premium", "VIP"
  "createdAt": "2023-10-01T10:00:00Z"
}
```

---

## 3. CƠ CHẾ PHÂN QUYỀN (AUTHORIZATION & ROLES)

Dự án chia làm 2 vai trò chính: **USER** (Khách hàng) và **ADMIN** (Người quản lý). Phân quyền sẽ được chặn ở 2 lớp: Frontend (ẩn UI) và Backend (chặn API).

### Lớp 1: Chặn trên Backend (Bắt buộc)
Backend sẽ sử dụng các **Middleware** trong Express.js để bảo vệ các Endpoints quan trọng.

1. **`verifyToken` (Dành cho User đã đăng nhập)**:
   - Các API cần dùng: Lịch sử đặt vé (`GET /api/bookings`), Mua vé (`POST /api/bookings`), Xem phim VOD.
   - Cách hoạt động: Kiểm tra xem Request gửi lên có chứa Header `Authorization: Bearer <token>` hợp lệ không.

2. **`verifyAdmin` (Dành riêng cho Admin)**:
   - Các API cần dùng: Thêm/Sửa/Xóa Phim (`POST /api/movies`), Tạo suất chiếu (`POST /api/showtimes`), Quản lý rạp.
   - Cách hoạt động: Chạy `verifyToken` trước để biết là ai, sau đó kiểm tra tiếp `if (req.user.role !== 'admin') -> Trả về lỗi 403 Forbidden`.

*Ví dụ cấu trúc Router Backend:*
```javascript
// router.js
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware';

router.post('/movies', verifyToken, verifyAdmin, createMovie); // Chỉ Admin
router.post('/bookings', verifyToken, createBooking); // User đăng nhập
router.get('/movies', getAllMovies); // Ai cũng xem được
```

### Lớp 2: Chặn trên Frontend (Trải nghiệm người dùng)
Frontend sẽ dùng React Router DOM để điều hướng dựa theo Role của người dùng.

- **Protected Routes (Bảo vệ Component)**:
  Nếu một người chưa đăng nhập mà cố tình gõ URL `/profile`, React Router sẽ tự động Redirect họ về trang `/login`.
- **Admin Routes**:
  Nếu một user thường (role: `user`) cố tình gõ URL `/admin`, hệ thống sẽ đá họ về `/` (Trang chủ) và hiện thông báo lỗi.
- **Render UI có điều kiện**:
  Nút "Thêm Phim" sẽ chỉ được `render` ra màn hình nếu biến toàn cục `currentUser.role === 'admin'`.

---

## 4. QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT) TẠI FRONTEND

Chúng ta sẽ tạo ra một `AuthContext` để toàn bộ App có thể biết được trạng thái đăng nhập hiện tại mà không phải truyền props xuống từng tầng.

```javascript
// AuthContext.jsx (Pseudo Code)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app khởi chạy, tự động gọi API /api/auth/me để check token hợp lệ không
  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const login = async (email, password) => {
    // Gọi API, lưu Token, setUser()
  };

  const logout = () => {
    // Xóa Token, setUser(null)
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 5. CÁC BƯỚC THỰC HIỆN TIẾP THEO

Để đưa hệ thống Auth vào hoạt động, chúng ta sẽ thực hiện theo thứ tự sau:

1. **Backend:**
   - Cài đặt thư viện `bcryptjs` (băm mật khẩu) và `jsonwebtoken` (tạo token).
   - Tạo Model `User` trong Mongoose.
   - Viết API `/api/auth/register` (Đăng ký) và `/api/auth/login` (Đăng nhập).
   - Viết `authMiddleware.js` để chặn quyền.

2. **Frontend:**
   - Hoàn thiện giao diện `Login.jsx` và `Register.jsx` (Gọi API thực tế).
   - Xây dựng `AuthContext` như mô tả ở trên.
   - Viết component `ProtectedRoute` để bọc các trang yêu cầu đăng nhập.
   - Cập nhật Navbar: Khi có `user`, hiển thị Avatar và nút Đăng xuất thay vì chữ "Login".
