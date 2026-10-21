# Changelog

## v0.4.0 — TXT/EPUB riêng tư (CHỜ BẠN TEST)
- Upload TXT/EPUB thật tối đa 20MB bằng tài khoản Supabase, metadata tự nhận diện và cho phép sửa.
- File gốc lưu riêng tư trong Supabase Storage, thông tin sách trong public.books có RLS.
- Đọc nội dung thật, mục lục theo chương, đánh dấu tiến độ trong reading_progress, nghe TTS trình duyệt.
- Có danh sách Sách của tôi, xóa sách thử, có thể mở lại bằng tài khoản trên thiết bị khác.
- Trích xuất văn bản EPUB nhưng chưa hiển thị ảnh/bảng/CSS/DRM. Bìa tạm là bìa phong cách mặc định.
- Chưa có offline, giải quyết xung đột nhiều thiết bị hay giọng người dùng cung cấp.
- Kiểm thử Chromium TXT/EPUB + Reader đã đạt; Android thực tế chưa nghiệm thu.

## v0.3.0 — Đã nghiệm thu
- Người dùng xác nhận 6/6 mục đăng nhập, đồng bộ Cloud đạt.

## v0.3.0 — Step 03 Supabase Cloud & Auth (đã nghiệm thu)
- Supabase Free project created Singapore; quote $0/month.
- Applied database schema with RLS for user_settings, books, reading_progress, bookmarks, demo_progress.
- Private storage bucket with owner-only path policies. Security advisor returned 0 security lints on initial review.
- Added login/register/logout and syncing demo reading position, saved demo books, font/reading settings and theme by authenticated account.
- Email confirmation URL requires site URL configuration in Supabase Dashboard (see SUPABASE_SETUP.md).
- This milestone does NOT yet upload TXT or EPUB, and does NOT guarantee Android background speech playback.
- Auth still allows user signup unless owner disables signup via Supabase Dashboard.
- Cloud frontend awaits Android acceptance.

## v0.2.2 — Reader restore (accepted)
- Reopening restores the marked paragraph; user accepts instant jump.
## v0.2.0 — UI (accepted)
- 7/7 criteria passed on Android.
## v0.1.0 — Audio proof of concept (accepted)
- Browser TTS and audio tests.
