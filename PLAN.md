# MY BOOKS PLAYER — Kế hoạch theo mốc

**Quy tắc:** Code một mốc → kiểm thử tự động → GitHub Pages → changelog và URL → người dùng nghiệm thu Android → mới mở mốc tiếp theo.

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| 01 | GitHub Pages, thử audio miễn phí | Đã nghiệm thu |
| 02 | Giao diện và Reader mẫu | Đã nghiệm thu 7/7 + sửa v0.2.2 |
| 03 | Supabase, tài khoản và đồng bộ | Đã nghiệm thu 6/6 |
| 04 | Import TXT/EPUB riêng tư, đọc, cloud | **Đã nghiệm thu 8/8** |
| 05 | Reader: nhiều dấu trang, tự lưu vị trí khi cuộn, quay về dấu trang | **Đã nghiệm thu 8/8** |
| 06 | Audio: TTS mặc định, MP3/WAV, Media Session và vị trí nghe | **Đã nghiệm thu 8/8** |
| 07 | Offline sách TXT/EPUB và xử lý xung đột tiến độ đọc | **Đã nghiệm thu 8/8** |
| 08 | Sao lưu/khôi phục, tối ưu và đánh giá phát hành v1 (chỉ URL) | **Đã nghiệm thu 8/8** |
| 09 | Catalog Nghe Epub, adapter HTTPS và sinh WAV theo chương | **Đã code/test client; chờ backend + nghiệm thu Android** |

### Trạng thái sau nghiệm thu v0.8 — 22/11/2026
- **Cả 8 mốc đã được người dùng nghiệm thu**, bước 08 đạt 8/8 trên Android theo báo cáo của người dùng.
- Bản ổn định: **v0.8.0**, URL https://vgpro9x.github.io/My-Books-Player/.
- **Chưa gọi v1.0 hoàn chỉnh**: client đã tích hợp bộ giọng, nhưng còn cần endpoint Piper/NCNN thật và nghiệm thu phát khi khóa màn hình Android.
- Tiếp tục giữ mô hình chỉ-URL, không APK và không nhúng API key hoặc model premium vào repo public.
- Bộ giọng đã được nối ở lớp client trong v0.9. Backend Piper/NCNN HTTPS vẫn là điều kiện để sinh WAV thật; model Android không được đưa lên GitHub Pages.

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

### Bước 07
- Offline qua Service Worker, chỉ cache vỏ website và thư viện JavaScript public; không cache Supabase API.
- Chỉ lưu sách offline khi người dùng chủ động nhấn nút ↓ trong Reader.
- IndexedDB lưu văn bản sách chưa mã hóa theo tài khoản và vị trí đọc, hàng đợi tiến độ tách riêng.
- Đăng xuất và xóa sách sẽ dọn nội dung offline trên thiết bị.
- Supabase reading_progress có revision và trigger tăng phiên bản; cập nhật CAS theo revision.
- Khi xung đột: hỏi giữ vị trí trên máy hay trên cloud; không âm thầm ghi đè.
- Chưa lưu audio MP3 offline; không có TTS trả phí hay APK.

### Phạm vi bước 08 (URL website, không cài APK/PWA)
- Xuất ZIP cá nhân chứa file TXT/EPUB gốc, tiến độ chương/đoạn, offset nghe, dấu trang và cài đặt đọc.
- Nhập ZIP tạo các bản sách **mới**, không xóa hay ghi đè sách cloud đang có; cài đặt chỉ được phục hồi nếu tích chọn.
- ZIP chưa mã hóa, chỉ nên lưu ở nơi an toàn. Không bao gồm mật khẩu/token; không sao lưu âm thanh MP3 hay cache offline.
- Giới hạn một lần: tối đa 300 cuốn, 20 MB/cuốn, 160 MB tổng file sách; ZIP tối đa 190 MB. Sao lưu yêu cầu mạng.
- Tối ưu 2 chỉ mục foreign key để truy vấn/xóa sách riêng tư hiệu quả hơn.
- Chỉ cache ứng dụng công khai qua Service Worker; tuyệt đối không cache API private.
- Bước 08 đã nghiệm thu 8/8. Yêu cầu tự tạo audio bằng giọng người dùng và nghe liên tục khi khóa màn hình vẫn **chưa hoàn thành**, nên chưa công bố v1 đầy đủ.
