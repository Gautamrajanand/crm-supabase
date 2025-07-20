-- Create share links table
create table if not exists public.share_links (
    id uuid primary key default uuid_generate_v4(),
    stream_id uuid references public.revenue_streams(id) on delete cascade,
    access_type text not null check (access_type in ('view', 'edit')),
    created_by text not null,
    created_at timestamptz default now(),
    expires_at timestamptz,
    used_at timestamptz
);

-- Enable RLS
alter table public.share_links enable row level security;

-- Share links policies
create policy "share_links_select_stream_member" on public.share_links
    for select using (
        auth.uid() in (
            select user_id from revenue_stream_members 
            where stream_id = share_links.stream_id
        )
    );

create policy "share_links_insert_stream_member" on public.share_links
    for insert with check (
        auth.uid() in (
            select user_id from revenue_stream_members 
            where stream_id = new.stream_id
            and role in ('owner', 'admin')
        )
    );

create policy "share_links_delete_stream_member" on public.share_links
    for delete using (
        auth.uid() in (
            select user_id from revenue_stream_members 
            where stream_id = share_links.stream_id
            and role in ('owner', 'admin')
        )
    );

-- Grant permissions
grant all on public.share_links to authenticated;
