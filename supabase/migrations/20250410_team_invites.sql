-- Create team invitation email template
select supabase_functions.http_request(
  'https://api.supabase.com/v1/projects/' || (select net.urlsplit(current_setting('request.header.origin'), 'host')::text) || '/email-templates',
  'POST',
  '{"Content-Type":"application/json"}',
  '{"name":"team-invitation","subject":"Invitation to join {{workspace_name}}","content":"<h2>You''ve been invited!</h2><p>You''ve been invited to join {{workspace_name}} as a {{role}}.</p><p>Click the link below to accept the invitation:</p><p><a href=\"{{invitation_url}}\">Accept Invitation</a></p><p>This invitation will expire in 7 days.</p>"}'
);

-- Create function to send invitation email
create or replace function send_team_invitation()
returns trigger as $$
declare
  workspace_name text;
  inviter_email text;
  invitation_url text;
begin
  -- Get workspace name
  select name into workspace_name
  from workspaces
  where id = NEW.workspace_id;

  -- Get inviter's email
  select email into inviter_email
  from auth.users
  where id = NEW.invited_by;

  -- Generate invitation URL
  invitation_url := current_setting('request.header.origin') || '/accept-invite?token=' || NEW.id;

  -- Send email using Supabase's email service
  perform net.http_post(
    url:='https://api.supabase.com/v1/projects/' || (select net.urlsplit(current_setting('request.header.origin'), 'host')::text) || '/email/send',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.header.apikey')
    ),
    body:=jsonb_build_object(
      'template_name', 'team-invitation',
      'to', NEW.email,
      'variables', jsonb_build_object(
        'workspace_name', workspace_name,
        'role', NEW.role,
        'invitation_url', invitation_url,
        'inviter_email', inviter_email
      )
    )
  );

  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to send invitation email
drop trigger if exists send_team_invitation_trigger on workspace_invitations;
create trigger send_team_invitation_trigger
  after insert on workspace_invitations
  for each row
  execute function send_team_invitation();

-- Create invitation acceptance function
create or replace function accept_team_invitation(invitation_id uuid)
returns void as $$
declare
  invitation record;
  user_id uuid;
begin
  -- Get current user ID
  user_id := auth.uid();
  if user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get and validate invitation
  select * into invitation
  from workspace_invitations
  where id = invitation_id
    and email = (select email from auth.users where id = user_id)
    and expires_at > now();

  if invitation is null then
    raise exception 'Invalid or expired invitation';
  end if;

  -- Add user to workspace
  insert into workspace_members (workspace_id, user_id, role)
  values (invitation.workspace_id, user_id, invitation.role);

  -- Delete the invitation
  delete from workspace_invitations where id = invitation_id;
end;
$$ language plpgsql security definer;
