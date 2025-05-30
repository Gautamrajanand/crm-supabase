-- Drop and recreate workspace_invitations table
drop table if exists workspace_invitations;

create table workspace_invitations (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade not null,
    email text not null,
    role text default 'member' not null,
    permissions jsonb default '{
        "outreach": "none",
        "deals": "none",
        "customers": "none",
        "tasks": "none",
        "calendar": "none"
    }'::jsonb not null,
    invited_by uuid references auth.users(id) not null,
    created_at timestamptz default now() not null,
    expires_at timestamptz default (now() + interval '7 days') not null,
    token text unique default encode(gen_random_bytes(32), 'hex') not null,
    status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')) not null
);

-- Create indexes
create index if not exists workspace_invitations_workspace_id_idx on workspace_invitations(workspace_id);
create index if not exists workspace_invitations_email_idx on workspace_invitations(email);
create index if not exists workspace_invitations_token_idx on workspace_invitations(token);
create index if not exists workspace_invitations_status_idx on workspace_invitations(status);

-- Enable RLS
alter table workspace_invitations enable row level security;

-- Drop existing policies
drop policy if exists "Users can view invitations for their workspaces" on workspace_invitations;
drop policy if exists "Users can create invitations for workspaces they manage" on workspace_invitations;
drop policy if exists "Users can delete invitations for workspaces they manage" on workspace_invitations;

-- Create new policies
create policy "invitation_select_policy"
    on workspace_invitations for select
    using (
        -- Users can see invitations for workspaces they belong to
        exists (
            select 1 from workspace_members
            where workspace_members.workspace_id = workspace_invitations.workspace_id
            and workspace_members.user_id = auth.uid()
        )
        or
        -- Users can see invitations sent to their email
        email = (select email from auth.users where id = auth.uid())
    );

create policy "invitation_insert_policy"
    on workspace_invitations for insert
    with check (
        -- Only workspace admins/owners can create invitations
        exists (
            select 1 from workspace_members
            where workspace_members.workspace_id = workspace_invitations.workspace_id
            and workspace_members.user_id = auth.uid()
            and workspace_members.role in ('owner', 'admin')
        )
        and
        -- Set invited_by to current user
        invited_by = auth.uid()
    );

create policy "invitation_update_policy"
    on workspace_invitations for update
    using (
        -- Only the invited user can update their invitation
        email = (select email from auth.users where id = auth.uid())
        and
        status = 'pending'
    )
    with check (
        -- Can only update to accepted or declined
        status in ('accepted', 'declined')
    );

create policy "invitation_delete_policy"
    on workspace_invitations for delete
    using (
        -- Only workspace admins/owners can delete invitations
        exists (
            select 1 from workspace_members
            where workspace_members.workspace_id = workspace_invitations.workspace_id
            and workspace_members.user_id = auth.uid()
            and workspace_members.role in ('owner', 'admin')
        )
    );

-- Grant permissions
grant all on workspace_invitations to authenticated;
grant all on workspace_invitations to service_role;
