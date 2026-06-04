# 📱 DANH SÁCH MÀN HÌNH VÀ CHỨC NĂNG (SCREEN FLOW & FEATURES)

Tài liệu này liệt kê chi tiết toàn bộ các màn hình (Screens) cần xây dựng cho dự án Hệ thống Đặt vé & Thuê phim trực tuyến, kèm theo danh sách các chức năng (Features) tương ứng trên từng màn hình đó.

---

## A. DÀNH CHO KHÁCH HÀNG (USER PORTAL)

### 1. Màn hình Chào Mừng & Xác Thực (Auth Screens)
*Giao diện tối màu, tập trung vào form đăng nhập, tương tự Netflix.*
- **Đăng nhập/Đăng ký:** Bằng Email/Password (hoặc Google/Facebook OAuth).
- **Quên mật khẩu:** Gửi mã xác nhận (OTP/Link) qua Email để đặt lại mật khẩu.
- **Màn hình Chọn Profile (Who's watching):** Cho phép chọn người xem sau khi đăng nhập (Giống Netflix - Tính năng nâng cao).

### 2. Màn hình Trang Chủ (Home Page)
*Màn hình chính chứa Hero banner và các danh sách phim cuộn ngang.*
- **Hero Banner:** Hiển thị phim nổi bật nhất (tự động đổi hoặc Banner lớn) kèm nút "Xem Trailer" và "Đặt vé ngay".
- **Phim đang chiếu (Now Showing):** Danh sách phim rạp hiện tại, vuốt ngang mượt mà.
- **Phim sắp chiếu (Coming Soon):** Danh sách phim rạp sắp ra mắt.
- **Phim Thuê (VOD Trending):** Danh sách phim có thu phí xem online.
- **Thanh Tìm kiếm (Search):** Box tìm tên phim, đạo diễn, diễn viên ngay trên Header.

### 3. Màn hình Chi Tiết Phim (Movie Detail / Modal)
*Khi click vào 1 phim bất kỳ từ Trang Chủ (Hiển thị dạng Popup Modal hoặc Chuyển trang).*
- **Phát Trailer tự động:** Chạy video nền (Background Video) trên cùng.
- **Hiển thị Thông tin:** Điểm đánh giá (Rating), Nhãn độ tuổi (18+), Thời lượng, Thể loại, Tóm tắt.
- **Call-to-Action:** Nút "🎟️ Mua Vé" (cho phim rạp) hoặc "🎬 Thuê Phim 50k" (cho phim VOD).
- **Khu vực Đánh giá (Reviews):** Đọc bình luận từ người xem khác và Form gửi đánh giá (Rating 1-5 sao).

### 4. Màn hình Chọn Rạp & Suất Chiếu (Showtimes)
*Flow tiếp theo nếu khách bấm "Mua Vé".*
- **Lọc theo vị trí (Geolocation):** Xin quyền GPS để tự động hiện rạp ở gần nhất.
- **Lọc theo ngày & Cụm rạp:** Dropdown chọn chuỗi rạp (MINDX Cinema HCM, HN...) và chọn ngày.
- **Danh sách Suất chiếu:** Hiển thị danh sách giờ chiếu theo từng định dạng (2D, 3D, IMAX) và báo giá.

### 5. Màn hình Chọn Ghế (Seat Booking)
*Màn hình quan trọng nhất của luồng Mua vé Rạp.*
- **Sơ đồ trực quan (Seat Map):** Có lưới ghế hiển thị (Trống, Đang chọn, Đã bán, Ghế VIP/Sweetbox).
- **Khóa ghế (Real-time Lock):** Khi 1 khách chọn, ghế lập tức đổi màu trên màn hình người khác qua WebSockets (Socket.io) để chống trùng vé.
- **Tổng tiền tạm tính:** Bottom bar tự động cộng tiền vé.

### 6. Màn hình Chọn Bắp Nước & Thanh Toán (Checkout)
- **Menu Combo:** Nút Thêm/Bớt các loại bắp nước, hiển thị giá.
- **Áp dụng Mã Khuyến Mãi (Voucher):** Input điền mã giảm giá, hiển thị số tiền được trừ.
- **Chọn Phương thức thanh toán:** Tích hợp Ví (VNPay, MoMo) hoặc Thẻ tính dụng (Stripe). (Toàn bộ chạy trên môi trường Sandbox/Test).
- **Đếm ngược thời gian:** Đồng hồ 5-10 phút để thanh toán, nếu quá giờ ghế sẽ tự động nhả ra.

### 7. Màn hình Trình Phát Video (VOD Player)
*Dành riêng cho luồng Thuê phim Trực tuyến.*
- **Video Player Fullscreen:** Giao diện tối đen, phát video sắc nét.
- **Player Controls:** Dải điều khiển (Play/Pause, Thanh tiến trình thời gian, Chỉnh âm lượng, Phóng to).
- **Hạn giờ xem:** Góc trên màn hình cảnh báo số giờ còn lại (ví dụ "Phim sẽ hết hạn sau 47h 59m").

### 8. Màn hình Hồ Sơ Khách Hàng (User Profile)
- **Thông tin cá nhân:** Đổi Avatar, Đổi mật khẩu.
- **Lịch sử Giao dịch:** Xem lại danh sách phim đã thuê, vé rạp đã mua.
- **Vé Điện Tử Của Tôi (My Tickets):** Hiển thị mã QR Code lớn để đưa cho nhân viên quét lúc check-in tại rạp.
- **Chia sẻ Vé (Share Ticket):** Form điền email bạn bè để gửi tặng mã QR ghế cụ thể cho họ.

---

## B. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN DASHBOARD)

### 9. Màn hình Tổng Quan (Dashboard / Analytics)
- **Biểu đồ Thống kê:** Line chart/Bar chart báo cáo doanh thu vé, doanh thu VOD theo Tuần/Tháng.
- **Thẻ Tóm Tắt (Summary Cards):** Tổng Users, Vé đã bán trong ngày, Phim hot nhất.

### 10. Màn hình Quản Lý Phim (Movies Management)
- **Data Table:** Danh sách toàn bộ phim (hỗ trợ Tìm kiếm, Lọc, Phân trang).
- **Thêm/Sửa Phim:** Upload hình ảnh (Poster/Trailer), Nhập thông tin, Phân loại rạp/VOD.
- **Cấu hình VOD:** Form cài đặt giá thuê và thời hạn xem (vd: 50.000đ / 48 tiếng).

### 11. Màn hình Quản Lý Rạp & Phòng Chiếu (Cinema Management)
- **Quản lý chuỗi rạp:** Thêm rạp mới, cập nhật tọa độ (Longitude/Latitude).
- **Sơ đồ Phòng chiếu (Seat Map Builder):** Công cụ ma trận tạo số lượng hàng/cột ghế, đánh dấu các ghế bị hỏng hoặc ghế VIP.

### 12. Màn hình Lịch Chiếu (Showtime Management)
- **Lên lịch chiếu:** Chọn Phim -> Chọn Rạp -> Chọn Phòng -> Gán thời gian bắt đầu.
- **Cấu hình giá linh hoạt:** Ghi đè giá vé cơ bản (ví dụ tăng giá ngày Lễ, cuối tuần).

### 13. Màn hình Quản Lý Đơn Hàng & Vouchers (Bookings & Vouchers)
- **Danh sách Đơn hàng:** Xem chi tiết bill của khách (mua ghế nào, thuê phim gì, thanh toán chưa).
- **Quản lý Voucher:** Tạo mã giảm giá (10%, giảm 50k...), set hạn sử dụng.
- **Xử lý Khiếu nại:** Cung cấp tính năng đền bù (gửi tặng Voucher 100% vào email khách).

### 14. Ứng dụng/Màn hình Quét Vé (Check-in Scanner)
*Dành riêng cho Staff tại Rạp (Có thể mở trên Mobile Browser).*
- **Quét Mã QR:** Truy cập Camera điện thoại để quét mã QR từ khách hàng.
- **Hệ thống trả kết quả:** Báo Xanh (Vé hợp lệ, kèm list Combo bắp nước) hoặc Đỏ (Vé giả / Vé đã quét rồi).
