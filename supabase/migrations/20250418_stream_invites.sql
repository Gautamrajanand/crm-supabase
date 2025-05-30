-- Drop existing policies first
drop policy if exists "Owners can create invites" on public.revenue_stream_invites;
drop policy if exists "Owners can view invites" on public.revenue_stream_invites;
drop policy if exists "Anyone can view invite by token" on public.revenue_stream_invites;

-- Create revenue_stream_invites table
create table if not exists public.revenue_stream_invites (
  id uuid primary key default gen_random_uuid(),
  permissions jsonb default '{}'::jsonb not null,
  stream_id uuid not null references public.revenue_streams(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  constraint revenue_stream_invites_token_key unique (token)
);

-- Enable RLS
alter table public.revenue_stream_invites enable row level security;

-- Create RLS policies
create policy "Owners can create invites"
  on public.revenue_stream_invites
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.revenue_streams s
      inner join public.revenue_stream_members m on s.id = m.stream_id
      where s.id = stream_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
    )
  );

create policy "Owners can view invites"
  on public.revenue_stream_invites
  for select
  to authenticated
  using (
    exists (
      select 1 from public.revenue_streams s
      inner join public.revenue_stream_members m on s.id = m.stream_id
      where s.id = stream_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
    )
  );

create policy "Anyone can view invite by token"
  on public.revenue_stream_invites
  for select
  using (
    true -- Allow public access to check invites by token
  );
