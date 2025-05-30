-- First ensure workspace_members table has all required columns
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

-- Create or replace the view
create or replace view workspace_members_with_emails as
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

-- Grant necessary permissions
grant select on workspace_members_with_emails to authenticated;
grant select on workspace_members_with_emails to service_role;
