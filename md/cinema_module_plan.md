# Kế hoạch triển khai Module Quản lý Cụm Rạp (Comprehensive Cinema Module)

Quản lý cụm rạp là một module cốt lõi cực kỳ lớn của hệ thống bán vé, không thể làm sơ sài. Dựa trên những yêu cầu chuyên sâu của bạn (Tích hợp bản đồ, Quản lý nhân sự, Giờ hoạt động, Sub-menu, Kết nối API thực), tôi đề xuất bản thiết kế kiến trúc toàn diện như sau:

> **LƯU Ý:** Đây là một đợt nâng cấp lớn thay đổi cả cấu trúc Database và Frontend. Vui lòng xem kỹ luồng hoạt động (đặc biệt là phần tích hợp Bản đồ) và phản hồi lại cho tôi để bắt đầu thực thi!

---

## 1. Nâng cấp Database Schema (MongoDB)

Cần mở rộng Model `Cinema` để lưu trữ các thông tin vận hành chi tiết:
- `location`: `{ lat: Number, lng: Number }` (Tọa độ để hiển thị ghim trên bản đồ).
- `operatingHours`: `{ open: String, close: String }` (Giờ mở/đóng cửa).
- `managerEmail`: Email của quản lý cụm rạp.
- `staffCount`: Tổng số nhân viên.

## 2. Tái cấu trúc Frontend & Sidebar (Sub-menu)

**Cập nhật `AdminLayout.jsx`:**
Mục "Cinemas" trên thanh điều hướng bên trái sẽ trở thành một **Dropdown Menu** chứa các Sub-menu:
- **📍 Overview (Tổng quan):** Xem bản đồ phân bổ và thống kê.
- **➕ Add Cinema (Thêm cơ sở):** Mở form nhập liệu chi tiết.
- **🚪 Theaters (Phòng chiếu):** Quản lý các rạp nhỏ bên trong các cơ sở.

## 3. Các Trang Giao Diện Mới (Frontend Pages)

### 3.1. Trang Overview (`AdminCinemaDashboard.jsx`)
- **Bản đồ phân bổ (Map Integration):** Tích hợp thư viện `Leaflet` để hiển thị một bản đồ trực quan. Mỗi cụm rạp là một Pin (Ghim) trên bản đồ.
- **Thống kê:** Tổng số rạp, Tổng số phòng chiếu, Tổng nhân viên.
- **Danh sách:** Bảng liệt kê các cụm rạp hiện có.

### 3.2. Trang Thêm/Sửa Cụm Rạp (`AdminCinemaForm.jsx`)
Một trang form chuyên dụng (thay vì modal chật chội) với các khối thông tin:
- **General:** Tên cụm rạp, Hotline, Giờ hoạt động, Manager Email, Số nhân viên.
- **Location Picker:** Một bản đồ mini. Khi người dùng click vào bản đồ, hệ thống tự động lấy tọa độ (Lat, Lng) lưu vào Database.

### 3.3. Trang Quản lý Phòng Chiếu (`AdminTheaterManager.jsx`)
- Chọn một Cụm rạp để xem danh sách các phòng chiếu con (IMAX, Standard...).
- Nút truy cập vào Seat Map Builder cho từng phòng.

## 4. Tích hợp Kết nối Dữ liệu (API Integration)

Thay vì dùng dữ liệu giả (Mock data), toàn bộ Frontend sẽ được kết nối bằng `fetch` tới Express Server chạy ở `http://localhost:5000`:
- **Fetch Cinemas:** Gọi `GET /api/cinemas` ngay khi vào trang Overview để lấy tọa độ vẽ lên bản đồ.
- **Thêm Cinema:** Gọi `POST /api/cinemas` gửi toàn bộ Form Data (bao gồm tọa độ map).
- **Seat Map Builder:** Sẽ `fetch` sơ đồ hiện tại từ `GET /api/theaters/:id`, và khi bấm Save sẽ bắn API `PUT /api/theaters/:id` để đè mảng lưới ghế xuống MongoDB.
