# Test guide — v0.2

URL chính: https://vgpro9x.github.io/My-Books-Player/
Audio v0.1: https://vgpro9x.github.io/My-Books-Player/audio-test.html

## Kiểm tra trên Android Chrome
1. Mở URL chính. Quan sát banner, thanh tìm kiếm, các bìa sách mẫu, menu dưới đáy.
2. Nhấn Tủ sách -> Đang đọc/Đã lưu/Bộ sưu tập. Bấm một cuốn để mở Reader.
3. Trong Reader: chuyển chương trước/sau, mục lục, chỉnh font/cỡ chữ/giãn dòng/màu nền; chạm một đoạn để đánh dấu.
4. Đóng Reader, mở lại đúng sách xem có nhớ chương/đoạn và cài đặt không.
5. Ấn nút phát TTS mini player; thử pause/resume/stop. Đây là TTS miễn phí của Chrome, không bảo đảm khóa màn hình.
6. Bấm biểu tượng ♫ trên header hoặc Audio Test ở menu điện thoại; xác nhận trang audio v0.1 còn hoạt động.
7. Tìm tên sách và tác giả; đổi bộ lọc, lưu hoặc bỏ lưu bằng nút trái tim.
8. Thử màn hình đứng/ngang; không có cuộn ngang, chữ không bị cắt, nút dễ chạm.
9. Thử sáng/tối, reload website, xác nhận cài đặt vẫn ở thiết bị này.

## Không thuộc mốc v0.2
- File TXT/EPUB thật (sẽ làm sau).
- Tài khoản, cloud, đồng bộ đa thiết bị.
- Bộ sưu tập hoạt động.
- Nghe TTS ở chế độ khóa màn hình (cần kiểm thử nguồn audio thật và định dạng giọng sau).

## Tiêu chí đóng mốc
- Người dùng vào URL, thử ít nhất các thao tác 1–8, báo OK hoặc lỗi cụ thể.
- Nếu lỗi, ghi và sửa trong v0.2.x, deploy lại rồi chờ test.
