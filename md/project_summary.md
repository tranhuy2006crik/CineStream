# BÁO CÁO TỔNG HỢP KIẾN TRÚC & PHÁT TRIỂN DỰ ÁN CINESTREAM (BẢN CHI TIẾT)

Tài liệu này cung cấp một cái nhìn toàn diện, chuyên sâu về mọi khía cạnh kỹ thuật, quyết định thiết kế và quy trình triển khai của dự án Hệ thống Đặt vé Rạp chiếu phim và Xem phim trực tuyến (CineStream).

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Dự án được xây dựng dựa trên hệ sinh thái **MERN Stack hiện đại**, chia làm 3 mảng riêng biệt nhưng giao tiếp chặt chẽ với nhau thông qua API:

### 1.1. Công nghệ Frontend (Client-side)
- **Framework:** **React.js 18** khởi tạo bằng **Vite** (nhằm tối ưu hóa tốc độ build và Hot Module Replacement - HMR so với Create-React-App truyền thống).
- **Styling:** **Tailwind CSS** (Utility-first CSS) để tùy biến giao diện nhanh chóng.
- **Icons & UI Assets:** `lucide-react` cho kho icon nhẹ và đồng bộ, Google Material Symbols cho các icon đặc thù.
- **State Management:** Sử dụng **React Context API** (`LanguageContext`, `AuthContext`) thay vì Redux để giảm thiểu boilerplate code cho các luồng dữ liệu cơ bản (Ngôn ngữ, Tài khoản).
- **Routing:** **React Router DOM v6** với kiến trúc phân cấp (`Outlet`), bao bọc bởi một lớp component chuyển cảnh (`PageTransition`).

### 1.2. Công nghệ Backend (Server-side)
- **Runtime:** **Node.js** kết hợp với framework **Express.js**.
- **Kiến trúc mã nguồn:** Tuân thủ mô hình **MVC (Model-View-Controller)** nhưng loại bỏ phần View (do Frontend đảm nhiệm), chuyển thành kiến trúc Controller-Service-Route.
- **Database:** **MongoDB Atlas** (Cloud Database), tương tác thông qua ODM **Mongoose**.
- **Authentication:** Tích hợp song song 2 hệ thống: 
  - **Firebase Admin SDK** (Được dùng để xác minh tính hợp lệ của người dùng đăng nhập bằng Google).
  - **JSON Web Tokens (JWT)** (Được dùng để cấp phiên bản nội bộ, chứa thông tin `role` để phân quyền Admin/User).

---

## 2. CHI TIẾT TRIỂN KHAI FRONTEND (UI/UX)

### 2.1. Triết lý Thiết kế "Cinematic UI"
Giao diện không đơn thuần là hiển thị dữ liệu mà được thiết kế để tạo ra trải nghiệm "đắm chìm" (Immersive).
- **Glassmorphism:** Sử dụng thuộc tính `backdrop-filter: blur(...)` kết hợp với màu nền bán trong suốt `rgba(0,0,0, 0.3)` tạo ra các thẻ nổi (Glass Card).
- **Hệ thống Reveal Animation:** Một custom hook kết hợp `IntersectionObserver` được gắn vào các thẻ `<section className="reveal">`. Khi người dùng cuộn đến đâu, DOM Element mới được đắp class `.active` để trượt lên và mờ dần (Fade-in).
- **Đồng bộ hóa hiệu ứng & React Lifecycle:** Một thách thức lớn đã được giải quyết là hiệu ứng Reveal bị mất khi đổi ngôn ngữ do React re-render. Giải pháp là sử dụng `useLayoutEffect` để đo lường lại kích thước và trạng thái hiển thị của DOM ngay trong tích tắc (trước khi trình duyệt repaint), giúp tái áp dụng class `.active` một cách vô hình với mắt người dùng.

### 2.2. Cơ chế Đa Ngôn Ngữ (i18n Context)
- Xây dựng một Context Provider bao bọc toàn ứng dụng.
- Dữ liệu tĩnh (như nút bấm, tiêu đề) được lưu trong các object từ điển (`translations.js`, `adminTranslations.js`).
- Dữ liệu động (tên phim, mô tả) sẽ ưu tiên hiển thị tiếng Việt, và trong tương lai Database có thể mở rộng thêm các trường như `titleEn`, `descriptionEn`.

### 2.3. Cấu trúc Các Component Nổi Bật
1. **Trang Đặt vé thông minh (Booking):**
   - Không liệt kê rạp thụ động, tích hợp nút "📍 Gần nhất".
   - Thuật toán `navigator.geolocation` gọi API trình duyệt, tính khoảng cách địa lý (Haversine Formula) giữa tọa độ người dùng và tọa độ của rạp lưu trong DB để sắp xếp danh sách rạp theo thứ tự từ gần đến xa.
2. **Trang Chọn Ghế (Seat Map Engine):**
   - Dữ liệu ma trận ghế (row, col) được Backend gửi lên dưới dạng mảng 2 chiều.
   - Frontend render cấu trúc lưới với màu sắc đại diện cho `loại ghế` (Standard, VIP, Sweetbox) và `trạng thái` (Available, Booked, Selecting).
   - Tự động cộng dồn hóa đơn (Total Price) dựa trên giá gốc của suất chiếu nhân với hệ số giá (Multiplier) của từng loại ghế.
