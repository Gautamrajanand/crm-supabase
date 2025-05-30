-- First, disable RLS and drop everything
alter table workspace_members disable row level security;
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
drop view if exists workspace_members_with_emails;
drop view if exists user_workspaces;
drop materialized view if exists user_workspace_access;
drop table if exists workspace_access;

-- Create a materialized view for member data
create materialized view workspace_members_with_emails as
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
    }'::jsonb) as permissions,
    wm.role in ('owner', 'admin') as is_admin,
    -- Add a unique identifier for concurrent refresh
    wm.id as unique_id
from workspace_members wm
left join auth.users u on wm.user_id = u.id
left join profiles p on wm.user_id = p.id;

-- Create unique index for concurrent refresh
create unique index workspace_members_with_emails_unique_idx 
    on workspace_members_with_emails(unique_id);

-- Create trigger function to refresh the view
create or replace function refresh_workspace_members_view()
returns trigger as $$
begin
    refresh materialized view concurrently workspace_members_with_emails;
    return null;
end;
$$ language plpgsql security definer;

-- Create trigger to refresh the view
create trigger refresh_workspace_members_view_trigger
    after insert or update or delete on workspace_members
    for each statement
    execute function refresh_workspace_members_view();

-- Create a materialized view for user workspaces
create materialized view user_workspaces as
select distinct
    w.id,
    w.name,
    wm.user_id,
    -- Add a unique identifier for concurrent refresh
    w.id || '-' || wm.user_id as unique_id
from workspaces w
inner join workspace_members wm on w.id = wm.workspace_id;

-- Create unique index for concurrent refresh
create unique index user_workspaces_unique_idx 
    on user_workspaces(unique_id);

-- Create trigger function to refresh the view
create or replace function refresh_user_workspaces_view()
returns trigger as $$
begin
    refresh materialized view concurrently user_workspaces;
    return null;
end;
$$ language plpgsql security definer;

-- Create trigger to refresh the view
create trigger refresh_user_workspaces_view_trigger
    after insert or update or delete on workspace_members
    for each statement
    execute function refresh_user_workspaces_view();

-- Create simple policies for write operations
create policy "workspace_member_insert_self"
    on workspace_members for insert
    with check (user_id = auth.uid());

create policy "workspace_member_insert_admin"
    on workspace_members for insert
    with check (
        exists (
            select 1 from workspace_members_with_emails
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and is_admin = true
        )
    );

create policy "workspace_member_update_admin"
    on workspace_members for update
    using (
        exists (
            select 1 from workspace_members_with_emails
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and is_admin = true
        )
    );

create policy "workspace_member_delete_self"
    on workspace_members for delete
    using (user_id = auth.uid());

create policy "workspace_member_delete_admin"
    on workspace_members for delete
    using (
        exists (
            select 1 from workspace_members_with_emails
            where workspace_id = workspace_members.workspace_id
            and user_id = auth.uid()
            and is_admin = true
        )
    );

-- Re-enable RLS
alter table workspace_members enable row level security;

-- Grant permissions
grant select on workspace_members_with_emails to authenticated;
grant select on user_workspaces to authenticated;
