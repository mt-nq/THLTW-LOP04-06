# Hệ Thống Quản Lý Mượn Đồ Dùng - CLB Sinh Viên

Hệ thống web hỗ trợ quản lý việc mượn và trả thiết bị cho các câu lạc bộ sinh viên. Project bao gồm các chức năng đăng ký mượn, duyệt yêu cầu, quản lý kho thiết bị, thông báo tự động (in-app và qua email) và thống kê.

## Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite, TypeScript, Ant Design 5
- **Backend**: Spring Boot 3, Spring Data JPA, Spring Security (JWT)
- **Database**: PostgreSQL (Neon)
- **Khác**: JavaMailSender (Email SMTP), Ant Design Charts

## Tài Khoản Test

- **Quản trị viên**: `admin@club.edu.vn` (Mật khẩu: `Admin@123`)
- **Sinh viên**: `sinhvien@gmail.com` (Mật khẩu: `Student@123`)

## Hướng Dẫn Chạy Môi Trường Local

### Cài Đặt Backend
1. Yêu cầu hệ thống phải có Java 17+ và Maven.
2. Cấu hình database PostgreSQL trong file `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=<YOUR_CONNECTION_STRING>
```
3. Cấu hình SMTP để gửi email (sử dụng App Password của Gmail):
```properties
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-app-password
```
4. Di chuyển vào thư mục backend và chạy server:
```bash
cd backend
mvn spring-boot:run
```
Server sẽ chạy ở cổng 8080.

### Cài Đặt Frontend
1. Mở một terminal khác, di chuyển vào thư mục frontend và cài đặt thư viện:
```bash
cd frontend
npm install
```
2. Cấu hình biến môi trường trong file `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
```
3. Chạy dev server:
```bash
npm run dev
```
Giao diện web sẽ chạy ở địa chỉ `http://localhost:5173`.

## Cấu Trúc Thư Mục

- `backend/`: Chứa toàn bộ mã nguồn server Spring Boot.
- `frontend/`: Chứa mã nguồn giao diện React.

## Deploy Production

- **Database**: Khuyến nghị dùng [Neon.tech](https://neon.tech) hoặc Supabase.
- **Backend**: Có thể đẩy lên Render.com. Cần set các biến môi trường: `DATABASE_URL`, `JWT_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `CORS_ALLOWED_ORIGINS`.
- **Frontend**: Deploy lên Netlify hoặc Vercel. Nhớ set `VITE_API_BASE_URL` trỏ về API của backend.

## Tính Năng Chính
- Phân quyền người dùng (Admin, Sinh viên).
- Quản lý thiết bị trong kho (CRUD, theo dõi số lượng tồn).
- Quy trình mượn đồ (Tạo yêu cầu, chờ duyệt, đang mượn, đã trả, quá hạn, gia hạn).
- Thống kê biểu đồ trực quan dành cho Admin.
- Hệ thống thông báo thời gian thực và tự động gửi email nhắc nhở.
