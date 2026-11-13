# SmartPhone AI — React Frontend

Ứng dụng React + TypeScript + Vite được chuyển từ **14 màn hình HTML Google Stitch**, dựa trên `FE_SPEC.md`. Toàn bộ mã nguồn chạy ứng dụng, ảnh, font, cấu hình và tài liệu đã gom trong thư mục `FE`.

Hướng dẫn thao tác và giải thích code nằm trong [User Guide](../USER_GUIDE.md).

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
- Một giao diện AI với 2 chủ đề, lịch sử theo tài khoản, gợi ý sản phẩm, bảng so sánh, xác nhận/hủy chuyển chủ đề. Xác nhận chuyển gọi endpoint riêng và không gửi lại câu hỏi.
- Admin quản lý dashboard, danh sách/thêm/sửa sản phẩm và biến thể, chuyển Đang mở bán/Hết hàng, xử lý đơn COD, tải PDF/TXT, thao tác tài liệu, cấu hình/test/kích hoạt Google Gemini.
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

Màn hình AI có hai ô **Tư vấn mua điện thoại** và **Hỗ trợ cửa hàng**. Tư vấn hiển thị gợi ý, bảng so sánh và nội dung trả lời. Nguồn tài liệu được xử lý nội bộ ở BE, giao diện Customer ẩn thẻ nguồn trong cả tin nhắn mới và lịch sử cũ. Các link và lịch sử mang topic so sánh hoặc trò chuyện cũ được ánh xạ về tư vấn.

Sao chép `.env.example` thành `.env` hoặc dùng file `.env` đã được chia sẻ. Vite tự đọc các giá trị này khi khởi động.

```dotenv
VITE_ENABLE_MOCK_API=false
VITE_API_BASE_URL=/api
VITE_API_TARGET=http://localhost:8080
```

Khởi động lại Vite. `.env.local` có ưu tiên cao hơn `.env` nếu cùng tồn tại. Request `/api` được proxy đến Spring Boot. Auth adapter lấy CSRF cookie và gửi `X-XSRF-TOKEN` cùng cookie JWT HttpOnly. Access JWT hạn 15 phút, refresh token hạn 7 ngày. Client tự refresh một lần khi API cần xác thực trả 401, giữ nguyên nội dung và idempotency key khi thử lại. Việc xoay cookie được điều phối giữa các request và các tab có Web Locks. Mã đánh dấu ngữ cảnh tài khoản trong localStorage giúp chặn thao tác cũ khi người dùng đổi tài khoản. Cấu hình Gmail, database, JWT và khóa mã hóa AI nằm trong `BE/.env`. Các giá trị `VITE_*` có thể xuất hiện trong mã trình duyệt. Để chạy BE và khởi tạo Admin gốc, xem [README backend](../BE/README.md).

Khi bật bảo trì, phần shop hiển thị màn hình riêng **Shop đang bảo trì** và hướng dẫn tải lại trang để cập nhật khi bảo trì kết thúc. Guest thấy liên kết **Đăng nhập**. ADMIN đăng nhập vào dashboard, CUSTOMER trở lại đường dẫn trước đó và liên kết đăng nhập được ẩn. Các màn đăng ký, quên mật khẩu và nhận lời mời vẫn truy cập được. Khách tải lại trang sau khi Admin tắt bảo trì để mở lại shop.

`npm run build` sử dụng cấu hình Vite hiện có; không bật demo khi muốn dùng API thật. `VITE_API_TARGET` chỉ cấu hình proxy khi chạy Vite; môi trường khác cần có proxy tương ứng. Xem `docs/API_INTEGRATION.md` nếu tài liệu có trên máy.

## AI và RAG

Thời gian chờ gửi tin nhắn và xác nhận chuyển chủ đề là tối đa 6 phút 40 giây. Kiểm tra kết nối cấu hình AI có thời gian chờ 130 giây. Các giới hạn này bao gồm nhiều bước gọi AI, chuyển key khi HTTP 429 và một lần thử lại khi HTTP 503 trên mỗi key.

Trong **Cấu hình AI**, Admin chọn Gemini, Groq hoặc DeepSeek và quản lý qua ba tab.

