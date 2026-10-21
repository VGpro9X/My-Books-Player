# Supabase — Bước 03 (Chuẩn bị, chưa khởi tạo project)

## Hiện trạng
- ChatGPT đã có kết nối Supabase.
- Danh sách Supabase projects hiện trả về **0**.
- Có 1 organization. **Chủ tài khoản phải xác nhận chọn organization** trước khi tạo project.
- Chưa tạo project, chưa gọi migration, chưa bật Auth và chưa có file nào được upload.

## Đề xuất
- Project name: `my-books-player`.
- Region: `ap-southeast-1` (Singapore, gần Việt Nam).
- Kế hoạch dùng **Supabase Free**, cần xác minh chi phí theo organization trước khi tạo; không tự chấp nhận phí khác $0.
- Đăng nhập email/password hoặc OTP, chỉ tài khoản chủ sở hữu; tránh bật đăng ký công khai nếu dùng cá nhân.
- Database theo user ID với Row Level Security. Bảng dự kiến `user_settings`, `books`, `reading_progress`, `bookmarks`.
- Storage bucket `my-books-private` là private; file lưu ở đường dẫn bắt đầu bằng UUID người sở hữu.
- Frontend chỉ dùng URL dự án và **publishable key**, tuyệt đối không đưa `service_role`, secret API keys hoặc mật khẩu DB lên GitHub Pages.
- Script migration dự kiến: `supabase/migrations/0001_private_library.sql`. **Chưa chạy** cho đến khi có project.

## Thứ tự triển khai bước 03
1. Chủ dự án xác nhận organization để tạo project (và phê duyệt nếu hệ thống báo phí).
2. Tạo project, lấy Project URL + publishable key.
3. Thẩm định và chạy migration, kiểm tra Security Advisor.
4. Tích hợp Supabase Auth trên website với giao diện đăng nhập/đăng xuất.
5. Thử lưu và đọc lại tùy chỉnh cá nhân qua database với 1 tài khoản; chặn truy cập khi không đăng nhập.
6. Kiểm tra reload, đăng xuất, đăng nhập lại và sử dụng trên 2 trình duyệt.
7. Commit, deploy GitHub Pages, ghi changelog; chờ người dùng test. Khi chưa đạt, không triển khai bước 04.

## Chưa thuộc bước này
- Upload TXT/EPUB thực tế và chuyển sách mẫu thành sách thật (bước 04).
- Sinh audio đám mây hoặc tích hợp giọng đọc người dùng (bước 06).
- Xóa/ghi đè sách do ứng dụng chưa triển khai.
