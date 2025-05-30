-- First, disable RLS and drop everything
alter table workspace_members disable row level security;
drop policy if exists "member_select_policy" on workspace_members;
drop policy if exists "member_insert_policy" on workspace_members;
drop policy if exists "member_update_policy" on workspace_members;
drop policy if exists "member_delete_policy" on workspace_members;
drop view if exists workspace_members_with_emails;
drop view if exists user_workspaces;
drop materialized view if exists user_workspace_access;
drop table if exists workspace_access;

-- Create a simple view for user workspaces
create view user_workspaces as
select distinct w.id, w.name
from workspaces w
inner join workspace_members wm on w.id = wm.workspace_id
where wm.user_id = auth.uid();

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
    }'::jsonb) as permissions
from workspace_members wm
left join auth.users u on wm.user_id = u.id
left join profiles p on wm.user_id = p.id;

-- Create the absolute simplest policies possible
create policy "users_can_see_their_workspaces"
    on workspace_members for select
    using (user_id = auth.uid());

create policy "users_can_see_workspaces_they_are_in"
    on workspace_members for select
    using (workspace_id in (
        select id from workspaces
        where id in (
            select workspace_id from workspace_members
            where user_id = auth.uid()
        )
    ));

create policy "users_can_add_themselves"
    on workspace_members for insert
    with check (user_id = auth.uid());

create policy "admins_can_add_others"
    on workspace_members for insert
    with check (
        workspace_id in (
            select workspace_id from workspace_members
            where user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "admins_can_update"
    on workspace_members for update
    using (
        workspace_id in (
            select workspace_id from workspace_members
            where user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

create policy "users_can_delete_themselves"
    on workspace_members for delete
    using (user_id = auth.uid());

create policy "admins_can_delete_others"
    on workspace_members for delete
    using (
        workspace_id in (
            select workspace_id from workspace_members
            where user_id = auth.uid()
            and role in ('owner', 'admin')
        )
    );

-- Re-enable RLS
alter table workspace_members enable row level security;

-- Grant permissions
grant select on workspace_members_with_emails to authenticated;
grant select on user_workspaces to authenticated;
