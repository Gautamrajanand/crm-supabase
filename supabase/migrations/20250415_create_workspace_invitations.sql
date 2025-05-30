-- Create workspace_invitations table
create table if not exists workspace_invitations (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade,
    email text not null,
    role text default 'member',
    permissions jsonb default '{
        "outreach": "none",
        "deals": "none",
        "customers": "none",
        "tasks": "none",
        "calendar": "none"
    }'::jsonb,
    created_at timestamptz default now(),
    expires_at timestamptz default (now() + interval '7 days'),
    created_by uuid references auth.users(id),
    token text unique default encode(gen_random_bytes(32), 'hex')
);

-- Enable RLS
alter table workspace_invitations enable row level security;

-- Create policies
create policy "Users can view invitations for their workspaces"
    on workspace_invitations for select
    using (
        exists (
            select 1 from workspace_members
            where workspace_members.workspace_id = workspace_invitations.workspace_id
            and workspace_members.user_id = auth.uid()
        )
    );

create policy "Users can create invitations for workspaces they manage"
    on workspace_invitations for insert
    with check (
        exists (
            select 1 from workspace_members
            where workspace_members.workspace_id = workspace_invitations.workspace_id
            and workspace_members.user_id = auth.uid()
            and workspace_members.role in ('owner', 'admin')
        )
    );

create policy "Users can delete invitations for workspaces they manage"
    on workspace_invitations for delete
    using (
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

-- Create index for faster lookups
create index if not exists workspace_invitations_workspace_id_idx 
    on workspace_invitations(workspace_id);
create index if not exists workspace_invitations_email_idx 
    on workspace_invitations(email);
create index if not exists workspace_invitations_token_idx 
    on workspace_invitations(token);
