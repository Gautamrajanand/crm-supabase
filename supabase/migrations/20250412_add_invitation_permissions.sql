-- Add permissions column to workspace_invitations
alter table workspace_invitations
add column if not exists permissions jsonb not null default '{}';

-- Add RLS policy for workspace_invitations
create policy "Users can view invitations for workspaces they are a member of"
  on workspace_invitations for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_invitations.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Only workspace admins and owners can create invitations"
  on workspace_invitations for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_invitations.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );

create policy "Only workspace admins and owners can delete invitations"
  on workspace_invitations for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_invitations.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );
