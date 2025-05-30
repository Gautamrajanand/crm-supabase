-- First disable RLS
alter table workspace_members disable row level security;

-- Drop existing policies
drop policy if exists "workspace_members_select_policy" on workspace_members;
drop policy if exists "workspace_members_insert_policy" on workspace_members;
drop policy if exists "workspace_members_update_policy" on workspace_members;
drop policy if exists "Users can view workspace members" on workspace_members;
drop policy if exists "Admins can insert workspace members" on workspace_members;

-- Create simpler policies without recursion
create policy "member_select_policy"
  on workspace_members for select
  using (
    -- Users can see members of workspaces they belong to
    user_id = auth.uid()
    or
    workspace_id in (
      select workspace_id from workspace_members
      where user_id = auth.uid()
    )
  );

create policy "member_insert_policy"
  on workspace_members for insert
  with check (
    -- Users can add themselves or be added by workspace admins/owners
    user_id = auth.uid()
    or
    exists (
      select 1 from workspace_members as m
      where m.workspace_id = workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

create policy "member_update_policy"
  on workspace_members for update
  using (
    -- Only workspace admins/owners can update members
    exists (
      select 1 from workspace_members as m
      where m.workspace_id = workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

create policy "member_delete_policy"
  on workspace_members for delete
  using (
    -- Members can remove themselves, or be removed by admins/owners
    user_id = auth.uid()
    or
    exists (
      select 1 from workspace_members as m
      where m.workspace_id = workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Re-enable RLS
alter table workspace_members enable row level security;

-- Ensure all required columns exist
do $$ 
begin
  -- Add role column if it doesn't exist
  if not exists (select 1 from information_schema.columns 
    where table_name = 'workspace_members' and column_name = 'role') then
    alter table workspace_members add column role text default 'member';
  end if;

  -- Add permissions column if it doesn't exist
  if not exists (select 1 from information_schema.columns 
    where table_name = 'workspace_members' and column_name = 'permissions') then
    alter table workspace_members add column permissions jsonb default '{
      "outreach": "none",
      "deals": "none",
      "customers": "none",
      "tasks": "none",
      "calendar": "none"
    }'::jsonb;
  end if;

  -- Add created_at column if it doesn't exist
  if not exists (select 1 from information_schema.columns 
    where table_name = 'workspace_members' and column_name = 'created_at') then
    alter table workspace_members add column created_at timestamptz default now();
  end if;
end $$;

-- Recreate the view
drop view if exists workspace_members_with_emails;
create view workspace_members_with_emails as
select 
    wm.id,
    wm.workspace_id,
    wm.user_id,
    wm.role,
    wm.created_at,
    coalesce(
      (select full_name from profiles where id = wm.user_id),
      split_part(u.email, '@', 1),
      'Unknown User'
    ) as name,
    u.email,
    coalesce(wm.permissions, '{
      "outreach": "none",
      "deals": "none",
      "customers": "none",
      "tasks": "none",
      "calendar": "none"
    }'::jsonb) as permissions
from workspace_members wm
left join auth.users u on wm.user_id = u.id;
