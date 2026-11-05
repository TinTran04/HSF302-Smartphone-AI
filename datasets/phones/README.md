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
| `dataset.test.mjs` | Kiểm tra dữ liệu, quy đổi giá, checksum và cấu trúc SQL |
| `LICENSE.txt` | Ghi công tác giả và điều khoản MIT được nguồn công bố |

## Quy tắc chuẩn hóa

- Chọn smartphone có trạng thái đã phát hành, năm 2024–2026, thuộc các thương hiệu đã định nghĩa trong script. Mỗi thương hiệu có tối đa 12 mẫu theo thứ tự có trong nguồn. Năm tối đa lấy theo snapshot hiện tại.
- Chọn bản ghi có thông số chipset, màn hình, pin, màu và cặp RAM/bộ nhớ rõ ràng. Cặp RAM/bộ nhớ đầu tiên và màu đầu tiên trong nguồn tạo một biến thể tham khảo cho mỗi mẫu máy.
- Tên thương hiệu được chuẩn hóa. Tiền tố thương hiệu được tách khỏi tên sản phẩm để khớp catalog đang có.
- Các khóa thông số như `Chip xử lý`, `RAM`, `Màn hình`, `Camera`, `Pin` và `Hệ điều hành` khớp với FE và phần tư vấn AI. Chuỗi thông số hiển thị được giới hạn 255 ký tự, bản gốc đầy đủ nằm trong CSV.
- Giá tham khảo được lấy từ giá BDT cuối cùng trong trường `Price` của nguồn. Khi trường chứa giá cũ và giá mới, giá cuối được dùng theo quy tắc này.
- Giá VNĐ là giá minh họa để test. Hệ số mặc định là 200 VNĐ/BDT, làm tròn đến 10.000 VNĐ. Đây là hệ số giả định cho demo. Giá gốc, giá nguồn hiển thị và URL nguồn được lưu trong thông số sản phẩm. Mô tả từng sản phẩm ghi rõ tính chất minh họa.
- Ảnh dùng placeholder chung đã có trong dự án. Dataset gốc chứa thông số và URL tham chiếu, ảnh sản phẩm cần được bổ sung riêng.

## Nhập vào database

Khởi động BE để Flyway tạo schema trên PostgreSQL có pgvector. Trong pgAdmin, mở đúng database local, mở Query Tool, tải toàn bộ `datasets/phones/import.sql` rồi chạy toàn bộ file. Cũng có thể dùng psql khi đã cấu hình kết nối phù hợp trên máy.

```powershell
psql -h localhost -p 5432 -U postgres -d smartphone_ai -v ON_ERROR_STOP=1 -f datasets/phones/import.sql
```

SQL chạy trong một transaction. Sản phẩm đã có cùng thương hiệu và tên, hoặc cùng `URL nguồn`, được giữ lại. Các bản ghi mới dùng sequence hiện có để cấp ID. Chạy lại file sẽ bỏ qua sản phẩm đã nhập, kể cả khi Admin đã sửa tên sản phẩm nhưng còn giữ `URL nguồn`. Hãy chạy toàn bộ file để các bảng tạm được dọn khi transaction kết thúc.

Dataset phục vụ catalog, tìm kiếm, so sánh và AI tư vấn điện thoại. Chủ đề RAG hỗ trợ cửa hàng sử dụng tài liệu chính sách được quản lý riêng trong Kho kiến thức AI.

## Tái tạo và kiểm tra

Chạy từ thư mục gốc dự án.

```powershell
pwsh -NoProfile -File datasets/phones/prepare.ps1
node --test datasets/phones/dataset.test.mjs
```

Có thể đổi số mẫu mỗi thương hiệu, năm bắt đầu và hệ số giá minh họa khi tái tạo. Các thay đổi chỉ tác động tới file đầu ra. Dữ liệu đã có trong database được giữ lại khi nhập lại bằng SQL.

```powershell
pwsh -NoProfile -File datasets/phones/prepare.ps1 -MaxPerBrand 8 -MinimumYear 2024 -BdtToVnd 200
```
