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

-- Create helper function for checking stream membership
create or replace function public.user_is_stream_member(stream_id uuid) returns boolean as $$
begin
    return exists (
        select 1 from public.revenue_stream_members
        where stream_id = user_is_stream_member.stream_id
        and user_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- Add stream_id to existing tables (if they exist)
do $$
declare
    first_stream_id uuid;
begin
    -- Get first stream ID
    select id into first_stream_id from public.revenue_streams limit 1;

    -- Add stream_id to customers table if it exists
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'customers') then
        alter table public.customers add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        if first_stream_id is not null then
            update public.customers set stream_id = first_stream_id where stream_id is null;
        end if;
        alter table public.customers alter column stream_id set not null;
        drop policy if exists "customers_select" on public.customers;
        create policy "customers_select" on public.customers for select using (user_is_stream_member(stream_id));
    end if;

    -- Add stream_id to tasks table if it exists
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'tasks') then
        alter table public.tasks add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        if first_stream_id is not null then
            update public.tasks set stream_id = first_stream_id where stream_id is null;
        end if;
        alter table public.tasks alter column stream_id set not null;
        drop policy if exists "tasks_select" on public.tasks;
        create policy "tasks_select" on public.tasks for select using (user_is_stream_member(stream_id));
    end if;

    -- Add stream_id to deals table if it exists
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'deals') then
        alter table public.deals add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        if first_stream_id is not null then
            update public.deals set stream_id = first_stream_id where stream_id is null;
        end if;
        alter table public.deals alter column stream_id set not null;
        drop policy if exists "deals_select" on public.deals;
        create policy "deals_select" on public.deals for select using (user_is_stream_member(stream_id));
    end if;

    -- Add stream_id to prospects table if it exists
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'prospects') then
        alter table public.prospects add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        if first_stream_id is not null then
            update public.prospects set stream_id = first_stream_id where stream_id is null;
        end if;
        alter table public.prospects alter column stream_id set not null;
        drop policy if exists "prospects_select" on public.prospects;
        create policy "prospects_select" on public.prospects for select using (user_is_stream_member(stream_id));
    end if;

    -- Add stream_id to boards table if it exists
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'boards') then
        alter table public.boards add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        if first_stream_id is not null then
            update public.boards set stream_id = first_stream_id where stream_id is null;
        end if;
        alter table public.boards alter column stream_id set not null;
        drop policy if exists "boards_select" on public.boards;
        create policy "boards_select" on public.boards for select using (user_is_stream_member(stream_id));
    end if;

    -- Add stream_id to board_columns table if it exists
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'board_columns') then
        alter table public.board_columns add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        if first_stream_id is not null then
            update public.board_columns set stream_id = first_stream_id where stream_id is null;
        end if;
        alter table public.board_columns alter column stream_id set not null;
        drop policy if exists "board_columns_select" on public.board_columns;
        create policy "board_columns_select" on public.board_columns for select using (user_is_stream_member(stream_id));
    end if;

    -- Add stream_id to board_entries table if it exists
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'board_entries') then
        alter table public.board_entries add column if not exists stream_id uuid references public.revenue_streams(id) on delete cascade;
        if first_stream_id is not null then
            update public.board_entries set stream_id = first_stream_id where stream_id is null;
        end if;
        alter table public.board_entries alter column stream_id set not null;
        drop policy if exists "board_entries_select" on public.board_entries;
        create policy "board_entries_select" on public.board_entries for select using (user_is_stream_member(stream_id));
    end if;
end $$;

-- Grant permissions
grant usage on schema public to authenticated;
grant select on public.user_streams to authenticated;
grant select on public.user_workspaces to authenticated;
grant all on public.revenue_streams to authenticated;
grant all on public.revenue_stream_members to authenticated;

-- Grant permissions to existing tables
do $$
declare
    table_name text;
begin
    for table_name in (select tablename from pg_tables where schemaname = 'public')
    loop
        execute format('grant all on public.%I to authenticated', table_name);
    end loop;
end $$;
