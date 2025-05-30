-- Drop all existing policies
drop policy if exists "Users can view workspace members" on workspace_members;
drop policy if exists "Admins can insert workspace members" on workspace_members;
drop policy if exists "Allow select for workspace members" on workspace_members;
drop policy if exists "Allow insert for workspace admins" on workspace_members;
drop policy if exists "Allow delete for workspace admins" on workspace_members;
drop policy if exists "Allow all operations for authenticated users" on workspaces;

-- First, enable RLS
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table workspace_invitations enable row level security;

-- Simple workspace policy - authenticated users can do everything
create policy "workspace_policy"
  on workspaces for all
  using (auth.role() = 'authenticated');

-- Simple workspace members policy - authenticated users can view all
create policy "workspace_members_select"
  on workspace_members for select
  using (auth.role() = 'authenticated');

-- Only admins/owners can insert/delete members
create policy "workspace_members_insert"
  on workspace_members for insert
  with check (
    auth.role() = 'authenticated'
    and
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_members.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

create policy "workspace_members_delete"
  on workspace_members for delete
  using (
    auth.role() = 'authenticated'
    and
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_members.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

-- Simple invitation policies
create policy "workspace_invitations_select"
  on workspace_invitations for select
  using (auth.role() = 'authenticated');

create policy "workspace_invitations_insert"
  on workspace_invitations for insert
  with check (
    auth.role() = 'authenticated'
    and
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

create policy "workspace_invitations_delete"
  on workspace_invitations for delete
  using (
    auth.role() = 'authenticated'
    and
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

-- Create a default workspace if none exists
insert into workspaces (name)
select 'My Workspace'
where not exists (select 1 from workspaces);

-- Make sure the current user is an owner of the first workspace
with first_workspace as (
  select id from workspaces limit 1
)
insert into workspace_members (workspace_id, user_id, role)
select 
  w.id,
  auth.uid(),
  'owner'
from first_workspace w
where not exists (
  select 1 from workspace_members
  where workspace_id = w.id
  and user_id = auth.uid()
);
