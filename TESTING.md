# My Books Player v0.7 — Offline + Đồng bộ an toàn

Website: https://vgpro9x.github.io/My-Books-Player/?v=0.7.0
Audio Test: https://vgpro9x.github.io/My-Books-Player/audio-test.html

## Test trên Android
1. Khi có mạng, đăng nhập và mở một TXT/EPUB đã lưu trên Supabase.
2. Bấm nút ↓ trên thanh Reader. Đợi báo lưu thành công, nút chuyển thành ✓.
3. Đóng sách; bật Chế độ máy bay (tắt cả Wi-Fi và dữ liệu di động). Tải lại chính URL website và mở lại sách đã lưu offline.
4. Thử chuyển chương, cuộn đọc và đánh dấu; nội dung sách đã lưu phải mở được không cần mạng.
5. Ở chế độ máy bay, dừng đọc ở đoạn gần cuối chương, đóng và mở lại; phải giữ được chương/đoạn trên máy.
6. Bật mạng lại, bấm biểu tượng ☁ → Đồng bộ ngay. Trên trình duyệt/thiết bị khác đăng nhập cùng tài khoản và kiểm tra vị trí đã cập nhật.
7. Để thử xung đột: mở cùng sách ở 2 thiết bị khi online. Cho A lưu một đoạn, sau đó B (chưa tải lại) lưu đoạn khác. Khi hộp thoại xung đột xuất hiện, thử lựa chọn giữ thiết bị hoặc cloud trên sách thử.
8. Nhấn ✓ để xóa bản offline khỏi máy; xác nhận sách vẫn đọc online được từ Supabase.
9. Lưu offline một sách thử lần nữa rồi đăng xuất; bản offline thuộc tài khoản phải được dọn khỏi thiết bị.
10. Kiểm tra lại nhập TXT/EPUB, TTS, file MP3, dấu trang, font, chuyển chương và cuộn về vị trí đã lưu.

## Lưu ý quan trọng
- Phải mở website thành công khi online trước khi thử offline; Service Worker không giúp mở website lần đầu khi không có mạng.
- Nội dung offline nằm trong IndexedDB **không mã hóa**. Chỉ lưu trên thiết bị cá nhân có khóa màn hình; đừng dùng máy công cộng.
- Xóa dữ liệu trang web trong Chrome hoặc hết quota lưu trữ có thể làm mất bản offline. Giữ file TXT/EPUB gốc để sao lưu.
- Không có mạng thì không thể đăng nhập mới, upload sách, lấy sách chưa cache hoặc đồng bộ ngay.
- Nếu phiên đăng nhập hết hạn, có thể cần kết nối mạng để xác thực lại.
- Audio MP3 hiện không tự lưu offline; TTS trình duyệt vẫn không bảo đảm chạy khi Android khóa màn hình.
- Xung đột chỉ áp dụng cho tiến độ chương/đoạn và thời điểm nghe trong reading_progress. Không áp dụng cho bookmark hoặc cài đặt.

**Bước 07 chỉ hoàn thành sau khi bạn test và xác nhận.**