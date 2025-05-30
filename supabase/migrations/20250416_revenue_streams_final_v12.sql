-- Drop all policies first
do $$
declare
    tbl text;
begin
    for tbl in (select tablename from pg_tables where schemaname = 'public' and tablename in ('customers', 'tasks', 'deals', 'prospects', 'boards', 'board_columns', 'board_entries', 'events', 'revenue_stream_members'))
    loop
        execute format('drop policy if exists %I_select on public.%I', tbl, tbl);
        execute format('drop policy if exists %I_insert on public.%I', tbl, tbl);
        execute format('drop policy if exists %I_update on public.%I', tbl, tbl);
        execute format('drop policy if exists %I_delete on public.%I', tbl, tbl);
    end loop;
end $$;

-- Drop function after policies are dropped
drop function if exists public.user_is_stream_member(uuid);

-- Create helper function with explicit parameter name
create or replace function public.user_is_stream_member(check_stream_id uuid) returns boolean as $$
begin
    return exists (
        select 1 from public.revenue_stream_members m
        where m.stream_id = check_stream_id
        and m.user_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- Drop existing tables and views
drop view if exists public.user_workspaces;
drop view if exists public.user_streams;
drop view if exists public.workspace_members_with_emails;
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

-- Create revenue stream members table first
create table public.revenue_stream_members (
    id uuid primary key default uuid_generate_v4(),
    stream_id uuid references public.revenue_streams(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    can_edit boolean default false,
    created_at timestamptz default now(),
    unique(stream_id, user_id)
);

-- Enable RLS early
alter table public.revenue_streams enable row level security;
alter table public.revenue_stream_members enable row level security;

-- Create base policies first
create policy "stream_select" on public.revenue_streams for select using (true);
create policy "stream_insert" on public.revenue_streams for insert with check (auth.uid() is not null);

-- Member policies needed for initial setup
create policy "member_select" on public.revenue_stream_members for select using (true);
create policy "member_insert" on public.revenue_stream_members for insert with check (
    auth.uid() is not null
    AND (
        -- Allow creating first member as owner (for new streams)
        (
            role = 'owner' 
            AND user_id = auth.uid()
            AND NOT EXISTS (
                select 1 from public.revenue_stream_members m
                where m.stream_id = revenue_stream_members.stream_id
            )
        )
        OR
        -- Allow admins/owners to add members
        EXISTS (
            select 1 from public.revenue_stream_members m
            where m.stream_id = revenue_stream_members.stream_id
            and m.user_id = auth.uid()
            and m.role in ('owner', 'admin')
        )
    )
);

-- Now create default stream and add members
do $$
declare
    default_stream_id uuid;
begin
    -- Create default stream
    insert into public.revenue_streams (name, description) 
    values ('Default', 'Default revenue stream for existing data')
    returning id into default_stream_id;

    -- Add all existing users as owners of the default stream
    insert into public.revenue_stream_members (stream_id, user_id, role, can_edit)
    select 
        default_stream_id,
        id,
        'owner',
        true
    from auth.users;

    -- Add stream_id to existing tables
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'customers') then
        alter table public.customers add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.customers set stream_id = default_stream_id where stream_id is null;
        alter table public.customers alter column stream_id set not null;
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'tasks') then
        alter table public.tasks add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.tasks set stream_id = default_stream_id where stream_id is null;
        alter table public.tasks alter column stream_id set not null;
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'deals') then
        alter table public.deals add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.deals set stream_id = default_stream_id where stream_id is null;
        alter table public.deals alter column stream_id set not null;
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'prospects') then
        alter table public.prospects add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.prospects set stream_id = default_stream_id where stream_id is null;
        alter table public.prospects alter column stream_id set not null;
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'boards') then
        alter table public.boards add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.boards set stream_id = default_stream_id where stream_id is null;
        alter table public.boards alter column stream_id set not null;
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'board_columns') then
        alter table public.board_columns add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.board_columns set stream_id = default_stream_id where stream_id is null;
        alter table public.board_columns alter column stream_id set not null;
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'board_entries') then
        alter table public.board_entries add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.board_entries set stream_id = default_stream_id where stream_id is null;
        alter table public.board_entries alter column stream_id set not null;
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'events') then
        alter table public.events add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        update public.events set stream_id = default_stream_id where stream_id is null;
        alter table public.events alter column stream_id set not null;
    end if;
end $$;

-- Create views
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
where m.user_id = auth.uid();

create or replace view public.user_workspaces as
select * from public.user_streams;

create or replace view public.workspace_members_with_emails as
select 
    m.*,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name
from public.revenue_stream_members m
inner join auth.users u on u.id = m.user_id;

-- Update stream policies to be more restrictive
create policy "stream_update" on public.revenue_streams as restrictive
    for update using (
        exists (
            select 1 from public.revenue_stream_members m
            where m.stream_id = revenue_streams.id 
            and m.user_id = auth.uid()
            and m.role in ('owner', 'admin')
        )
    );

create policy "stream_delete" on public.revenue_streams as restrictive
    for delete using (
        exists (
            select 1 from public.revenue_stream_members m
            where m.stream_id = revenue_streams.id 
            and m.user_id = auth.uid()
            and m.role = 'owner'
        )
    );

-- Update member policies to be more restrictive
create policy "member_update" on public.revenue_stream_members as restrictive
    for update using (
        exists (
            select 1 from public.revenue_stream_members m
            where m.stream_id = revenue_stream_members.stream_id
            and m.user_id = auth.uid()
            and m.role = 'owner'
        )
    );

create policy "member_delete" on public.revenue_stream_members as restrictive
    for delete using (
        exists (
            select 1 from public.revenue_stream_members m
            where m.stream_id = revenue_stream_members.stream_id
            and m.user_id = auth.uid()
            and m.role = 'owner'
        )
        OR user_id = auth.uid()
    );

-- Add RLS policies to existing tables
do $$
declare
    tbl text;
begin
    for tbl in (select tablename from pg_tables where schemaname = 'public' and tablename in ('customers', 'tasks', 'deals', 'prospects', 'boards', 'board_columns', 'board_entries', 'events'))
    loop
        execute format('create policy %I_select on public.%I as restrictive for select using (user_is_stream_member((%I).stream_id))', tbl, tbl, tbl);
        execute format('create policy %I_insert on public.%I as restrictive for insert with check (user_is_stream_member(stream_id))', tbl, tbl);
        execute format('create policy %I_update on public.%I as restrictive for update using (user_is_stream_member(stream_id))', tbl, tbl);
        execute format('create policy %I_delete on public.%I as restrictive for delete using (user_is_stream_member(stream_id))', tbl, tbl);
        
        execute format('alter table public.%I enable row level security', tbl);
    end loop;
end $$;

-- Grant permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
