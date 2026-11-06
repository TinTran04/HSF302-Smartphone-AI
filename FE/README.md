# SmartPhone AI — React Frontend

Ứng dụng React + TypeScript + Vite được chuyển từ **14 màn hình HTML Google Stitch**, dựa trên `FE_SPEC.md`. Toàn bộ mã nguồn chạy ứng dụng, ảnh, font, cấu hình và tài liệu đã gom trong thư mục `FE`.

## Chạy trên máy

Yêu cầu Node.js 22.12 trở lên; đã kiểm tra với Node.js 24.

Mở PowerShell tại thư mục `FE` của dự án:

```powershell
npm install
npm run dev
```

Mở **http://localhost:5173**. Nếu cổng 5173 đã được sử dụng, xem địa chỉ Vite in trong terminal. Không mở `index.html` bằng cách nhấp đúp; ứng dụng cần Vite.

Ứng dụng mặc định dùng backend thật qua Vite proxy. Để xem giao diện với dữ liệu demo, đặt `VITE_ENABLE_MOCK_API=true` trong `.env.local` rồi khởi động lại Vite. Thanh thông báo trên trang hiển thị rõ chế độ demo.

| Vai trò         | Email              | Mật khẩu   |
| --------------- | ------------------ | ---------- |
| Khách hàng demo | `customer@demo.vn` | `Demo123!` |
| Quản trị demo   | `admin@demo.vn`    | `Demo123!` |

Đăng ký demo tạo phiên khách hàng mới. Mật khẩu không được lưu. Dữ liệu demo lưu theo phiên tab (`sessionStorage`); đây không phải hệ thống xác thực thực tế. Giỏ Guest chỉ lưu `variantId` và `quantity` trong `localStorage`. Đóng phiên hoặc xóa dữ liệu trình duyệt sẽ đặt lại dữ liệu demo.

## Những gì đã chuyển

- JSX thuần cho toàn bộ 14 bản thiết kế tại `src/design/stitch`, xem đối chiếu ở **`/design`** khi chạy development. Khu vực này là bản mẫu tĩnh, không phải màn nghiệp vụ.
- Ứng dụng chính refactor theo `layouts / pages / features / shared`, với header, footer, sidebar, thẻ sản phẩm, bảng so sánh, hộp thoại và thông báo dùng chung.
- Trang chủ, danh mục tìm kiếm/lọc/sắp xếp qua URL, chi tiết chọn màu/dung lượng/số lượng, so sánh tối đa 3 mẫu máy.
- Đăng nhập/đăng ký, hồ sơ, giỏ Guest, hợp nhất giỏ sau xác thực, checkout COD hai bước kiểm tra giá và xác nhận, lịch sử/chi tiết/hủy đơn PENDING.
- Một giao diện AI với 4 chủ đề, lịch sử theo phiên/tài khoản, gợi ý sản phẩm, bảng so sánh, nguồn RAG, xác nhận/hủy chuyển chủ đề. Xác nhận chuyển gọi endpoint riêng và không gửi lại câu hỏi.
- Admin: dashboard, danh sách/thêm/sửa/ẩn sản phẩm và biến thể, xử lý đơn COD, tải PDF/TXT, thao tác tài liệu, cấu hình/test/kích hoạt OpenAI hoặc Gemini.
- Bổ sung các màn chưa có bản Stitch riêng: hồ sơ, danh sách/chi tiết đơn và form sản phẩm. File `dang_ki` ban đầu có cả panel đăng nhập lẫn đăng ký; React tách thành `/login` và `/register`.
- 50 ảnh gốc đã tải về `public/images`. Inter (có tiếng Việt) và Material Symbols nằm trong `public/fonts`; không dùng Tailwind CDN khi chạy ứng dụng.

Nội dung mẫu AI, giá và thông số demo là minh họa. Demo không gọi AI thật, không tạo embedding và không kiểm tra kết nối provider thật. Tài liệu RAG mẫu ghi rõ tính chất minh họa. UI nghiệp vụ không có tồn kho hoặc thanh toán online.

## Cấu trúc chính

```text
FE/
├── public/                  # Ảnh, font và tài liệu RAG minh họa
├── src/
│   ├── app/                 # Router, providers, route guards
│   ├── layouts/             # Store, Account, Chat, Admin
│   ├── pages/               # Màn hình React theo từng nhóm
│   ├── features/            # Auth, products, cart, comparison, orders, AI chat
│   ├── shared/              # API adapter, types, UI, formatters
│   ├── mocks/               # Fake Backend, chỉ nạp khi bật demo
│   ├── design/              # JSX gốc chuyển từ Stitch, theme và hero
│   └── styles/              # Design tokens và CSS
├── docs/                    # Spec, đối chiếu thiết kế và hợp đồng API
├── scripts/                 # Chuyển HTML, tải ảnh và font
└── tests/e2e/               # Các luồng kiểm thử trên Chrome
```

