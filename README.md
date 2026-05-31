# 🎬 CineStream - Hệ Thống Đặt Vé Xem Phim & Phim VOD

CineStream là một hệ thống web đa nền tảng hiện đại dành cho việc đặt vé rạp chiếu phim và thuê phim trực tuyến (VOD). Dự án được xây dựng dựa trên MERN Stack (MongoDB, Express, React, Node.js) kết hợp với các công nghệ tối ưu hóa giao diện (Tailwind CSS v4) và trải nghiệm người dùng (Framer Motion / Page Transitions).

## 🚀 Tính Năng Nổi Bật
- **Khám phá phim**: Hiển thị danh sách phim đang chiếu, sắp chiếu, tìm kiếm và lọc phim thông minh.
- **Sơ đồ rạp trực quan**: Hệ thống tìm rạp gần nhất qua GPS, giao diện bản đồ, lọc suất chiếu theo giờ (Sáng/Chiều/Tối).
- **Trải nghiệm đắm chìm (Immersive UI)**: Giao diện tối màu (Dark mode) sang trọng với hiệu ứng kính (Glassmorphism), bóng mờ neon (Glow effects) và các dải phim trượt mượt mà.
- **Hỗ trợ đa ngôn ngữ**: Tích hợp Context API để chuyển đổi mượt mà giữa Tiếng Anh và Tiếng Việt.
- **Hệ thống đa dạng gói dịch vụ**: Basic, Premium (4K/Dolby), VIP (Truy cập rạp sớm).
- **Thuê phim VOD (Sắp ra mắt)**: Xem trực tuyến các bộ phim với chất lượng 4K, hỗ trợ bảo mật chống tải lậu.

## 🛠 Công Nghệ Sử Dụng
### Frontend
- **React.js (Vite)**
- **Tailwind CSS v4**
- **React Router DOM** (Routing & Page Transitions)
- **Lucide Icons / Material Symbols**

### Backend & CSDL (Đang phát triển)
- **Node.js & Express.js**
- **MongoDB Atlas**
- **Socket.io** (Lock ghế thời gian thực)
- **AWS S3 / Cloudinary** (Lưu trữ Media)

## 📦 Cài Đặt Khởi Chạy (Local Development)

### 1. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```
Truy cập `http://localhost:5173` để xem giao diện web.

### 2. Cài đặt Backend
```bash
cd backend
npm install
npm run dev
```

## 📜 Cấu Trúc Dự Án Hiện Tại
- `/frontend`: Mã nguồn giao diện người dùng (React).
- `/backend`: Mã nguồn xử lý logic API và cơ sở dữ liệu.
- `/md`: Chứa các tài liệu thiết kế hệ thống, sơ đồ và hướng dẫn cấu hình.

## 👥 Nhóm Phát Triển
- Developed for **MINDX-PNL-X42**
- Trịnh Quốc Bình (trinhquocbinh05-lgtm)
