-- First disable RLS
alter table workspace_members disable row level security;

-- Drop existing policies and views
drop policy if exists "member_select_policy" on workspace_members;
drop policy if exists "member_insert_policy" on workspace_members;
drop policy if exists "member_update_policy" on workspace_members;
drop policy if exists "member_delete_policy" on workspace_members;
drop view if exists workspace_members_with_emails;
drop materialized view if exists user_workspace_access;

-- Create a simple view for member data
create view workspace_members_with_emails as
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
    wm.role in ('owner', 'admin') as is_admin
from workspace_members wm
left join auth.users u on wm.user_id = u.id
left join profiles p on wm.user_id = p.id;

-- Create simple policies
create policy "member_select_policy"
    on workspace_members for select
    using (
        -- Users can see members of workspaces they belong to
        workspace_id in (
            select workspace_id 
            from workspace_members 
            where user_id = auth.uid()
        )
    );

create policy "member_insert_policy"
    on workspace_members for insert
    with check (
        -- Users can only add themselves
        user_id = auth.uid()
        or
        -- Or if they are admin/owner of the workspace
        workspace_id in (
            select workspace_id 
            from workspace_members 
            where user_id = auth.uid() 
            and role in ('owner', 'admin')
        )
    );

create policy "member_update_policy"
    on workspace_members for update
    using (
        -- Only workspace admins/owners can update
        workspace_id in (
            select workspace_id 
            from workspace_members 
            where user_id = auth.uid() 
            and role in ('owner', 'admin')
        )
    );

create policy "member_delete_policy"
    on workspace_members for delete
    using (
        -- Members can remove themselves
        user_id = auth.uid()
        or
        -- Or be removed by admins/owners
        workspace_id in (
            select workspace_id 
            from workspace_members 
            where user_id = auth.uid() 
            and role in ('owner', 'admin')
        )
    );

-- Re-enable RLS
alter table workspace_members enable row level security;

-- Grant permissions
grant select on workspace_members_with_emails to authenticated;
