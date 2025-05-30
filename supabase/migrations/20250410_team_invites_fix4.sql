-- Create workspaces table if it doesn't exist
create table if not exists workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create workspace_members table if it doesn't exist
create table if not exists workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- Create workspace_invitations table if it doesn't exist
create table if not exists workspace_invitations (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  invited_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days'),
  unique(workspace_id, email)
);

-- Create function to accept invitation
create or replace function accept_team_invitation(invitation_id uuid)
returns void as $$
declare
  v_invitation record;
  v_user_id uuid;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get and validate invitation
  select * into v_invitation
  from workspace_invitations
  where id = invitation_id
    and expires_at > now();

  if not found then
    raise exception 'Invalid or expired invitation';
  end if;

  -- Check if email matches
  if v_invitation.email != (
    select email from auth.users where id = v_user_id
  ) then
    raise exception 'Email does not match invitation';
  end if;

  -- Add user to workspace
  insert into workspace_members (workspace_id, user_id, role)
  values (v_invitation.workspace_id, v_user_id, v_invitation.role)
  on conflict (workspace_id, user_id) do nothing;

  -- Delete invitation
  delete from workspace_invitations where id = invitation_id;
end;
$$ language plpgsql security definer;
