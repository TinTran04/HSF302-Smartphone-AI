# SmartPhone AI

Website bán điện thoại có trợ lý AI, gồm giao diện React và backend Spring Boot. Dự án được thiết kế để chạy local, hỗ trợ thanh toán khi nhận hàng (COD) và miễn phí giao hàng.

Hệ thống chỉ sử dụng hai vai trò **CUSTOMER** và **ADMIN**. Admin đăng nhập bằng email và mật khẩu. Gmail gửi OTP và lời mời kích hoạt tài khoản được cấu hình riêng.

Xác thực dùng access JWT 15 phút và refresh token xoay vòng 7 ngày trong cookie HttpOnly, kèm CSRF. Mỗi thiết bị có thể bị thu hồi khi đăng xuất hoặc khi thông tin tài khoản thay đổi. Khi khởi động, BE áp dụng migration V26 để bổ sung ảnh dataset và V27 để lưu vị trí bản đồ cho hồ sơ, bản xem trước và đơn hàng.

Hướng dẫn đầy đủ về setup, cấu hình nền tảng AI (Gemini, Groq, DeepSeek), sử dụng, giải thích code và kịch bản demo nằm trong [User Guide](USER_GUIDE.md).

## Chức năng chính

- **Cửa hàng:** xem, tìm kiếm và lọc điện thoại; xem phiên bản; so sánh sản phẩm; dùng giỏ hàng và đặt hàng COD.
- **Tài khoản** đăng nhập bằng email và mật khẩu. OTP qua email dùng cho đăng ký và quên mật khẩu. Chủ tài khoản quản lý thông tin cá nhân và theo dõi đơn hàng. Đổi mật khẩu thu hồi phiên trên thiết bị khác, đặt lại mật khẩu thu hồi các phiên cũ.
- **Trợ lý AI** dành cho CUSTOMER đã đăng nhập, có hai ô Tư vấn mua điện thoại và Hỗ trợ cửa hàng. Tư vấn gộp chọn máy, so sánh và giải thích công nghệ bằng catalog, tài liệu và kiến thức AI. Hỗ trợ cửa hàng trả lời chính sách theo RAG có nguồn. Chủ tài khoản có thể xóa hội thoại bằng hộp thoại xác nhận.
- **Quản trị** quản lý sản phẩm, thương hiệu, đơn hàng, tài khoản CUSTOMER/ADMIN, chế độ bảo trì, tài liệu AI và cấu hình nhà cung cấp AI/embedding. Admin tạo tài khoản qua email để người nhận tự đặt mật khẩu và đổi vai trò của tài khoản đã kích hoạt.

Admin sử dụng khu vực `/admin`, gồm hồ sơ cá nhân tại `/admin/profile`. CUSTOMER sử dụng các luồng mua hàng và AI. Xóa Admin thường là xóa mềm.

Bật bảo trì hiển thị màn hình riêng **Shop đang bảo trì** cho khách, Admin vẫn truy cập dashboard. AI tư vấn theo mức tiền khách đưa ra, các gợi ý vượt tối đa 10% phải nêu rõ số tiền và tỷ lệ vượt.

Trang bảo trì hướng dẫn tải lại trang để cập nhật khi bảo trì kết thúc. Guest thấy liên kết **Đăng nhập**. Đăng nhập ADMIN vào dashboard, CUSTOMER trở lại trang đã mở và liên kết đăng nhập được ẩn. Hồ sơ mở ở chế độ xem, bấm **Chỉnh sửa thông tin** để sửa họ tên, số điện thoại và địa chỉ. Email luôn bị khóa.

Đơn hàng của Customer và Admin được sắp xếp theo thời gian đặt mới nhất trước. Sản phẩm có hai nhãn **Đang mở bán** và **Hết hàng**. Máy hết hàng vẫn xuất hiện trong danh mục, tìm kiếm, chi tiết và so sánh, với thao tác mua bị khóa.

