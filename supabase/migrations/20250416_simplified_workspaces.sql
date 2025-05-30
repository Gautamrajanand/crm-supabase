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

-- Enable RLS
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- Workspace policies
create policy "users_can_see_their_workspaces"
    on public.workspaces for select
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_id = id
            and user_id = auth.uid()
        )
    );

create policy "owners_and_admins_can_update_workspace"
    on public.workspaces for update
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_id = id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "owners_can_delete_workspace"
    on public.workspaces for delete
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_id = id
            and user_id = auth.uid()
            and role = 'owner'
        )
    );

create policy "authenticated_users_can_create_workspace"
    on public.workspaces for insert
    with check (auth.uid() is not null);

-- Workspace member policies
create policy "users_can_see_workspace_members"
    on public.workspace_members for select
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
        )
    );

create policy "owners_and_admins_can_manage_members"
    on public.workspace_members for insert
    with check (
        exists (
            select 1 from public.workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "owners_and_admins_can_update_members"
    on public.workspace_members for update
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "owners_and_admins_can_delete_members"
    on public.workspace_members for delete
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

-- Grant permissions
grant select on public.user_workspaces to authenticated;
grant all on public.workspaces to authenticated;
grant all on public.workspace_members to authenticated;
