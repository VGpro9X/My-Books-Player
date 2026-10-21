# My Books Player

Ứng dụng web đọc truyện cá nhân — đang phát triển theo từng mốc và được người dùng kiểm thử sau mỗi lần deploy.

- URL: https://vgpro9x.github.io/My-Books-Player/
- Trang thử audio đã nghiệm thu trước đó: https://vgpro9x.github.io/My-Books-Player/audio-test.html

## v0.2 — Mốc giao diện (chờ người dùng test)

- Trang chủ, banner nổi bật, sách đọc dở, grid sách và tìm kiếm.
- Tủ sách dạng popup với các tab Đang đọc, Đã lưu, Bộ sưu tập (tab bộ sưu tập chưa có chức năng).
- Reader toàn màn hình: chương, lật chương, font, cỡ chữ, giãn dòng, màu nền, đánh dấu vị trí và TTS mặc định.
- Responsive, tối ưu thiết bị Android, thanh điều hướng di động.
- Dữ liệu sách demo; cài đặt và vị trí chỉ lưu trong localStorage của trình duyệt này.
- Audio Test v0.1 giữ riêng ở /audio-test.html.

**Quan trọng:** Chưa có kho lưu trữ thật, tài khoản, cloud hoặc đồng bộ thiết bị. TTS tích hợp reader chỉ để thử; tính năng phát nền được kiểm tra riêng ở trang audio-test.html. Sách demo và văn bản demo không phải sách người dùng upload.

## Thứ tự bước
Xem PLAN.md, CHANGELOG.md và TESTING.md. **Không chuyển bước nếu người dùng chưa xác nhận kết quả test.**

## Quy tắc TTS tương lai
Xem VOICE_INTEGRATION.md. Người dùng sẽ cung cấp giọng sau, không mua API TTS. Định dạng giọng có thể là model + config hoặc tài liệu endpoint; không buộc chuyển định dạng trước.