- **Kết nối** lưu model, kiểm tra các key rồi kích hoạt. Ô Chat Model chỉ hiển thị tối đa 3 model gợi ý. Khi đổi lựa chọn, số liệu key được tải theo model đó. Lưu model trước khi sửa key.
- **API key** ghim key chính, phân trang tối đa 10 key dự phòng với 5 mục/trang. Một hộp thoại lưu tên, bí mật mới, nhóm/project và hạn mức của model. Thay bí mật được kiểm tra trước khi lưu. Thao tác lưu áp dụng ngay cho cấu hình đang hoạt động. Đặt dự phòng làm chính hoán đổi vị trí và giữ tên nhận diện theo từng key.
- **Nhật ký** hiển thị 10 sự kiện/trang, mới nhất trước, gồm thao tác quản trị và sự cố/chuyển key khi chạy.

Nút **Xóa key** hiển thị trực tiếp trên key chính và từng dự phòng. Xóa chính cần chọn key thay thế khi có dự phòng. Xóa key cuối cùng tắt nền tảng đó. Hộp thoại sửa, xóa, hoán đổi giữ phiên bản cấu hình lúc mở và tự đóng nếu cấu hình hoặc model đổi.

Mỗi key hiển thị trạng thái từ BE và yêu cầu/ngày còn lại theo ước tính của ứng dụng. Danh sách dùng cách trình bày ngắn gọn và nhật ký có phân trang. Giới hạn chưa xác định có nhãn riêng. Hộp thoại **Sửa** cho chọn mặc định hoặc nhập giới hạn ngày và giới hạn token mỗi phút để chuyển key. Các số liệu ngày chỉ gồm những lượt gọi do ứng dụng ghi nhận từ khi bật tính năng, một tin nhắn có thể tạo nhiều lượt gọi AI.

