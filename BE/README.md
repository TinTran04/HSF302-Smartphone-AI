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
- SMTP Gmail cho email OTP và lời mời kích hoạt tài khoản. Cấu hình AI và embedding riêng trong API quản trị trước khi dùng các chức năng liên quan.

Nhận file `.env` đã điền sẵn từ người phụ trách dự án và đặt tại `BE/.env`, hoặc sao chép `.env.example` thành `.env` để cấu hình lần đầu. BE tự đọc file khi working directory là thư mục `BE` hoặc thư mục gốc dự án.

File dùng định dạng `KEY=value` của Java properties. Giá trị viết trực tiếp, dấu gạch chéo ngược viết thành `\\`. Các biến môi trường của IntelliJ hoặc terminal có ưu tiên cao hơn file. Khởi động lại BE sau khi cập nhật `.env`.

Các giá trị trong file gồm những nhóm sau.

| Biến | Mục đích |
| --- | --- |
| `DB_URL` | JDBC URL, mặc định `jdbc:postgresql://localhost:5432/smartphone_ai` |
| `DB_USERNAME`, `DB_PASSWORD` | Tài khoản PostgreSQL |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Tài khoản và mật khẩu ứng dụng Gmail |
| `SMTP_LOCALHOST` | Tên máy dùng khi gửi lệnh SMTP; mặc định `localhost` |
| `ROOT_ADMIN_EMAIL`, `ROOT_ADMIN_PASSWORD` | Email và mật khẩu khởi tạo Admin gốc |
| `AI_CONFIG_ENCRYPTION_KEY` | Khóa AES 32 byte mã hóa Base64 để bảo vệ API key AI |

File `.env` được Git bỏ qua và chia sẻ riêng. File `.env.example` đi cùng repository. Các kiểm thử tự động được tách khỏi `.env` để sử dụng database và dịch vụ thử nghiệm. Có thể chỉ định vị trí cấu hình riêng qua `APP_ENV_FILE` với cú pháp Spring config import khi chạy ứng dụng từ thư mục khác.

Giữ nguyên khóa mã hóa giữa các lần chạy để đọc lại cấu hình AI đã lưu. Admin gốc được tạo từ email hợp lệ và mật khẩu tối thiểu 8 ký tự khi chưa có tài khoản gốc. Admin đăng nhập bằng email và mật khẩu.

Với database cũ có Admin gốc chưa có email, cấu hình `ROOT_ADMIN_EMAIL` rồi khởi động BE. Ứng dụng gán email cho tài khoản gốc hiện tại trong một transaction. ID tài khoản, mật khẩu đã lưu và dữ liệu liên quan được giữ lại. Email đã thuộc tài khoản khác sẽ được báo lỗi cấu hình để người quản trị chọn email phù hợp. Khi Admin gốc đã có email, cấu hình khởi tạo chỉ phục vụ lần tạo đầu tiên. Mật khẩu được quản lý qua chức năng đổi hoặc đặt lại mật khẩu. Flyway áp dụng migration khi ứng dụng khởi động và Hibernate kiểm tra schema.

Migration `V20` xóa các tài khoản có vai trò `STAFF` hoặc `MANAGER` cũ cùng đơn hàng, giỏ, hội thoại, lời mời và OTP liên quan đến các tài khoản đó. Hãy sao lưu database trước khi khởi động phiên bản này với dữ liệu hiện có. Migration đã được kiểm thử bằng H2 và PostgreSQL 16 có pgvector trên database thử nghiệm; hãy kiểm tra thêm trên bản sao dữ liệu của bạn trước khi áp dụng vào database thực.

Cấu hình hiện tại đặt `spring.flyway.validate-on-migrate=false`. Không tự chạy `flyway repair` trên database có dữ liệu khi chưa kiểm tra lịch sử migration.

Từ thư mục gốc dự án:

```powershell
cd BE
mvn test
mvn spring-boot:run
```

API mặc định ở `http://localhost:8080/api`. Client lấy CSRF token tại `/api/auth/csrf`, gửi cookie JWT cùng `X-XSRF-TOKEN` khi thực hiện thao tác thay đổi.

## JWT và thiết bị đăng nhập

Đăng nhập và hoàn tất OTP đăng ký cấp cookie HttpOnly `SPAI_ACCESS` có JWT hạn 15 phút tại `/api`, cùng `SPAI_REFRESH` hạn 7 ngày tại `/api/auth`. Cả hai dùng SameSite Strict. `POST /api/auth/refresh` nhận cookie và CSRF, xoay refresh token rồi trả 204 cùng cookie mới. Database chỉ lưu hash refresh token. Mỗi thiết bị có một bản ghi trong `refresh_sessions`, được tạo bởi migration V25. BE kiểm tra chữ ký, thuật toán HS256, issuer, audience, thời hạn, vai trò, phiên bản xác thực và trạng thái thiết bị/tài khoản.

