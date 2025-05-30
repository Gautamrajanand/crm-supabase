-- First disable RLS
alter table workspace_members disable row level security;

-- Drop existing policies and views
drop policy if exists "member_select_policy" on workspace_members;
drop policy if exists "member_insert_policy" on workspace_members;
drop policy if exists "member_update_policy" on workspace_members;
drop policy if exists "member_delete_policy" on workspace_members;
drop view if exists workspace_members_with_emails;
drop materialized view if exists user_workspace_access;

-- Create a function to check workspace access
create or replace function check_workspace_access(workspace uuid, requesting_user uuid)
returns boolean
security definer
stable
language plpgsql
as $$
declare
    user_role text;
begin
    -- Get the user's role in the workspace
    select role into user_role
    from workspace_members
    where workspace_id = workspace
    and user_id = requesting_user;
    
    -- Return true if user is a member (has any role)
    return user_role is not null;
end;
$$;

-- Create a function to check admin access
create or replace function check_workspace_admin(workspace uuid, requesting_user uuid)
returns boolean
security definer
stable
language plpgsql
as $$
declare
    user_role text;
begin
    -- Get the user's role in the workspace
    select role into user_role
    from workspace_members
    where workspace_id = workspace
    and user_id = requesting_user;
    
    -- Return true if user is admin or owner
    return user_role in ('admin', 'owner');
end;
$$;

-- Create view for member data
create or replace view workspace_members_with_emails as
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
left join profiles p on wm.user_id = p.id;

-- Create simple policies using the security definer functions
create policy "member_select_policy"
    on workspace_members for select
    using (check_workspace_access(workspace_id, auth.uid()));

create policy "member_insert_policy"
    on workspace_members for insert
    with check (
        -- Users can add themselves or admins can add others
        (user_id = auth.uid()) or
        check_workspace_admin(workspace_id, auth.uid())
    );

create policy "member_update_policy"
    on workspace_members for update
    using (check_workspace_admin(workspace_id, auth.uid()));

create policy "member_delete_policy"
    on workspace_members for delete
    using (
        -- Users can remove themselves or admins can remove others
        user_id = auth.uid() or
        check_workspace_admin(workspace_id, auth.uid())
    );

-- Re-enable RLS
alter table workspace_members enable row level security;

-- Grant necessary permissions
grant select on workspace_members_with_emails to authenticated;
grant execute on function check_workspace_access to authenticated;
grant execute on function check_workspace_admin to authenticated;
