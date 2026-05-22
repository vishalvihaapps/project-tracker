# Project Tracker

A Trello-style kanban tracker for managing multiple projects. Each project is a
**board** with four fixed columns — **Todo, InProgress, Complete, Archive** — and
cards you drag between them. Built with React + Vite + TypeScript, backed by
Supabase (Postgres + Auth + Realtime).

## Features

- Email/password authentication via Supabase Auth.
- Per-user data isolation enforced by Postgres Row Level Security — each account
  only ever sees its own boards and cards.
- Create and delete project boards.
- Create, edit, and delete cards on a board.
- Drag and drop cards between columns and reorder within a column (`@dnd-kit`).
- Live updates across tabs/devices via Supabase Realtime.

## Tech stack

React 18 · Vite · TypeScript · Tailwind CSS · React Router · `@dnd-kit` ·
`@supabase/supabase-js`

## Setup

### 1. Create a Supabase project

1. Sign up / sign in at <https://supabase.com> and create a new project.
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `boards` and `cards` tables, the `card_status` enum, RLS policies, the
   `updated_at` trigger, and enables Realtime.
3. *(Optional, recommended for local testing)* Under **Authentication →
   Sign In / Providers → Email**, turn **off** "Confirm email" so new accounts
   can sign in immediately without an email round-trip.

### 2. Configure environment variables

1. In Supabase, go to **Project Settings → API**.
2. Copy this file and fill in your values:

   ```sh
   cp .env.example .env.local
   ```

3. Set in `.env.local`:
   - `VITE_SUPABASE_URL` — the **Project URL**
   - `VITE_SUPABASE_ANON_KEY` — the **anon public** API key

   `.env.local` is gitignored and never committed.

### 3. Install and run

```sh
npm install
npm run dev
```

Open the printed URL (default <http://localhost:5173>).

## Scripts

| Command           | Description                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Start the Vite dev server.                   |
| `npm run build`   | Type-check and build for production.         |
| `npm run preview` | Preview the production build locally.        |

## How it works

| Area        | File(s) |
|-------------|---------|
| DB schema   | [`supabase/schema.sql`](supabase/schema.sql) |
| Supabase client | [`src/lib/supabase.ts`](src/lib/supabase.ts) |
| Auth        | [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx), [`src/components/ProtectedRoute.tsx`](src/components/ProtectedRoute.tsx) |
| Boards      | [`src/hooks/useBoards.ts`](src/hooks/useBoards.ts), [`src/pages/DashboardPage.tsx`](src/pages/DashboardPage.tsx) |
| Kanban board| [`src/hooks/useCards.ts`](src/hooks/useCards.ts), [`src/pages/BoardPage.tsx`](src/pages/BoardPage.tsx) |
| Drag & drop helpers | [`src/lib/kanban.ts`](src/lib/kanban.ts) |

Columns are fixed and modeled as a `card_status` enum (`todo`, `in_progress`,
`complete`, `archive`) on each card. Card order within a column is an integer
`position`; after every drag the affected cards are renumbered and only the
changed rows are written back.