## Kết nối Spring Boot

Adapter trong `src/shared/api/realApi.ts` kết nối Spring Boot theo hợp đồng API. Các luồng quản trị, đăng ký OTP, giỏ Guest và đặt COD đã được kiểm thử cùng BE với cơ sở dữ liệu và SMTP giả cục bộ.

Trang **Quản lý tài khoản** tại `/admin/accounts` hiển thị CUSTOMER và ADMIN, cho đổi vai trò của tài khoản đã kích hoạt và tạo tài khoản mới bằng email. Vai trò mặc định khi tạo là CUSTOMER. Người nhận mở link trong email, nhập mật khẩu mới và xác nhận để kích hoạt. Link có hiệu lực 24 giờ và dùng một lần. Admin có thể gửi lại lời mời cho tài khoản đang chờ đặt mật khẩu. Admin gốc và tài khoản đang đăng nhập được bảo vệ khi đổi quyền. Địa chỉ `/admin/admins` cũ chuyển tới trang mới.

Mỗi tài khoản có nút **Vô hiệu hóa** hoặc **Cho hoạt động lại** với hộp thoại xác nhận. Vô hiệu hóa thu hồi phiên đăng nhập và giữ dữ liệu. Cho hoạt động lại khôi phục trạng thái xác minh trước đó, tài khoản đang chờ vẫn cần hoàn tất đăng ký hoặc đặt mật khẩu. Admin gốc và tài khoản đang đăng nhập được bảo vệ khỏi vô hiệu hóa.

Các thao tác nghiệp vụ hiển thị toast thành công hoặc lỗi, gồm xác thực, tài khoản, giỏ hàng, đơn hàng, sản phẩm, thương hiệu, tài liệu và cấu hình AI. Hộp thoại của ứng dụng xác nhận thao tác đổi quyền, vô hiệu hóa, xóa và bật/tắt bảo trì. Toast lỗi hiển thị cùng lỗi tại biểu mẫu để có thể thử lại. Điều hướng, nhập liệu, bộ lọc và tải lại dữ liệu nền dùng trạng thái giao diện tương ứng.

CUSTOMER và ADMIN đăng nhập bằng email/mật khẩu. OTP phục vụ đăng ký và quên mật khẩu. Form OTP xuất hiện khi cần hoàn tất đăng ký đang dang dở. Admin đi vào portal, hồ sơ và đổi mật khẩu tại `/admin/profile`. Đường dẫn shop của người đang đăng nhập ADMIN chuyển tới `/admin`.

Màn hình AI có hai ô **Tư vấn mua điện thoại** và **Hỗ trợ cửa hàng**. Tư vấn hiển thị gợi ý, bảng so sánh và nguồn tài liệu cùng câu trả lời khi BE cung cấp. Các link và lịch sử mang topic so sánh hoặc trò chuyện cũ được ánh xạ về tư vấn.

Sao chép `.env.example` thành `.env` hoặc dùng file `.env` đã được chia sẻ. Vite tự đọc các giá trị này khi khởi động.

```dotenv
VITE_ENABLE_MOCK_API=false
VITE_API_BASE_URL=/api
VITE_API_TARGET=http://localhost:8080
```

Khởi động lại Vite. `.env.local` có ưu tiên cao hơn `.env` nếu cùng tồn tại. Request `/api` được proxy đến Spring Boot. Auth adapter lấy CSRF cookie và gửi `X-XSRF-TOKEN` cùng cookie JWT HttpOnly. Access JWT hạn 15 phút, refresh token hạn 7 ngày. Client tự refresh một lần khi API cần xác thực trả 401, giữ nguyên nội dung và idempotency key khi thử lại. Việc xoay cookie được điều phối giữa các request và các tab có Web Locks. Mã đánh dấu ngữ cảnh tài khoản trong localStorage giúp chặn thao tác cũ khi người dùng đổi tài khoản. Cấu hình Gmail, database, JWT và khóa mã hóa AI nằm trong `BE/.env`. Các giá trị `VITE_*` có thể xuất hiện trong mã trình duyệt. Để chạy BE và khởi tạo Admin gốc, xem [README backend](../BE/README.md).

Khi bật bảo trì, phần shop hiển thị màn hình riêng **Shop đang bảo trì**. Trạng thái được kiểm tra lại mỗi 30 giây và bằng nút **Thử lại**. Các màn đăng nhập, đăng ký, quên mật khẩu và nhận lời mời vẫn truy cập được. Admin sử dụng dashboard để tắt bảo trì. Khi bảo trì kết thúc, shop mở lại và các truy vấn shop đang lỗi được tải lại.

