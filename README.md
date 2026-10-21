# My Books Player

Website đọc sách cá nhân, ưu tiên Chrome Android.

**URL dùng thử:** https://vgpro9x.github.io/My-Books-Player/?v=0.4.0

## v0.4 — Nhập TXT / EPUB thật (chờ người dùng nghiệm thu)
- Đăng nhập bằng biểu tượng ☁ với tài khoản Supabase đã có.
- Chạm **＋ Thêm sách**, chọn `.txt` hoặc `.epub` tối đa **20 MB**.
- Ứng dụng nhận diện tên/tác giả (cho phép sửa), tách chương và trích xuất nội dung.
- File gốc lưu trong Supabase Storage bucket riêng tư theo tài khoản; **không** đưa lên GitHub.
- Sách thật xuất hiện trong thư viện và bộ lọc **Sách của tôi**; có nút xóa sách thử.
- Reader đọc nội dung thật, mục lục, chuyển chương, đánh dấu vị trí và TTS trình duyệt.
- Tiến độ sách thật lưu trong bảng `reading_progress` và đồng bộ khi đăng nhập cùng tài khoản.

## Đã nghiệm thu
- v0.1 Audio Test (https://vgpro9x.github.io/My-Books-Player/audio-test.html)
- v0.2 UI + sửa lỗi khôi phục đoạn
- v0.3 Supabase Cloud: người dùng xác nhận 6/6

## Giới hạn
- EPUB DRM, ảnh, bảng, CSS và chú thích chưa hiển thị đầy đủ (chỉ trích xuất văn bản).
- Bìa sách đang hiển thị bìa phong cách mặc định, chưa trích xuất ảnh bìa từ EPUB.
- Offline/cache, xử lý xung đột hai thiết bị và TTS phát nền ổn định là các bước tiếp theo.
- Không sử dụng dịch vụ TTS trả phí hoặc Android APK.

Xem [TESTING.md](TESTING.md), [PLAN.md](PLAN.md), [CHANGELOG.md](CHANGELOG.md) và [VOICE_INTEGRATION.md](VOICE_INTEGRATION.md).
