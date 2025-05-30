-- Create tables for workspace data
create table if not exists workspace_outreach (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  email text,
  company text,
  status text not null default 'new',
  last_contact timestamptz,
  next_follow_up timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

create table if not exists workspace_deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  company text,
  value numeric(10,2) not null default 0,
  stage text not null default 'lead',
  probability integer not null default 0,
  expected_close_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

create table if not exists workspace_customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  email text,
  company text,
  phone text,
  status text not null default 'active',
  last_contact timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

create table if not exists workspace_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

create table if not exists workspace_calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  attendees jsonb not null default '[]',
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

-- Add RLS policies
alter table workspace_outreach enable row level security;
alter table workspace_deals enable row level security;
alter table workspace_customers enable row level security;
alter table workspace_tasks enable row level security;
alter table workspace_calendar_events enable row level security;

-- Create policies for each table
create policy "Users can view workspace data"
  on workspace_outreach for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_outreach.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can view workspace data"
  on workspace_deals for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_deals.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can view workspace data"
  on workspace_customers for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_customers.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can view workspace data"
  on workspace_tasks for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_tasks.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can view workspace data"
  on workspace_calendar_events for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_calendar_events.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Create policies for insert/update/delete
create policy "Users can manage workspace data"
  on workspace_outreach for insert with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_outreach.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can manage workspace data"
  on workspace_deals for insert with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_deals.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can manage workspace data"
  on workspace_customers for insert with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_customers.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can manage workspace data"
  on workspace_tasks for insert with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_tasks.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can manage workspace data"
  on workspace_calendar_events for insert with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_calendar_events.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Add sample data function
create or replace function initialize_workspace_data(workspace_id uuid, user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Add sample outreach
  insert into workspace_outreach (workspace_id, name, email, company, status, created_by)
  values
    (workspace_id, 'John Smith', 'john@example.com', 'ABC Corp', 'new', user_id),
    (workspace_id, 'Sarah Johnson', 'sarah@example.com', 'XYZ Inc', 'contacted', user_id);

  -- Add sample deals
  insert into workspace_deals (workspace_id, name, company, value, stage, probability, created_by)
  values
    (workspace_id, 'Enterprise Package', 'ABC Corp', 50000, 'proposal', 70, user_id),
    (workspace_id, 'Startup Bundle', 'XYZ Inc', 10000, 'lead', 30, user_id);

  -- Add sample customers
  insert into workspace_customers (workspace_id, name, email, company, status, created_by)
  values
    (workspace_id, 'Michael Brown', 'michael@example.com', 'Brown LLC', 'active', user_id),
    (workspace_id, 'Emma Wilson', 'emma@example.com', 'Wilson Co', 'active', user_id);

  -- Add sample tasks
  insert into workspace_tasks (workspace_id, title, description, status, priority, assigned_to, created_by)
  values
    (workspace_id, 'Follow up with ABC Corp', 'Schedule demo call', 'todo', 'high', user_id, user_id),
    (workspace_id, 'Prepare proposal', 'For XYZ Inc startup bundle', 'todo', 'medium', user_id, user_id);

  -- Add sample calendar events
  insert into workspace_calendar_events (workspace_id, title, description, start_time, end_time, created_by)
  values
    (workspace_id, 'ABC Corp Demo', 'Product demonstration', now() + interval '1 day', now() + interval '1 day' + interval '1 hour', user_id),
    (workspace_id, 'Team Meeting', 'Weekly sync', now() + interval '2 days', now() + interval '2 days' + interval '30 minutes', user_id);
end;
$$;
