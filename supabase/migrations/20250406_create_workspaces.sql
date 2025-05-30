-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Create workspace invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days') NOT NULL,
  UNIQUE(workspace_id, email)
);

-- Add RLS policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Workspace policies
CREATE POLICY "Users can view workspaces they are a member of" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspaces.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Only workspace owners can update workspace" ON workspaces
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspaces.id 
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Workspace members policies
CREATE POLICY "Users can view members of their workspace" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only workspace owners and admins can add members" ON workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspace_members.workspace_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only workspace owners can update member roles" ON workspace_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspace_members.workspace_id 
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Only workspace owners and admins can remove members" ON workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspace_members.workspace_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    AND NOT EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE id = workspace_members.id 
      AND role = 'owner'
    )
  );

-- Workspace invitations policies
CREATE POLICY "Users can view invitations for their workspace" ON workspace_invitations
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only workspace owners and admins can create invitations" ON workspace_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspace_invitations.workspace_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only workspace owners and admins can delete invitations" ON workspace_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspace_invitations.workspace_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON workspace_members
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
