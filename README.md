# SmartPhone AI

Website bán điện thoại có trợ lý AI, gồm giao diện React và backend Spring Boot. Dự án được thiết kế để chạy local, hỗ trợ thanh toán khi nhận hàng (COD) và miễn phí giao hàng.

Hệ thống chỉ sử dụng hai vai trò **CUSTOMER** và **ADMIN**. Admin gốc đăng nhập bằng username và mật khẩu; Gmail được cấu hình riêng để gửi OTP và lời mời Admin.

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

**Nếu database đã có dữ liệu:** sao lưu và thử trên bản sao trước khi khởi động BE. Migration V20 xóa các tài khoản STAFF/MANAGER cũ cùng dữ liệu liên quan của chính các tài khoản đó. Chi tiết tại [README backend](BE/README.md).

## Chạy dự án local

Các lệnh sau dùng PowerShell và giả sử bạn đang ở thư mục gốc dự án. Nếu thư mục đã được đổi tên hoặc di chuyển, mở terminal tại vị trí mới.

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

Lưu khóa ở nơi an toàn và sử dụng **cùng một khóa** cho các lần chạy sau để đọc được cấu hình AI đã mã hóa. Admin gốc được tạo nếu chưa tồn tại và đã cấu hình username/mật khẩu; thay đổi biến môi trường sau khi tài khoản đã được tạo không tự đổi mật khẩu đã lưu. Flyway sẽ áp dụng migration khi backend khởi động. Các biến `$env:` chỉ tồn tại trong terminal PowerShell hiện tại.

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

## Cấu hình AI và RAG

1. Đăng nhập Admin, mở **Cấu hình AI**, lưu cấu hình OpenAI/Gemini, kiểm tra kết nối rồi kích hoạt chat model.
2. Mở **Cấu hình embedding**, nhập provider, model, số chiều và API key phù hợp; kiểm tra và lưu.
3. Vào **Kho kiến thức AI**, tải tài liệu PDF/TXT và đợi trạng thái `READY`. PDF dạng ảnh không được OCR trong phạm vi hiện tại.
4. Vào AI Chat và chọn **Hỗ trợ cửa hàng** để hỏi theo tài liệu. Nếu không đủ căn cứ, hệ thống thông báo không thể xác nhận; khi có nguồn, hãy đối chiếu câu trả lời với tài liệu.

Mỗi cấu hình Chat hỗ trợ một API key chính và một API key dự phòng tùy chọn, dùng cùng provider và model. Admin nhập key dự phòng, lưu cấu hình, kiểm tra cả hai key rồi kích hoạt. Mỗi yêu cầu ưu tiên key chính. Khi provider trả HTTP 429 do quota hoặc giới hạn sử dụng, BE thử key dự phòng một lần. Để trống trường key giữ giá trị đã lưu, chọn **Xóa API Key dự phòng khi lưu** để gỡ key khỏi bản cấu hình mới. Với Gemini, các key cùng project dùng chung quota. [Giới hạn Gemini](https://ai.google.dev/gemini-api/docs/rate-limits)

Tư vấn và so sánh điện thoại dùng dữ liệu sản phẩm; trò chuyện chung dùng chat model. Email Gmail, nhà cung cấp AI và dữ liệu thực tế cần được kiểm thử trong môi trường của bạn.

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

Thư mục `docs/` đang được `.gitignore` bỏ qua, gồm cả các thư mục có tên `docs` bên trong dự án. Các tài liệu ở đó có thể không xuất hiện trong bản clone nếu chưa được chia sẻ riêng.
