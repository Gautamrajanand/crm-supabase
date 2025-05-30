-- Drop existing tables if they exist
drop table if exists workspace_invitations;
drop table if exists workspace_members;
drop table if exists workspace_permissions;
drop table if exists workspaces;
drop type if exists board_type;
drop type if exists permission_type;
drop type if exists member_role;

-- Create custom types
create type board_type as enum (
  'outreach',
  'deals',
  'customers',
  'tasks',
  'calendar'
);

create type permission_type as enum (
  'view',
  'edit',
  'none'
);

create type member_role as enum (
  'owner',
  'admin',
  'member'
);

-- Create workspaces table
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

-- Create workspace members table
create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role member_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- Create workspace permissions table
create table workspace_permissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  member_id uuid not null references workspace_members(id) on delete cascade,
  board board_type not null,
  permission permission_type not null default 'view',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, member_id, board)
);

-- Create workspace invitations table
create table workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email text not null,
  role member_role not null default 'member',
  permissions jsonb not null default '{}',
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  unique(workspace_id, email)
);

-- Add RLS policies
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table workspace_permissions enable row level security;
alter table workspace_invitations enable row level security;

-- Workspace policies
create policy "Users can view workspaces they are a member of"
  on workspaces for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspaces.id
      and user_id = auth.uid()
    )
  );

create policy "Only authenticated users can create workspaces"
  on workspaces for insert
  with check (auth.uid() = created_by);

create policy "Only workspace owners can update workspace"
  on workspaces for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspaces.id
      and user_id = auth.uid()
      and role = 'owner'
    )
  );

-- Workspace members policies
create policy "Users can view members of their workspaces"
  on workspace_members for select
  using (
    exists (
      select 1 from workspace_members as member
      where member.workspace_id = workspace_members.workspace_id
      and member.user_id = auth.uid()
    )
  );

create policy "Only workspace owners and admins can add members"
  on workspace_members for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_members.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

create policy "Only workspace owners can update member roles"
  on workspace_members for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_members.workspace_id
      and user_id = auth.uid()
      and role = 'owner'
    )
  );

-- Workspace permissions policies
create policy "Users can view permissions in their workspaces"
  on workspace_permissions for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_permissions.workspace_id
      and user_id = auth.uid()
    )
  );

create policy "Only workspace owners and admins can manage permissions"
  on workspace_permissions for all
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_permissions.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- Workspace invitations policies
create policy "Users can view invitations for their workspaces"
  on workspace_invitations for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
    )
  );

create policy "Only workspace owners and admins can create invitations"
  on workspace_invitations for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

create policy "Only workspace owners and admins can delete invitations"
  on workspace_invitations for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- Functions
create or replace function create_workspace(
  workspace_name text,
  user_name text
)
returns uuid as $$
declare
  workspace_id uuid;
  member_id uuid;
begin
  -- Create workspace
  insert into workspaces (name, created_by)
  values (workspace_name, auth.uid())
  returning id into workspace_id;

  -- Add creator as owner
  insert into workspace_members (workspace_id, user_id, name, role)
  values (workspace_id, auth.uid(), user_name, 'owner')
  returning id into member_id;

  -- Add default permissions for owner
  insert into workspace_permissions (workspace_id, member_id, board, permission)
  select workspace_id, member_id, board, 'edit'
  from unnest(enum_range(null::board_type)) as board;

  return workspace_id;
end;
$$ language plpgsql security definer;

-- Function to create invitation with permissions
create or replace function create_invitation(
  workspace_id uuid,
  invitee_name text,
  invitee_email text,
  invitee_role member_role,
  board_permissions jsonb
)
returns uuid as $$
declare
  invitation_id uuid;
begin
  -- Validate permissions format
  if not (
    select bool_and(
      value::text in ('"view"', '"edit"', '"none"')
      and key in (
        select unnest(enum_range(null::board_type))::text
      )
    )
    from jsonb_each(board_permissions)
  ) then
    raise exception 'Invalid permissions format';
  end if;

  -- Create invitation
  insert into workspace_invitations (
    workspace_id,
    name,
    email,
    role,
    permissions,
    invited_by
  )
  values (
    workspace_id,
    invitee_name,
    invitee_email,
    invitee_role,
    board_permissions,
    auth.uid()
  )
  returning id into invitation_id;

  return invitation_id;
end;
$$ language plpgsql security definer;

-- Function to accept invitation
create or replace function accept_invitation(invitation_id uuid)
returns jsonb as $$
declare
  v_workspace_id uuid;
  v_name text;
  v_role member_role;
  v_permissions jsonb;
  v_member_id uuid;
begin
  -- Get current user
  if auth.uid() is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get and validate invitation
  select
    workspace_id,
    name,
    role,
    permissions
  into
    v_workspace_id,
    v_name,
    v_role,
    v_permissions
  from workspace_invitations
  where id = invitation_id
    and email = (select email from auth.users where id = auth.uid())
    and expires_at > now();

  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  end if;

  -- Check if already a member
  if exists (
    select 1
    from workspace_members
    where workspace_id = v_workspace_id
    and user_id = auth.uid()
  ) then
    delete from workspace_invitations where id = invitation_id;
    return jsonb_build_object('success', true, 'message', 'already a member');
  end if;

  -- Add member
  insert into workspace_members (workspace_id, user_id, name, role)
  values (v_workspace_id, auth.uid(), v_name, v_role)
  returning id into v_member_id;

  -- Add permissions
  insert into workspace_permissions (workspace_id, member_id, board, permission)
  select
    v_workspace_id,
    v_member_id,
    board::board_type,
    case jsonb_typeof(v_permissions->board::text)
      when 'string' then (v_permissions->>board::text)::permission_type
      else 'view'
    end
  from unnest(enum_range(null::board_type)) as board;

  -- Delete the invitation
  delete from workspace_invitations where id = invitation_id;

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;
