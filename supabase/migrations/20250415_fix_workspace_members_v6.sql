-- First disable RLS
alter table workspace_members disable row level security;
alter table workspaces disable row level security;

-- Drop all existing policies
drop policy if exists "member_select_policy" on workspace_members;
drop policy if exists "member_insert_policy" on workspace_members;
drop policy if exists "member_update_policy" on workspace_members;
drop policy if exists "member_delete_policy" on workspace_members;

-- Drop and recreate materialized view with unique index
drop materialized view if exists user_workspace_access;
create materialized view user_workspace_access as
select distinct
    wm.user_id,
    wm.workspace_id,
    wm.role in ('owner', 'admin') as is_admin,
    -- Add a unique identifier column
    (wm.user_id::text || '-' || wm.workspace_id::text) as unique_id
from workspace_members wm;

-- Create unique index required for concurrent refresh
create unique index user_workspace_access_unique_idx 
    on user_workspace_access(unique_id);

-- Create other indexes for performance
create index if not exists user_workspace_access_user_id_idx 
    on user_workspace_access(user_id);
create index if not exists user_workspace_access_workspace_id_idx 
    on user_workspace_access(workspace_id);

-- Create function to refresh the materialized view
create or replace function refresh_user_workspace_access()
returns trigger as $$
begin
    refresh materialized view concurrently user_workspace_access;
    return null;
end;
$$ language plpgsql;

-- Create trigger to refresh the view
drop trigger if exists refresh_user_workspace_access_trigger on workspace_members;
create trigger refresh_user_workspace_access_trigger
    after insert or update or delete on workspace_members
    for each statement
    execute function refresh_user_workspace_access();

-- Create simple policies using the materialized view
create policy "member_select_policy"
    on workspace_members for select
    using (
        exists (
            select 1 from user_workspace_access ua
            where ua.user_id = auth.uid()
            and ua.workspace_id = workspace_members.workspace_id
        )
    );

create policy "member_insert_policy"
    on workspace_members for insert
    with check (
        exists (
            select 1 from user_workspace_access ua
            where ua.user_id = auth.uid()
            and ua.workspace_id = workspace_id
            and ua.is_admin = true
        )
        or user_id = auth.uid()
    );

create policy "member_update_policy"
    on workspace_members for update
    using (
        exists (
            select 1 from user_workspace_access ua
            where ua.user_id = auth.uid()
            and ua.workspace_id = workspace_id
            and ua.is_admin = true
        )
    );

create policy "member_delete_policy"
    on workspace_members for delete
    using (
        exists (
            select 1 from user_workspace_access ua
            where ua.user_id = auth.uid()
            and ua.workspace_id = workspace_id
            and ua.is_admin = true
        )
        or user_id = auth.uid()
    );

-- Re-enable RLS
alter table workspace_members enable row level security;
alter table workspaces enable row level security;

-- Initial refresh of the materialized view
refresh materialized view concurrently user_workspace_access;

-- Recreate the view for member data
drop view if exists workspace_members_with_emails;
create view workspace_members_with_emails as
select 
    wm.id,
    wm.workspace_id,
    wm.user_id,
    wm.role,
    wm.created_at,
    coalesce(
        (select full_name from profiles where id = wm.user_id),
        split_part(u.email, '@', 1),
        'Unknown User'
    ) as name,
    u.email,
    coalesce(wm.permissions, '{
        "outreach": "none",
        "deals": "none",
        "customers": "none",
        "tasks": "none",
        "calendar": "none"
    }'::jsonb) as permissions
from workspace_members wm
left join auth.users u on wm.user_id = u.id;

-- Grant necessary permissions
grant select on workspace_members_with_emails to authenticated;
grant select on user_workspace_access to authenticated;
