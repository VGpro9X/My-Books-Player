# Changelog

## v0.6.0 — Audio tích hợp Reader (CHỜ NGHIỆM THU)
- Bước 05 được người dùng chấp thuận 8/8 mục.
- Reader có nút ♫: chuyển giữa TTS tiếng Việt miễn phí và HTML Audio file MP3/WAV/M4A thực.
- WAV tiếng bíp 60 giây sinh cục bộ để thử Android khóa màn hình; Media Session hỗ trợ play/pause/seek trong khả năng trình duyệt.
- TTS Chrome tô sáng theo đoạn; MP3 có thể tô sáng theo đoạn nếu có JSON {chapter,cues:[{startMs,endMs,paragraph}]} chính xác.
- Lưu audio_offset_ms cho từng sách và chương qua Supabase; file audio không được tải lên server và cần chọn lại trên thiết bị khác.
- Không có API TTS trả phí, giọng do người dùng cung cấp sẽ tích hợp sau.
- TTS trình duyệt chưa bảo đảm phát khi khóa màn hình; MP3 cũng chưa bảo đảm nếu Chrome bị Android tắt.
- Chưa nghiệm thu bước 06 trên Android thực tế.


## v0.5.0 — Reader: dấu trang nhiều vị trí (ĐÃ NGHIỆM THU 8/8)
- Thêm nút 🔖 ngay trên thanh Reader.
- Lưu nhiều dấu trang cho từng cuốn TXT/EPUB, kèm chương, số đoạn và trích đoạn nhận diện.
- Mở danh sách, nhảy đến đoạn đã lưu, xóa dấu trang, đồng bộ qua Supabase theo owner_id với RLS.
- Dấu trang sách mẫu lưu localStorage, **không** đồng bộ cloud.
- Tự đánh dấu và lưu vị trí đang đọc sau khi người dùng dừng cuộn khoảng 900 ms; chạm trực tiếp một đoạn vẫn đánh dấu như cũ.
- Giữ nguyên tự khôi phục vị trí khi mở sách, không cần Play TTS.
- Bổ sung kiểm thử Chromium mobile cho đa dấu trang, tải lại trang và adapter Supabase giả lập.
- Các giới hạn: chưa có offline, chưa giải quyết xung đột hai thiết bị cùng chỉnh, không có TTS phát nền được bảo đảm.

## v0.4.0 — TXT/EPUB thật (ĐÃ NGHIỆM THU)
- Người dùng xác nhận **8/8 mục**: upload TXT, EPUB, nội dung, mục lục, đánh dấu, TTS, đồng bộ và xóa sách thử.
- Chỉ TXT/EPUB, bìa ảnh EPUB chưa xử lý; ảnh/bảng/DRM chưa đầy đủ.

## v0.3.0 — Cloud (ĐÃ NGHIỆM THU 6/6)
- Tài khoản, Supabase RLS và đồng bộ.
## v0.2.2 — Reader position (ĐÃ NGHIỆM THU)
- Nhảy thẳng tới đoạn đánh dấu khi mở.
## v0.2.0 — Giao diện (ĐÃ NGHIỆM THU 7/7)
## v0.1.0 — Audio test (ĐÃ NGHIỆM THU)
