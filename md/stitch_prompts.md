# 🤖 BỘ PROMPT DÀNH CHO STITCH / V0 ĐỂ TẠO GIAO DIỆN (PHẦN 2)

Dưới đây là danh sách các câu lệnh (Prompts) được thiết kế chuyên biệt để bạn copy-paste vào các công cụ AI tạo UI (như Stitch, v0.dev) nhằm tạo ra các component React + Tailwind CSS v4 chuẩn xác cho dự án CineStream.

---

## 1. GIAO DIỆN XÁC THỰC (ĐĂNG KÝ / ĐĂNG NHẬP)

**Prompt:**
> Build a dual-pane Auth page (Login and Register) for a premium cinema and VOD platform called 'CineStream'. 
> Use React and Tailwind CSS. The design should be dark-themed, sleek, and highly immersive (glassmorphism).
> 
> **Layout Requirements:**
> - Left side (or background): A high-quality, cinematic movie poster collage or a subtle video background with a dark overlay.
> - Right side (or center floating card): A glassmorphism card (backdrop-blur, semi-transparent dark background, subtle white borders) containing the form.
> 
> **Form Elements:**
> - A toggle to switch between 'Sign In' and 'Create Account' with smooth animation.
> - Input fields for Email, Password, and Full Name (for register) with floating labels. Inputs should have no background, just bottom borders that glow red (`#e50914`) on focus.
> - A prominent submit button (Red background, bold text, neon glow on hover).
> - 'Forgot Password?' link.
> - Social login buttons (Google, Facebook) with subtle styling.
> 
> **Vibe:** Cyberpunk-ish, Netflix meets modern cinema, premium feel.

---

## 2. GIAO DIỆN ADMIN DASHBOARD (LAYOUT CHÍNH)

**Prompt:**
> Create a modern, dark-themed Admin Dashboard Layout for a cinema and movie streaming platform.
> Use React and Tailwind CSS.
> 
> **Components:**
> 1. **Sidebar (Left):** 
>    - Logo 'CineStream Admin' at the top.
>    - Navigation links with icons (Dashboard, Movies, Cinemas, Showtimes, Bookings, Users, Settings).
>    - Active state should have a red accent (`#e50914`) and subtle background highlight.
>    - A collapse/expand button for the sidebar.
> 2. **Header (Top):**
>    - Global search bar (styled beautifully).
>    - Notification bell icon with a red dot indicator.
>    - Admin Avatar profile dropdown.
> 3. **Main Content Area:**
>    - A subtle dark gray background.
>    - Placeholder for page content.
> 
> The UI should look like a professional SaaS dashboard, using shades of deep gray (`#121212`, `#1a1a1a`, `#2a2a2a`), not pure black. Text should be crisp and legible.

---

## 3. GIAO DIỆN THỐNG KÊ (ANALYTICS OVERVIEW)

**Prompt:**
> Create a Dashboard Overview page for a cinema admin panel using React and Tailwind CSS.
> It sits inside a dark-themed dashboard.
> 
> **Requirements:**
> 1. **KPI Cards (Top row):** 4 cards showing 'Total Revenue', 'Tickets Sold', 'VOD Rentals', and 'New Users'. Each card should have an icon, the main number, and a small green/red indicator showing percentage growth vs last month. Use subtle glass/border effects.
> 2. **Charts Area (Middle row):** 
>    - Left: A placeholder for a Line Chart showing 'Revenue Over Time' (Cinema vs VOD).
>    - Right: A placeholder for a Doughnut Chart showing 'Revenue by Movie'.
>    - *Note: Just create beautifully styled empty containers with mock axes/labels if actual charts can't be rendered, or use simple CSS bars to mock it.*
> 3. **Top Performing Movies (Bottom row):** A beautiful table listing the top 5 movies. Columns: Rank, Movie Title (with small thumbnail), Tickets Sold, Total Revenue, Status.
> 
> Keep the dark mode consistent, using primary red (`#e50914`) for key highlights.

---

## 4. GIAO DIỆN SƠ ĐỒ CHỌN GHẾ (SEAT MAP BUILDER - RẤT QUAN TRỌNG)

**Prompt:**
> Build a cinematic Cinema Seat Selection Component using React and Tailwind CSS.
> The background should be dark.
> 
> **Layout:**
> - Top: A curved SVG shape representing the cinema screen with a glowing light effect projecting downwards.
> - Middle: A grid of seats. Rows labeled A to J, Columns 1 to 15.
> - There should be a visual gap (aisle) in the middle of the grid (e.g., between column 7 and 8).
> 
> **Seat Types & Styling:**
> - Each seat is a small stylized box/icon.
> - **Available (Standard):** Bordered, dark grey background. Hovering makes it slightly lighter.
> - **Available (VIP):** Bordered, gold/yellow accent.
> - **Selected:** Filled with brand red (`#e50914`), glowing box shadow.
> - **Sold/Occupied:** Darked out, unclickable, maybe an 'X' or distinct disabled look.
> 
> **Bottom Info:**
> - A legend explaining the seat colors (Available, VIP, Selected, Sold).
> - A sticky bottom bar showing 'Selected Seats: A1, A2', 'Total: $24.00', and a prominent 'Proceed to Checkout' button.

---

## 5. GIAO DIỆN QUẢN LÝ PHIM (ADMIN MOVIE LIST & FORM)

**Prompt:**
> Create a 'Movies Management' page for an Admin Dashboard using React and Tailwind CSS (Dark Mode).
> 
> **Part 1: Data Table**
> - Top bar: 'Add New Movie' button and a Search input.
> - Table columns: Poster (small image), Title, Genre, Release Date, Status Badge (Showing, Upcoming, VOD), Actions (Edit/Delete icons).
> - The table should look modern, with hover effects on rows.
> 
> **Part 2: Add/Edit Movie Modal (or separate form view)**
> - A clean form with sections:
>   - **Basic Info:** Title, Director, Duration, Description (textarea).
>   - **Media Upload:** Two drag-and-drop zones. One for 'Vertical Poster', one for 'Horizontal Banner'. They should look like dashed boxes with upload icons.
>   - **VOD Settings:** A toggle switch 'Enable VOD'. If toggled ON, reveal a 'VOD Price' input and a 'Full Movie File Upload' zone.
> 
> Use modern UI practices: rounded corners, smooth transitions, and clear visual hierarchy.
