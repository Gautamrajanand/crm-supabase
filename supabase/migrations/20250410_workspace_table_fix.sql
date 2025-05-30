-- First ensure the workspaces table exists
create table if not exists workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Drop existing policies
drop policy if exists "Users can view workspaces they belong to" on workspaces;
drop policy if exists "Workspace members can update workspaces" on workspaces;

-- Create simpler policies
create policy "Enable read access for authenticated users"
  on workspaces for select
  using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users"
  on workspaces for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update for workspace admins"
  on workspaces for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );

-- Create a default workspace if none exists
insert into workspaces (name)
select 'My Workspace'
where not exists (select 1 from workspaces);

-- Make sure the current user is an owner
insert into workspace_members (workspace_id, user_id, role)
select 
  w.id,
  auth.uid(),
  'owner'
from workspaces w
where not exists (
  select 1 from workspace_members
  where workspace_id = w.id
  and user_id = auth.uid()
)
limit 1;