`POST /api/auth/logout` thu hồi thiết bị hiện tại và xóa cookie. Đổi mật khẩu cấp lại thông tin xác thực cho thiết bị đang thao tác, các thiết bị khác phải đăng nhập lại. Quên mật khẩu, đổi vai trò, vô hiệu hóa hoặc xóa mềm làm mất hiệu lực thông tin xác thực cũ. FE tự gọi refresh một lần khi nhận 401 từ API cần xác thực và chặn gửi lại thao tác của tài khoản cũ sau khi người dùng đổi tài khoản.

Các request của tài khoản trên FE gửi `X-Account-Id`. BE yêu cầu JWT có cùng chủ sở hữu trước khi xử lý, gồm các API AI có hỗ trợ Guest. Token hết hạn trả 401 để client gia hạn, tài khoản khác trả 409 `AUTH_CONTEXT_CHANGED`. GET `/users/me` xác định danh tính hiện tại và vẫn hoạt động khi shop bảo trì.

`JWT_SECRET` trong `BE/.env` là Base64 của ít nhất 32 byte ngẫu nhiên, có thể để trống khi chạy local để BE tạo khóa cho mỗi lần chạy. Khi khóa thay đổi, refresh token còn hợp lệ trong DB có thể cấp lại access JWT. Dùng khóa riêng ổn định khi chạy nhiều BE hoặc triển khai. `AUTH_COOKIE_SECURE=false` phục vụ localhost HTTP, đặt true khi dùng HTTPS. Các giá trị mẫu nằm trong `.env.example`. Cơ chế JWT sử dụng Spring Security JOSE. [Tài liệu Spring Security](https://docs.spring.io/spring-security/reference/6.5/servlet/oauth2/resource-server/jwt.html)

Link kích hoạt tài khoản mặc định trỏ tới `http://localhost:5173/account/invite`. Có thể thay Spring property `app.account-invitation-url` khi FE dùng địa chỉ khác. Cấu hình `app.admin-invitation-url` và link Admin cũ vẫn được hỗ trợ. Chạy BE cùng FE theo [README dự án](../README.md).

## Quản lý tài khoản

Admin xem toàn bộ tài khoản CUSTOMER và ADMIN qua `GET /api/admin/accounts`. Tạo tài khoản bằng `POST /api/admin/account-invitations` với `email`, `fullName` và `role` bằng CUSTOMER hoặc ADMIN. Người nhận mở email và tự đặt mật khẩu qua `POST /api/auth/account-invitations/accept` với `token` và `password`. Sau khi kích hoạt, CUSTOMER và ADMIN đăng nhập bằng email và mật khẩu. OTP dành cho đăng ký và quên mật khẩu.

Link dùng một lần và hết hạn sau 24 giờ. `POST /api/admin/account-invitations/{id}/resend` gửi link mới, vô hiệu link cũ. Database lưu bản băm token và mật khẩu BCrypt. Lỗi gửi email hủy việc tạo tài khoản trong transaction để Admin có thể thử lại.

`PATCH /api/admin/accounts/{id}/role` nhận `role` là CUSTOMER hoặc ADMIN cho tài khoản đã kích hoạt. Admin gốc và tài khoản đang thao tác được bảo vệ khi đổi quyền. Phiên dùng vai trò cũ bị vô hiệu ở yêu cầu tiếp theo. Các API `/admin/admins` và `/admin/admin-invitations` vẫn hoạt động cho client cũ.

`PATCH /api/admin/accounts/{id}/status` nhận `{"enabled": false}` để vô hiệu hóa và `{"enabled": true}` để cho hoạt động lại. Áp dụng cho CUSTOMER và ADMIN thường, bảo vệ Admin gốc và chính người đang thao tác. Cả hai lần chuyển trạng thái đều thu hồi phiên cũ, yêu cầu lặp lại cùng trạng thái giữ nguyên phiên bản. Đăng nhập bằng mật khẩu đúng khi bị khóa trả `403 ACCOUNT_DISABLED`. OTP, lời mời và đặt lại mật khẩu tuân theo trạng thái khóa.

Migration V24 thêm `disabled` mặc định false. Trường này độc lập với `active` dùng cho xác minh đăng ký. Dữ liệu tài khoản được giữ lại, cho hoạt động lại vẫn yêu cầu xác minh nếu trước đó chưa hoàn tất. `GET /api/admin/accounts` bổ sung `disabled` trong từng phần tử. Khởi động lại BE để áp dụng migration trước khi dùng nút trạng thái trên FE.

Admin dùng portal và hồ sơ cá nhân `/admin/profile`. API catalog công khai, giỏ và AI của shop từ chối người đang đăng nhập bằng vai trò ADMIN. Product Form của Admin đọc thương hiệu qua API quản trị. Xóa Admin thường đánh dấu deleted/inactive.

Migration V22 thêm `credential_version` mặc định 0 cho tài khoản cũ. JWT và thiết bị lưu phiên bản lúc xác thực, được kiểm tra với DB ở mỗi request. Đổi mật khẩu làm mất hiệu lực các thiết bị khác và cấp lại cookie sau khi transaction thành công. Quên mật khẩu thu hồi toàn bộ thông tin xác thực cũ.

Nếu khách đóng trang trước khi xác minh đăng ký, khách có thể đăng nhập lại bằng email và mật khẩu đã nhập để nhận OTP đăng ký mới (áp dụng thời gian chờ gửi lại 60 giây). Phiên chat Guest hết hạn sau 24 giờ; tác vụ chạy mỗi giờ xóa tối đa 100 phiên hết hạn cùng hội thoại Guest còn gắn với chúng. Hội thoại đã chuyển vào tài khoản được giữ lại.

## Kiểm thử

Bộ kiểm thử tự động sử dụng H2 và mock cho các dịch vụ ngoài. Các test PostgreSQL có điều kiện dùng `TEST_POSTGRES_URL`, `TEST_POSTGRES_USERNAME` và `TEST_POSTGRES_PASSWORD`; test migration yêu cầu database **trống và tách biệt**, test vector yêu cầu database thử nghiệm đã chạy migration. Không trỏ test vào database thật. Hướng dẫn test tích hợp FE–BE với H2 và SMTP giả có trong [README frontend](../FE/README.md).

## AI và tài liệu RAG

Hai chủ đề hiển thị là PHONE_CONSULTATION và SHOP_SUPPORT. PHONE_CONSULTATION gộp tư vấn, so sánh và kiến thức AI, đồng thời truy xuất tài liệu khi có nguồn phù hợp. SHOP_SUPPORT tiếp tục trả lời chính sách theo bằng chứng RAG. Topic cũ PHONE_COMPARISON và GENERAL_CHAT được ánh xạ về tư vấn để mở lịch sử và link cũ. Giá/phiên bản tại cửa hàng lấy từ catalog, trích dẫn phải thuộc tài liệu thực sự được truy xuất. Kiến thức AI phục vụ giải thích tham khảo.

Tư vấn dựa trên mức tiền khách cung cấp, giữ mức tiền ở các câu hỏi tiếp theo và lấy đầu trên của khoảng giá. Các lựa chọn đúng ngân sách được ưu tiên. Phiên bản có giá cao hơn được gợi ý tối đa 10% và kèm thông báo giá, số tiền cùng tỷ lệ vượt do BE tính từ catalog. Ví dụ ngân sách 10 triệu cho phép máy tối đa 11 triệu, máy giá 10,5 triệu được ghi vượt 500.000đ (5%). Giá vượt giới hạn bị loại khỏi thẻ gợi ý.

Mỗi lần gọi Chat được thử tối đa hai lần khi nhà cung cấp trả HTTP 503, cách nhau 750 ms. Sau lần thử cuối, lỗi vẫn được trả về nếu provider tiếp tục quá tải. HTTP 429 sử dụng quy tắc key dự phòng đã cấu hình. Bộ đọc JSON AI chấp nhận JSON thuần và JSON trong khối Markdown cho phân loại chủ đề, chọn sản phẩm và câu trả lời RAG.

Trong trang quản trị, lưu cấu hình chat model, kiểm tra và kích hoạt OpenAI hoặc Gemini. Cấu hình embedding được quản lý riêng; nhập model, số chiều và API key phù hợp. Tải PDF/TXT từ **Kho kiến thức AI**; PDF ảnh không được OCR.

Cấu hình Chat có thêm `backupApiKey` tùy chọn và `removeBackupKey` để xóa key dự phòng. Bỏ trống key giữ giá trị trước đó của cùng provider. Cả hai key được mã hóa và chỉ trả về `maskedKey`/`maskedBackupKey`. Bước kiểm tra gọi thử cả hai key. Nếu key chính trả HTTP 429, bước kiểm tra có thể thành công khi key dự phòng hoạt động. Lưu và kiểm tra thành công mới cho kích hoạt bản cấu hình mới.

Mỗi lần gọi Chat ưu tiên key chính, gặp HTTP 429 thì thử key dự phòng đúng một lần với cùng model và prompt. Lỗi lần thử cuối được trả về khi cả hai key đều lỗi. Với Gemini, các key cùng project dùng chung quota. Migration `V21` bổ sung cột key dự phòng và cấu hình cũ tiếp tục chạy với key chính. [Giới hạn Gemini](https://ai.google.dev/gemini-api/docs/rate-limits)

Tải tài liệu trả về `PROCESSING`; quá trình tạo embedding chạy nền và có thể chuyển sang `READY`, `FAILED` hoặc `DISABLED`. Các tài liệu còn `PROCESSING` được lên lịch lại khi ứng dụng khởi động. Chủ đề **Hỗ trợ cửa hàng** dùng tài liệu `READY` cho RAG; tư vấn và so sánh lấy dữ liệu sản phẩm. Xem `../docs/RAG_RULES.md` nếu tài liệu có trên máy.

Các kiểm thử H2/mock không thay thế kiểm thử Gmail, PostgreSQL/pgvector và nhà cung cấp AI thực tế. Cần kiểm thử các thành phần ngoài và tích hợp FE trên môi trường dự án trước khi coi luồng đầu-cuối là hoàn tất. Thư mục `docs/` đang bị Git bỏ qua.
