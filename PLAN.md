# MY BOOKS PLAYER — Kế hoạch theo mốc

**Quy tắc:** Code một mốc → kiểm thử tự động → GitHub Pages → changelog và URL → người dùng nghiệm thu Android → mới mở mốc tiếp theo.

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| 01 | GitHub Pages, thử audio miễn phí | Đã nghiệm thu |
| 02 | Giao diện và Reader mẫu | Đã nghiệm thu 7/7 + sửa v0.2.2 |
| 03 | Supabase, tài khoản và đồng bộ | Đã nghiệm thu 6/6 |
| 04 | Import TXT/EPUB riêng tư, đọc, cloud | **Đã nghiệm thu 8/8** |
| 05 | Reader: nhiều dấu trang, tự lưu vị trí khi cuộn, quay về dấu trang | **Đã nghiệm thu 8/8** |
| 06 | Audio: TTS mặc định + file MP3/WAV, Media Session, cue tô sáng, lưu tiến độ nghe | **v0.6 đang kiểm thử và chờ nghiệm thu; chưa cần cung cấp giọng riêng** |
| 07 | Offline và đồng bộ hai thiết bị có giải quyết xung đột | Chưa làm |
| 08 | PWA, sao lưu và nghiệm thu v1 | Chưa làm |

### Phạm vi / quyết định cố định
- **Chỉ URL GitHub Pages**, không APK; ưu tiên Chrome Android.
- File truyện đầu vào chỉ TXT và EPUB.
- TTS tiếng Việt trình duyệt miễn phí để thử, không mua API; giọng chính thức người dùng sẽ cung cấp sau.
- Phát liên tục khi khóa màn hình vẫn là mục tiêu bắt buộc nhưng hiện chưa bảo đảm qua Web Speech API; cần audio file thực khi tới mốc Audio.
- Không có tính năng cộng đồng; dữ liệu private Supabase có RLS.

### Bước 05: ghi chú
- Bookmark sách thật dùng bảng Supabase public.bookmarks hiện có và chính sách RLS owner-only.
- Bookmark demo dùng localStorage riêng trên một trình duyệt, không quảng cáo là đồng bộ.
- Auto-save vị trí khi ngừng cuộn (debounce). Khôi phục vẫn **nhảy ngay** vào đoạn đã lưu, đúng yêu cầu đã nghiệm thu.
- Đây là bản phát hành Reader cải tiến; chưa có offline hay giải quyết xung đột hai thiết bị chỉnh cùng lúc.

### Phạm vi v0.6
- TTS tiếng Việt hệ thống miễn phí: tô sáng đoạn, không bảo đảm phát khi khóa màn hình.
- HTML Audio cho MP3/WAV có sẵn: Media Session, khóa màn hình tùy Android; file chỉ chọn cục bộ, không tự upload.
- Muốn highlight MP3 chính xác cần JSON cue thời gian; không đoán sai nếu thiếu cue.
- Audio offset lưu theo sách/chương bằng Supabase reading_progress.audio_offset_ms.
- Chưa có model giọng riêng hoặc sinh MP3 tự động từ TXT/EPUB; người dùng cung cấp giọng sau, không dùng API trả phí.