Mức sử dụng và trạng thái lỗi gắn với nền tảng, nhóm/project và model. Gemini có mặc định ước tính, Groq có thể nhận giới hạn từ header phản hồi, giới hạn Admin nhập được ưu tiên. DeepSeek hiển thị lỗi hết số dư khi được nhà cung cấp báo. Key cùng project Gemini dùng chung quota. Mốc 80% ưu tiên nhóm khác, các key còn khả dụng vẫn được dùng khi mọi nhóm đều vượt mốc này. Key mới có nút ẩn/hiện, key đã lưu chỉ hiển thị phần che. Thông báo và nhật ký được lưu ở backend. [Giới hạn Gemini](https://ai.google.dev/gemini-api/docs/rate-limits)

Chuông **Thông báo AI** trên thanh Admin hiển thị số chưa đọc, mở lịch sử có thời điểm, lý do, tên key được chuyển sang và trạng thái đã xử lý. Dữ liệu được kiểm tra mỗi 15 giây và khi quay lại tab. **Đánh dấu tất cả đã đọc** chỉ cập nhật số chưa đọc của Admin đang đăng nhập, lịch sử vẫn xem lại được sau khi tải lại trang. Banner giữ cảnh báo của cấu hình đang chạy. Các thao tác thêm, thay, xóa key có toast kết quả. Chế độ demo mô phỏng dữ liệu và chỉ lưu thông tin key đã che.

Màn hình AI có hai ô Tư vấn mua điện thoại và Hỗ trợ cửa hàng. Tư vấn gộp chọn máy, so sánh và giải thích công nghệ từ catalog, tài liệu phù hợp và kiến thức AI tham khảo. Hỗ trợ cửa hàng dùng tài liệu chính sách. Admin cấu hình chat model, embedding model và tải PDF/TXT đến READY để kiểm thử phần truy xuất tài liệu. FE gọi BE để nhận câu trả lời.

Chat yêu cầu CUSTOMER đăng nhập. Link từ sản phẩm hoặc so sánh giữ chủ đề và ID sản phẩm khi chuyển qua đăng nhập. Nút xóa trong lịch sử mở hộp thoại xác nhận và có toast kết quả. Xóa hội thoại đang mở trở về `/ai`.

Hồ sơ ban đầu khóa và làm mờ các trường. Bấm **Chỉnh sửa thông tin** để sửa họ tên, số điện thoại và địa chỉ, bấm **Hủy** để bỏ thay đổi. Email luôn bị vô hiệu hóa. 138 ảnh dataset có sẵn tại `public/images/phones`, migration V26 cập nhật ảnh thiếu trong DB khi BE khởi động.

Danh sách đơn Customer/Admin hiển thị mới nhất trước, giữ độ chính xác thời gian từ BE và dùng ID giảm dần khi thời điểm bằng nhau. Máy Hết hàng vẫn có card, chi tiết, bộ lọc và so sánh, với nút mua bị khóa. API tiếp tục dùng ACTIVE/INACTIVE cho trạng thái bán.

### Bản đồ địa chỉ

Ô địa chỉ trong hồ sơ và checkout gợi ý địa điểm Việt Nam sau khi nhập từ 3 ký tự và dừng 400 ms. Chọn gợi ý bằng chuột hoặc phím mũi tên + Enter sẽ cập nhật đồng thời địa chỉ, tọa độ và mở bản đồ. FE gọi `/api/locations/autocomplete`; `GEOAPIFY_API_KEY` chỉ nằm trong `BE/.env`. Chế độ demo dùng địa điểm mẫu, không gọi Geoapify.

`LocationPicker` tải Leaflet khi mở bản đồ. Khách bấm chọn điểm, dùng phím mũi tên và Enter để chọn tâm, hoặc bấm **Vị trí hiện tại** để yêu cầu quyền định vị. Có thể bổ sung số nhà và hướng dẫn giao hàng bằng cách nhập địa chỉ thủ công. Lưu hồ sơ lưu cả vị trí, Hủy khôi phục vị trí cũ. Sửa địa chỉ xóa điểm cũ để chọn lại. Chọn lại địa chỉ hoặc điểm ở checkout yêu cầu kiểm tra đơn hàng lại trước khi xác nhận. Nếu gợi ý lỗi hoặc hết hạn mức, khách vẫn nhập địa chỉ và chọn bản đồ được.

Vị trí tùy chọn có dạng `location: { latitude, longitude }`, hoặc `null`. Đơn hàng giữ snapshot vị trí, cả Customer và Admin có thể mở xem trong chi tiết đơn. Hồ sơ/đơn cũ có địa chỉ dạng chữ vẫn sử dụng được. Bản đồ cần mạng, quyền định vị do trình duyệt quản lý. Khi tải bản đồ hoặc định vị gặp lỗi, khách vẫn nhập địa chỉ trực tiếp.

Mặc định dùng tiles HTTPS OpenStreetMap, giữ attribution và cache của trình duyệt. `VITE_MAP_TILE_URL` và `VITE_MAP_ATTRIBUTION` trong `.env.example` cho phép chọn nguồn tiles cùng attribution tương ứng. Kiểm thử trình duyệt giả lập tiles và GPS. [Quy định sử dụng tiles](https://operations.osmfoundation.org/policies/tiles/).

Khi khách cung cấp mức tiền mua máy, AI ưu tiên máy đúng ngân sách. Các gợi ý cao hơn tối đa 10% hiển thị thông báo giá, số tiền và tỷ lệ vượt do BE tính. Mức tiền được giữ cho câu hỏi tiếp theo trong hội thoại.

Chọn điểm trên bản đồ hoặc dùng Vị trí hiện tại ở hồ sơ/checkout gọi `GET /api/locations/reverse` để điền địa chỉ theo tọa độ. Điểm khách chọn được giữ nguyên, nút lưu/đặt hàng chờ tra cứu xong. Sửa địa chỉ, chọn điểm mới, hủy form hoặc rời trang hủy kết quả cũ. Tra cứu quá 10 giây hoặc thất bại cho phép nhập tay. Checkout thay đổi điểm/địa chỉ sẽ yêu cầu kiểm tra lại đơn.

## Ảnh và xóa sản phẩm

Form sản phẩm dùng bộ chọn ảnh từ máy cho bộ ảnh và ảnh phiên bản. Hỗ trợ PNG/JPEG/WebP tối đa 5 MiB mỗi ảnh, có xem trước và gỡ ảnh khỏi form. Chờ tải ảnh xong rồi lưu sản phẩm. Tải ảnh qua `POST /api/admin/products/images` bằng multipart, BE trả đường dẫn ảnh để lưu vào sản phẩm. Chế độ demo lưu ảnh dạng data URL trong phiên tab.

Danh sách sản phẩm có nút **Xóa sản phẩm** với hộp thoại xác nhận xóa vĩnh viễn và toast kết quả. Xóa thành công cập nhật danh mục, giỏ và dashboard. Đơn đã đặt vẫn giữ thông tin sản phẩm tại thời điểm mua. Thao tác gỡ ảnh hoặc hủy form không tự xóa file đã tải lên máy chủ.

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

Chat hiển thị tin nhắn gửi ngay trong khung hội thoại, ba chấm chuyển động khi chờ và câu trả lời mới hiện dần sau khi nhận JSON từ BE. Tin nhắn lỗi có thao tác thử lại. Cấu hình Chat và Embedding sử dụng Google Gemini.
