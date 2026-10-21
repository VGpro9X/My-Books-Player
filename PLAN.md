# MY BOOKS PLAYER — Milestone plan

Nguyên tắc: một mốc -> commit code -> deploy GitHub Pages -> báo cáo đã làm và URL -> người dùng test Android -> ghi nhận kết quả -> chỉ làm mốc sau khi được xác nhận.

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| 01 | Repo, Pages, Audio thử nghiệm miễn phí, xác minh URL | Đã được người dùng báo test thành công |
| 02 | Giao diện theo mẫu, mobile-first, bookshelf modal, reader mẫu | Người dùng xác nhận 7/7 đạt; bản vá khôi phục cuộn v0.2.2 chờ test |
| 03 | Supabase đăng nhập cá nhân, kho sách riêng tư, bảo mật RLS | Chưa làm |
| 04 | Import TXT và EPUB, metadata, bìa, mục lục, xử lý lỗi | Chưa làm |
| 05 | Reader hoàn chỉnh, bookmark, vị trí đọc | Chưa làm (v0.2 mới mô phỏng trên dữ liệu demo) |
| 06 | Audio adapter, kết nối reader, highlight, vị trí nghe/đọc | Chưa làm (v0.2 chỉ TTS thử trong reader) |
| 07 | Đồng bộ đa thiết bị, offline, bảo vệ dữ liệu và giải quyết xung đột | Chưa làm |
| 08 | PWA, sao lưu/khôi phục, kiểm tra hiệu năng, nghiệm thu v1.0 | Chưa làm |

### Các quyết định đã chốt
- Chỉ website URL GitHub Pages, không có Android APK.
- Tối ưu Android Chrome; chưa cần iOS.
- Chỉ import TXT và EPUB ở v1.
- Phát khi khóa màn hình là mục tiêu bắt buộc; Web Speech API không bảo đảm chạy nền, cần nguồn audio thật để xác minh khi tích hợp giọng sau.
- Trước mắt một giọng TTS miễn phí, không thanh toán Google/Azure.
- Giọng tùy chỉnh sẽ được người dùng cung cấp sau.
- Giao diện lấy cảm hứng từ ảnh tham khảo nhưng loại bỏ mọi yếu tố cộng đồng.

### Ghi chú kiến trúc v0.2
Mốc này triển khai HTML/CSS/JS thuần trên Pages branch-root để không phá URL test đang hoạt động và không cần build pipeline lúc kiểm tra UI. Trước mốc cloud cần chuẩn hóa cấu trúc TypeScript/components theo kiến trúc sản phẩm. Việc có React + TypeScript không được tính là đã hoàn thành trong v0.2.
