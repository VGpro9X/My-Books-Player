-- Applied as v0.8 performance optimization; no user rows modified.
create index if not exists reading_progress_by_book_fk on public.reading_progress (book_id,owner_id);
create index if not exists bookmarks_by_book_fk on public.bookmarks (book_id,owner_id);
