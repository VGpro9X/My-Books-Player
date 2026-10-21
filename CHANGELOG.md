# Changelog

## Bước 03 — Đang chuẩn bị (CHƯA DEPLOY CHỨC NĂNG CLOUD)
- Xác nhận Supabase chưa có project; chưa tạo tài nguyên hay phát sinh phí.
- Chuẩn bị tài liệu thiết lập và migration SQL riêng tư có RLS, lưu trong repository; **chưa áp dụng migration**.
- Đợi người dùng xác nhận organization để tạo project miễn phí nếu được phép.

## v0.2.2 — Reader restore follow-up (đã nghiệm thu)
- Sửa lần hai lỗi vào sách không tự cuộn đến đoạn đã đánh dấu.
- Đổi từ phép tính scrollTop riêng sang đúng scrollIntoView() mà TTS đang sử dụng.
- Bổ sung min-height:0 và tắt scroll anchoring cho khung Reader để tránh can thiệp từ trình duyệt.
- Không thay đổi vị trí đã lưu, audio-test hoặc dữ liệu mẫu.
- Người dùng đã xác nhận Reader nhảy chính xác đến đoạn đánh dấu khi mở, chấp nhận cuộn tức thì (không cần animation).

## v0.2.1 — Bản sửa chưa đạt
- Đã thử khôi phục vị trí bằng cách tính scrollTop sau 2 animation frames.
- Người dùng báo vẫn không tự cuộn đến đoạn đã đánh dấu; lỗi được mở lại.

## v0.2.0 — Bước 02
- Đã triển khai giao diện responsive, Tủ sách mẫu, reader, TTS cơ bản.
- Người dùng xác nhận 7/7 mục kiểm tra đạt, kèm lỗi khôi phục vị trí cuộn khi mở sách.

## v0.1.0 — Audio proof of concept
- TTS Chrome/Android miễn phí, thử Audio thật và khóa màn hình trên trang /audio-test.html.
- Người dùng đã kiểm tra thành công.
