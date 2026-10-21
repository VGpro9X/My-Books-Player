# My Books Player

Bản thử nghiệm **v0.1.0 — TTS miễn phí và audio trên Android**.

## Mở ứng dụng

https://vgpro9x.github.io/My-Books-Player/

> **Nếu website báo 404:** mã nguồn đã có ở nhánh `main`, nhưng cần bật GitHub Pages lần đầu.

1. Mở https://github.com/VGpro9X/My-Books-Player/settings/pages
2. Chọn **Build and deployment → Source → Deploy from a branch**.
3. Chọn **Branch: main** và **Folder: /(root)**, nhấn **Save**.
4. Đợi bản triển khai GitHub Pages hoàn tất (xem tab Actions nếu lỗi), sau đó mở URL phía trên.

## Nội dung v0.1

- Tab **TTS mặc định**: đọc thử đoạn truyện hoặc TXT bằng giọng có sẵn trên Android/Chrome, đổi tốc độ, highlight đoạn đang đọc.
- Tab **Audio khóa màn hình**: chọn file MP3/WAV/M4A từ điện thoại hoặc tạo WAV tiếng bíp 60 giây; phát bằng HTML Audio, Media Session API, tua 15 giây và lặp.
- Không sử dụng API trả phí và không upload sách của bạn lên server.

## Kiểm thử Android

1. Thử TTS khi Chrome đang mở.
2. Khóa màn hình, xem TTS có tiếp tục đọc không.
3. Đổi sang tab Audio, chọn file MP3 có sẵn hoặc tạo WAV thử, bấm Play rồi khóa màn hình.
4. Thử điều khiển Play/Pause trên màn hình khóa, chuyển sang ứng dụng khác, thử ít nhất 5 phút rồi 30 phút.
5. Ghi lại Android, Chrome, kết quả của hai chế độ.

**Quan trọng:** TTS trình duyệt không bảo đảm hoạt động sau khi khóa màn hình. File audio HTML có thể phát nền trên Android nhưng vẫn phải thử trên thiết bị thật. Bản v0.1 chưa có thư viện EPUB, cloud hay đồng bộ; chưa được nghiệm thu.

Xem [CHANGELOG.md](CHANGELOG.md) và [VOICE_INTEGRATION.md](VOICE_INTEGRATION.md).
