# My Books Player v0.5 — Checklist Reader

Website: https://vgpro9x.github.io/My-Books-Player/?v=0.5.0
Audio Test: https://vgpro9x.github.io/My-Books-Player/audio-test.html

## Trên Android Chrome
1. Đăng nhập bằng tài khoản Supabase đã kiểm tra ở v0.4, mở một TXT/EPUB **thật**.
2. Ở Reader, chạm biểu tượng **🔖**, nhấn **＋ Lưu vị trí hiện tại**; xem danh sách có số chương, đoạn và đoạn trích.
3. Chạm một đoạn khác (hoặc cuộn đến đoạn khác, đợi trên 1 giây), lưu thêm dấu trang thứ hai.
4. Từ danh sách, bấm **↗ Đến đoạn** tại dấu trang trước đó; Reader phải nhảy đúng chương và đoạn.
5. Xóa một dấu trang; xác nhận dấu còn lại không bị ảnh hưởng.
6. Cuộn đọc khoảng vài đoạn **không chạm chữ**, dừng trên 2 giây. Đóng Reader, mở lại: phải nhảy đến vị trí vừa đọc.
7. Tải lại website hoặc đăng xuất/đăng nhập lại: cả dấu trang và vị trí đọc sách thật vẫn còn.
8. Nếu có thiết bị/trình duyệt thứ hai, đăng nhập cùng tài khoản: dấu trang phải xuất hiện ở máy thứ hai. Khi kiểm tra không nên sửa cùng một vị trí đồng thời.
9. Thử dấu trang trên một **sách mẫu**: có thể lưu/nhảy nhưng chỉ lưu trên trình duyệt này.
10. Kiểm tra các chức năng đã nghiệm thu: chọn chương, đổi font/nền, TTS đọc nội dung, Audio Test URL cũ.

## Cần chú ý
- Dấu trang của **sách thật** được đồng bộ qua tài khoản Supabase, phải có Internet.
- Dấu trang demo chỉ lưu localStorage.
- Mỗi lần ngừng cuộn khoảng 900 ms thì Reader có thể cập nhật đoạn đang đọc; khi tự mở lại vị trí, ứng dụng tạm tránh ghi đè do cuộn tự động.
- TTS trình duyệt vẫn có thể dừng khi Android khóa màn hình.
- Chưa triển khai xung đột tiến độ khi mở đồng thời hai máy (mốc 07).

Bước 05 chỉ được chốt khi người dùng test và xác nhận.
