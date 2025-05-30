-- Drop existing policies
drop policy if exists "Users can view workspaces they belong to" on workspaces;
drop policy if exists "Workspace members can update workspaces" on workspaces;

-- Create new policies with fixed recursion
create policy "Users can view workspaces they belong to"
  on workspaces for select
  using (
    id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Workspace members can update workspaces"
  on workspaces for update
  using (
    id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- Refresh workspace_members policies
drop policy if exists "Users can view workspace members" on workspace_members;

create policy "Users can view workspace members"
  on workspace_members for select
  using (
    workspace_id in (
      select id from workspaces
      where id = workspace_id
    )
    and exists (
      select 1 from workspace_members m2
      where m2.workspace_id = workspace_id
      and m2.user_id = auth.uid()
    )
  );
