# Changelog

## v0.3.0 — Step 03 Supabase Cloud & Auth (chờ nghiệm thu)
- Supabase Free project created Singapore; quote $0/month.
- Applied database schema with RLS for user_settings, books, reading_progress, bookmarks, demo_progress.
- Private storage bucket with owner-only path policies. Security advisor returned 0 security lints on initial review.
- Added login/register/logout and syncing demo reading position, saved demo books, font/reading settings and theme by authenticated account.
- Email confirmation URL requires site URL configuration in Supabase Dashboard (see SUPABASE_SETUP.md).
- This milestone does NOT yet upload TXT or EPUB, and does NOT guarantee Android background speech playback.
- Auth still allows user signup unless owner disables signup via Supabase Dashboard.
- Cloud frontend awaits Android acceptance.

## v0.2.2 — Reader restore (accepted)
- Reopening restores the marked paragraph; user accepts instant jump.
## v0.2.0 — UI (accepted)
- 7/7 criteria passed on Android.
## v0.1.0 — Audio proof of concept (accepted)
- Browser TTS and audio tests.
