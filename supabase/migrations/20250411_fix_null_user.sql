-- First, let's check if there are any workspace_members with null user_id and clean them up
delete from workspace_members where user_id is null;

-- Now let's verify your auth status and user ID
select auth.uid() as current_user_id;

-- Get your email to verify
select email from auth.users where id = auth.uid();

-- Check existing workspaces
select id, name from workspaces;

-- Check existing workspace members
select 
  wm.workspace_id,
  w.name as workspace_name,
  wm.user_id,
  u.email as user_email,
  wm.role
from workspace_members wm
join workspaces w on w.id = wm.workspace_id
left join auth.users u on u.id = wm.user_id;
