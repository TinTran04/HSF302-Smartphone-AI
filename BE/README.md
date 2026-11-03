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
| `SMTP_LOCALHOST` | Tên máy dùng khi gửi lệnh SMTP; mặc định `localhost` |
| `ROOT_ADMIN_USERNAME`, `ROOT_ADMIN_PASSWORD` | Tạo Admin gốc lần đầu nếu chưa tồn tại |
| `AI_CONFIG_ENCRYPTION_KEY` | Khóa AES 32 byte mã hóa Base64 để bảo vệ API key AI |

Giữ nguyên khóa mã hóa giữa các lần chạy để đọc lại cấu hình AI đã lưu. Admin gốc chỉ được tạo khi chưa tồn tại và đã cấu hình username/mật khẩu; username không chứa `@`, mật khẩu tối thiểu 8 ký tự. Admin gốc đăng nhập bằng username, không cần email. Thay biến Admin gốc sau khi đã khởi tạo không thay đổi mật khẩu trong database. Flyway áp dụng migration khi ứng dụng khởi động và Hibernate kiểm tra schema.

Migration `V20` xóa các tài khoản có vai trò `STAFF` hoặc `MANAGER` cũ cùng đơn hàng, giỏ, hội thoại, lời mời và OTP liên quan đến các tài khoản đó. Hãy sao lưu database trước khi khởi động phiên bản này với dữ liệu hiện có. Migration đã được kiểm thử bằng H2 và PostgreSQL 16 có pgvector trên database thử nghiệm; hãy kiểm tra thêm trên bản sao dữ liệu của bạn trước khi áp dụng vào database thực.

Cấu hình hiện tại đặt `spring.flyway.validate-on-migrate=false`. Không tự chạy `flyway repair` trên database có dữ liệu khi chưa kiểm tra lịch sử migration.

Từ thư mục gốc dự án:

```powershell
cd BE
mvn test
mvn spring-boot:run
```

API mặc định ở `http://localhost:8080/api`. Client cần lấy CSRF token tại `/api/auth/csrf`, lưu cookie phiên và gửi token khi thực hiện thao tác thay đổi.

Link lời mời Admin mặc định trỏ tới `http://localhost:5173/admin/invite`; có thể thay Spring property `app.admin-invitation-url` khi FE dùng địa chỉ khác. Chạy BE cùng FE theo [README dự án](../README.md).

Nếu khách đóng trang trước khi xác minh đăng ký, khách có thể đăng nhập lại bằng email và mật khẩu đã nhập để nhận OTP đăng ký mới (áp dụng thời gian chờ gửi lại 60 giây). Phiên chat Guest hết hạn sau 24 giờ; tác vụ chạy mỗi giờ xóa tối đa 100 phiên hết hạn cùng hội thoại Guest còn gắn với chúng. Hội thoại đã chuyển vào tài khoản được giữ lại.

## Kiểm thử

Bộ kiểm thử tự động sử dụng H2 và mock cho các dịch vụ ngoài. Các test PostgreSQL có điều kiện dùng `TEST_POSTGRES_URL`, `TEST_POSTGRES_USERNAME` và `TEST_POSTGRES_PASSWORD`; test migration yêu cầu database **trống và tách biệt**, test vector yêu cầu database thử nghiệm đã chạy migration. Không trỏ test vào database thật. Hướng dẫn test tích hợp FE–BE với H2 và SMTP giả có trong [README frontend](../FE/README.md).

## AI và tài liệu RAG

Trong trang quản trị, lưu cấu hình chat model, kiểm tra và kích hoạt OpenAI hoặc Gemini. Cấu hình embedding được quản lý riêng; nhập model, số chiều và API key phù hợp. Tải PDF/TXT từ **Kho kiến thức AI**; PDF ảnh không được OCR.

Tải tài liệu trả về `PROCESSING`; quá trình tạo embedding chạy nền và có thể chuyển sang `READY`, `FAILED` hoặc `DISABLED`. Các tài liệu còn `PROCESSING` được lên lịch lại khi ứng dụng khởi động. Chủ đề **Hỗ trợ cửa hàng** dùng tài liệu `READY` cho RAG; tư vấn và so sánh lấy dữ liệu sản phẩm. Xem `../docs/RAG_RULES.md` nếu tài liệu có trên máy.

Các kiểm thử H2/mock không thay thế kiểm thử Gmail, PostgreSQL/pgvector và nhà cung cấp AI thực tế. Cần kiểm thử các thành phần ngoài và tích hợp FE trên môi trường dự án trước khi coi luồng đầu-cuối là hoàn tất. Thư mục `docs/` đang bị Git bỏ qua.
