-- ============================================================
-- Trello-like Project Tracker — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query.
-- ============================================================

-- Fixed kanban columns, modeled as an enum on each card.
create type card_status as enum ('todo', 'in_progress', 'complete', 'archive');

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
  position    integer not null default 0,        -- order within a column
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index cards_board_status_idx on cards (board_id, status, position);
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
