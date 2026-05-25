-- ============================================================
-- Trello-like Project Tracker — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query.
-- ============================================================

-- Fixed kanban columns, modeled as an enum on each card.
create type card_status as enum ('todo', 'in_progress', 'complete', 'archive');

-- Card priority. P1 = highest, P3 = lowest. Null means no priority set.
create type card_priority as enum ('p1', 'p2', 'p3');

-- ------------------------------------------------------------
-- Projects / boards
-- ------------------------------------------------------------
create table boards (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Cards / tasks
-- ------------------------------------------------------------
create table cards (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references boards (id) on delete cascade,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  description text,
  status      card_status not null default 'todo',
  priority    card_priority,                     -- nullable: optional
  position    integer not null default 0,        -- order within a column
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index cards_board_status_idx on cards (board_id, status, position);
create index cards_board_priority_idx on cards (board_id, priority);
create index boards_owner_idx on boards (owner_id);

-- ------------------------------------------------------------
-- Row Level Security: a user can only read/write their own rows.
-- ------------------------------------------------------------
alter table boards enable row level security;
alter table cards  enable row level security;

create policy "own boards" on boards for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "own cards" on cards for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ------------------------------------------------------------
-- Keep cards.updated_at fresh on every update.
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cards_updated_at
  before update on cards
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Enable Realtime so the board stays live across tabs/devices.
-- (Realtime still respects the RLS policies above.)
-- ------------------------------------------------------------
alter publication supabase_realtime add table cards;
alter publication supabase_realtime add table boards;

-- ============================================================
-- Migration: priority field (run on existing databases)
-- ============================================================
-- If your database was created before the priority feature, run this
-- block in the SQL editor. It is idempotent — safe to run more than once.
--
-- do $$
-- begin
--   if not exists (select 1 from pg_type where typname = 'card_priority') then
--     create type card_priority as enum ('p1', 'p2', 'p3');
--   end if;
-- end$$;
--
-- alter table cards add column if not exists priority card_priority;
-- create index if not exists cards_board_priority_idx on cards (board_id, priority);
