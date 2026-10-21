# Changelog

## v0.1.0 — Audio proof of concept

### Đã tạo
- Trang web responsive tối ưu thử nghiệm trên Android.
- TTS mặc định miễn phí từ Android/Chrome.
- Nhập TXT cục bộ để thử TTS (tối đa 30.000 ký tự), highlight đoạn đọc, tốc độ và nút điều khiển.
- Trình phát HTML Audio dùng file audio trên thiết bị, hỗ trợ tua 15 giây, tốc độ và lặp.
- Media Session API cung cấp metadata và các hành động play, pause, seek.
- Tạo audio WAV thử nghiệm (tiếng bíp, 60 giây) cục bộ để không cần tải file từ Internet.

### 2026-10-21 — Khắc phục sự cố triển khai
- Người dùng báo URL trả về 404: "There isn't a GitHub Pages site here."
- Đã xác minh repository Public, nhánh main chứa index.html ở thư mục gốc.
- Kiểm tra GitHub Actions: chưa có workflow run (total_count: 0).
- Cần chủ repo kích hoạt **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
- Đã bổ sung hướng dẫn chính xác vào README.md.
- Chưa xác nhận Pages đã xuất bản thành công; **chưa đánh dấu bước hoàn thành**.

### Giới hạn/chưa làm
- **Chưa xác minh triển khai GitHub Pages hay test trên Android thực.**
- Web Speech API không bảo đảm phát khi khóa màn hình.
- Chưa có nhận diện EPUB, thư viện cloud hay đồng bộ.
- Không có giọng TTS bên ngoài và không có phí API.

### Kiểm tra người dùng
1. Mở URL GitHub Pages trên Chrome Android sau khi xuất bản thành công.
2. Thử TTS qua giọng Việt và khóa màn hình.
3. Thử tab Audio với WAV 60 giây hoặc MP3 có sẵn, khóa màn hình ít nhất 5–30 phút.
4. Thử điều khiển Play/Pause trên màn hình khóa và tai nghe.
5. Báo Android phiên bản, Chrome phiên bản (nếu biết), kết quả TTS và MP3.

**Trạng thái:** Đợi chủ repo kích hoạt GitHub Pages rồi thử trên Android.