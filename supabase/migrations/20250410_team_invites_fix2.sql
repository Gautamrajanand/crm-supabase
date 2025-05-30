-- First, let's create a more reliable email template
create or replace function create_team_invitation_template()
returns void as $$
begin
  insert into auth.mfa_factors (
    friendly_name,
    factor_type,
    status,
    updated_at,
    created_at,
    secret
  )
  values (
    'team-invitation',
    'totp',
    'verified',
    now(),
    now(),
    json_build_object(
      'subject', 'Invitation to join {{workspace_name}}',
      'body', '<h2>You''ve been invited!</h2><p>You''ve been invited to join <strong>{{workspace_name}}</strong> as a <strong>{{role}}</strong>.</p><p>Click the link below to accept the invitation:</p><p><a href="{{invitation_url}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p><p>This invitation will expire in 7 days.</p>'
    )
  )
  on conflict (friendly_name)
  do update set
    secret = excluded.secret,
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Execute the function to create/update the template
select create_team_invitation_template();

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

  -- Send email using Supabase's email service
  perform net.http_post(
    url := 'https://api.supabase.com/v1/projects/' || current_setting('supabase.project-ref') || '/email/send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.auth.api-key')
    ),
    body := jsonb_build_object(
      'template', 'team-invitation',
      'to', NEW.email,
      'subject', 'Invitation to join ' || workspace_name,
      'data', jsonb_build_object(
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

-- Recreate the trigger
drop trigger if exists send_team_invitation_trigger on workspace_invitations;
create trigger send_team_invitation_trigger
  after insert on workspace_invitations
  for each row
  execute function send_team_invitation();
