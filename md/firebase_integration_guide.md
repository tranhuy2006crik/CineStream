# 🔐 Hướng dẫn Tích hợp & Quản lý Firebase Authentication

Tài liệu này ghi lại quá trình tích hợp Firebase Authentication cho tính năng Đăng nhập bằng Google và Facebook của dự án Cinestream. Phục vụ cho việc tra cứu và tracking về sau.

## 1. Kiến trúc luồng xác thực (Authentication Flow)

Chúng ta kết hợp **Firebase Auth (Client)** và **Custom JWT (Server)** để không phá vỡ luồng phân quyền cũ:

1. **Frontend (React):** Khi User bấm "Continue with Google/Facebook", React gọi SDK của Firebase `signInWithPopup()`.
2. **Frontend:** Firebase trả về một đối tượng user kèm theo `idToken` (chứng thực từ Google).
3. **Frontend -> Backend:** React gửi `idToken` này lên API `/api/auth/social-login`.
4. **Backend (Node.js):** Backend dùng `firebase-admin` (với Service Account Key) để verify cái `idToken` này. Nếu đúng, giải mã ra `email`, `name`, `picture`.
5. **Database (MongoDB):**
   - Nếu `email` đã tồn tại: Cập nhật lại thông tin (nếu cần) và lấy `user._id`.
   - Nếu `email` chưa tồn tại: Tạo mới `User` trong CSDL với password ngẫu nhiên hoặc rỗng, cấp role `user`.
6. **Backend -> Frontend:** Backend tự sinh ra `Custom JWT` (như luồng đăng nhập bình thường) và trả về Frontend.
7. **Frontend:** Lưu `token` vào `localStorage` và chuyển hướng vào trang chủ.

---

## 2. Các biến môi trường cần thiết (.env)

### 2.1. Frontend (`frontend/.env`)
Bạn cần tạo một file `.env` ở thư mục `frontend` và điền các thông tin từ Firebase Console (Project Settings -> General -> Web App):

```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

### 2.2. Backend (`backend/.env`)
Để backend verify token, bạn cần tải file `serviceAccountKey.json` từ Firebase Console (Project Settings -> Service Accounts -> Generate new private key).
*Lưu ý: Không bao giờ push file này lên Github.*

Hoặc lưu dưới dạng biến môi trường Base64 / Đường dẫn:
```env
FIREBASE_SERVICE_ACCOUNT_PATH="./config/serviceAccountKey.json"
```

---

## 3. Các bước bạn (User) cần làm trên Firebase Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Tạo Project mới (ví dụ: `cinestream-auth`).
3. Vào mục **Build > Authentication > Sign-in method**.
4. Bật (Enable) **Google** và **Facebook**.
   - Với Facebook, bạn sẽ cần tạo một App bên [Meta for Developers](https://developers.facebook.com/) để lấy `App ID` và `App Secret` điền vào Firebase.
5. Cập nhật các biến môi trường vào source code.

*Tài liệu này được tạo vào ngày 04/06/2026. Code cơ sở đã được thiết lập sẵn sàng để kết nối khi bạn điền biến môi trường.*
