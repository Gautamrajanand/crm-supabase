-- Add expires_at column to team_invitations
ALTER TABLE team_invitations
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
