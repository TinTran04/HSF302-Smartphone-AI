# SmartPhone AI — Backend

Backend Spring Boot cho catalog điện thoại, tài khoản và OTP, giỏ hàng, đơn COD, quản trị và trợ lý AI. Hợp đồng và nghiệp vụ được mô tả tại [API specification](../docs/API_SPECIFICATION.md) và [Business specification](../docs/BUSINESS_SPECIFICATION.md).

## Chuẩn bị local

- JDK 21 và Maven 3.9 trở lên.
- PostgreSQL có extension `vector` (pgvector), tạo database `smartphone_ai`. Tài khoản database cần quyền tạo extension khi Flyway chạy lần đầu.
- SMTP Gmail cho email OTP và lời mời Admin. Cấu hình AI và embedding riêng trong API quản trị trước khi dùng các chức năng liên quan.

Đặt các biến môi trường sau cho máy local, không ghi mật khẩu hoặc API key vào mã nguồn:

| Biến | Mục đích |
| --- | --- |
| `DB_URL` | JDBC URL, mặc định `jdbc:postgresql://localhost:5432/smartphone_ai` |
| `DB_USERNAME`, `DB_PASSWORD` | Tài khoản PostgreSQL |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Tài khoản và mật khẩu ứng dụng Gmail |
| `ROOT_ADMIN_USERNAME`, `ROOT_ADMIN_PASSWORD` | Tạo Admin gốc lần đầu nếu chưa tồn tại |
| `AI_CONFIG_ENCRYPTION_KEY` | Khóa AES 32 byte mã hóa Base64 để bảo vệ API key AI |

Giữ nguyên khóa mã hóa giữa các lần chạy để đọc lại cấu hình AI đã lưu. Thay biến Admin gốc sau khi đã khởi tạo không thay đổi mật khẩu trong database. Flyway áp dụng migration khi ứng dụng khởi động và Hibernate kiểm tra schema.

Từ thư mục gốc dự án:

```powershell
cd BE
mvn test
mvn spring-boot:run
```

API mặc định ở `http://localhost:8080/api`. Client cần lấy CSRF token tại `/api/auth/csrf`, lưu cookie phiên và gửi token khi thực hiện thao tác thay đổi.

## Kiểm thử

Bộ kiểm thử tự động sử dụng H2 và mock cho các dịch vụ ngoài. Nó không thay thế kiểm thử PostgreSQL/pgvector, SMTP hoặc nhà cung cấp AI thực tế. Tải tài liệu trả về `PROCESSING`; quá trình tạo embedding chạy nền và có thể chuyển sang `READY`, `FAILED` hoặc `DISABLED`. Các tài liệu còn `PROCESSING` được lên lịch lại khi ứng dụng khởi động. Cần cấu hình embedding hợp lệ trước khi lập chỉ mục.

Các thành phần ngoài và tích hợp FE cần được kiểm thử trên môi trường của dự án trước khi coi luồng đầu-cuối là hoàn tất.
