-- First, disable RLS and drop ALL policies
alter table workspace_members disable row level security;

-- Drop ALL policies by name
drop policy if exists "member_select_policy" on workspace_members;
drop policy if exists "member_insert_policy" on workspace_members;
drop policy if exists "member_update_policy" on workspace_members;
drop policy if exists "member_delete_policy" on workspace_members;
drop policy if exists "users_can_see_their_workspaces" on workspace_members;
drop policy if exists "users_can_see_workspaces_they_are_in" on workspace_members;
drop policy if exists "users_can_add_themselves" on workspace_members;
drop policy if exists "admins_can_add_others" on workspace_members;
drop policy if exists "admins_can_update" on workspace_members;
drop policy if exists "users_can_delete_themselves" on workspace_members;
drop policy if exists "admins_can_delete_others" on workspace_members;

-- Drop views and tables
drop view if exists workspace_members_with_emails;
drop view if exists user_workspaces;
drop materialized view if exists user_workspace_access;
drop table if exists workspace_access;

-- Create a function to get workspace members that bypasses RLS
create or replace function get_workspace_members(workspace_id uuid)
returns table (
    id uuid,
    workspace_id uuid,
    user_id uuid,
    role text,
    created_at timestamptz,
    name text,
    email text,
    permissions jsonb
)
security definer
stable
language sql
as $$
    select 
        wm.id,
        wm.workspace_id,
        wm.user_id,
        wm.role,
        wm.created_at,
        coalesce(p.full_name, split_part(u.email, '@', 1)) as name,
        u.email,
        coalesce(wm.permissions, '{
            "outreach": "none",
            "deals": "none",
            "customers": "none",
            "tasks": "none",
            "calendar": "none"
        }'::jsonb) as permissions
    from workspace_members wm
    left join auth.users u on wm.user_id = u.id
    left join profiles p on wm.user_id = p.id
    where wm.workspace_id = $1
    and exists (
        select 1 from workspace_members
        where workspace_id = $1
        and user_id = auth.uid()
    );
$$;

-- Create a function to get user workspaces that bypasses RLS
create or replace function get_user_workspaces()
returns table (
    id uuid,
    name text
)
security definer
stable
language sql
as $$
    select distinct w.id, w.name
    from workspaces w
    inner join workspace_members wm on w.id = wm.workspace_id
    where wm.user_id = auth.uid();
$$;

-- Create new policies with unique names
create policy "workspace_member_insert_self"
    on workspace_members for insert
    with check (user_id = auth.uid());

create policy "workspace_member_insert_admin"
    on workspace_members for insert
    with check (
        exists (
            select 1 from workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "workspace_member_update_admin"
    on workspace_members for update
    using (
        exists (
            select 1 from workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "workspace_member_delete_self"
    on workspace_members for delete
    using (user_id = auth.uid());

create policy "workspace_member_delete_admin"
    on workspace_members for delete
    using (
        exists (
            select 1 from workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

-- Re-enable RLS
alter table workspace_members enable row level security;

-- Grant permissions
grant execute on function get_workspace_members to authenticated;
grant execute on function get_user_workspaces to authenticated;
