-- Create roles enum
create type user_role as enum ('owner', 'admin', 'member');

-- Create workspaces table
create table workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workspace_members table
create table workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role user_role not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, user_id)
);

-- Create workspace invitations table
create table workspace_invitations (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  email text not null,
  role user_role not null default 'member',
  invited_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '7 days') not null,
  unique(workspace_id, email)
);

-- Add RLS policies
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table workspace_invitations enable row level security;

-- Workspace policies
create policy "Users can view workspaces they are members of"
  on workspaces for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Only workspace owners can delete workspaces"
  on workspaces for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role = 'owner'
    )
  );

-- Workspace members policies
create policy "Users can view members in their workspaces"
  on workspace_members for select
  using (
    exists (
      select 1 from workspace_members as members
      where members.workspace_id = workspace_members.workspace_id
      and members.user_id = auth.uid()
    )
  );

create policy "Only admins and owners can add members"
  on workspace_members for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = new.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );

create policy "Only admins and owners can update member roles"
  on workspace_members for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_members.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );

create policy "Only admins and owners can remove members"
  on workspace_members for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_members.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );

-- Workspace invitations policies
create policy "Users can view invitations in their workspaces"
  on workspace_invitations for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_invitations.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Only admins and owners can create invitations"
  on workspace_invitations for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = new.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );

create policy "Only admins and owners can delete invitations"
  on workspace_invitations for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_invitations.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );

-- Create view for workspace members with user emails
create view workspace_members_with_emails as
select
  wm.*,
  u.email
from workspace_members wm
join auth.users u on u.id = wm.user_id;

-- Grant access to the view
grant select on workspace_members_with_emails to authenticated;

-- Create function to create a workspace with the creator as owner
create or replace function create_workspace_with_owner(
  workspace_name text,
  owner_id uuid
) returns uuid as $$
declare
  workspace_id uuid;
begin
  -- Insert workspace
  insert into workspaces (name)
  values (workspace_name)
  returning id into workspace_id;

  -- Add owner as a member
  insert into workspace_members (workspace_id, user_id, role)
  values (workspace_id, owner_id, 'owner');

  return workspace_id;
end;
$$ language plpgsql security definer;
