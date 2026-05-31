# 📚 HƯỚNG DẪN QUẢN LÝ DỮ LIỆU MEDIA TỪ A-Z DÀNH CHO ADMIN

Tài liệu này hướng dẫn chi tiết luồng xử lý và quản lý dữ liệu Media (Hình ảnh, Video) dành cho Ban Quản Trị (Admin) của dự án CineStream. Bao gồm quy trình xử lý phim chiếu rạp (Booking) và phim cho thuê trực tuyến (VOD).

---

## 1. TỔNG QUAN HỆ THỐNG QUẢN LÝ (ADMIN WORKFLOW)

Người quản lý (Admin) sẽ không tương tác trực tiếp với Database hay code. Thay vào đó, Admin sẽ sử dụng một giao diện **Admin Dashboard** (Trang quản trị nội bộ) để thao tác.

**Quy trình 3 bước cốt lõi:**
1. **Upload:** Admin tải file (Ảnh/Video) từ máy tính lên Dashboard.
2. **Lưu trữ Cloud:** Backend sẽ đẩy các file này lên Dịch vụ Lưu trữ Đám mây (Cloudinary, AWS, Youtube) và nhận về các đường link (URL).
3. **Lưu Database:** Backend lưu các URL này vào MongoDB cùng với tên phim, mô tả, giá vé.

---

## 2. QUẢN LÝ PHIM CHIẾU RẠP (BOOKING)

Phim chiếu rạp yêu cầu dữ liệu media nhẹ hơn (chỉ cần Ảnh và Video Trailer).

### A. Poster và Banner (Hình ảnh)
- **Công cụ khuyến nghị:** Cloudinary (Gói Free).
- **Quy trình Admin thao tác:**
  - Trong Admin Dashboard -> Chọn tab **Quản lý Phim**.
  - Bấm **Thêm Phim Mới**.
  - Có 2 ô input dạng File Upload: `Upload Poster (Khổ dọc)` và `Upload Banner (Khổ ngang)`.
  - Khi Admin bấm "Lưu", Backend sẽ gửi file ảnh lên Cloudinary qua API.
  - Cloudinary trả về link: `https://res.cloudinary.com/cinestream/image/upload/v12345/dune-poster.jpg`.
  - URL này được lưu vào bảng `movies` ở MongoDB.

### B. Trailer (Video ngắn)
- **Công cụ khuyến nghị:** Youtube (Unlisted) hoặc Cloudinary Video.
- **Quy trình Admin thao tác:**
  - Cách 1 (Dễ nhất cho Demo): Admin tự up Trailer lên Youtube cá nhân ở chế độ Unlisted (Không công khai). Sau đó chỉ cần dán URL Youtube vào ô `Trailer Link` trên Dashboard.
  - Cách 2 (Chuyên nghiệp): Tương tự hình ảnh, Admin upload file `.mp4` nặng khoảng 50MB lên Dashboard. Backend đẩy lên Cloudinary/AWS, lấy URL file `.mp4` hoặc `.m3u8` lưu vào MongoDB.

---

## 3. QUẢN LÝ PHIM VOD (THUÊ PHIM TRỰC TUYẾN)

VOD (Video On Demand) phức tạp hơn vì đây là những file phim gốc, rất nặng (Vài GB) và cần bảo mật chống tải lậu.

### A. Đưa Phim Thực Tế Vào Hệ Thống (Phim nguyên bộ)
- **Không bao giờ:** Lưu file `.mp4` vào MongoDB hoặc thư mục Source Code. Nếu user F12, họ có thể tải trộm phim ngay lập tức.
- **Công cụ khuyến nghị:** Mux.com, AWS S3 + CloudFront, hoặc Google Drive (Nếu chỉ làm đồ án Demo).
- **Quy trình Admin thao tác:**
  1. Trong Dashboard -> Chuyển sang Tab **VOD Manager**.
  2. Bấm nút **Chuyển Phim Thành VOD** (Dành cho phim đã hết hạn chiếu rạp) hoặc **Thêm Phim VOD Mới**.
  3. Upload file phim chất lượng cao (File gốc có thể lên tới 10GB).
  4. Backend tích hợp SDK của dịch vụ Streaming (ví dụ: Mux API). Dịch vụ này sẽ nhận file, tự động cắt nhỏ thành hàng nghìn mảnh (Streaming HLS) để chống giật lag và chống tải lậu.
  5. Dịch vụ trả về URL dạng m3u8: `https://stream.mux.com/1a2b3c4d.m3u8`.
  6. Backend lưu URL này vào field `full_movie_url` trong MongoDB và đặt cờ `isVOD: true`.