`npm run build` sử dụng cấu hình Vite hiện có; không bật demo khi muốn dùng API thật. `VITE_API_TARGET` chỉ cấu hình proxy khi chạy Vite; môi trường khác cần có proxy tương ứng. Xem `docs/API_INTEGRATION.md` nếu tài liệu có trên máy.

## AI và RAG

Thời gian chờ gửi tin nhắn và xác nhận chuyển chủ đề là tối đa 6 phút 40 giây. Kiểm tra kết nối cấu hình AI có thời gian chờ 130 giây. Các giới hạn này bao gồm nhiều bước gọi AI, chuyển key khi HTTP 429 và một lần thử lại khi HTTP 503 trên mỗi key.

Trong **Cấu hình AI**, Admin có thể nhập một API key dự phòng cho từng nhà cung cấp. Thực hiện **Lưu cấu hình → Kiểm tra kết nối → Kích hoạt**. Để trống trường key giữ key đã lưu. Chọn **Xóa API Key dự phòng khi lưu** để gỡ key trong bản cấu hình mới. Khi Chat nhận HTTP 429, BE thử key dự phòng một lần với cùng model. Giao diện tăng thời gian chờ cho kiểm tra hai key và gửi tin nhắn AI để chờ kết quả chuyển key. Với Gemini, các key cùng project dùng chung quota. [Giới hạn Gemini](https://ai.google.dev/gemini-api/docs/rate-limits)

Màn hình AI có hai ô Tư vấn mua điện thoại và Hỗ trợ cửa hàng. Tư vấn gộp chọn máy, so sánh và giải thích công nghệ từ catalog, tài liệu phù hợp và kiến thức AI tham khảo. Hỗ trợ cửa hàng dùng tài liệu chính sách. Admin cấu hình chat model, embedding model và tải PDF/TXT đến READY để kiểm thử phần truy xuất tài liệu. FE gọi BE để nhận câu trả lời.

Khi khách cung cấp mức tiền mua máy, AI ưu tiên máy đúng ngân sách. Các gợi ý cao hơn tối đa 10% hiển thị thông báo giá, số tiền và tỷ lệ vượt do BE tính. Mức tiền được giữ cho câu hỏi tiếp theo trong hội thoại.

## Kiểm tra

```powershell
npm run build
npm test
npm run test:e2e
npm run format:check
```

Kiểm thử E2E dùng Chrome được cài trên máy, khởi động Vite tự động ở chế độ demo. Kiểm thử trong `tests/integration` dùng BE Spring Boot và cơ sở dữ liệu thử nghiệm; Gmail và nhà cung cấp AI thực tế vẫn cần được kiểm thử trên môi trường dự án.

Để chạy riêng kiểm thử tích hợp bằng H2 và SMTP giả **chỉ trên máy local**, mở ba terminal. Test tạo dữ liệu: không trỏ vào database cửa hàng.

```powershell
# Terminal 1, trong FE: hộp thư SMTP giả trên cổng 12525/12526
node tests/integration/local-mail.mjs

# Terminal 2, trong BE: database H2 trong bộ nhớ, không dùng dữ liệu cửa hàng
mvn "-Dspring-boot.run.useTestClasspath=true" "-Dspring-boot.run.arguments=--server.port=18080 --spring.datasource.url=jdbc:h2:mem:feintegration;DB_CLOSE_DELAY=-1 --spring.datasource.username=sa --spring.datasource.password= --app.root-admin.email=integration-admin@example.com --app.root-admin.password=IntegrationPass123! --spring.mail.host=127.0.0.1 --spring.mail.port=12525 --spring.mail.username=test@example.com --spring.mail.properties.mail.smtp.auth=false --spring.mail.properties.mail.smtp.starttls.enable=false" spring-boot:run

# Terminal 3, trong FE
npm run test:integration
```

Tài khoản và dịch vụ SMTP trên chỉ dành cho kiểm thử; tắt hai tiến trình sau khi chạy xong.

## Đối chiếu và chuyển lại từ Stitch

Xem [STITCH_MAPPING.md](docs/STITCH_MAPPING.md) để biết màn gốc tương ứng với route React. Thư mục HTML và ZIP ban đầu vẫn được giữ nguyên bên ngoài `FE`.

Thư mục `docs/` hiện bị Git bỏ qua theo cấu hình dự án, nên các file đặc tả trong `FE/docs` hoặc `../docs` có thể không có trong bản clone nếu chưa được chia sẻ riêng.

```powershell
npm run import:stitch
node scripts/download-assets.mjs
node scripts/download-fonts.mjs
```

Lệnh import cần thư mục Stitch gốc ở vị trí ban đầu. Nó chỉ tạo lại `src/design/stitch`, theme, dữ liệu ánh xạ ảnh và hero; không ghi đè các trang nghiệp vụ React đã refactor.
