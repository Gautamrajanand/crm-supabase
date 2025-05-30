-- Drop all existing policies
drop policy if exists "workspace_members_select" on workspace_members;
drop policy if exists "workspace_members_insert" on workspace_members;
drop policy if exists "workspace_members_delete" on workspace_members;
drop policy if exists "Users can view workspace members" on workspace_members;
drop policy if exists "Admins can insert workspace members" on workspace_members;

-- Make sure RLS is enabled
alter table workspace_members enable row level security;

-- Create a single, simple policy for workspace_members
create policy "workspace_members_all_operations"
  on workspace_members
  for all
  using (
    -- Allow if user is authenticated
    auth.role() = 'authenticated'
  )
  with check (
    -- For inserts/updates, require admin/owner role
    exists (
      select 1 
      from workspace_members m 
      where m.workspace_id = workspace_members.workspace_id 
      and m.user_id = auth.uid() 
      and m.role in ('admin', 'owner')
    )
  );

-- Make sure we have at least one workspace
insert into workspaces (name)
select 'My Workspace'
where not exists (select 1 from workspaces);

-- Make sure current user is owner of the workspace
insert into workspace_members (workspace_id, user_id, role)
select 
  (select id from workspaces order by created_at asc limit 1),
  auth.uid(),
  'owner'
where 
  auth.uid() is not null
  and not exists (
    select 1 
    from workspace_members 
    where user_id = auth.uid()
  );
