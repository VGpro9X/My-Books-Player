-- Historical reproducibility: already applied on Supabase project in step 07.
-- Re-running against an existing instance should not discard reading_progress rows.
alter table public.reading_progress add column if not exists revision bigint not null default 1;
create or replace function public.bump_reading_revision()
returns trigger language plpgsql security invoker
set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  return new;
end; $$;
drop trigger if exists reading_progress_revision_before_update on public.reading_progress;
create trigger reading_progress_revision_before_update
before update on public.reading_progress
for each row execute function public.bump_reading_revision();
revoke all on function public.bump_reading_revision() from public, anon, authenticated;
