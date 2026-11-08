# Dataset điện thoại

## Nguồn

Bộ Global Mobile Phone Specifications & Prices do UTSHO DEY công bố trên Kaggle. Bản v1 cập nhật ngày 23/08/2026, tải về ngày 05/11/2026. Bộ gốc chứa 6.620 thiết bị và 168 cột, gồm smartphone, điện thoại phổ thông, máy tính bảng, đồng hồ và vòng đeo tay. Tác giả công bố giấy phép MIT. [Trang dataset](https://www.kaggle.com/datasets/utsh0dey/global-mobile-phone-specifications-and-prices)

Giá trong các bản ghi được chọn dùng đồng taka Bangladesh, ký hiệu BDT hoặc ৳. Các bản ghi có URL tham chiếu tới MobileDokan. Đây là snapshot của dữ liệu bên ngoài, có thể có thiếu sót và khác biệt giữa các thị trường.

## Các file

| File | Nội dung |
| --- | --- |
| `raw.csv` | Bộ dữ liệu gốc được giữ nguyên |
| `source.json` | Nguồn, tác giả, phiên bản, giấy phép và SHA-256 của file gốc |
| `catalog.json` | 138 smartphone thuộc 13 thương hiệu được chuẩn hóa cho dự án |
| `import.sql` | Nhập catalog vào PostgreSQL đã chạy migration của BE |
| `prepare.ps1` | Tái tạo catalog và SQL từ file gốc bằng PowerShell 7 |
| `import.template.sql` | Mẫu SQL dùng khi tái tạo |
| `images.json` | URL trang, tên mẫu, URL ảnh gốc, ngày lấy, định dạng, kích thước và SHA-256 của 138 ảnh |
| `image-source-aliases.json` | Bằng chứng cho URL nguồn đã đổi tên và chuyển hướng |
| `fetch-images.mjs` | Lấy ảnh từ các trang nguồn, xác minh tên mẫu và lưu vào `FE/public/images/phones/` |
| `backfill-images.template.sql` | Bổ sung ảnh thiếu/placeholder cho sản phẩm dataset theo `URL nguồn` |
| `dataset.test.mjs` | Kiểm tra dữ liệu, quy đổi giá, checksum và cấu trúc SQL |
| `LICENSE.txt` | Ghi công tác giả và điều khoản MIT được nguồn công bố |

## Quy tắc chuẩn hóa

- Chọn smartphone có trạng thái đã phát hành, năm 2024–2026, thuộc các thương hiệu đã định nghĩa trong script. Mỗi thương hiệu có tối đa 12 mẫu theo thứ tự có trong nguồn. Năm tối đa lấy theo snapshot hiện tại.
- Chọn bản ghi có thông số chipset, màn hình, pin, màu và cặp RAM/bộ nhớ rõ ràng. Cặp RAM/bộ nhớ đầu tiên và màu đầu tiên trong nguồn tạo một biến thể tham khảo cho mỗi mẫu máy.
- Tên thương hiệu được chuẩn hóa. Tiền tố thương hiệu được tách khỏi tên sản phẩm để khớp catalog đang có.
- Các khóa thông số như `Chip xử lý`, `RAM`, `Màn hình`, `Camera`, `Pin` và `Hệ điều hành` khớp với FE và phần tư vấn AI. Chuỗi thông số hiển thị được giới hạn 255 ký tự, bản gốc đầy đủ nằm trong CSV.
- Giá tham khảo được lấy từ giá BDT cuối cùng trong trường `Price` của nguồn. Khi trường chứa giá cũ và giá mới, giá cuối được dùng theo quy tắc này.
- Giá VNĐ là giá minh họa để test. Hệ số mặc định là 200 VNĐ/BDT, làm tròn đến 10.000 VNĐ. Đây là hệ số giả định cho demo. Giá gốc, giá nguồn hiển thị và URL nguồn được lưu trong thông số sản phẩm. Mô tả từng sản phẩm ghi rõ tính chất minh họa.
- CSV gốc không có cột ảnh. Đã bổ sung 138 ảnh WebP cho 138 sản phẩm từ ảnh chính `og:image` trên các trang MobileDokan được CSV tham chiếu, tải ngày 06/11/2026. Ảnh cục bộ có tổng kích thước 16.820.494 byte và hiển thị được khi không truy cập nguồn bên ngoài.
- Mỗi trang được kiểm tra tên mẫu trong `h1`, URL canonical, URL ảnh thuộc thư mục uploads của MobileDokan, MIME và chữ ký byte ảnh. Ảnh theo mẫu máy và màu ảnh chính của nguồn. Màu biến thể tham khảo vẫn lấy từ CSV.
- Riêng `Apple iPhone 17 Air`, URL nguồn chuyển hướng HTTP 301 sang `Apple iPhone Air`. Trang nguồn cũ đã được lập chỉ mục với tên ban đầu và cùng URL ảnh như trang hiện tại. Bằng chứng và hai URL được lưu trong `image-source-aliases.json`. Script chỉ chấp nhận chuyển hướng cụ thể đã xác minh này.

## Nguồn và quyền sử dụng ảnh

Ảnh lấy từ các trang sản phẩm MobileDokan, URL trang và URL ảnh gốc được ghi riêng cho từng mẫu trong `images.json`. Quyền ảnh thuộc các chủ sở hữu tương ứng. Giấy phép MIT do tác giả Kaggle công bố áp dụng cho dataset thông số. Chưa xác minh được giấy phép riêng cho phép phân phối lại ảnh sản phẩm. Khi sử dụng hoặc phát hành ảnh, cần đối chiếu quyền của chủ sở hữu ảnh.

## Nhập vào database

Khởi động BE để Flyway tạo schema trên PostgreSQL có pgvector. Trong pgAdmin, mở đúng database local, mở Query Tool, tải toàn bộ `datasets/phones/import.sql` rồi chạy toàn bộ file. Cũng có thể dùng psql khi đã cấu hình kết nối phù hợp trên máy.

```powershell
psql -h localhost -p 5432 -U postgres -d smartphone_ai -v ON_ERROR_STOP=1 -f datasets/phones/import.sql
```

SQL chạy trong một transaction. Sản phẩm đã có cùng thương hiệu và tên, hoặc cùng `URL nguồn`, được giữ lại. Các bản ghi mới dùng sequence hiện có để cấp ID. Chạy lại file sẽ bỏ qua sản phẩm đã nhập, kể cả khi Admin đã sửa tên sản phẩm nhưng còn giữ `URL nguồn`. Với sản phẩm có `URL nguồn` khớp dataset, SQL bổ sung ảnh gallery và biến thể đang trống hoặc bằng `/images/placeholder.svg`, đồng thời giữ ảnh tùy chỉnh hiện có. Nếu gallery chưa có dòng nào, SQL tạo ảnh ở vị trí 0. Hãy chạy toàn bộ file để các bảng tạm được dọn khi transaction kết thúc.

Migration BE `V26__phone_dataset_images.sql` cũng bổ sung ảnh cho các dòng dataset đã nhập trước đó theo cùng quy tắc khi Flyway khởi động. Migration chỉ cập nhật ảnh của dữ liệu đã có, danh sách 138 sản phẩm vẫn được nhập qua `import.sql`.

Dataset phục vụ catalog, tìm kiếm, so sánh và AI tư vấn điện thoại. Chủ đề RAG hỗ trợ cửa hàng sử dụng tài liệu chính sách được quản lý riêng trong Kho kiến thức AI.

## Tái tạo và kiểm tra

Chạy từ thư mục gốc dự án.

```powershell
pwsh -NoProfile -File datasets/phones/prepare.ps1
node --test datasets/phones/dataset.test.mjs datasets/phones/fetch-images.test.mjs
```

Có thể đổi số mẫu mỗi thương hiệu, năm bắt đầu và hệ số giá minh họa khi tái tạo. Các thay đổi chỉ tác động tới file đầu ra. Dữ liệu đã có trong database được giữ lại khi nhập lại bằng SQL.

```powershell
pwsh -NoProfile -File datasets/phones/prepare.ps1 -MaxPerBrand 8 -MinimumYear 2024 -BdtToVnd 200
```

`prepare.ps1` tái tạo từ CSV, manifest và ảnh đã có trong repo, đồng thời kiểm tra checksum ảnh. Mẫu mới được chọn ngoài manifest hiện tại dùng placeholder cho đến khi có ảnh nguồn được xác minh. Để lấy ảnh cho catalog đã chọn, chạy lệnh sau rồi tái tạo bằng `prepare.ps1`.

```powershell
node datasets/phones/fetch-images.mjs
pwsh -NoProfile -File datasets/phones/prepare.ps1
```

Script giữ ảnh đã tải có checksum đúng, tối đa 4 request đồng thời, timeout 25 giây mỗi request, HTML tối đa 2 MB và ảnh tối đa 5 MB. Các lỗi được ghi trong `images.json` và làm lệnh trả exit code 1. Migration V26 là snapshot cố định và được giữ nguyên khi tái tạo catalog.
