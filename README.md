# 🎓 Hệ Thống Quản Lý Mượn Đồ Dùng - CLB Sinh Viên

## 📋 Mô tả
Hệ thống web full-stack cho phép sinh viên đăng ký mượn thiết bị và quản trị viên quản lý kho, duyệt yêu cầu, gửi email thông báo tự động và xem thống kê.

## 🛠️ Tech Stack

| | Công nghệ |
|---|---|
| **Frontend** | Vite + React 18 + TypeScript + Ant Design 5 |
| **Backend** | Spring Boot 3 + Spring Data JPA + Spring Security |
| **Database** | Neon (PostgreSQL serverless) |
| **Auth** | JWT |
| **Email** | JavaMailSender (Gmail SMTP) |
| **Charts** | Ant Design Charts |
| **Frontend Deploy** | Netlify |
| **Backend Deploy** | Render.com |

## 👤 Tài khoản mẫu

| Role | Email | Mật khẩu |
|---|---|---|
| 👨‍💼 Admin | admin@club.edu.vn | Admin@123 |
| 👨‍🎓 Sinh viên | sinhvien@student.edu.vn | Student@123 |

---

## 🚀 Hướng dẫn chạy local

### Backend (Spring Boot)

1. **Yêu cầu**: Java 17+, Maven
2. **Cấu hình database Neon**:
   - Tạo tài khoản tại [neon.tech](https://neon.tech)
   - Tạo project mới → Lấy Connection String
   - Chỉnh sửa `backend/src/main/resources/application.properties`:
     ```properties
     spring.datasource.url=<YOUR_NEON_CONNECTION_STRING>
     ```
3. **Cấu hình Gmail SMTP** (App Password):
   - Vào Google Account → Security → 2-Step Verification → App passwords
   - Thêm vào `application.properties`:
     ```properties
     spring.mail.username=your-gmail@gmail.com
     spring.mail.password=your-app-password
     ```
4. **Chạy backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Backend sẽ khởi động tại `http://localhost:8080`

### Frontend (Vite + React)

1. **Cài đặt dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Tạo file `.env`**:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
3. **Chạy development server**:
   ```bash
   npm run dev
   ```
   Frontend tại `http://localhost:5173`

---

## ☁️ Deploy Production

### Bước 1: Deploy Database (Neon)
1. Đăng ký [neon.tech](https://neon.tech) → Tạo project
2. Copy Connection String (dạng `postgresql://user:pass@host/dbname?sslmode=require`)

### Bước 2: Deploy Backend (Render.com)
1. Đăng ký [render.com](https://render.com)
2. New → **Web Service** → Connect GitHub repo
3. Cấu hình:
   - **Root Directory**: `backend`
   - **Runtime**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/clubborrow-0.0.1-SNAPSHOT.jar`
4. **Environment Variables**:
   ```
   DATABASE_URL=<neon-connection-string>
   JWT_SECRET=<random-256-bit-string>
   MAIL_USERNAME=your-gmail@gmail.com
   MAIL_PASSWORD=your-gmail-app-password
   CORS_ALLOWED_ORIGINS=https://your-app.netlify.app
   ```
5. Deploy → Lấy URL backend (VD: `https://clubborrow-api.onrender.com`)

### Bước 3: Deploy Frontend (Netlify)
1. Đăng ký [netlify.com](https://netlify.com)
2. New site → Import from GitHub → Chọn repo
3. Cấu hình:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. **Environment Variables** → Add:
   ```
   VITE_API_BASE_URL=https://clubborrow-api.onrender.com
   ```
5. Deploy site!

---

## 📁 Cấu trúc thư mục

```
BTL/
├── backend/                    # Spring Boot
│   ├── src/main/java/com/btl/clubborrow/
│   │   ├── config/             # SecurityConfig, DataInitializer
│   │   ├── controller/         # REST Controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA Entities + Enums
│   │   ├── exception/          # Exception handlers
│   │   ├── repository/         # JPA Repositories
│   │   ├── scheduler/          # Cron jobs
│   │   ├── security/           # JWT
│   │   └── service/            # Business logic
│   └── pom.xml
└── frontend/                   # Vite + React + TS
    ├── src/
    │   ├── components/         # NotificationBell
    │   ├── layouts/            # Student/Admin layouts
    │   ├── pages/              # All pages
    │   ├── store/              # Redux + RTK Query
    │   ├── types/              # TypeScript types
    │   └── utils/              # Auth helpers
    ├── package.json
    └── netlify.toml
```

## 🔌 API Endpoints

| Method | Endpoint | Mô tả | Role |
|---|---|---|---|
| POST | `/api/auth/login` | Đăng nhập | — |
| GET | `/api/auth/me` | Thông tin tôi | ALL |
| GET | `/api/equipment` | Danh sách thiết bị | ALL |
| POST | `/api/equipment` | Thêm thiết bị | ADMIN |
| PUT | `/api/equipment/{id}` | Sửa thiết bị | ADMIN |
| DELETE | `/api/equipment/{id}` | Xóa thiết bị | ADMIN |
| GET | `/api/borrows` | Tất cả yêu cầu | ADMIN |
| GET | `/api/borrows/my` | Yêu cầu của tôi | STUDENT |
| POST | `/api/borrows` | Tạo yêu cầu | STUDENT |
| PUT | `/api/borrows/{id}/approve` | Duyệt | ADMIN |
| PUT | `/api/borrows/{id}/reject` | Từ chối | ADMIN |
| PUT | `/api/borrows/{id}/return` | Ghi nhận trả | ADMIN |
| GET | `/api/notifications` | Thông báo | ALL |
| GET | `/api/statistics/dashboard` | Thống kê tổng quan | ADMIN |
| GET | `/api/statistics/monthly` | Thống kê tháng | ADMIN |
| GET | `/api/statistics/overdue` | Danh sách quá hạn | ADMIN |
"# abc" 
