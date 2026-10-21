# Chuẩn nhận giọng TTS sau này

Chỉ cần cung cấp **nguyên bộ giọng hoặc tài liệu kỹ thuật thực tế**; không cần tự chuyển sang một định dạng cụ thể. Trình duyệt/GitHub Pages không tự chạy mọi loại mô hình giọng.

## Nếu cung cấp API TTS

- HTTPS endpoint, method, kiểu xác thực (không đưa khóa API vào repo public).
- Đầu vào: text UTF-8 và tùy chọn voice_id, language=vi-VN, speed.
- Đầu ra: audio MP3 hoặc WAV hoặc OGG/Opus tùy trình duyệt hỗ trợ.
- Nếu có: JSON thời gian theo câu/từ để đồng bộ highlight.
- Ví dụ request/response và giới hạn ký tự/kích thước.

## Nếu cung cấp mô hình TTS

Gửi nguyên bộ file gốc (ví dụ ONNX + config JSON, hoặc PyTorch safetensors/pth + config/tokenizer/vocoder), code inference nếu có, và phụ thuộc/hướng dẫn chạy. Không cần tự chuyển định dạng. Mô hình có thể cần một backend riêng và tài nguyên tính toán.

## Nếu cung cấp file âm thanh

MP3/AAC(M4A)/WAV/Opus được hỗ trợ tùy browser. File âm thanh có sẵn có thể phát ngay nhưng **không phải mô hình TTS có thể đọc văn bản tùy ý**.

## Giao diện tích hợp dự kiến

Adapter sẽ nhận văn bản/voice_id/speed và trả về (1) audioUrl hoặc audioBlob, (2) duration, (3) optional array of {startMs,endMs,textPosition}. Cách tạo audio và hosting được triển khai khi biết bộ giọng thực tế.

**Chưa tích hợp bất kỳ giọng tùy chỉnh nào trong v0.1.**
