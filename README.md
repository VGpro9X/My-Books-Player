# My Books Player

Website: https://vgpro9x.github.io/My-Books-Player/

Ứng dụng đọc TXT/EPUB cá nhân chạy trên GitHub Pages, đăng nhập và lưu sách riêng tư bằng Supabase.

## v0.5 — Bookmark / Reader (đã nghiệm thu 8/8)
- Mở sách TXT/EPUB đã nhập từ bước 04.
- Chạm **🔖** trên thanh Reader để lưu **nhiều dấu trang** cho cuốn sách, xem đoạn trích, nhảy lại hoặc xóa.
- Đọc bằng cách cuộn: ứng dụng tự lưu vị trí sau khi ngừng cuộn, hoặc chạm vào đoạn cần đánh dấu thủ công.
- Đóng rồi mở lại sách: Reader nhảy thẳng đến đoạn lưu.
- Sách riêng tư: bookmark/tiến độ theo tài khoản Supabase. Sách mẫu: bookmark chỉ lưu trên trình duyệt này.
- Giữ giao diện responsive, tùy chỉnh font/nền, đọc TTS tiếng Việt mặc định và trang [Audio Test](audio-test.html).

## Đã nghiệm thu
v0.1 Audio Test · v0.2 Reader UI · v0.3 Cloud (6/6) · **v0.4 TXT/EPUB (8/8)** · **v0.5 Reader (8/8)** · **v0.6 Audio (8/8)**

## Còn giới hạn
- Offline riêng từng sách và xung đột tiến độ có trong bản v0.7, đang chờ nghiệm thu.
- TTS trong Chrome không thể đảm bảo chạy khi khóa màn hình; audio thật và giọng do người dùng cung cấp sẽ xử lý ở bước Audio.
- Chỉ TXT/EPUB, EPUB bìa/ảnh/bảng/DRM chưa hoàn chỉnh. Không dùng dịch vụ TTS trả phí hay APK.

Xem [TESTING.md](TESTING.md), [PLAN.md](PLAN.md), [CHANGELOG.md](CHANGELOG.md).


## v0.6 — Audio trong Reader (đã nghiệm thu 8/8)
- Mở TXT/EPUB, nhấn **♫** để chuyển TTS miễn phí hoặc phát MP3/WAV thực theo chương.
- Chọn WAV bíp 60 giây để thử Android khóa màn hình, Media Session/seek/speed.
- Vị trí nghe lưu vào audio_offset_ms trên Supabase cho sách thật, localStorage cho demo.
- Highlight TTS theo đoạn; highlight MP3 chỉ với JSON thời gian chính xác.
- Không tải audio lên cloud, không TTS trả phí, không APK và chưa cần giọng mới.
- Xem [TESTING.md](TESTING.md) và [VOICE_INTEGRATION.md](VOICE_INTEGRATION.md).

## v0.7 — Đọc offline, chống xung đột (chờ nghiệm thu)
- Mở sách TXT/EPUB khi có mạng và nhấn ↓ ngay trong Reader. Khi lưu thành công, nút đổi thành ✓.
- Bản offline nằm trong IndexedDB của Chrome, cho phép mở URL website (không cài APK) khi không có mạng sau khi Service Worker đã cài.
- Tiến độ đọc được lưu cục bộ lúc offline rồi đồng bộ khi có mạng; nếu hai máy đã đổi vị trí đọc, người dùng được chọn giữ máy hay lấy cloud.
- Nhấn ✓ để xóa bản offline mà không xóa sách cloud.
- Đăng xuất xóa bản offline của tài khoản khỏi trình duyệt; file sách và bookmark Supabase vẫn còn.
- Nội dung offline không mã hóa; chỉ sử dụng trên điện thoại cá nhân có khóa màn hình.
- Chưa cache MP3 hay hỗ trợ đăng nhập mới khi offline. Tài khoản phiên đã hết hạn cần mạng để đăng nhập lại.
