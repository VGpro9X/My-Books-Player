# My Books Player

Website: https://vgpro9x.github.io/My-Books-Player/

Ứng dụng đọc TXT/EPUB cá nhân chạy trên GitHub Pages, đăng nhập và lưu sách riêng tư bằng Supabase.

## v0.5 — Bookmark / Reader (chờ nghiệm thu)
- Mở sách TXT/EPUB đã nhập từ bước 04.
- Chạm **🔖** trên thanh Reader để lưu **nhiều dấu trang** cho cuốn sách, xem đoạn trích, nhảy lại hoặc xóa.
- Đọc bằng cách cuộn: ứng dụng tự lưu vị trí sau khi ngừng cuộn, hoặc chạm vào đoạn cần đánh dấu thủ công.
- Đóng rồi mở lại sách: Reader nhảy thẳng đến đoạn lưu.
- Sách riêng tư: bookmark/tiến độ theo tài khoản Supabase. Sách mẫu: bookmark chỉ lưu trên trình duyệt này.
- Giữ giao diện responsive, tùy chỉnh font/nền, đọc TTS tiếng Việt mặc định và trang [Audio Test](audio-test.html).

## Đã nghiệm thu
v0.1 Audio Test · v0.2 Reader UI · v0.3 Cloud (6/6) · **v0.4 TXT/EPUB (8/8)**

## Còn giới hạn
- Chưa có offline và xử lý xung đột tiến độ hai thiết bị cùng đọc (bước 07).
- TTS trong Chrome không thể đảm bảo chạy khi khóa màn hình; audio thật và giọng do người dùng cung cấp sẽ xử lý ở bước Audio.
- Chỉ TXT/EPUB, EPUB bìa/ảnh/bảng/DRM chưa hoàn chỉnh. Không dùng dịch vụ TTS trả phí hay APK.

Xem [TESTING.md](TESTING.md), [PLAN.md](PLAN.md), [CHANGELOG.md](CHANGELOG.md).
