# PHÂN CÔNG NHIỆM VỤ DỰ ÁN CINESTREAM (WORK BREAKDOWN STRUCTURE)

Tài liệu này chia nhỏ toàn bộ dự án thành các Module (Tính năng lớn) và các Task (Nhiệm vụ cụ thể) theo dạng Frontend (Giao diện) và Backend (API/Database) để Team Leader dễ dàng phân việc cho các thành viên.

---

## MODULE 1: XÁC THỰC & TÀI KHOẢN (AUTHENTICATION)

### 🔴 Backend Developer (API & DB)
- **[Task 1.1] Thiết kế DB User:** Tạo Schema `User` (email, password hash, role: admin/user, firebaseUid).
- **[Task 1.2] API Đăng nhập truyền thống:** Viết API Đăng ký, Đăng nhập (Mã hóa mật khẩu bằng bcrypt, trả về JWT Token).
- **[Task 1.3] API Auth bằng Google:** Viết Middleware nhận Token từ Firebase Frontend gửi lên, dùng Firebase Admin SDK để giải mã. Nếu hợp lệ, tự động tạo tài khoản trong MongoDB và trả về JWT cho web.
- **[Task 1.4] Middleware Phân Quyền:** Viết hàm `protect` (kiểm tra user đăng nhập) và `authorize('admin')` (kiểm tra quyền quản trị).

### 🔵 Frontend Developer (UI/UX)
- **[Task 1.5] UI Đăng nhập/Đăng ký:** Xây dựng giao diện Login/Register có hiệu ứng thẻ trượt (Sliding Card).
- **[Task 1.6] Form Validation:** Xử lý bắt lỗi form (chưa nhập email, sai định dạng, mật khẩu ngắn).
- **[Task 1.7] Tích hợp Google Login:** Gắn SDK Firebase vào Frontend, tạo nút "Login with Google", lấy accessToken đẩy xuống API Backend.
- **[Task 1.8] Quản lý State Auth:** Cấu hình `AuthContext` lưu trữ thông tin User, tự động chuyển hướng (Redirect) khỏi trang Login nếu đã đăng nhập.

---

## MODULE 2: LANDING PAGE & TÌM KIẾM PHIM

### 🔴 Backend Developer
- **[Task 2.1] API Phim:** Xây dựng CRUD API cho phim (Tiêu đề, Poster, Trailer, Thể loại).
- **[Task 2.2] Lọc Phim:** Hỗ trợ API tìm phim theo trạng thái (`status=Showing` hoặc `status=VOD`) và API tìm kiếm theo tên phim.
- **[Task 2.3] Script Cào Phim (Bonus):** Dùng Python gọi API TMDB lấy data phim thực tế để mồi (seed) vào Database.

### 🔵 Frontend Developer
- **[Task 2.4] Hero Video Banner:** Làm banner video tự động phát ở đầu trang chủ, tích hợp nút "Watch Trailer" popup.
- **[Task 2.5] Carousel Phim:** Vẽ giao diện danh sách phim cuộn ngang mượt mà.
- **[Task 2.6] Hiệu ứng Cinematic:** Cài đặt `IntersectionObserver` và class `reveal/active` để các khối giao diện mờ dần và hiện lên khi cuộn.
- **[Task 2.7] Đa Ngôn Ngữ (i18n):** Tạo `LanguageContext` chuyển đổi Tiếng Anh / Tiếng Việt mà không cần load lại trang.

---

## MODULE 3: LÕI ĐẶT VÉ (RẠP, SUẤT CHIẾU, SƠ ĐỒ GHẾ)

### 🔴 Backend Developer (Nghiệp vụ khó nhất)
- **[Task 3.1] DB Rạp & Phòng Chiếu:** Tạo Schema `Cinema` và `Theater`. Lưu bản đồ gốc (grid) của phòng chiếu dưới dạng mảng 2 chiều.
- **[Task 3.2] API Suất chiếu (Showtime):** Viết logic khi tạo Suất chiếu -> Tự động copy `seatMap` từ phòng chiếu sang thành một bản nháp động. Tránh trùng giờ chiếu.
- **[Task 3.3] Thuật toán Giữ/Mua Ghế:** Viết API nhận yêu cầu mua ghế `[A1, A2]`. Kiểm tra xem ghế đã có ai mua chưa. Nếu trống, chuyển trạng thái thành `booked` trên Suất chiếu đó.

### 🔵 Frontend Developer
- **[Task 3.4] Giao diện Tìm Suất chiếu:** Làm UI chọn Phim -> Ngày -> Cụm Rạp.
- **[Task 3.5] Tìm Rạp theo Định vị (GPS):** Dùng `navigator.geolocation` lấy tọa độ máy tính/điện thoại, tính khoảng cách (Haversine) để hiển thị "Rạp Gần Nhất".
- **[Task 3.6] UI Chọn Ghế (Seat Map Engine):** Render mảng 2 chiều Backend trả về thành Sơ đồ ghế thực tế (Ghế VIP màu khác, ghế thường màu khác, ghế đã bán bị mờ đi). 
- **[Task 3.7] Tính Tiền Tự Động:** Tính tổng tiền dựa trên loại ghế khách chọn và hiển thị ngay lập tức (Summary).

---

## MODULE 4: VOD (XEM PHIM TẠI NHÀ) & GÓI CƯỚC

### 🔴 Backend Developer
- **[Task 4.1] DB Gói Cước (Package):** Cấu hình bảng dữ liệu Packages (Tên gói, Giá, mảng Tính năng `features`, cờ `isPopular`).
- **[Task 4.2] Lịch sử Giao dịch:** Xây dựng API luân chuyển trạng thái tài khoản User sau khi mua gói cước thành công.

### 🔵 Frontend Developer
- **[Task 4.3] Giao diện Bảng giá (Pricing UI):** Render tự động các thẻ (Cards) gói cước từ DB. Làm nổi bật thẻ nào có `isPopular = true`.
- **[Task 4.4] Trình phát Video (VOD Player):** Tích hợp video player cho người dùng xem phim tại nhà sau khi đã mua quyền truy cập.

---

## MODULE 5: TRANG QUẢN TRỊ ADMIN (ADMIN DASHBOARD)

### 🔴 Backend Developer
- **[Task 5.1] API Thống kê:** Viết API đếm tổng số Users, tính Tổng Doanh thu, số lượng Phim để xuất ra cho Dashboard.

### 🔵 Frontend Developer (Khối lượng lớn)
- **[Task 5.2] Khung Layout Admin:** Làm Sidebar, Header, chặn Route (chỉ cho phép user có `role=admin` truy cập).
- **[Task 5.3] UI Quản lý Data (CRUD Tables):** Làm các trang quản lý Phim, Gói cước, Tài khoản (Hiển thị bảng, Modal thêm mới, nút Sửa/Xóa).
- **[Task 5.4] Tool Vẽ Sơ Đồ Ghế (Seat Map Builder):** (Tính năng nâng cao) Viết giao diện cho phép Admin tự click chọn kích thước phòng (VD: 10x10), kéo thả cấu hình ghế VIP, ghế thường để lưu làm bản mẫu.
