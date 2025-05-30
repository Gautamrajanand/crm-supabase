-- Drop existing complex tables and start fresh
drop table if exists public.workspace_members cascade;
drop table if exists public.workspaces cascade;

-- Create a simple workspaces table
create table public.workspaces (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    created_at timestamptz default now(),
    created_by uuid references auth.users(id) on delete set null,
    updated_at timestamptz default now()
);

-- Create a simple workspace_members table
create table public.workspace_members (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid references public.workspaces(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    can_edit boolean default false,
    created_at timestamptz default now(),
    unique(workspace_id, user_id)
);

-- Enable RLS
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- Basic workspace policies
create policy "workspace_member_select" on public.workspaces
    for select using (
        auth.uid() in (
            select user_id from workspace_members 
            where workspace_id = id
        )
    );

create policy "workspace_member_insert" on public.workspaces
    for insert with check (
        auth.uid() is not null -- Any authenticated user can create a workspace
    );

create policy "workspace_admin_update" on public.workspaces
    for update using (
        auth.uid() in (
            select user_id from workspace_members 
            where workspace_id = id and role in ('owner', 'admin')
        )
    );

create policy "workspace_owner_delete" on public.workspaces
    for delete using (
        auth.uid() in (
            select user_id from workspace_members 
            where workspace_id = id and role = 'owner'
        )
    );

-- Basic member policies
create policy "member_select_self" on public.workspace_members
    for select using (
        user_id = auth.uid() OR -- Can see own membership
        auth.uid() in ( -- Or is an admin/owner of the workspace
            select user_id from workspace_members m2
            where m2.workspace_id = workspace_id
            and m2.role in ('owner', 'admin')
        )
    );

create policy "member_insert_admin" on public.workspace_members
    for insert with check (
        (
            select true
            from workspace_members
            where workspace_id = new.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
        OR
        (
            -- Allow inserting self as owner when creating a new workspace
            new.role = 'owner' 
            and new.user_id = auth.uid()
            and not exists (
                select 1 from workspace_members
                where workspace_id = new.workspace_id
            )
        )
    );

create policy "member_update_admin" on public.workspace_members
    for update using (
        auth.uid() in (
            select user_id from workspace_members
            where workspace_id = workspace_members.workspace_id
            and role in ('owner', 'admin')
        )
    );

create policy "member_delete_admin" on public.workspace_members
    for delete using (
        auth.uid() in (
            select user_id from workspace_members
            where workspace_id = workspace_members.workspace_id
            and role in ('owner', 'admin')
        )
    );

-- Create a view for user's workspaces
create or replace view public.user_workspaces as
select 
    w.id,
    w.name,
    w.description,
    w.created_at,
    wm.role,
    wm.can_edit,
    case 
        when wm.role = 'owner' then true
        when wm.role = 'admin' then true
        else false
    end as can_manage_members
from public.workspaces w
inner join public.workspace_members wm on w.id = wm.workspace_id
where wm.user_id = auth.uid();

-- Grant permissions
grant select on public.user_workspaces to authenticated;
grant all on public.workspaces to authenticated;
grant all on public.workspace_members to authenticated;
