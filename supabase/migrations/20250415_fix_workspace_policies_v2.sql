-- Drop existing policies
drop policy if exists "Users can view workspaces they belong to" on workspaces;
drop policy if exists "Workspace members can update workspaces" on workspaces;
drop policy if exists "Users can view workspace members" on workspace_members;
drop policy if exists "Admins can insert workspace members" on workspace_members;

-- Create new workspace policies
create policy "Users can view workspaces they belong to"
  on workspaces for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can insert workspaces"
  on workspaces for insert
  with check (
    created_by = auth.uid()
  );

create policy "Workspace members can update workspaces"
  on workspaces for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );

-- Create new workspace_members policies
create policy "Users can view workspace members"
  on workspace_members for select
  using (
    exists (
      select 1 from workspace_members as m2
      where m2.workspace_id = workspace_id
      and m2.user_id = auth.uid()
    )
  );

create policy "Users can insert workspace members"
  on workspace_members for insert
  with check (
    auth.uid() = user_id
    or
    exists (
      select 1 from workspace_members as m2
      where m2.workspace_id = workspace_id
      and m2.user_id = auth.uid()
      and m2.role in ('owner', 'admin')
    )
  );

create policy "Users can update workspace members"
  on workspace_members for update
  using (
    exists (
      select 1 from workspace_members as m2
      where m2.workspace_id = workspace_id
      and m2.user_id = auth.uid()
      and m2.role in ('owner', 'admin')
    )
  );

-- Add missing columns if they don't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
    where table_name = 'workspaces' and column_name = 'created_by') then
    alter table workspaces add column created_by uuid references auth.users(id);
  end if;
end $$;
