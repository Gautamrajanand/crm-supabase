-- Drop existing policies
drop policy if exists "Users can view invitations for workspaces they are a member of" on workspace_invitations;
drop policy if exists "Only workspace admins and owners can create invitations" on workspace_invitations;
drop policy if exists "Only workspace admins and owners can delete invitations" on workspace_invitations;

-- Create updated policies
create policy "Users can view invitations they received"
  on workspace_invitations for select
  using (
    email = auth.jwt()->>'email'
    or exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_invitations.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
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

create policy "Users can delete their own invitations or if they are admin/owner"
  on workspace_invitations for delete
  using (
    email = auth.jwt()->>'email'
    or exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_invitations.workspace_id
      and workspace_members.user_id = auth.uid()
      and workspace_members.role in ('admin', 'owner')
    )
  );
