## 2026-11-22 - Integrate remote TTS in a static reader
**Component pattern:** Keep licensed model assets behind a user-controlled HTTPS service; expose only a validated catalog and a small browser adapter.
**Insight:** A single generated chapter WAV reuses the existing HTML Audio/Media Session path and is more background-friendly than chaining speech requests.
**Apply when:** Adding custom TTS to a static-site reader that cannot execute the native model locally.