### B. Quản Lý Quyền Truy Cập (User Authentication cho VOD)
- Bất kỳ ai cũng có thể xem trang chi tiết phim, nhưng **nút Play Video sẽ bị khóa**.
- Quy trình:
  - Khách hàng bấm **"Thuê phim với giá 50.000đ"**.
  - Hoàn tất thanh toán qua VNPay/MoMo.
  - Hệ thống tạo một record trong bảng `Bookings` với type là `VOD` và `vodExpireAt` là thời gian hết hạn (VD: 48 giờ sau).
  - Khi user truy cập trang xem phim, Backend kiểm tra: Nếu User đã trả tiền và chưa quá 48 giờ -> Trả về `full_movie_url` -> Frontend dùng `Video.js` hoặc `React-Player` để phát phim.

---

## 4. GIAO DIỆN ADMIN DASHBOARD CẦN XÂY DỰNG

Để người quản lý có thể làm được tất cả những việc trên, chúng ta sẽ cần code một khu vực riêng biệt tại đường dẫn `/admin`.

### Cấu trúc giao diện Admin:
- **Tab Movies:** Bảng danh sách các phim. Có nút Sửa/Xóa.
- **Form Thêm/Sửa Phim:**
  - `Title`, `Description`, `Duration`, `Age Rating`, `Format` (Text Input)
  - `Status`: Dropdown (Đang chiếu, Sắp chiếu, Đã chuyển sang VOD)
  - `Poster Image`, `Banner Image`: Drop Zone (Kéo thả file)
  - `Trailer Video`: Ô nhập URL hoặc Upload File.
  - `VOD Settings`: Toggle Bật/Tắt bán online -> Nếu bật, hiện thêm ô `Giá Thuê` và nút `Upload Phim Gốc (Full Movie)`.

---

## 5. BẢN THIẾT KẾ DATABASE (LƯU Ý DÀNH CHO BỘ PHẬN CODE)

Khi Admin thao tác, dữ liệu thực tế lưu trong MongoDB sẽ trông như thế này:

```json
{
  "_id": "60d5ecb74d6bb892...",
  "title": "Dune: Part Two",
  "status": "showing", 
  "poster": "https://res.cloudinary.com/.../dune-poster.jpg",
  "banner": "https://res.cloudinary.com/.../dune-banner.jpg",
  "trailer": "https://www.youtube.com/embed/Way9Dexny3w",
  
  // Các trường dành riêng cho VOD (Thuê phim online)
  "isVOD": true,
  "vodPrice": 50000,
  "full_movie_url": "https://stream.mux.com/123xyz.m3u8",
  "uploadedBy": "admin_id_001" // Lưu lại ID của người quản lý đã upload
}
```

## 6. TÓM TẮT CÁC BƯỚC TIẾP THEO ĐỂ CODE

Nếu bạn muốn hiện thực hóa luồng này, tiến trình phát triển sẽ là:
1. **Thiết lập Cloudinary:** Tạo tài khoản, lấy API Key, cài thư viện `multer` và `cloudinary` vào Node.js Backend để nhận file ảnh từ Admin.
2. **Thiết kế API Admin:** Viết API `POST /api/movies` (chỉ cho phép user có `role: admin` gọi) để upload file và lưu MongoDB.
3. **Làm giao diện Dashboard:** Tạo route `/admin` trên React, dựng các Form nhập liệu cho Admin tải file.
4. **Viết luồng Check Quyền Xem Phim VOD:** Viết API kiểm tra tài khoản của user trước khi trả về link phim gốc.
