-- First, let's check if we have any workspaces
select * from workspaces;

-- If no workspaces exist, create a default one
insert into workspaces (name)
select 'My Workspace'
where not exists (select 1 from workspaces);

-- Enable RLS for workspaces
alter table workspaces enable row level security;

-- Create policies for workspaces
create policy "Users can view workspaces they belong to"
  on workspaces for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Workspace members can update workspaces"
  on workspaces for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );

-- Enable RLS for workspace_members
alter table workspace_members enable row level security;

-- Create policies for workspace_members
create policy "Users can view workspace members"
  on workspace_members for select
  using (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Admins can insert workspace members"
  on workspace_members for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );

-- Enable RLS for workspace_invitations
alter table workspace_invitations enable row level security;

-- Create policies for workspace_invitations
create policy "Users can view invitations for their workspaces"
  on workspace_invitations for select
  using (
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Admins can create invitations"
  on workspace_invitations for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );

create policy "Admins can delete invitations"
  on workspace_invitations for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('owner', 'admin')
    )
  );
