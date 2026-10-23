# Changelog

## v0.5.0 — Reader: dấu trang nhiều vị trí (CHỜ TEST)
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
