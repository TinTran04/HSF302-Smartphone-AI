# SmartPhone AI

Website bán điện thoại có trợ lý AI, gồm giao diện React và backend Spring Boot. Dự án được thiết kế để chạy local, hỗ trợ thanh toán khi nhận hàng (COD) và miễn phí giao hàng.

## Chức năng chính

- **Cửa hàng:** xem, tìm kiếm và lọc điện thoại; xem phiên bản; so sánh sản phẩm; dùng giỏ hàng và đặt hàng COD.
- **Tài khoản:** đăng ký, đăng nhập và đặt lại mật khẩu với OTP qua email; quản lý thông tin cá nhân và theo dõi đơn hàng.
- **Trợ lý AI:** tư vấn điện thoại, so sánh sản phẩm, hỗ trợ thông tin cửa hàng từ tài liệu và trò chuyện chung. Khách chưa đăng nhập được gửi tối đa hai tin nhắn trong mỗi phiên Guest.
- **Quản trị:** quản lý sản phẩm, thương hiệu, đơn hàng, tài khoản Admin, chế độ bảo trì, tài liệu AI và cấu hình nhà cung cấp AI/embedding.

Dự án không xử lý tồn kho thực tế, thanh toán trực tuyến hoặc kết nối đơn vị vận chuyển.

## Công nghệ và cấu trúc

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, TanStack Query |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA, Flyway |
| Dữ liệu | PostgreSQL và extension pgvector |
| AI | OpenAI hoặc Gemini; truy xuất tài liệu PDF/TXT bằng RAG |
| Kiểm thử | Vitest, Playwright, JUnit, H2 |

```text
smartphone-ai/
├── BE/       # Mã nguồn, migration và kiểm thử backend
├── FE/       # Giao diện React, tài nguyên và kiểm thử frontend
├── docs/     # Đặc tả nghiệp vụ, API và kế hoạch
└── README.md
```

## Yêu cầu trước khi chạy

- JDK 21 và Maven 3.9 trở lên.
- Node.js 22.12 trở lên và npm.
- PostgreSQL đã cài extension **pgvector**. Tạo database `smartphone_ai`; tài khoản database cần quyền tạo extension khi Flyway chạy lần đầu.
- Tài khoản Gmail và mật khẩu ứng dụng để gửi OTP và lời mời Admin. Các tính năng này cần SMTP hoạt động.
- API key của OpenAI hoặc Gemini nếu muốn sử dụng AI thật. Cấu hình Chat Model và Embedding Model riêng trong trang quản trị.

## Chạy dự án local

Các lệnh sau dùng PowerShell và giả sử bạn đang ở thư mục gốc `E:\HSF\smartphone-ai`.

### 1. Cấu hình và chạy backend

Trong terminal dành cho backend, đặt các biến môi trường phù hợp với máy của bạn:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/smartphone_ai"
$env:DB_USERNAME = "<ten-nguoi-dung-postgresql>"
$env:DB_PASSWORD = "<mat-khau-postgresql>"
$env:SMTP_USERNAME = "<email-gmail>"
$env:SMTP_PASSWORD = "<mat-khau-ung-dung-gmail>"
$env:ROOT_ADMIN_USERNAME = "<ten-dang-nhap-admin-goc>"
$env:ROOT_ADMIN_PASSWORD = "<mat-khau-admin-goc>"
$env:AI_CONFIG_ENCRYPTION_KEY = "<khoa-base64-cua-32-byte-ngau-nhien>"

cd BE
mvn spring-boot:run
```

Thay các giá trị trong dấu `<...>` bằng cấu hình của bạn; không lưu thông tin thật vào mã nguồn. Có thể tạo khóa mã hóa một lần bằng PowerShell:

```powershell
$aiKeyBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($aiKeyBytes)
[Convert]::ToBase64String($aiKeyBytes)
```

Lưu khóa ở nơi an toàn và sử dụng **cùng một khóa** cho các lần chạy sau để đọc được cấu hình AI đã mã hóa. Admin gốc được tạo khi khởi động lần đầu; thay đổi biến môi trường sau khi tài khoản đã được tạo không tự đổi mật khẩu đã lưu. Flyway sẽ áp dụng migration khi backend khởi động.

Backend mặc định phục vụ API tại `http://localhost:8080/api`. Tham khảo [hướng dẫn backend](BE/README.md) để biết chi tiết cấu hình và kiểm thử.

### 2. Chạy frontend

Mở một terminal khác tại thư mục gốc dự án:

```powershell
cd FE
npm install
npm run dev
```

Mở `http://localhost:5173`. FE mặc định gọi API thật qua `/api`; Vite chuyển tiếp các request đến `http://localhost:8080`. Nếu BE chạy ở địa chỉ khác, tạo `FE/.env.local`:

```dotenv
VITE_API_BASE_URL=/api
VITE_API_TARGET=http://localhost:8080
VITE_ENABLE_MOCK_API=false
```

Sửa `VITE_API_TARGET` theo địa chỉ backend và khởi động lại Vite. Không đưa mật khẩu hay API key vào biến `VITE_*`. Cấu hình proxy này dùng cho Vite khi phát triển; môi trường triển khai cần cấu hình proxy tương ứng.

### Chế độ demo giao diện

Nếu chỉ muốn xem giao diện mà không kết nối BE, đặt `VITE_ENABLE_MOCK_API=true` trong `FE/.env.local` và khởi động lại Vite. Chế độ demo hiển thị thông báo trên trang, sử dụng dữ liệu giả và không gửi email hay gọi nhà cung cấp AI thật. Tài khoản demo và thông tin chi tiết có trong [hướng dẫn frontend](FE/README.md).

## Kiểm thử

Chạy từ các terminal tại thư mục tương ứng:

```powershell
# Backend
cd BE
mvn test
```

```powershell
# Frontend
cd FE
npm test
npm run build
npm run test:e2e
```

Kiểm thử giao diện dùng Chrome cài trên máy và chạy ở chế độ demo. Dự án cũng có `npm run test:integration` để kiểm thử FE với Spring Boot, H2 và SMTP giả cục bộ; xem cách khởi động các dịch vụ thử nghiệm trong [FE README](FE/README.md). Các kiểm thử dùng H2 hoặc dịch vụ giả không thay thế việc kiểm thử PostgreSQL/pgvector, Gmail và nhà cung cấp AI thực tế.

## Tài liệu

- [Đặc tả nghiệp vụ](docs/BUSINESS_SPECIFICATION.md)
- [Đặc tả REST API](docs/API_SPECIFICATION.md)
- [Hướng dẫn frontend](FE/README.md) và [tích hợp API](FE/docs/API_INTEGRATION.md)
- [Hướng dẫn backend](BE/README.md)
- [Đặc tả frontend](FE/docs/FE_SPEC.md)
