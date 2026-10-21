-- My Books Player • bước 03 (ĐÃ ÁP DỤNG)
-- Đã áp dụng thành công vào project wdrawjvdppikutzvzoxe (Singapore).
-- Mọi dữ liệu đều phân vùng theo auth.uid(), không có quyền truy cập công khai.

create table public.user_settings (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  reader_options jsonb not null default '{}'::jsonb,
  app_options jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy "owner_only_settings" on public.user_settings
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Khung bảng sách: schema chuẩn bị cho bước 04, chưa mở chức năng upload.
create table public.books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  source_format text not null check (source_format in ('txt','epub')),
  source_filename text,
  object_path text not null,
  cover_path text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);
alter table public.books enable row level security;
create index books_by_owner_recent on public.books(owner_id,created_at desc);
create policy "owner_only_books" on public.books
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create table public.reading_progress (
  owner_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null,
  chapter_index integer not null default 0 check (chapter_index >= 0),
  paragraph_index integer not null default 0 check (paragraph_index >= 0),
  audio_offset_ms bigint not null default 0 check (audio_offset_ms >= 0),
  updated_at timestamptz not null default now(),
  primary key (owner_id, book_id),
  foreign key(book_id,owner_id) references public.books(id,owner_id) on delete cascade
);
alter table public.reading_progress enable row level security;
create policy "owner_only_progress" on public.reading_progress
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null,
  chapter_index integer not null check (chapter_index >= 0),
  paragraph_index integer not null check (paragraph_index >= 0),
  label text,
  created_at timestamptz not null default now(),
  foreign key(book_id,owner_id) references public.books(id,owner_id) on delete cascade
);
alter table public.bookmarks enable row level security;
create index bookmarks_by_book on public.bookmarks(owner_id,book_id,created_at desc);
create policy "owner_only_bookmarks" on public.bookmarks
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Bucket riêng tư. Chỉ nhận TXT/EPUB và chưa gọi upload từ frontend ở bước 03.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('my-books-private','my-books-private',false,52428800,
  array['text/plain','application/epub+zip','application/octet-stream']::text[])
on conflict (id) do nothing;

-- Quy ước đường dẫn upload: <user-uuid>/<book-uuid>/<file>.
-- Không dựa vào metadata do client tự khai là owner; xác thực theo folder đầu.
create policy "books_objects_owner_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'my-books-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "books_objects_owner_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'my-books-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "books_objects_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'my-books-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'my-books-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "books_objects_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'my-books-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Đồng bộ vị trí của các sách demo trước khi triển khai upload thật
create table public.demo_progress (
 owner_id uuid not null references auth.users(id) on delete cascade,
 demo_book_id text not null check (demo_book_id ~ '^[a-z0-9_-]{1,50}$'),
 chapter_index integer not null default 0 check (chapter_index >= 0),
 paragraph_index integer not null default 0 check (paragraph_index >= 0),
 updated_at timestamptz not null default now(),
 primary key(owner_id,demo_book_id)
);
alter table public.demo_progress enable row level security;
create policy "owner_only_demo_progress" on public.demo_progress
 for all to authenticated using(owner_id=(select auth.uid()))
 with check(owner_id=(select auth.uid()));
