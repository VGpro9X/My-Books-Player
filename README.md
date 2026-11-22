# My Books Player

**Website:** https://vgpro9x.github.io/My-Books-Player/

Ứng dụng đọc sách TXT/EPUB và phát audio cá nhân, ưu tiên Chrome trên Android, chạy trực tiếp bằng **URL GitHub Pages**. **Không cần APK hay cài PWA.**

## Đã nghiệm thu
- v0.1: thử Audio Android.
- v0.2: giao diện thư viện và Reader, tự nhảy đến đoạn đánh dấu.
- v0.3: tài khoản riêng tư Supabase và đồng bộ (6/6).
- v0.4: nhập TXT/EPUB gốc và đọc thật (8/8).
- v0.5: nhiều dấu trang, tự lưu tiến độ Reader (8/8).
- v0.6: TTS mặc định và trình phát MP3/WAV trong Reader, Media Session (8/8).
- v0.7: lưu offline chọn lọc, đồng bộ tiến độ và xử lý xung đột (8/8).
- **v0.8: sao lưu/khôi phục ZIP và rà soát bảo mật, hiệu năng (8/8, nghiệm thu 22/11/2026).**
- **v0.9 (ứng viên): tích hợp catalog Nghe Epub và adapter HTTPS TTS; chờ endpoint Piper/NCNN và nghiệm thu Android.**

## v0.9 — Giọng Nghe Epub

Trong Reader, mở **♫ Nghe sách → Nghe Epub**, nhập endpoint HTTPS của dịch vụ TTS,
chọn một trong 10 gói/97 speaker rồi tạo WAV từ đoạn đang đọc đến hết chương. WAV
được phát bằng HTML Audio/Media Session; endpoint và lựa chọn giọng chỉ lưu trên thiết
bị. Nội dung chương chỉ được gửi khi người dùng nhấn tạo audio.

Repo public chỉ chứa catalog và client adapter, không chứa archive/model premium hoặc
binary Android. Xem [VOICE_INTEGRATION.md](VOICE_INTEGRATION.md) để triển khai backend.

## v0.8 — Sao lưu/Khôi phục (đã nghiệm thu 8/8)
1. Đăng nhập bằng biểu tượng ☁.
2. Chọn **Sao lưu / Khôi phục** trong cửa sổ tài khoản.
3. Nhấn **Sao lưu toàn bộ thư viện** để tải ZIP về máy (sách gốc, bookmark, tiến độ và cài đặt).
4. Chọn ZIP đã sao lưu, xem trước số sách rồi **Khôi phục thành sách mới**. Không xóa hoặc ghi đè sách cũ.

Gói ZIP chưa mã hóa, không chứa mật khẩu hay token. Chỉ lưu nơi riêng tư, không gửi lên công khai. Sao lưu và khôi phục cần Internet. Xem [BACKUP.md](BACKUP.md).

## Giới hạn quan trọng
- TTS giọng hệ thống miễn phí không bảo đảm chạy liên tục khi Android khóa màn hình.
- Adapter có thể tự tạo WAV từ TXT/EPUB khi kết nối tới backend Nghe Epub tương thích; GitHub Pages không tự chạy model Android ARM64.
- Không lưu MP3 trong offline hoặc ZIP backup; bản offline lưu dạng văn bản rõ trong IndexedDB.
- EPUB phức tạp, DRM, ảnh/bảng/kiểu chữ chưa hỗ trợ đầy đủ.
- Dung lượng sao lưu trong trình duyệt có hạn: tối đa 300 cuốn, 20 MB/cuốn, tổng 160 MB sách, ZIP tối đa 190 MB.
- v0.8.0 vẫn là bản ổn định đã nghiệm thu. v0.9 là ứng viên tích hợp client, chưa gọi là v1.0 cho tới khi có endpoint thật và kiểm tra khóa màn hình trên Android.

Xem [PLAN.md](PLAN.md), [TESTING.md](TESTING.md), [CHANGELOG.md](CHANGELOG.md), [VOICE_INTEGRATION.md](VOICE_INTEGRATION.md).
