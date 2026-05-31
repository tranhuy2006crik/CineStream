# 🎨 TÀI LIỆU PROMPT THIẾT KẾ UI/UX (DÀNH CHO STITCH / AI GENERATOR)

Tài liệu này chứa bộ Prompt (Câu lệnh) được tinh chỉnh cực kỳ chi tiết, phân chia theo từng trang (Page-by-page), từng hiệu ứng (Effects) và tone màu (Color palette). Bạn chỉ cần copy từng block text dưới đây thả vào AI (như Stitch, v0.dev) để AI tự động code ra giao diện React/Tailwind chuẩn chỉnh nhất.

---

## 1. 🎭 BỘ NHẬN DIỆN THƯƠNG HIỆU (DESIGN SYSTEM & TONE MÀU)
*Hãy copy đoạn này dán vào đầu mỗi phiên làm việc với AI để nó hiểu "Luật" thiết kế của dự án.*

```text
You are an Elite UI/UX Designer and Senior React/Tailwind Developer. We are building a "Cinema Ticket Booking & VOD Rental Platform". You must strictly follow this Design System for all components:

1. COLOR PALETTE (NETFLIX CLONE - ĐÂY CHÍNH LÀ TONE MÀU CHỦ ĐẠO):
- Background: Pitch Black (#141414) for the main body, Dark Gray (#181818) for cards/modals. (Nền đen đặc trưng của Netflix)
- Primary Accent: Netflix Red (#E50914) for Call-To-Action buttons, active states, and highlights. (Màu đỏ thương hiệu)
- Text: Pure White (#FFFFFF) for primary text, Light Gray (#B3B3B3) for secondary text/subtitles.

2. TYPOGRAPHY:
- Use 'Inter' or 'Roboto' sans-serif. 
- High contrast: Bold font-weights for Headings, thin/regular for descriptions.

3. EFFECTS & ANIMATIONS:
- Hover effects on Movie Cards: Smooth scale-up (scale-105) with a transition duration of 300ms, and a soft red or black shadow (box-shadow).
- Glassmorphism: Use subtle blur (backdrop-blur-md) and semi-transparent dark backgrounds for fixed Navbars and Modals.
- Skeletons: Use dark-gray pulsing animations for loading states.

4. TECHNICAL RULES:
- Output functional React components (export default function).
- Use ONLY Tailwind CSS utility classes. No custom CSS files.
- Mobile-first responsive design (use md:, lg: prefixes heavily).
- Use Lucide-react icons.
```

---

## 2. 📄 PROMPT CHO TỪNG TRANG CỤ THỂ (PAGE-BY-PAGE PROMPTS)

### 🔑 Trang 0: Đăng Nhập / Đăng Ký (Auth/Login Page)
*Mục đích: Màn hình chào mừng và đăng nhập, giống màn hình "Sign In" hoặc "Who's watching" của Netflix.*

```text
Build the 'Login and Registration' page using the agreed Netflix Clone Design System.

Requirements:
1. Background: A full-screen dark image of mixed movie posters, heavily dimmed/darkened with a black overlay (opacity 60-80%).
2. Header: Very simple transparent header with only the Red Logo on the top left.
3. Auth Box (Center):
   - A centered rectangular box with a semi-transparent dark background (#000000 with 70% opacity), subtle glass blur.
   - Large white heading "Sign In".
   - Input fields: Email and Password (dark gray background, no borders, white text, focus ring in Netflix Red).
   - A massive solid Red (#E50914) "Sign In" button.
   - Links for "Forgot Password?" and a toggle text "New to Cinema? Sign up now."
4. User Profiles (Optional State): After login, show a "Who's watching?" screen with large square avatars and names underneath, scaling up on hover.
```

### 🏠 Trang 1: Trang Chủ (Home Page)
*Mục đích: Gây ấn tượng mạnh ngay khi vào web, show phim hot nhất.*

