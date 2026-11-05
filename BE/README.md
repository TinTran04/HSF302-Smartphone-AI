# SmartPhone AI — Backend

Backend Spring Boot cho catalog điện thoại, tài khoản và OTP, giỏ hàng, đơn COD, quản trị và trợ lý AI. Hợp đồng và nghiệp vụ được mô tả tại [API specification](../docs/API_SPECIFICATION.md) và [Business specification](../docs/BUSINESS_SPECIFICATION.md).

## Cấu trúc backend

```text
com.smartphoneai/
├── controller/                  # REST API, nhận request và trả response
├── service/                     # Interface và hợp đồng nghiệp vụ
│   ├── ProductService.java
│   ├── OrderService.java
│   ├── impl/                    # Các lớp triển khai, transaction và async
│   │   ├── ProductServiceImpl.java
│   │   ├── OrderServiceImpl.java
│   │   └── SpringAiProviderClient.java
│   └── support/                 # Mã hóa, trích xuất tài liệu và policy
├── mapper/                      # Ánh xạ entity sang DTO
├── repository/                  # Truy cập dữ liệu bằng Spring Data JPA
├── entity/                      # Entity database
├── dto/                         # Request và response
├── config/                      # Cấu hình Spring, security và khởi tạo
└── exception/                   # Ngoại lệ và xử lý lỗi API
```

Controller và các service khác inject interface. Spring tạo bean từ các lớp `*Impl` trong `service/impl`. Các implementation gửi Gmail và kết nối AI cũng nằm trong thư mục này. Các kiểu record công khai thuộc interface tương ứng. Annotation `@Transactional`, `@Async` và `@Scheduled` được đặt trên phương thức implementation.

## Chuẩn bị local

- JDK 21 và Maven 3.9 trở lên.
- PostgreSQL có extension `vector` (pgvector), tạo database `smartphone_ai`. Tài khoản database cần quyền tạo extension khi Flyway chạy lần đầu.
- SMTP Gmail cho email OTP và lời mời Admin. Cấu hình AI và embedding riêng trong API quản trị trước khi dùng các chức năng liên quan.

Nhận file `.env` đã điền sẵn từ người phụ trách dự án và đặt tại `BE/.env`, hoặc sao chép `.env.example` thành `.env` để cấu hình lần đầu. BE tự đọc file khi working directory là thư mục `BE` hoặc thư mục gốc dự án.

File dùng định dạng `KEY=value` của Java properties. Giá trị viết trực tiếp, dấu gạch chéo ngược viết thành `\\`. Các biến môi trường của IntelliJ hoặc terminal có ưu tiên cao hơn file. Khởi động lại BE sau khi cập nhật `.env`.

Các giá trị trong file gồm những nhóm sau.

| Biến | Mục đích |
| --- | --- |
| `DB_URL` | JDBC URL, mặc định `jdbc:postgresql://localhost:5432/smartphone_ai` |
| `DB_USERNAME`, `DB_PASSWORD` | Tài khoản PostgreSQL |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Tài khoản và mật khẩu ứng dụng Gmail |
| `SMTP_LOCALHOST` | Tên máy dùng khi gửi lệnh SMTP; mặc định `localhost` |
| `ROOT_ADMIN_USERNAME`, `ROOT_ADMIN_PASSWORD` | Tạo Admin gốc lần đầu nếu chưa tồn tại |
| `AI_CONFIG_ENCRYPTION_KEY` | Khóa AES 32 byte mã hóa Base64 để bảo vệ API key AI |

File `.env` được Git bỏ qua và chia sẻ riêng. File `.env.example` đi cùng repository. Các kiểm thử tự động được tách khỏi `.env` để sử dụng database và dịch vụ thử nghiệm. Có thể chỉ định vị trí cấu hình riêng qua `APP_ENV_FILE` với cú pháp Spring config import khi chạy ứng dụng từ thư mục khác.

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

Mỗi lần gọi Chat được thử tối đa hai lần khi nhà cung cấp trả HTTP 503, cách nhau 750 ms. Sau lần thử cuối, lỗi vẫn được trả về nếu provider tiếp tục quá tải. HTTP 429 sử dụng quy tắc key dự phòng đã cấu hình. Bộ đọc JSON AI chấp nhận JSON thuần và JSON trong khối Markdown cho phân loại chủ đề, chọn sản phẩm và câu trả lời RAG.

Trong trang quản trị, lưu cấu hình chat model, kiểm tra và kích hoạt OpenAI hoặc Gemini. Cấu hình embedding được quản lý riêng; nhập model, số chiều và API key phù hợp. Tải PDF/TXT từ **Kho kiến thức AI**; PDF ảnh không được OCR.

Cấu hình Chat có thêm `backupApiKey` tùy chọn và `removeBackupKey` để xóa key dự phòng. Bỏ trống key giữ giá trị trước đó của cùng provider. Cả hai key được mã hóa và chỉ trả về `maskedKey`/`maskedBackupKey`. Bước kiểm tra gọi thử cả hai key. Nếu key chính trả HTTP 429, bước kiểm tra có thể thành công khi key dự phòng hoạt động. Lưu và kiểm tra thành công mới cho kích hoạt bản cấu hình mới.

Mỗi lần gọi Chat ưu tiên key chính, gặp HTTP 429 thì thử key dự phòng đúng một lần với cùng model và prompt. Lỗi lần thử cuối được trả về khi cả hai key đều lỗi. Với Gemini, các key cùng project dùng chung quota. Migration `V21` bổ sung cột key dự phòng và cấu hình cũ tiếp tục chạy với key chính. [Giới hạn Gemini](https://ai.google.dev/gemini-api/docs/rate-limits)

Tải tài liệu trả về `PROCESSING`; quá trình tạo embedding chạy nền và có thể chuyển sang `READY`, `FAILED` hoặc `DISABLED`. Các tài liệu còn `PROCESSING` được lên lịch lại khi ứng dụng khởi động. Chủ đề **Hỗ trợ cửa hàng** dùng tài liệu `READY` cho RAG; tư vấn và so sánh lấy dữ liệu sản phẩm. Xem `../docs/RAG_RULES.md` nếu tài liệu có trên máy.

Các kiểm thử H2/mock không thay thế kiểm thử Gmail, PostgreSQL/pgvector và nhà cung cấp AI thực tế. Cần kiểm thử các thành phần ngoài và tích hợp FE trên môi trường dự án trước khi coi luồng đầu-cuối là hoàn tất. Thư mục `docs/` đang bị Git bỏ qua.
