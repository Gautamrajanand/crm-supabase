-- First, let's create a more reliable email template
create or replace function create_team_invitation_template()
returns void as $$
begin
  insert into auth.email_templates (template_name, subject, content, html_content)
  values (
    'team-invitation',
    'Invitation to join {{workspace_name}}',
    'You''ve been invited to join {{workspace_name}} as a {{role}}.\n\nClick the link below to accept the invitation:\n{{invitation_url}}\n\nThis invitation will expire in 7 days.',
    '<h2>You''ve been invited!</h2><p>You''ve been invited to join <strong>{{workspace_name}}</strong> as a <strong>{{role}}</strong>.</p><p>Click the link below to accept the invitation:</p><p><a href="{{invitation_url}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p><p>This invitation will expire in 7 days.</p>'
  )
  on conflict (template_name)
  do update set
    subject = excluded.subject,
    content = excluded.content,
    html_content = excluded.html_content;
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

  -- Send email using Supabase's built-in email function
  perform auth.send_email(
    NEW.email,
    'team-invitation',
    json_build_object(
      'workspace_name', workspace_name,
      'role', NEW.role,
      'invitation_url', invitation_url,
      'inviter_email', inviter_email
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
