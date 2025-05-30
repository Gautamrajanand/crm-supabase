-- Drop all policies first
do $$
declare
    tbl text;
begin
    for tbl in (select tablename from pg_tables where schemaname = 'public' and tablename in ('customers', 'tasks', 'deals', 'prospects', 'boards', 'board_columns', 'board_entries', 'events'))
    loop
        execute format('drop policy if exists %I_select on public.%I', tbl, tbl);
        execute format('drop policy if exists %I_insert on public.%I', tbl, tbl);
        execute format('drop policy if exists %I_update on public.%I', tbl, tbl);
        execute format('drop policy if exists %I_delete on public.%I', tbl, tbl);
    end loop;
end $$;

-- Update user_is_stream_member function to also check role
create or replace function public.user_is_stream_member_with_role(check_stream_id uuid, required_role text[]) returns boolean as $$
begin
    return exists (
        select 1 from public.revenue_stream_members m
        where m.stream_id = check_stream_id
        and m.user_id = auth.uid()
        and (
            array_length(required_role, 1) is null -- If no roles specified, any role is fine
            or m.role = any(required_role) -- Otherwise, must have one of the specified roles
        )
    );
end;
$$ language plpgsql security definer;

-- Add RLS policies to existing tables
do $$
declare
    tbl text;
begin
    for tbl in (select tablename from pg_tables where schemaname = 'public' and tablename in ('customers', 'tasks', 'deals', 'prospects', 'boards', 'board_columns', 'board_entries', 'events'))
    loop
        -- Anyone in the stream can view
        execute format('create policy %I_select on public.%I for select using (user_is_stream_member_with_role(stream_id, null))', tbl, tbl);
        
        -- Only owners and admins can create/update/delete
        execute format('create policy %I_insert on public.%I for insert with check (user_is_stream_member_with_role(stream_id, array[''owner'', ''admin'']))', tbl, tbl);
        execute format('create policy %I_update on public.%I for update using (user_is_stream_member_with_role(stream_id, array[''owner'', ''admin'']))', tbl, tbl);
        execute format('create policy %I_delete on public.%I for delete using (user_is_stream_member_with_role(stream_id, array[''owner'', ''admin'']))', tbl, tbl);
    end loop;
end $$;
