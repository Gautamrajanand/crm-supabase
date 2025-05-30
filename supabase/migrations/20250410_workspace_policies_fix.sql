-- Drop existing policies
drop policy if exists "Users can view workspace members" on workspace_members;
drop policy if exists "Admins can insert workspace members" on workspace_members;

-- Create new policies without circular dependencies
create policy "Users can view workspace members"
  on workspace_members for select
  using (
    -- Allow if the user is a member of the workspace
    user_id = auth.uid() or
    exists (
      select 1 from workspace_members as m
      where m.workspace_id = workspace_members.workspace_id
      and m.user_id = auth.uid()
    )
  );

create policy "Admins can insert workspace members"
  on workspace_members for insert
  with check (
    -- Allow if the user is an admin/owner in the workspace
    exists (
      select 1 from workspace_members as m
      where m.workspace_id = workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Ensure RLS is enabled
alter table workspace_members enable row level security;

-- Create initial owner if none exists
insert into workspace_members (workspace_id, user_id, role)
select 
  w.id as workspace_id,
  auth.uid() as user_id,
  'owner' as role
from workspaces w
where not exists (
  select 1 from workspace_members 
  where workspace_id = w.id
)
and exists (
  select 1 from auth.users 
  where id = auth.uid()
);
