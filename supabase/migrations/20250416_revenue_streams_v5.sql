-- Drop existing tables and views
drop view if exists public.user_workspaces;
drop view if exists public.user_streams;
drop table if exists public.workspace_members cascade;
drop table if exists public.workspaces cascade;
drop table if exists public.revenue_stream_members cascade;
drop table if exists public.revenue_streams cascade;

-- Create revenue streams table
create table public.revenue_streams (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    created_at timestamptz default now(),
    created_by uuid references auth.users(id) on delete set null,
    updated_at timestamptz default now()
);

-- Create revenue stream members table
create table public.revenue_stream_members (
    id uuid primary key default uuid_generate_v4(),
    stream_id uuid references public.revenue_streams(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    can_edit boolean default false,
    created_at timestamptz default now(),
    unique(stream_id, user_id)
);

-- Enable RLS
alter table public.revenue_streams enable row level security;
alter table public.revenue_stream_members enable row level security;

-- Revenue stream policies
create policy "stream_select" on public.revenue_streams
    for select using (true); -- Allow all reads, filtering done in views

create policy "stream_member_insert" on public.revenue_streams
    for insert with check (
        auth.uid() is not null -- Any authenticated user can create a stream
    );

create policy "stream_admin_update" on public.revenue_streams
    for update using (
        exists (
            select 1 from public.revenue_stream_members 
            where stream_id = id 
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "stream_owner_delete" on public.revenue_streams
    for delete using (
        exists (
            select 1 from public.revenue_stream_members 
            where stream_id = id 
            and user_id = auth.uid()
            and role = 'owner'
        )
    );

-- Member policies (simplified to avoid recursion)
create policy "member_select" on public.revenue_stream_members
    for select using (true); -- Allow all reads, filtering done in views

create policy "member_insert_admin" on public.revenue_stream_members
    for insert with check (
        -- Only allow if user is admin/owner of the stream or creating first member
        (
            exists (
                select 1 from public.revenue_stream_members existing
                where existing.stream_id = revenue_stream_members.stream_id
                and existing.user_id = auth.uid()
                and existing.role in ('owner', 'admin')
            )
        )
        OR
        (
            -- Allow creating first member as owner (for new streams)
            role = 'owner' 
            and user_id = auth.uid()
            and not exists (
                select 1 from public.revenue_stream_members existing
                where existing.stream_id = revenue_stream_members.stream_id
            )
        )
    );

create policy "member_update" on public.revenue_stream_members
    for update using (
        -- Only owners can update member roles
        exists (
            select 1 from public.revenue_stream_members existing
            where existing.stream_id = revenue_stream_members.stream_id
            and existing.user_id = auth.uid()
            and existing.role = 'owner'
        )
    );

create policy "member_delete" on public.revenue_stream_members
    for delete using (
        -- Only owners can remove members
        exists (
            select 1 from public.revenue_stream_members existing
            where existing.stream_id = revenue_stream_members.stream_id
            and existing.user_id = auth.uid()
            and existing.role = 'owner'
        )
        OR
        -- Members can remove themselves
        user_id = auth.uid()
    );

-- Create a secure view for user's streams
create or replace view public.user_streams as
select 
    s.id,
    s.name,
    s.description,
    s.created_at,
    m.user_id,
    m.role,
    m.can_edit,
    case 
        when m.role = 'owner' then true
        when m.role = 'admin' then true
        else false
    end as can_manage_members
from public.revenue_streams s
inner join public.revenue_stream_members m on s.id = m.stream_id
where m.user_id = auth.uid(); -- Only show streams where user is a member

-- Create a backward-compatible view for existing components
create or replace view public.user_workspaces as
select 
    s.id,
    s.name,
    s.description,
    s.created_at,
    m.user_id,
    m.role,
    m.can_edit,
    case 
        when m.role = 'owner' then true
        when m.role = 'admin' then true
        else false
    end as can_manage_members
from public.revenue_streams s
inner join public.revenue_stream_members m on s.id = m.stream_id
where m.user_id = auth.uid(); -- Only show streams where user is a member

-- Grant permissions
grant usage on schema public to authenticated;
grant select on public.user_streams to authenticated;
grant select on public.user_workspaces to authenticated;
grant all on public.revenue_streams to authenticated;
grant all on public.revenue_stream_members to authenticated;
