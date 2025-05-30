-- Drop existing table if it exists
drop table if exists public.stream_invitations;

-- Create stream invitations table
create table public.stream_invitations (
    id uuid primary key default uuid_generate_v4(),
    stream_id uuid references public.revenue_streams(id) on delete cascade,
    email text not null,
    role text not null check (role in ('owner', 'admin', 'member')),
    permissions jsonb not null default '{}'::jsonb,
    invited_by uuid references auth.users(id) on delete set null,
    created_at timestamptz default now(),
    expires_at timestamptz default (now() + interval '7 days'),
    status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
    unique(stream_id, email)
);

-- Enable RLS
alter table public.stream_invitations enable row level security;

-- Create policies
create policy "stream_invitation_select" on public.stream_invitations
    for select using (
        -- Can see invitations for streams you are an admin/owner of
        auth.uid() in (
            select user_id from revenue_stream_members
            where stream_id = stream_invitations.stream_id
            and role in ('owner', 'admin')
        )
        OR
        -- Can see your own invitation
        email = (
            select email from auth.users
            where id = auth.uid()
        )
    );

create policy "stream_invitation_insert" on public.stream_invitations
    for insert with check (
        -- Must be an admin/owner of the stream to invite others
        auth.uid() in (
            select user_id from revenue_stream_members
            where stream_id = new.stream_id
            and role in ('owner', 'admin')
        )
    );

create policy "stream_invitation_update" on public.stream_invitations
    for update using (
        -- Must be an admin/owner of the stream
        auth.uid() in (
            select user_id from revenue_stream_members
            where stream_id = stream_invitations.stream_id
            and role in ('owner', 'admin')
        )
        OR
        -- Or be the invited user
        email = (
            select email from auth.users
            where id = auth.uid()
        )
    );

create policy "stream_invitation_delete" on public.stream_invitations
    for delete using (
        -- Must be an admin/owner of the stream
        auth.uid() in (
            select user_id from revenue_stream_members
            where stream_id = stream_invitations.stream_id
            and role in ('owner', 'admin')
        )
        OR
        -- Or be the invited user
        email = (
            select email from auth.users
            where id = auth.uid()
        )
    );

-- Grant permissions
grant all on public.stream_invitations to authenticated;

-- Grant permissions to access auth.users (read-only)
grant usage on schema auth to authenticated;
grant select on auth.users to authenticated;
