# My Books Player v0.9 — Kiểm thử Nghe Epub và hồi quy

Website sau khi phát hành: https://vgpro9x.github.io/My-Books-Player/?v=0.9.0

## Kiểm thử v0.9 sau khi có backend

1. Mở một sách/chương, chọn **♫ → Nghe Epub**.
2. Nhập base URL HTTPS kết thúc bằng `/api/tts`, nhấn **Kiểm tra kết nối**.
3. Chọn gói giọng và speaker; xác nhận đủ 10 gói và tên speaker đúng catalog.
4. Nhấn **Tạo audio phần còn lại của chương** và xác nhận trạng thái cho biết số ký tự đang gửi.
5. Phát WAV, thử play/pause/tua trên Reader và màn hình khóa Android.
6. Chuyển chương trong lúc tạo/phát; request cũ phải bị hủy và audio cũ được dọn.
7. Tải lại trang; endpoint/lựa chọn còn lưu nhưng audio Blob cũ không còn.
8. Xác nhận backend chỉ nhận nội dung sau thao tác tạo audio và repo/browser không chứa API key.

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
- Client Nghe Epub đã tích hợp; không đánh dấu end-to-end là đạt cho tới khi endpoint Piper/NCNN thật sinh WAV thành công và được thử trên Android.
- **Đã nghiệm thu:** người dùng xác nhận v0.8 đạt **8/8** vào **22/11/2026**. Các bước 01–08 được chốt trong phạm vi đã triển khai.
- Để đạt v1 vẫn cần triển khai endpoint HTTPS, xác nhận CORS/quyền sử dụng model và nghiệm thu phát WAV khi khóa màn hình.
