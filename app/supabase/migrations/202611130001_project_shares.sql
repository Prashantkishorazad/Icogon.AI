-- Required for backend/app/routers/project_sharing.py
-- Apply through your Supabase migration workflow. Do not expose service-role keys to the frontend.
create table if not exists public.project_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid not null,
  token text not null unique,
  permission text not null default 'view' check (permission in ('view','edit')),
  created_at timestamptz not null default now(),
  expires_at timestamptz null,
  revoked_at timestamptz null
);
create index if not exists project_shares_project_id_idx on public.project_shares(project_id);
create index if not exists project_shares_token_idx on public.project_shares(token);
alter table public.project_shares enable row level security;
-- Backend uses the authenticated Supabase service client via get_supabase().
-- No anon/public table policies are added. Public share resolution must go through the API route.
