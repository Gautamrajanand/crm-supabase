-- First, disable RLS and drop everything
alter table workspace_members disable row level security;
drop policy if exists "member_select_policy" on workspace_members;
drop policy if exists "member_insert_policy" on workspace_members;
drop policy if exists "member_update_policy" on workspace_members;
drop policy if exists "member_delete_policy" on workspace_members;
drop view if exists workspace_members_with_emails;
drop materialized view if exists user_workspace_access;

-- Create a denormalized access table
create table if not exists workspace_access (
    user_id uuid references auth.users(id) on delete cascade,
    workspace_id uuid references workspaces(id) on delete cascade,
    is_admin boolean default false,
    primary key (user_id, workspace_id)
);

-- Create index for performance
create index if not exists workspace_access_user_id_idx on workspace_access(user_id);
create index if not exists workspace_access_workspace_id_idx on workspace_access(workspace_id);

-- Function to sync access
create or replace function sync_workspace_access()
returns trigger
language plpgsql
security definer
as $$
begin
    if (TG_OP = 'DELETE') then
        delete from workspace_access
        where user_id = OLD.user_id and workspace_id = OLD.workspace_id;
        return OLD;
    end if;

    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        insert into workspace_access (user_id, workspace_id, is_admin)
        values (
            NEW.user_id,
            NEW.workspace_id,
            NEW.role in ('owner', 'admin')
        )
        on conflict (user_id, workspace_id)
        do update set is_admin = NEW.role in ('owner', 'admin');
        return NEW;
    end if;

    return null;
end;
$$;

-- Create trigger
drop trigger if exists sync_workspace_access_trigger on workspace_members;
create trigger sync_workspace_access_trigger
after insert or update or delete on workspace_members
for each row execute function sync_workspace_access();

-- Sync existing data
insert into workspace_access (user_id, workspace_id, is_admin)
select user_id, workspace_id, role in ('owner', 'admin')
from workspace_members
on conflict (user_id, workspace_id)
do update set is_admin = EXCLUDED.is_admin;

-- Create view for member data
create or replace view workspace_members_with_emails as
select 
    wm.id,
    wm.workspace_id,
    wm.user_id,
    wm.role,
    wm.created_at,
    coalesce(p.full_name, split_part(u.email, '@', 1)) as name,
    u.email,
    coalesce(wm.permissions, '{
        "outreach": "none",
        "deals": "none",
        "customers": "none",
        "tasks": "none",
        "calendar": "none"
    }'::jsonb) as permissions
from workspace_members wm
left join auth.users u on wm.user_id = u.id
left join profiles p on wm.user_id = p.id;

-- Create policies using the access table
create policy "member_select_policy"
    on workspace_members for select
    using (
        exists (
            select 1 from workspace_access
            where user_id = auth.uid()
            and workspace_id = workspace_members.workspace_id
        )
    );

create policy "member_insert_policy"
    on workspace_members for insert
    with check (
        user_id = auth.uid()
        or
        exists (
            select 1 from workspace_access
            where user_id = auth.uid()
            and workspace_id = workspace_members.workspace_id
            and is_admin = true
        )
    );

create policy "member_update_policy"
    on workspace_members for update
    using (
        exists (
            select 1 from workspace_access
            where user_id = auth.uid()
            and workspace_id = workspace_members.workspace_id
            and is_admin = true
        )
    );

create policy "member_delete_policy"
    on workspace_members for delete
    using (
        user_id = auth.uid()
        or
        exists (
            select 1 from workspace_access
            where user_id = auth.uid()
            and workspace_id = workspace_members.workspace_id
            and is_admin = true
        )
    );

-- Enable RLS and grant permissions
alter table workspace_members enable row level security;
grant select on workspace_members_with_emails to authenticated;