Hồ sơ và checkout có gợi ý địa chỉ Việt Nam bằng Geoapify và bản đồ Leaflet/OpenStreetMap. Nhập từ 3 ký tự, chọn gợi ý để cập nhật địa chỉ và ghim vị trí trên bản đồ; có thể chọn điểm, lấy vị trí hiện tại hoặc nhập địa chỉ thủ công. Vị trí là tùy chọn, được lưu cùng hồ sơ hoặc snapshot đơn hàng. Đặt `GEOAPIFY_API_KEY` trong `BE/.env` và khởi động lại BE để bật gợi ý. Khóa được giữ tại BE. Geoapify có gói miễn phí không cần thẻ; hạn mức theo [bảng giá nhà cung cấp](https://www.geoapify.com/pricing/). [Quy định sử dụng bản đồ OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).

Admin chọn ảnh từ máy cho bộ ảnh sản phẩm và ảnh từng phiên bản, xem trước rồi lưu sản phẩm. Ảnh hỗ trợ PNG, JPEG, WebP, tối đa 5 MiB mỗi ảnh. Nút **Xóa sản phẩm** xóa vĩnh viễn sản phẩm, các phiên bản và mục giỏ liên quan sau khi xác nhận; đơn đã đặt vẫn giữ thông tin lịch sử. Ảnh tải lên lưu tại `BE/uploads/product-images` mặc định, cần giữ thư mục này khi chuyển máy hoặc triển khai.

Trang **Quản lý tài khoản** hỗ trợ vô hiệu hóa và cho CUSTOMER hoặc ADMIN thường hoạt động lại. Mỗi lần chuyển trạng thái thu hồi phiên cũ và giữ dữ liệu. Admin gốc và tài khoản đang thao tác được bảo vệ. Các thao tác nghiệp vụ trên FE có toast kết quả và hộp thoại xác nhận cho thao tác cần xác nhận.

Dự án không xử lý tồn kho thực tế, thanh toán trực tuyến hoặc kết nối đơn vị vận chuyển.

## Công nghệ và cấu trúc

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, TanStack Query |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA, Flyway |
| Dữ liệu | PostgreSQL và extension pgvector |
| AI | Chat hoán chuyển giữa Google Gemini, Groq và DeepSeek; embedding Gemini và RAG cho tài liệu PDF/TXT |
| Kiểm thử | Vitest, Playwright, JUnit, H2 |

```text
smartphone-ai/
├── BE/       # Mã nguồn, migration và kiểm thử backend
├── FE/       # Giao diện React, tài nguyên và kiểm thử frontend
├── docs/     # Đặc tả nghiệp vụ, API và kế hoạch
└── README.md
```

Backend tổ chức theo luồng Controller → Service interface → ServiceImpl → Repository. Interface nằm trong `BE/src/main/java/com/smartphoneai/service`, các lớp triển khai nằm trong `service/impl`, helper nằm trong `service/support` và bộ ánh xạ DTO nằm trong `mapper`.

## Yêu cầu trước khi chạy

- JDK 21 và Maven 3.9 trở lên.
- Node.js 22.12 trở lên và npm.
- PostgreSQL đã cài extension **pgvector**. Tạo database `smartphone_ai`; tài khoản database cần quyền tạo extension khi Flyway chạy lần đầu.
- Tài khoản Gmail và mật khẩu ứng dụng để gửi OTP và lời mời kích hoạt tài khoản. Các tính năng này cần SMTP hoạt động.
- API key của Google Gemini cho embedding, và API key Chat của ít nhất một nền tảng Gemini, Groq hoặc DeepSeek nếu muốn sử dụng AI thật. Cấu hình Chat Model và Embedding Model riêng trong trang quản trị.

**Nếu database đã có dữ liệu:** sao lưu và thử trên bản sao trước khi khởi động BE. Migration V20 xóa các tài khoản STAFF/MANAGER cũ cùng dữ liệu liên quan của chính các tài khoản đó. Chi tiết tại [README backend](BE/README.md).

## Chạy dự án local

Các lệnh sau dùng PowerShell và giả sử bạn đang ở thư mục gốc dự án. Nếu thư mục đã được đổi tên hoặc di chuyển, mở terminal tại vị trí mới.

### 1. Cấu hình và chạy backend

Nhận file `BE/.env` đã được cấu hình từ người phụ trách dự án và đặt vào thư mục `BE`. Nếu tự cấu hình lần đầu, sao chép file mẫu rồi điền giá trị trong `BE/.env`.

```powershell
Copy-Item BE/.env.example BE/.env
```

Khi đã có file `.env` phù hợp với database local, chạy backend.

```powershell
cd BE
mvn spring-boot:run
```

BE tự đọc `BE/.env` khi chạy từ thư mục `BE` hoặc thư mục gốc dự án, kể cả khi chạy bằng IntelliJ với working directory tương ứng. Các nhóm cấu hình gồm database, Gmail gửi OTP, Admin gốc và khóa mã hóa AI. File dùng cú pháp `KEY=value`, giá trị viết trực tiếp, dấu gạch chéo ngược được viết thành `\\`. Khởi động lại BE sau khi sửa file. Biến môi trường trong IntelliJ hoặc terminal có ưu tiên cao hơn giá trị trong `.env`.

File `.env` chứa giá trị thật được Git bỏ qua và chia sẻ riêng cho nhóm. File `.env.example` đi cùng mã nguồn trên GitHub. Nếu dùng database khác trên máy mới, điều chỉnh các giá trị `DB_*` cho database đó. API key chat và embedding được quản lý trong giao diện Admin, còn `AI_CONFIG_ENCRYPTION_KEY` trong `.env` bảo vệ các key đã lưu trong database.

Người cấu hình lần đầu có thể tạo khóa mã hóa bằng PowerShell.

```powershell
$aiKeyBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($aiKeyBytes)
[Convert]::ToBase64String($aiKeyBytes)
```

Điền kết quả vào `AI_CONFIG_ENCRYPTION_KEY` trong `BE/.env` và sử dụng **cùng một khóa** cho database đó ở các lần chạy sau. Admin gốc được tạo từ `ROOT_ADMIN_EMAIL` và `ROOT_ADMIN_PASSWORD` nếu chưa tồn tại. Với Admin gốc cũ chưa có email, lần khởi động tiếp theo sẽ gán `ROOT_ADMIN_EMAIL` cho tài khoản đó và chuyển sang đăng nhập bằng email. Mật khẩu tài khoản đã tạo được quản lý qua chức năng đổi mật khẩu. Flyway áp dụng migration khi backend khởi động.

Backend mặc định phục vụ API tại `http://localhost:8080/api`. Tham khảo [hướng dẫn backend](BE/README.md) để biết chi tiết cấu hình và kiểm thử.

### 2. Chạy frontend

Mở một terminal khác tại thư mục gốc dự án:

```powershell
cd FE
npm install
npm run dev
```

Mở `http://localhost:5173`. FE mặc định gọi API thật qua `/api`; Vite chuyển tiếp các request đến `http://localhost:8080`. Có thể sao chép `FE/.env.example` thành `FE/.env`. Khi BE chạy ở địa chỉ khác, chỉnh cấu hình FE tương ứng.

```dotenv
VITE_API_BASE_URL=/api
VITE_API_TARGET=http://localhost:8080
VITE_ENABLE_MOCK_API=false
```

Sửa `VITE_API_TARGET` theo địa chỉ backend và khởi động lại Vite. Không đưa mật khẩu hay API key vào biến `VITE_*`. Cấu hình proxy này dùng cho Vite khi phát triển; môi trường triển khai cần cấu hình proxy tương ứng.

## Cấu hình AI và RAG

1. Đăng nhập Admin, mở **Cấu hình AI**, chọn thẻ Google Gemini, Groq hoặc DeepSeek, lưu model và API key, kiểm tra kết nối rồi kích hoạt. Kích hoạt nền tảng khác để hoán chuyển nền tảng Chat.
2. Mở **Cấu hình embedding**. Hệ thống đặt sẵn Gemini `gemini-embedding-001` với 768 chiều cho cấu hình mới. Nhập API key Gemini rồi bấm **Kiểm tra và lưu**.
3. Vào **Kho kiến thức AI**, tải tài liệu PDF/TXT và đợi trạng thái `READY`. PDF dạng ảnh không được OCR trong phạm vi hiện tại.
4. Vào AI Chat và chọn **Hỗ trợ cửa hàng** để hỏi theo tài liệu. Nếu không đủ căn cứ, hệ thống thông báo không thể xác nhận; khi có nguồn, hãy đối chiếu câu trả lời với tài liệu.

Mỗi cấu hình Chat hỗ trợ một API key chính và tối đa 10 key dự phòng có tên, thứ tự ưu tiên và trạng thái riêng. Admin có thể thêm, thay, kiểm tra hoặc xác nhận xóa từng key, sau đó lưu, kiểm tra và kích hoạt cấu hình. Khi key chính gặp lỗi xác thực hoặc quota, BE thử các key dự phòng theo thứ tự và ghi rõ tên key đã dùng. Chuông **Thông báo AI** hiển thị số chưa đọc và lịch sử lưu trong DB, có thao tác đánh dấu đã đọc và mở trang quản lý key. Banner giữ cảnh báo đang cần xử lý. Với Gemini, các key cùng project dùng chung quota. [Giới hạn Gemini](https://ai.google.dev/gemini-api/docs/rate-limits)

Tư vấn điện thoại kết hợp catalog, tài liệu phù hợp và kiến thức Gemini. Hỗ trợ cửa hàng truy xuất tài liệu và kiểm chứng căn cứ ở BE, Customer nhận nội dung trả lời và các gợi ý sản phẩm. Email Gmail, nhà cung cấp AI và dữ liệu thực tế cần được kiểm thử trong môi trường của bạn.

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

Bộ dataset điện thoại gốc, dữ liệu đã chuẩn hóa và SQL nhập catalog nằm trong [datasets/phones](datasets/phones/README.md). Giá quy đổi trong bộ này phục vụ kiểm thử giao diện VNĐ, nguồn và giá gốc được lưu cùng từng sản phẩm.

- [Đặc tả nghiệp vụ](docs/BUSINESS_SPECIFICATION.md)
- [Đặc tả REST API](docs/API_SPECIFICATION.md)
- [Hướng dẫn frontend](FE/README.md) và [tích hợp API](FE/docs/API_INTEGRATION.md)
- [Hướng dẫn backend](BE/README.md)
- [Đặc tả frontend](FE/docs/FE_SPEC.md)

Thư mục `docs/` đang được `.gitignore` bỏ qua, gồm cả các thư mục có tên `docs` bên trong dự án. Các tài liệu ở đó có thể không xuất hiện trong bản clone nếu chưa được chia sẻ riêng.
