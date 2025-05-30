-- First, let's keep only one workspace (the first one)
with workspace_to_keep as (
  select id 
  from workspaces 
  order by created_at asc 
  limit 1
)
delete from workspaces 
where id not in (select id from workspace_to_keep);

-- Now update the team-client code to always use the first workspace
create or replace function get_default_workspace()
returns uuid
language sql
stable
as $$
  select id 
  from workspaces 
  order by created_at asc 
  limit 1;
$$;

-- Create policy for workspace invitations
drop policy if exists "workspace_invitations_select" on workspace_invitations;
drop policy if exists "workspace_invitations_insert" on workspace_invitations;
drop policy if exists "workspace_invitations_delete" on workspace_invitations;

create policy "workspace_invitations_select"
  on workspace_invitations for select
  using (auth.role() = 'authenticated');

create policy "workspace_invitations_insert"
  on workspace_invitations for insert
  with check (
    auth.role() = 'authenticated'
    and
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

create policy "workspace_invitations_delete"
  on workspace_invitations for delete
  using (
    auth.role() = 'authenticated'
    and
    exists (
      select 1 from workspace_members
      where workspace_id = workspace_invitations.workspace_id
      and user_id = auth.uid()
      and role in ('admin', 'owner')
    )
  );

-- Enable RLS on workspace_invitations
alter table workspace_invitations enable row level security;
