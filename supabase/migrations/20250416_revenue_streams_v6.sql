-- First run the base revenue streams migration
\ir 20250416_revenue_streams_v5.sql

-- Add stream_id to all related tables
alter table public.outreach add column stream_id uuid references public.revenue_streams(id) on delete cascade;
alter table public.leads add column stream_id uuid references public.revenue_streams(id) on delete cascade;
alter table public.customers add column stream_id uuid references public.revenue_streams(id) on delete cascade;
alter table public.calendar_events add column stream_id uuid references public.revenue_streams(id) on delete cascade;
alter table public.tasks add column stream_id uuid references public.revenue_streams(id) on delete cascade;

-- Update existing records to use the first revenue stream (if any exists)
do $$
declare
    first_stream_id uuid;
begin
    select id into first_stream_id from public.revenue_streams limit 1;
    
    if first_stream_id is not null then
        update public.outreach set stream_id = first_stream_id where stream_id is null;
        update public.leads set stream_id = first_stream_id where stream_id is null;
        update public.customers set stream_id = first_stream_id where stream_id is null;
        update public.calendar_events set stream_id = first_stream_id where stream_id is null;
        update public.tasks set stream_id = first_stream_id where stream_id is null;
    end if;
end $$;

-- Make stream_id required for all tables
alter table public.outreach alter column stream_id set not null;
alter table public.leads alter column stream_id set not null;
alter table public.customers alter column stream_id set not null;
alter table public.calendar_events alter column stream_id set not null;
alter table public.tasks alter column stream_id set not null;

-- Update RLS policies for each table to check stream membership
create or replace function public.user_is_stream_member(stream_id uuid) returns boolean as $$
begin
    return exists (
        select 1 from public.revenue_stream_members
        where stream_id = user_is_stream_member.stream_id
        and user_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- Outreach policies
drop policy if exists "outreach_select" on public.outreach;
create policy "outreach_select" on public.outreach
    for select using (user_is_stream_member(stream_id));

drop policy if exists "outreach_insert" on public.outreach;
create policy "outreach_insert" on public.outreach
    for insert with check (user_is_stream_member(stream_id));

drop policy if exists "outreach_update" on public.outreach;
create policy "outreach_update" on public.outreach
    for update using (user_is_stream_member(stream_id));

drop policy if exists "outreach_delete" on public.outreach;
create policy "outreach_delete" on public.outreach
    for delete using (user_is_stream_member(stream_id));

-- Leads policies
drop policy if exists "leads_select" on public.leads;
create policy "leads_select" on public.leads
    for select using (user_is_stream_member(stream_id));

drop policy if exists "leads_insert" on public.leads;
create policy "leads_insert" on public.leads
    for insert with check (user_is_stream_member(stream_id));

drop policy if exists "leads_update" on public.leads;
create policy "leads_update" on public.leads
    for update using (user_is_stream_member(stream_id));

drop policy if exists "leads_delete" on public.leads;
create policy "leads_delete" on public.leads
    for delete using (user_is_stream_member(stream_id));

-- Customers policies
drop policy if exists "customers_select" on public.customers;
create policy "customers_select" on public.customers
    for select using (user_is_stream_member(stream_id));

drop policy if exists "customers_insert" on public.customers;
create policy "customers_insert" on public.customers
    for insert with check (user_is_stream_member(stream_id));

drop policy if exists "customers_update" on public.customers;
create policy "customers_update" on public.customers
    for update using (user_is_stream_member(stream_id));

drop policy if exists "customers_delete" on public.customers;
create policy "customers_delete" on public.customers
    for delete using (user_is_stream_member(stream_id));

-- Calendar events policies
drop policy if exists "calendar_select" on public.calendar_events;
create policy "calendar_select" on public.calendar_events
    for select using (user_is_stream_member(stream_id));

drop policy if exists "calendar_insert" on public.calendar_events;
create policy "calendar_insert" on public.calendar_events
    for insert with check (user_is_stream_member(stream_id));

drop policy if exists "calendar_update" on public.calendar_events;
create policy "calendar_update" on public.calendar_events
    for update using (user_is_stream_member(stream_id));

drop policy if exists "calendar_delete" on public.calendar_events;
create policy "calendar_delete" on public.calendar_events
    for delete using (user_is_stream_member(stream_id));

-- Tasks policies
drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select" on public.tasks
    for select using (user_is_stream_member(stream_id));

drop policy if exists "tasks_insert" on public.tasks;
create policy "tasks_insert" on public.tasks
    for insert with check (user_is_stream_member(stream_id));

drop policy if exists "tasks_update" on public.tasks;
create policy "tasks_update" on public.tasks
    for update using (user_is_stream_member(stream_id));

drop policy if exists "tasks_delete" on public.tasks;
create policy "tasks_delete" on public.tasks
    for delete using (user_is_stream_member(stream_id));
