# Changelog

## v0.2.2 — Reader restore follow-up (chờ bạn test)
- Sửa lần hai lỗi vào sách không tự cuộn đến đoạn đã đánh dấu.
- Đổi từ phép tính scrollTop riêng sang đúng scrollIntoView() mà TTS đang sử dụng.
- Bổ sung min-height:0 và tắt scroll anchoring cho khung Reader để tránh can thiệp từ trình duyệt.
- Không thay đổi vị trí đã lưu, audio-test hoặc dữ liệu mẫu.
- Cần người dùng xác nhận trên Chrome Android; chưa coi lỗi đã được nghiệm thu.

## v0.2.1 — Bản sửa chưa đạt
- Đã thử khôi phục vị trí bằng cách tính scrollTop sau 2 animation frames.
- Người dùng báo vẫn không tự cuộn đến đoạn đã đánh dấu; lỗi được mở lại.

## v0.2.0 — Bước 02
- Đã triển khai giao diện responsive, Tủ sách mẫu, reader, TTS cơ bản.
- Người dùng xác nhận 7/7 mục kiểm tra đạt, kèm lỗi khôi phục vị trí cuộn khi mở sách.

## v0.1.0 — Audio proof of concept
- TTS Chrome/Android miễn phí, thử Audio thật và khóa màn hình trên trang /audio-test.html.
- Người dùng đã kiểm tra thành công.
