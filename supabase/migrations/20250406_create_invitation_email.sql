-- Enable pgcrypto for generating invitation tokens
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add token column to workspace_invitations
ALTER TABLE workspace_invitations 
ADD COLUMN IF NOT EXISTS token UUID DEFAULT gen_random_uuid();

-- Create email template
INSERT INTO auth.email_templates (template_name, subject, content_html, content_text)
VALUES (
  'workspace-invitation',
  'You''ve been invited to join {{ workspace.name }}',
  '
  <h2>You''ve been invited to join {{ workspace.name }}</h2>
  <p>{{ inviter.email }} has invited you to join their workspace on CRM.</p>
  <p>Your role will be: {{ invitation.role }}</p>
  <p>Click the link below to accept the invitation:</p>
  <a href="{{ base_url }}/accept-invite?token={{ invitation.token }}">Accept Invitation</a>
  <p>This invitation will expire on {{ invitation.expires_at }}</p>
  ',
  '
  You''ve been invited to join {{ workspace.name }}
  
  {{ inviter.email }} has invited you to join their workspace on CRM.
  
  Your role will be: {{ invitation.role }}
  
  Click the link below to accept the invitation:
  {{ base_url }}/accept-invite?token={{ invitation.token }}
  
  This invitation will expire on {{ invitation.expires_at }}
  '
) ON CONFLICT (template_name) DO UPDATE 
SET 
  subject = EXCLUDED.subject,
  content_html = EXCLUDED.content_html,
  content_text = EXCLUDED.content_text;

-- Create function to send invitation email
CREATE OR REPLACE FUNCTION send_workspace_invitation()
RETURNS TRIGGER AS $$
DECLARE
  workspace_name text;
  inviter_email text;
BEGIN
  -- Get workspace name
  SELECT name INTO workspace_name
  FROM workspaces
  WHERE id = NEW.workspace_id;

  -- Get inviter email
  SELECT email INTO inviter_email
  FROM auth.users
  WHERE id = NEW.invited_by;

  -- Send email
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'template_name', 'workspace-invitation',
      'to', NEW.email,
      'data', jsonb_build_object(
        'workspace', jsonb_build_object('name', workspace_name),
        'inviter', jsonb_build_object('email', inviter_email),
        'invitation', jsonb_build_object(
          'role', NEW.role,
          'token', NEW.token,
          'expires_at', to_char(NEW.expires_at, 'YYYY-MM-DD HH24:MI:SS')
        ),
        'base_url', current_setting('app.settings.base_url')
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send invitation email
DROP TRIGGER IF EXISTS send_workspace_invitation_trigger ON workspace_invitations;
CREATE TRIGGER send_workspace_invitation_trigger
  AFTER INSERT ON workspace_invitations
  FOR EACH ROW
  EXECUTE FUNCTION send_workspace_invitation();
