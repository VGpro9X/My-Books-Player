# Tích hợp giọng Nghe Epub

## Trạng thái v0.9

Frontend đã tích hợp catalog **10 gói / 97 speaker** và adapter `ngheEpub` trong
Reader. Người dùng có thể nhập endpoint HTTPS, kiểm tra kết nối, chọn
`voice_id`/`speaker_id`/tốc độ, tạo WAV cho phần còn lại của chương và phát bằng
HTML Audio + Media Session.

Model không chạy trực tiếp trên GitHub Pages. Bộ runtime hiện có là thư viện native
Android ARM64 và harness còn phụ thuộc lớp JNI của ứng dụng nguồn. Vì vậy repo public
không chứa `.enc`, model NCNN, thư viện `.so`, khóa giải mã hoặc API key.

## Contract backend bắt buộc

Base URL người dùng nhập phải kết thúc bằng `/api/tts`, ví dụ:

```text
https://tts.example.com/api/tts
```

### Danh sách giọng

```http
GET /api/tts/voices
Accept: application/json
```

Response phải là một object có mảng `voices` hoặc trực tiếp là một mảng. Frontend
dùng request này để kiểm tra endpoint; catalog hiển thị được cung cấp sẵn trong
`nghe-epub-voices.json`.

### Sinh audio

```http
POST /api/tts/synthesize
Content-Type: application/json
Accept: audio/wav
```

```json
{
  "text": "Nội dung cần đọc",
  "voice_id": "nghe-epub:12",
  "speaker_id": 6,
  "speed": 1.2
}
```

Response thành công là `audio/wav` (khuyến nghị mono, PCM 16-bit, 24 kHz). Frontend
chấp nhận tối đa 150 MB và gửi tối đa 50.000 ký tự trong một lần tạo.

Backend phải bật CORS cho origin GitHub Pages:

```text
https://vgpro9x.github.io
```

Không yêu cầu người dùng nhập token vào website public. Nếu cần bảo vệ dịch vụ, nên
dùng reverse proxy, phiên đăng nhập riêng hoặc allowlist phù hợp; không nhúng secret
vào JavaScript.

## Quyền riêng tư và vận hành

- Nội dung từ đoạn đang đọc đến hết chương được gửi tới endpoint khi người dùng nhấn
  **Tạo audio**. Không có request TTS nền hoặc tự động.
- Endpoint và lựa chọn giọng lưu trong `localStorage`; audio sinh ra chỉ tồn tại dưới
  dạng Blob của phiên đọc, không upload Supabase và không nằm trong ZIP backup.
- HTTPS là bắt buộc khi chạy từ GitHub Pages. HTTP chỉ được chấp nhận trên localhost
  khi phát triển cục bộ.
- Phát một WAV dài qua Media Session có khả năng tiếp tục khi khóa màn hình tốt hơn
  Web Speech API, nhưng Android vẫn có thể dừng Chrome để tiết kiệm pin.

## Các adapter hiện có

- `browserSpeech`: Web Speech API của Chrome/Android.
- `ngheEpub`: gọi dịch vụ HTTPS và nhận audio thật.
- `fileAudio`: phát MP3/WAV/M4A người dùng chọn từ máy.
