-- Create or replace the function to send invitation email
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

  -- Generate invitation URL (use the actual domain in production)
  invitation_url := 'http://localhost:3000/accept-invite?token=' || NEW.id::text;

  -- Call the Edge Function to send the email
  perform
    net.http_post(
      url := 'https://' || current_setting('request.header.host') || '/functions/v1/send-invitation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase.auth.anon_key')
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'workspaceName', workspace_name,
        'role', NEW.role,
        'invitationUrl', invitation_url
      )
    );

  return NEW;
end;
$$ language plpgsql security definer;

-- Recreate the trigger
drop trigger if exists send_team_invitation_trigger on workspace_invitations;
create trigger send_team_invitation_trigger
  after insert on workspace_invitations
  for each row
  execute function send_team_invitation();