```text
Build the 'Home Page' for our Cinema app using the agreed Design System.

Requirements:
1. Transparent Sticky Navbar: Turns solid #141414 when scrolled past 50px. Contains Logo, 'Movies', 'Cinemas', 'VOD', and a User Avatar.
2. Hero Section: 
   - Takes up 85vh height.
   - Background is a massive, high-quality movie wallpaper with a gradient overlay (fade to #141414 at the bottom).
   - Left-aligned huge Movie Title, age rating badge (e.g., 18+), short description.
   - Two buttons: A solid Red (#E50914) "🎟️ Book Ticket" button and a glass/white "▶ Play Trailer" button.
3. Movie Rows (Horizontal Scroll):
   - Create 3 rows: "Now Showing", "Top Rated VODs", "Coming Soon".
   - Each row has a title and a horizontal scrolling list of Movie Cards (vertical posters).
   - Movie Card Hover Effect: Scale up, reveal the movie genre and a small red "Rent / Book" button inside the card.
```

### 🎬 Trang 2: Popup Chi tiết Phim (Movie Details Modal)
*Mục đích: Hiện thông tin phim nổi lên trên màn hình (kiểu Netflix Modal).*

```text
Build the 'Movie Details Modal' component. It should look like the modal that pops up on Netflix when you click a movie.

Requirements:
1. Modal Container: Centered, max-width 4xl, dark background (#181818), rounded corners, subtle shadow.
2. Top Header (Video Player simulation): 
   - A 16:9 image/video placeholder playing a trailer, fading into the dark background at the bottom.
   - A close button (X) at the top right.
3. Content Area:
   - Left side: Movie Title, Match Score (e.g., 98% Match), Release Year, Age Rating, Duration.
   - Two massive CTA buttons: "🎫 Book Cinema Ticket" (Red) and "🎬 Rent Online for $2" (Outlined).
   - Right side: Cast, Director, Genres (in smaller light gray text).
   - Bottom: A section for "User Reviews" showing 5-star ratings and short comments.
```

### 💺 Trang 3: Trang Đặt Vé & Sơ Đồ Ghế (Seat Booking)
*Mục đích: Trực quan hóa rạp chiếu phim để khách chọn chỗ.*

```text
Build the 'Cinema Seat Booking' page. This is the core interactive feature.

Requirements:
1. Screen Indicator: At the top, draw a curved glowing white/blue line representing the Cinema Screen with text "SCREEN".
2. Seat Map Matrix:
   - A grid layout (e.g., 10 columns x 8 rows).
   - Seat legends: 
     - Available (Bordered gray box)
     - Selected (Filled Netflix Red #E50914)
     - Booked/Unavailable (Dark gray, opacity-50, unclickable)
     - VIP/Sweetbox (Maybe a gold border for distinction).
   - Add row letters (A-H) on the left side of the grid.
3. Bottom Checkout Bar:
   - Fixed at the bottom of the screen.
   - Shows: Selected Seats (e.g., "G4, G5"), Subtotal Price.
   - A glowing Red "Continue to Payment" button.
```

### 📺 Trang 4: Trình Phát Video (VOD Player)
*Mục đích: Giao diện xem phim online cực kỳ tối giản.*

```text
Build the 'VOD Video Player' page. This should be extremely immersive and distraction-free.

Requirements:
1. Fullscreen layout (100vw, 100vh), pure black background (#000000).
2. Video placeholder in the center.
3. Player Controls (hidden by default, appears on hover):
   - A sleek bottom control bar (glassmorphism).
   - Play/Pause icon, Progress bar (Red filled section for progress, gray for buffer).
   - Volume slider, Time remaining, Subtitle toggle (CC), Fullscreen toggle.
4. Top left: A subtle "Back arrow" to exit the player.
```

### 📈 Trang 5: Dashboard Quản Trị (Admin Panel)
*Mục đích: Cho chủ rạp quản lý doanh thu, xem báo cáo.*

```text
Build the 'Admin Dashboard' layout. 

Requirements:
1. Sidebar: Fixed on the left, dark background (#181818), logo at the top. Menu items: Dashboard, Movies, Cinemas, Bookings, Users (with hover states turning text Red).
2. Topbar: Search bar, Admin Profile, Notification bell.
3. Main Content Area (Background #141414):
   - 4 Summary Cards at the top: Total Revenue, Tickets Sold, Active VOD Rentals, New Users (Use red text/icons for positive trends).
   - A large chart placeholder (e.g., "Revenue over the last 7 days").
   - A "Recent Transactions" table displaying user email, movie name, type (Cinema/VOD), amount, and status (Success/Pending).
```
