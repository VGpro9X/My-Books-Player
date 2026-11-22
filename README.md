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

## v0.8 — Sao lưu/Khôi phục (đã nghiệm thu 8/8)
1. Đăng nhập bằng biểu tượng ☁.
2. Chọn **Sao lưu / Khôi phục** trong cửa sổ tài khoản.
3. Nhấn **Sao lưu toàn bộ thư viện** để tải ZIP về máy (sách gốc, bookmark, tiến độ và cài đặt).
4. Chọn ZIP đã sao lưu, xem trước số sách rồi **Khôi phục thành sách mới**. Không xóa hoặc ghi đè sách cũ.

Gói ZIP chưa mã hóa, không chứa mật khẩu hay token. Chỉ lưu nơi riêng tư, không gửi lên công khai. Sao lưu và khôi phục cần Internet. Xem [BACKUP.md](BACKUP.md).

## Giới hạn quan trọng
- TTS giọng hệ thống miễn phí không bảo đảm chạy liên tục khi Android khóa màn hình.
- Có thể phát file MP3/WAV thật bằng HTML Audio / Media Session nhưng chưa tự tạo MP3 từ TXT/EPUB theo giọng riêng. Người dùng sẽ cung cấp giọng sau, **chưa phải chức năng đã hoàn thiện**.
- Không lưu MP3 trong offline hoặc ZIP backup; bản offline lưu dạng văn bản rõ trong IndexedDB.
- EPUB phức tạp, DRM, ảnh/bảng/kiểu chữ chưa hỗ trợ đầy đủ.
- Dung lượng sao lưu trong trình duyệt có hạn: tối đa 300 cuốn, 20 MB/cuốn, tổng 160 MB sách, ZIP tối đa 190 MB.
- Cả 8 mốc đã nghiệm thu. Bản hiện tại là **v0.8.0 ổn định**. Chưa gắn nhãn v1.0 đầy đủ: còn chờ tích hợp giọng TTS người dùng cung cấp và tạo/phát audio tự động khi khóa màn hình.

Xem [PLAN.md](PLAN.md), [TESTING.md](TESTING.md), [CHANGELOG.md](CHANGELOG.md), [VOICE_INTEGRATION.md](VOICE_INTEGRATION.md).
