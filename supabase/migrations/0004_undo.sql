-- Undo, for the owner, for fifteen days.
--
-- Each change to the site's content keeps a copy of the rows it touched, as
-- they were before it, beside its line in the activity log. The owner can put
-- them back for fifteen days. After that the copy is deleted (the site's
-- server does it as changes are saved) and the change stays for good.
--
--   activity_id  the line in the activity log this copy belongs to
--   reach        what the change could touch: a table, and which of its rows
--   rows         those rows as they were; a row not listed did not exist
--   undone_at    when the owner undid the change
--
-- Nobody reaches this table through the API: it has row-level security and
-- no policies, so a signed-in member can neither read old content out of it
-- nor plant a copy for the owner to "undo". Only the site's server touches
-- it, with the service key, after checking who is asking.
--
-- Safe to run more than once.

create table if not exists public.undo_copies (
  activity_id bigint primary key references public.activity (id) on delete cascade,
  at timestamptz not null default now(),
  reach jsonb not null,
  rows jsonb not null,
  undone_at timestamptz
);

create index if not exists undo_copies_at on public.undo_copies (at);

alter table public.undo_copies enable row level security;
revoke all on public.undo_copies from anon, authenticated;
