# My Books Player — Supabase Step 03
Project: `my-books-player`
Region: `ap-southeast-1` (Singapore)
Project URL: `https://wdrawjvdppikutzvzoxe.supabase.co`
Pricing quote when created: **$0/month** for Free plan, resource overruns subject to Supabase terms.

## Current status
- Created Supabase project, migration applied, tables user_settings/books/reading_progress/bookmarks/demo_progress RLS enabled.
- Storage bucket: `my-books-private` private with owner-based path policies.
- Security Advisor: no lint findings at initial scan.
- Website uses public publishable key (this key is meant to be in frontend; never use service_role).
- Auth email/password signup/login/logout; synchronize demo progress and reader preferences via user_settings and demo_progress.
- TXT/EPUB upload is not yet live (Step 04).

## Required authentication setting
Before real signup emails work reliably, go to Supabase Dashboard > Authentication > URL Configuration.
- Site URL: `https://vgpro9x.github.io/My-Books-Player/`
- Additional Redirect URLs: `https://vgpro9x.github.io/My-Books-Player/` and `https://vgpro9x.github.io/My-Books-Player/**`
Supabase confirms email by default; check Email provider and confirmations in Auth settings.
Never send login password or email confirmation codes to assistant.
The default hosted email service has rate limits, suitable for a private test, not mass signup.

## Security
Authenticated users can access only their own records, scoped to auth.uid() via RLS; storage bucket has no public access.
Anyone may potentially sign up if public signup remains enabled; their own records remain separate. Disable public signup after you create your personal account if you want no further accounts.
No automatic paid TTS and no secret keys on GitHub Pages.

## Test
1. Open website, click cloud icon, create account, confirm email if needed.
2. Login. Set book demo position / settings, wait a moment and press 'Đồng bộ ngay'.
3. Logout and login again, and try on second browser/device with same account.
4. Confirm separate accounts cannot read others' settings/book progress.