3. **Admin Dashboard (SPA phân lớp):**
   - Giao diện Admin được cô lập hoàn toàn khỏi luồng của khách hàng.
   - Sidebar động. Các form (thêm phim, cụm rạp) đều sử dụng Modal Pop-up với hiệu ứng scale-up, tránh việc chuyển trang gây gián đoạn trải nghiệm người quản trị.

---

## 3. CHI TIẾT TRIỂN KHAI BACKEND & DATABASE

### 3.1. Thiết kế Schema (Entity Relationship)
Mô hình dữ liệu được thiết kế tối ưu hóa cho truy vấn NoSQL:
- **`Movie`:** Chứa mọi thông tin tĩnh (Trailer URL, Cloudinary Poster, Thể loại, Đạo diễn, Thời lượng). Điểm nhấn là trường `status` quyết định phim này hiện ở ngoài rạp (`Showing`), hay ở mảng xem tại nhà (`VOD`), hoặc cả hai.
- **`Cinema` & `Theater`:**
  - `Cinema` (Cụm rạp) đại diện cho cơ sở vật chất (VD: CineStream Cầu Giấy), chứa địa chỉ, bản đồ, hotline.
  - `Theater` (Phòng chiếu) thuộc về một Cinema, định nghĩa **Layout ghế gốc**. Admin có thể tự vẽ layout này (Ví dụ: Dòng A ghế VIP, Dòng B ghế thường).
- **`Showtime` (Suất chiếu) - TRÁI TIM HỆ THỐNG:**
  - Liên kết `MovieId` và `TheaterId`.
  - Copy toàn bộ **Layout ghế gốc** từ Theater vào làm bản sao riêng (`seatMap`) cho suất chiếu đó. Khi khách hàng mua vé, ghế sẽ đổi trạng thái thành `booked` trực tiếp trên document Showtime này. Thiết kế này giúp khóa ghế theo thời gian thực dễ dàng.
- **`Package` (Gói Cước):** Cấu trúc động cho phép lưu mảng các String đại diện cho `features`, giúp Admin tự do gõ tính năng (VD: "4K Dolby") mà không cần sửa code Frontend.
- **`User`:** Lưu Profile. Nếu đăng nhập bằng Google, lưu trữ Firebase `uid`.

### 3.2. Middleware Bảo mật (Security)
- **`protect`:** Bóc tách chuỗi `Bearer <token>` từ Headers. Gọi JWT để giải mã hoặc lấy `uid` từ Firebase để xác thực xem user có thực sự tồn tại trong hệ thống.
- **`authorize('admin')`:** Chặn đứng các hành động POST, PUT, DELETE từ người dùng thường hoặc hacker vào các Route nhạy cảm.

### 3.3. Các Luồng Nghiệp Vụ Cốt Lõi (Core Logics)
- **Xếp lịch chiếu (Admin):** Khi chọn phim và chọn khoảng thời gian, Backend kiểm tra chống trùng lặp giờ (Overlap check) với các suất chiếu đã tồn tại trong cùng một phòng chiếu.
- **Mua vé & Giữ chỗ (Booking Flow):** (Phần đang được hoàn thiện) Khi chọn ghế, Backend sẽ tạm khóa (hold) ghế trong 5-10 phút. Nếu thanh toán VNPAY thành công, ghi đè trạng thái thành `booked` vĩnh viễn. Nếu timeout, nhả ghế về `available`.

---

## 4. CHI TIẾT CÁC SCRIPTS & CÔNG CỤ HỖ TRỢ (DEVOPS/TOOLING)

### 4.1. Chuyển đổi Dữ liệu lên Cloud (Migration)
Để tăng tính di động và làm việc nhóm, dữ liệu đã được gỡ bỏ khỏi Local host:
- Sử dụng Script Node.js (`migrate_to_atlas.js`) kết nối song song 2 luồng: `sourceURI` (Local) và `targetURI` (Atlas).
- Quét qua 9 Collections, xóa sạch data rác trên Cloud (tránh duplicate) và sử dụng `insertMany` để bơm toàn bộ dữ liệu máy chủ cục bộ lên mạng.

### 4.2. Hệ thống Mồi dữ liệu (Seeders)
Xây dựng các kịch bản để tạo ra hệ sinh thái ngay lập tức cho môi trường Dev mới:
- **`generate_movies.py`:** Một kiệt tác tự động hóa viết bằng Python. Gọi API đến The Movie Database (TMDB), lấy danh sách phim hot nhất. Lấy ảnh độ phân giải cao, tự động tải lên dịch vụ Cloudinary để có link CDN tối ưu, sau đó kết nối trực tiếp vào MongoDB để ghi dữ liệu phim.
- **`seed.js` / `seed_packages.js`:** Các kịch bản Node.js tạo ra các tài khoản Admin gốc, hàng loạt Cụm rạp (Bình Dương, Hà Nội), sơ đồ phòng chiếu tiêu chuẩn 10x10, và các gói cước VIP có sẵn tính năng.

---

## 5. HƯỚNG MỞ RỘNG (SCALABILITY LÀ TƯƠNG LAI)
- Tích hợp WebSockets (`Socket.io`) vào phòng chọn ghế để hiển thị hiệu ứng "Có người đang giữ ghế này" theo thời gian thực (Real-time).
- Triển khai thuật toán Recommendation (Gợi ý phim) dựa trên lịch sử đặt vé của User.
- Áp dụng Redis Cache cho các API `/movies?status=Showing` vì dữ liệu này tần suất truy cập rất lớn từ Landing Page nhưng ít khi thay đổi.
