-- Drop existing function if it exists
drop function if exists accept_invitation;

-- Create function to accept invitation
create or replace function accept_invitation(invitation_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_workspace_id uuid;
  v_role text;
  v_email text;
  v_name text;
  v_user_id uuid;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get user's email and raw_user_meta_data->>'full_name'
  select email, raw_user_meta_data->>'full_name'
  into v_email, v_name
  from auth.users
  where id = v_user_id;

  if not found then
    return json_build_object('success', false, 'error', 'User not found');
  end if;

  -- Get and validate invitation
  select workspace_id, role
  into v_workspace_id, v_role
  from workspace_invitations
  where id = invitation_id
    and email = v_email
    and expires_at > now();

  if not found then
    return json_build_object('success', false, 'error', 'Invalid or expired invitation');
  end if;

  -- Check if user is already a member
  if exists (
    select 1 
    from workspace_members 
    where workspace_id = v_workspace_id 
    and user_id = v_user_id
  ) then
    -- User is already a member, just delete the invitation and return success
    delete from workspace_invitations where id = invitation_id;
    return json_build_object('success', true, 'message', 'already a member');
  end if;

  begin
    -- Add user to workspace
    insert into workspace_members (workspace_id, user_id, name, role)
    values (v_workspace_id, v_user_id, coalesce(v_name, split_part(v_email, '@', 1)), v_role);
  exception
    when unique_violation then
      -- If we hit a race condition and the user was added between our check and insert
      delete from workspace_invitations where id = invitation_id;
      return json_build_object('success', true, 'message', 'already a member');
  end;

  -- Delete the invitation
  delete from workspace_invitations where id = invitation_id;

  return json_build_object('success', true);
exception
  when others then
    return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
