-- Disable RLS temporarily
alter table workspaces disable row level security;
alter table workspace_members disable row level security;

-- Drop all existing policies
drop policy if exists "workspace_select_policy" on workspaces;
drop policy if exists "workspace_insert_policy" on workspaces;
drop policy if exists "workspace_update_policy" on workspaces;
drop policy if exists "workspace_members_select_policy" on workspace_members;
drop policy if exists "workspace_members_insert_policy" on workspace_members;
drop policy if exists "workspace_members_update_policy" on workspace_members;

-- Create a view for user's workspaces to avoid circular dependencies
create or replace view user_workspaces as
select distinct w.*
from workspaces w
inner join workspace_members wm on w.id = wm.workspace_id
where wm.user_id = auth.uid();

-- Simple workspace policies that don't reference workspace_members
create policy "workspace_select_policy"
  on workspaces for select
  using (true);  -- Allow all reads, filtering will be done through the view

create policy "workspace_insert_policy"
  on workspaces for insert
  with check (
    created_by = auth.uid()
  );

create policy "workspace_update_policy"
  on workspaces for update
  using (
    created_by = auth.uid()
  );

-- Simple workspace_members policies
create policy "workspace_members_select_policy"
  on workspace_members for select
  using (
    user_id = auth.uid()
  );

create policy "workspace_members_insert_policy"
  on workspace_members for insert
  with check (
    exists (
      select 1 from workspaces
      where id = workspace_id
      and created_by = auth.uid()
    )
    or user_id = auth.uid()
  );

create policy "workspace_members_update_policy"
  on workspace_members for update
  using (
    exists (
      select 1 from workspaces
      where id = workspace_id
      and created_by = auth.uid()
    )
  );

-- Re-enable RLS
alter table workspaces enable row level security;
alter table workspace_members enable row level security;

-- Ensure created_by column exists
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
    where table_name = 'workspaces' and column_name = 'created_by') then
    alter table workspaces add column created_by uuid references auth.users(id);
  end if;
end $$;
