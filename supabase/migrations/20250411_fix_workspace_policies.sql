-- Drop all existing policies to start fresh
drop policy if exists "Users can view workspace members" on workspace_members;
drop policy if exists "Admins can insert workspace members" on workspace_members;
drop policy if exists "Enable read access for authenticated users" on workspaces;
drop policy if exists "Enable insert for authenticated users" on workspaces;
drop policy if exists "Enable update for workspace admins" on workspaces;

-- Simple workspace policies
create policy "Allow all operations for authenticated users"
  on workspaces for all
  using (auth.role() = 'authenticated');

-- Simple workspace_members policies without recursion
create policy "Allow select for workspace members"
  on workspace_members for select
  using (
    -- User can see their own memberships
    user_id = auth.uid()
    or
    -- User can see other members in workspaces they belong to
    workspace_id in (
      select workspace_id 
      from workspace_members 
      where user_id = auth.uid()
    )
  );

create policy "Allow insert for workspace admins"
  on workspace_members for insert
  with check (
    -- Only allow if user is admin/owner in the target workspace
    exists (
      select 1 
      from workspace_members 
      where workspace_id = workspace_members.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

create policy "Allow delete for workspace admins"
  on workspace_members for delete
  using (
    -- Only allow if user is admin/owner in the workspace
    exists (
      select 1 
      from workspace_members 
      where workspace_id = workspace_members.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

-- Ensure we have a workspace
insert into workspaces (name)
select 'My Workspace'
where not exists (select 1 from workspaces);

-- Ensure current user is an owner
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
  select 1 
  from workspace_members 
  where workspace_id = w.id 
  and user_id = auth.uid()
);
