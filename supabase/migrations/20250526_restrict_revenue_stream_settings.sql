-- Drop existing policies
drop policy if exists "stream_member_select" on public.revenue_streams;
drop policy if exists "stream_member_insert" on public.revenue_streams;
drop policy if exists "stream_admin_update" on public.revenue_streams;
drop policy if exists "stream_owner_delete" on public.revenue_streams;

-- Create more restrictive policies
create policy "stream_member_select" on public.revenue_streams
    for select using (
        auth.uid() in (
            select user_id from revenue_stream_members 
            where stream_id = id
        )
    );

create policy "stream_owner_insert" on public.revenue_streams
    for insert with check (
        auth.uid() in (
            select user_id from revenue_stream_members
            where role = 'owner'
        )
    );

create policy "stream_owner_update" on public.revenue_streams
    for update using (
        auth.uid() in (
            select user_id from revenue_stream_members 
            where stream_id = id and role = 'owner'
        )
    );

create policy "stream_owner_delete" on public.revenue_streams
    for delete using (
        auth.uid() in (
            select user_id from revenue_stream_members 
            where stream_id = id and role = 'owner'
        )
    );
