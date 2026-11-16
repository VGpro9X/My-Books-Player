# My Books Player v0.8 — Kiểm thử sao lưu, hiệu năng và hồi quy

Website: https://vgpro9x.github.io/My-Books-Player/?v=0.8.0

## Checklist kiểm tra Android
1. Đăng nhập tài khoản Supabase cũ; mở biểu tượng ☁ → nhấn **Sao lưu / Khôi phục**.
2. Chọn **Sao lưu toàn bộ thư viện**, đợi tải tệp ZIP về điện thoại.
3. Xác nhận ZIP có file `manifest.json` và các tệp TXT/EPUB gốc, không chứa mật khẩu hay token. **Không chia sẻ ZIP riêng tư**.
4. Chọn lại ZIP đã tải; ứng dụng phải hiển thị số cuốn và dung lượng để bạn xem trước.
5. Khôi phục ZIP (có thể dùng **1 cuốn sách thử** để tránh tạo nhiều bản trùng). Các bản nhập phải được thêm mới, sách hiện có không biến mất.
6. Mở sách vừa khôi phục, kiểm tra nội dung, chương, vị trí đọc và dấu trang giống sách gốc.
7. Thử ô chọn **Khôi phục cài đặt** với tài khoản thử hoặc cài đặt không quan trọng; tải lại trang và kiểm tra cỡ chữ/nền. Mặc định bỏ chọn để không ghi đè.
8. Tải lại website, thử mở sách trong Supabase, sau đó thử mở URL khi offline với sách đã lưu ở bước 07.
9. Thử lại TTS miễn phí, MP3/WAV, nút khóa màn hình, điều khiển và tô sáng theo cue (nếu có).
10. Kiểm tra nhập TXT/EPUB, chuyển chương, nhiều dấu trang, đăng xuất/đăng nhập, đồng bộ hai thiết bị và báo lỗi khi không có mạng.

## Cảnh báo riêng tư và giới hạn
- ZIP lưu văn bản sách **chưa mã hóa** và không chứa khóa đăng nhập. Không tải lên dịch vụ chia sẻ công khai.
- ZIP khôi phục luôn tạo thêm cuốn sách, có thể trùng tên. Hãy khôi phục bản thử ít sách trước khi thử toàn bộ.
- Khôi phục gián đoạn có thể để lại các cuốn **đã nhập thành công** trước khi lỗi; không xóa cuốn đang có. Ghi nhận số cuốn đã thêm trước khi lỗi.
- Trình duyệt có thể thiếu bộ nhớ khi tải ZIP gần giới hạn (tổng sách 160 MB, ZIP 190 MB).
- Giọng do bạn cung cấp và sinh audio tự động từ TXT/EPUB để nghe liên tục khi khóa màn hình chưa được tích hợp. Không đánh dấu chức năng đó là đạt.
- Bước 08 chỉ đóng sau khi bạn nghiệm thu. Nếu cần phát hành v1 đủ các tiêu chí ban đầu thì tính năng TTS khi khóa màn hình vẫn cần xử lý tiếp.
