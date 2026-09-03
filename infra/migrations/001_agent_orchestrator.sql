create extension if not exists pgcrypto;

create table if not exists public.agent_runs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    project_id text not null,
    idempotency_key text not null,
    status text not null check (
        status in ('queued', 'planning', 'generating', 'verifying', 'repairing', 'completed', 'failed', 'cancelled')
    ),
    prompt text not null,
    state jsonb not null default '{}'::jsonb,
    cancel_requested_at timestamptz,
    lease_owner text,
    lease_token uuid,
    lease_expires_at timestamptz,
    last_heartbeat_at timestamptz,
    execution_attempts integer not null default 0 check (execution_attempts >= 0),
    next_event_sequence bigint not null default 1 check (next_event_sequence > 0),
    version integer not null default 1 check (version > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, idempotency_key)
);

create index if not exists agent_runs_project_created_idx
    on public.agent_runs (project_id, created_at desc);

create index if not exists agent_runs_claim_idx
    on public.agent_runs (status, lease_expires_at, created_at)
    where status not in ('completed', 'failed', 'cancelled');

create table if not exists public.agent_run_events (
    id uuid primary key default gen_random_uuid(),
    run_id uuid not null references public.agent_runs(id) on delete cascade,
    sequence bigint not null,
    event_type text not null,
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    unique (run_id, sequence)
);

create index if not exists agent_run_events_stream_idx
    on public.agent_run_events (run_id, sequence);

alter table public.agent_runs enable row level security;
alter table public.agent_run_events enable row level security;

create policy "users_read_own_agent_runs"
    on public.agent_runs for select
    using (auth.uid() = user_id);

create policy "users_read_own_agent_run_events"
    on public.agent_run_events for select
    using (
        exists (
            select 1
            from public.agent_runs
            where agent_runs.id = agent_run_events.run_id
              and agent_runs.user_id = auth.uid()
        )
    );

create or replace function public.claim_next_agent_run(
    p_worker_id text,
    p_lease_seconds integer default 30
)
returns public.agent_runs
language plpgsql
security invoker
set search_path = public
as $$
declare
    claimed public.agent_runs;
begin
    select *
      into claimed
      from public.agent_runs
     where status not in ('completed', 'failed', 'cancelled')
       and (lease_expires_at is null or lease_expires_at <= now())
     order by created_at, id
     for update skip locked
     limit 1;

    if claimed.id is null then
        return null;
    end if;

    update public.agent_runs
       set lease_owner = p_worker_id,
           lease_token = gen_random_uuid(),
           lease_expires_at = now() + make_interval(secs => greatest(1, p_lease_seconds)),
           last_heartbeat_at = now(),
           execution_attempts = execution_attempts + 1,
           version = version + 1,
           updated_at = now()
     where id = claimed.id
     returning * into claimed;

    return claimed;
end;
$$;

create or replace function public.heartbeat_agent_run(
    p_lease_token uuid,
    p_lease_seconds integer default 30
)
returns boolean
language sql
security invoker
set search_path = public
as $$
    with renewed as (
        update public.agent_runs
           set lease_expires_at = now() + make_interval(secs => greatest(1, p_lease_seconds)),
               last_heartbeat_at = now(),
               updated_at = now()
         where lease_token = p_lease_token
           and lease_expires_at > now()
         returning 1
    )
    select exists(select 1 from renewed);
$$;

create or replace function public.release_agent_run(p_lease_token uuid)
returns boolean
language sql
security invoker
set search_path = public
as $$
    with released as (
        update public.agent_runs
           set lease_owner = null,
               lease_token = null,
               lease_expires_at = null,
               updated_at = now()
         where lease_token = p_lease_token
         returning 1
    )
    select exists(select 1 from released);
$$;
