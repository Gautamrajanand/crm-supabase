-- First, disable RLS and drop everything
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
drop policy if exists "workspace_member_insert_self" on workspace_members;
drop policy if exists "workspace_member_insert_admin" on workspace_members;
drop policy if exists "workspace_member_update_admin" on workspace_members;
drop policy if exists "workspace_member_delete_self" on workspace_members;
drop policy if exists "workspace_member_delete_admin" on workspace_members;

-- Drop views and tables
drop view if exists public.workspace_members_with_emails;
drop view if exists public.user_workspaces;
drop materialized view if exists public.user_workspace_access;
drop table if exists public.workspace_access;

-- Create a simple view for user workspaces in public schema
create view public.user_workspaces as
select distinct w.id, w.name
from public.workspaces w
inner join public.workspace_members wm on w.id = wm.workspace_id
where wm.user_id = auth.uid();

-- Create a simple view for member data in public schema
create view public.workspace_members_with_emails as
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
from public.workspace_members wm
left join auth.users u on wm.user_id = u.id
left join public.profiles p on wm.user_id = p.id;

-- Create simple policies for write operations
create policy "workspace_member_insert_self"
    on workspace_members for insert
    with check (user_id = auth.uid());

create policy "workspace_member_insert_admin"
    on workspace_members for insert
    with check (
        exists (
            select 1 from public.workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "workspace_member_update_admin"
    on workspace_members for update
    using (
        exists (
            select 1 from public.workspace_members
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
            select 1 from public.workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

-- Create policy for reading members in same workspace
create policy "workspace_member_select"
    on workspace_members for select
    using (
        exists (
            select 1 from public.workspace_members
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
        )
    );

-- Re-enable RLS
alter table workspace_members enable row level security;

-- Grant permissions
grant select on public.workspace_members_with_emails to authenticated;
grant select on public.user_workspaces to authenticated;
