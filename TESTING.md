# My Books Player v0.6 — Bước 06: Nghe trong Reader

Website: https://vgpro9x.github.io/My-Books-Player/?v=0.6.0
Audio Test cũ: https://vgpro9x.github.io/My-Books-Player/audio-test.html

## Kiểm thử trên Android Chrome
1. Đăng nhập tài khoản cũ, mở một sách TXT hoặc EPUB thật, kiểm tra nút **♫** trên đầu Reader.
2. Mở ♫ → **TTS miễn phí** → Đọc. Nghe nội dung chương thật và quan sát đoạn đang đọc được tô sáng.
3. Chuyển sang **Audio MP3/WAV**, chọn **Tạo WAV thử 60 giây**, bấm Play rồi khóa màn hình. Kiểm tra tối thiểu 5 phút và các nút Play/Pause khóa màn hình.
4. Mở khóa, thử tua lùi/tiến 15 giây và điều chỉnh tốc độ phát.
5. Chọn file MP3 có sẵn phù hợp với chương đang mở, phát rồi tạm dừng ở một vị trí. Đóng/mở lại Reader và chọn lại *cùng file*, xem có khôi phục vị trí nghe hay không.
6. Nếu có JSON thời gian chính xác, chọn file ở mục **JSON thời gian**. Đoạn đang đọc phải tô sáng đúng theo cue; **không có JSON sẽ không tô sáng theo MP3**.
7. Đang nghe file, đổi chương hoặc đóng Reader: audio cũ phải dừng, không tiếp tục đọc sai chương.
8. Quay về chế độ TTS và thử lại dấu trang, mục lục, font/cỡ chữ, tự khôi phục vị trí.
9. Đăng xuất và đăng nhập trên máy khác, chọn lại chính file MP3 phù hợp với chương, xác nhận offset đã được đồng bộ; file MP3 không tự theo tài khoản sang máy khác.

## Ví dụ JSON mốc thời gian
```json
{
  "chapter": 1,
  "cues": [
    {"startMs": 0, "endMs": 2500, "paragraph": 0},
    {"startMs": 2500, "endMs": 6800, "paragraph": 1}
  ]
}
```

Trong đó chapter tính từ 1; paragraph tính từ 0; thời gian là mili-giây, các mốc không chồng lấn. Chỉ sử dụng mốc của audio và nội dung thực tế tương ứng.

## Giới hạn minh bạch
- TTS mặc định không xuất audio MP3, không bảo đảm chạy khi Android khóa màn hình.
- Audio MP3/WAV là file thật nên khả năng phát nền tốt hơn, nhưng còn tùy Chrome, pin và xử lý ứng dụng nền của Android.
- Audio không tự chuyển chương khi khóa màn hình. Chỉ file theo chương hiện tại, phải chọn lại khi reload/đổi thiết bị.
- Tô sáng MP3 cần cue JSON phù hợp, không tự đoán đoạn từ thời gian.
- Đồng bộ vị trí nghe và đọc theo sách/chương có mạng, chưa xử lý xung đột hai thiết bị cập nhật đồng thời (bước 07).
- Giọng đọc do người dùng cung cấp sau; **không cần gửi giọng để nghiệm thu v0.6**.

Đợi người dùng xác nhận từng bước trước khi mở mốc 07.