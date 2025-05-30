-- First, disable RLS temporarily to fix any data issues
alter table workspaces disable row level security;
alter table workspace_members disable row level security;

-- Drop all existing policies
drop policy if exists "Users can view workspaces they belong to" on workspaces;
drop policy if exists "Workspace members can update workspaces" on workspaces;
drop policy if exists "Users can insert workspaces" on workspaces;
drop policy if exists "Users can view workspace members" on workspace_members;
drop policy if exists "Users can insert workspace members" on workspace_members;
drop policy if exists "Users can update workspace members" on workspace_members;

-- Create simplified workspace policies
create policy "workspace_select_policy"
  on workspaces for select
  using (
    id in (
      select workspace_id 
      from workspace_members 
      where user_id = auth.uid()
    )
  );

create policy "workspace_insert_policy"
  on workspaces for insert
  with check (
    created_by = auth.uid()
  );

create policy "workspace_update_policy"
  on workspaces for update
  using (
    id in (
      select workspace_id 
      from workspace_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Create simplified workspace_members policies
create policy "workspace_members_select_policy"
  on workspace_members for select
  using (
    user_id = auth.uid() 
    or 
    workspace_id in (
      select workspace_id 
      from workspace_members 
      where user_id = auth.uid()
    )
  );

create policy "workspace_members_insert_policy"
  on workspace_members for insert
  with check (
    user_id = auth.uid() 
    or 
    workspace_id in (
      select workspace_id 
      from workspace_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

create policy "workspace_members_update_policy"
  on workspace_members for update
  using (
    workspace_id in (
      select workspace_id 
      from workspace_members 
      where user_id = auth.uid() 
      and role in ('owner', 'admin')
    )
  );

-- Re-enable RLS
alter table workspaces enable row level security;
alter table workspace_members enable row level security;

-- Ensure created_by column exists and has proper foreign key
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
    where table_name = 'workspaces' and column_name = 'created_by') then
    alter table workspaces add column created_by uuid references auth.users(id);
  end if;
end $$;

-- Update any null created_by values with the owner from workspace_members
update workspaces w
set created_by = m.user_id
from workspace_members m
where w.id = m.workspace_id
and m.role = 'owner'
and w.created_by is null;
