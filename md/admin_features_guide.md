# 📊 ĐỊNH HƯỚNG CÁC CHỨC NĂNG QUẢN LÝ CỦA ADMIN (ADMIN DASHBOARD)

Tài liệu này vạch ra các tính năng cốt lõi cần có trong khu vực Quản trị (Admin Dashboard) của dự án CineStream. Hệ thống được chia thành các phân hệ quản lý độc lập giúp Admin dễ dàng vận hành toàn bộ vòng đời của một bộ phim từ rạp chiếu đến khi lên nền tảng VOD trực tuyến, cũng như theo dõi sát sao tình hình kinh doanh.

---

## 1. THỐNG KÊ & DOANH THU (ANALYTICS & DASHBOARD OVERVIEW)
Đây là màn hình đầu tiên Admin nhìn thấy khi đăng nhập. Cung cấp cái nhìn toàn cảnh về tình hình kinh doanh của hệ thống bằng các biểu đồ trực quan.

- **Thống kê Tổng quan (KPI Cards):**
  - Tổng doanh thu (Ngày/Tuần/Tháng).
  - Tổng số vé đã bán.
  - Tổng lượt thuê VOD.
  - Tổng số lượng tài khoản người dùng đăng ký mới.
- **Biểu đồ phân tích (Charts):**
  - Biểu đồ đường (Line chart) so sánh **Doanh thu Rạp** vs **Doanh thu VOD**.
  - Biểu đồ tròn (Pie chart) tỷ trọng doanh thu theo từng bộ phim.
  - Tỷ lệ lấp đầy rạp (Seat occupancy rate) trung bình.
- **Top Thịnh Hành:** Danh sách top 5 phim cháy vé nhất và top 5 phim VOD được thuê nhiều nhất.

---

## 2. QUẢN LÝ PHIM (MOVIES MANAGEMENT)
Nơi quản lý toàn bộ cơ sở dữ liệu về phim, dùng chung cho cả mảng Rạp và VOD.

- **Danh sách phim:** Hiển thị dạng bảng (Table) với các cột: Tên phim, Thể loại, Trạng thái (Đang chiếu, Sắp chiếu, Ngừng chiếu, Đã lên VOD). Có bộ lọc tìm kiếm nhanh.
- **Thêm/Sửa Phim:**
  - Nhập thông tin Metadata: Tiêu đề, Đạo diễn, Diễn viên, Thời lượng, Giới hạn độ tuổi.
  - Upload Hình ảnh & Video: Kéo thả Poster (khổ dọc), Banner (khổ ngang), nhập link Trailer (như đã quy định ở tài liệu Media).
- **Thiết lập VOD:** Đối với phim đã chiếu rạp xong, Admin có thể bật công tắc (Toggle) "Chuyển thành VOD", nhập giá thuê, thời gian có hiệu lực và upload file phim gốc (Full Video).

---

## 3. QUẢN LÝ CỤM RẠP & PHÒNG CHIẾU (CINEMAS & THEATERS)
Chỉ áp dụng cho mảng Booking. Quản lý cơ sở vật chất của hệ thống rạp.

- **Quản lý Cụm Rạp:** Thêm rạp mới (Tên rạp, Địa chỉ, Bản đồ GPS, Hotline). VD: CineStream Landmark, CineStream Chelsea.
- **Quản lý Phòng Chiếu:**
  - Định nghĩa các phòng (Phòng 1, Phòng 2, IMAX).
  - **Công cụ vẽ sơ đồ ghế (Seat Map Builder):** Admin thiết lập số hàng, số cột, định nghĩa loại ghế (Ghế thường, Ghế VIP, Ghế Đôi, Lối đi).

---

## 4. QUẢN LÝ LỊCH CHIẾU (SHOWTIMES)
Tính năng sống còn để hệ thống Booking hoạt động.

- **Lập lịch linh hoạt:** Chọn Phim -> Chọn Rạp -> Chọn Phòng Chiếu -> Thiết lập Khung giờ (Bắt đầu - Kết thúc).
- **Định giá động (Dynamic Pricing):**
  - Cài đặt giá vé cơ bản cho suất chiếu đó.
  - (Nâng cao) Phụ thu cuối tuần hoặc giờ vàng.
- **Hiển thị trực quan:** Giao diện lịch chiếu dạng Calendar/Timeline (như Google Calendar) giúp Admin dễ dàng nhận biết phòng chiếu nào đang trống để xếp lịch, chống trùng lặp giờ chiếu.

---

## 5. QUẢN LÝ ĐƠN HÀNG & GIAO DỊCH (BOOKINGS & TRANSACTIONS)
Kiểm soát dòng tiền và giải quyết khiếu nại của khách hàng.

- **Danh sách Đơn hàng (Transactions):** Hiển thị chi tiết thời gian mua, mã hóa đơn, tên người mua, tổng tiền, phương thức thanh toán (VNPay/Momo/Thẻ).
- **Phân loại giao dịch:** Bộ lọc để xem riêng các giao dịch "Mua vé rạp" (Ticket) và giao dịch "Thuê phim" (VOD).
- **Trạng thái:** Quản lý giao dịch Thành công / Thất bại / Chờ thanh toán. Tính năng hoàn tiền (Refund) trong trường hợp rạp gặp sự cố điện nước phải hủy suất chiếu.

---

## 6. QUẢN LÝ NGƯỜI DÙNG & TÀI KHOẢN (USERS & ROLES)
Quản lý tập khách hàng và phân quyền nội bộ.

- **Danh sách User:** Quản lý tài khoản khách hàng, lịch sử mua vé/thuê phim của từng người.
- **Phân quyền (Role Based Access):** 
  - Admin có thể cấp quyền cho một nhân viên làm `Sub-Admin` hoặc `Moderator`.
  - Cấp độ thành viên (Membership): Theo dõi những khách hàng đạt VIP (dựa trên tổng chi tiêu) để gửi thông báo/khuyến mãi tự động.
- **Chặn (Ban) tài khoản:** Tạm khóa tài khoản người dùng có hành vi gian lận (vd: spam đặt vé ảo nhưng không thanh toán).

---

## 🚀 TÓM LẠI & ƯU TIÊN PHÁT TRIỂN

Vì số lượng chức năng trên Admin Dashboard khá đồ sộ, quá trình thực hiện nên chia làm **3 Giai đoạn (Phases)**:

- **Giai đoạn 1 (Cốt lõi - Cần làm ngay):**
  1. Quản lý Phim (Thêm/Sửa thông tin cơ bản).
  2. Quản lý Cụm rạp & Phòng chiếu (Tạo sơ đồ ghế).
  3. Quản lý Suất chiếu (Xếp lịch để Frontend có data hiển thị đặt vé).
- **Giai đoạn 2 (Dòng tiền):**
  4. Quản lý giao dịch, đơn hàng.
  5. Quản lý VOD (Mở khóa tính năng mua/thuê phim).
- **Giai đoạn 3 (Tối ưu hóa):**
  6. Biểu đồ thống kê doanh thu toàn diện.
  7. Quản lý danh sách User chi tiết.
