# My Books Player — Sao lưu và khôi phục

## Phạm vi
Vào website, đăng nhập Supabase, nhấn biểu tượng ☁ → **Sao lưu / Khôi phục**.

**Sao lưu**: tải trực tiếp từ bucket riêng tư những file TXT/EPUB gốc của tài khoản vào ZIP, kèm `manifest.json` chứa metadata, bookmark, vị trí đọc/nghe và cài đặt Reader. Dữ liệu không chạy qua GitHub hoặc máy chủ trung gian của ChatGPT.

**Khôi phục**: chọn ZIP, kiểm tra trước khi nhập và xác nhận thao tác. Mỗi cuốn được tạo ID mới, bản file gốc mới và bản bookmark/progress tương ứng. Không ghi đè cuốn có sẵn. Nếu lỗi giữa chừng, sách khôi phục thành công trước đó vẫn tồn tại; cuốn bị lỗi được cố gắng dọn khỏi Supabase.

**Cài đặt**: chỉ áp dụng nếu bật ô “Khôi phục cài đặt Reader và giao diện”; mặc định không ghi đè.

## Định dạng ZIP
- `manifest.json`: `format: "my-books-player-backup"`, `version: 1`, `createdAt`, `books`, `settings`.
- `sources/<uuid>.txt` hoặc `sources/<uuid>.epub` là file gốc. Không dùng đường dẫn tự do từ ZIP khi nhập.
- Mỗi cuốn có `title`, `author`, `source_format`, `source_filename`, `size_bytes`, `archivePath`, `progress`, `bookmarks`.
- `progress`: `chapter_index`, `paragraph_index`, `audio_offset_ms`. Dấu trang tính chương từ 1, đoạn từ 0.
- Chỉ dữ liệu thư viện cloud: **không** backup tài khoản/mật khẩu, token, giọng đọc, file MP3/WAV, dữ liệu cache offline hay sách mẫu.

## Bảo mật
- **ZIP không có mã hóa hay mật khẩu.** Bạn tự lưu an toàn; không chia sẻ nếu sách là riêng tư.
- File sao lưu được tải bằng JWT đăng nhập riêng của người dùng theo RLS. Không đưa `service_role` lên website.
- Chỉ cho phép ZIP manifest đúng phiên bản; chặn path traversal, file sai định dạng, quá nhiều sách và quá lớn.
- Tối đa **300 cuốn**, **20 MB/cuốn**, **160 MB tổng sách**, **190 MB/ZIP**.
- Có thể tiêu tốn dung lượng tải xuống và bộ nhớ điện thoại; nên bắt đầu với tệp sao lưu nhỏ.

## Nếu cần khôi phục hoàn toàn về tài khoản mới
1. Mở website bằng URL, đăng nhập tài khoản mới.
2. Chọn ZIP và khôi phục. Hệ thống lưu các cuốn mới theo tài khoản đang đăng nhập.
3. Nếu muốn giữ cấu hình Reader cũ, bật ô khôi phục cài đặt; tải lại trang sau khi hoàn tất.
4. Kiểm tra nội dung và bookmark trước khi xóa bản gốc hoặc các bản sao lưu cũ.

Mục đích của backup là có bản sao cá nhân. Nó không thay thế việc giữ file TXT/EPUB gốc ở một nơi khác.
