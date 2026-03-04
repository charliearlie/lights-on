-- ============================================================================
-- Illuminate: Initial Database Schema
-- ============================================================================

-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  stripe_customer_id text unique,
  plan text default 'free' check (plan in ('free', 'pro', 'business', 'agency')),
  transformations_used int default 0,
  transformations_limit int default 5,
  billing_period_start timestamptz,
  created_at timestamptz default now()
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  slug text unique,
  settings jsonb default '{}',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Image states within a project
create table public.image_states (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  product_name text,
  sort_order int default 0,
  states jsonb not null, -- [{label: "Off", image_url: "..."}, {label: "On", image_url: "..."}]
  created_at timestamptz default now()
);

-- Transformation jobs
create table public.transformations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  project_id uuid references public.projects on delete set null,
  source_image_url text not null,
  source_image_hash text,
  transformation_type text not null,
  parameters jsonb default '{}',
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result_image_url text,
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Service orders (Channel A: productised service)
create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  package text not null check (package in ('starter', 'pro', 'enterprise')),
  stripe_payment_id text,
  status text default 'pending' check (status in ('pending', 'paid', 'in_progress', 'delivered', 'cancelled')),
  brief jsonb,
  deliverables jsonb,
  amount_paid int,
  created_at timestamptz default now(),
  delivered_at timestamptz
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.image_states enable row level security;
alter table public.transformations enable row level security;
alter table public.service_orders enable row level security;

-- Profiles: users can read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Projects: users can CRUD their own projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Public projects are viewable by anyone
create policy "Public projects are viewable"
  on public.projects for select
  using (is_public = true);

-- Image states: access via project ownership
create policy "Users can view own image states"
  on public.image_states for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = image_states.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can manage own image states"
  on public.image_states for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = image_states.project_id
        and projects.user_id = auth.uid()
    )
  );

-- Public project image states are viewable
create policy "Public project image states are viewable"
  on public.image_states for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = image_states.project_id
        and projects.is_public = true
    )
  );

-- Transformations: users can view/create their own
create policy "Users can view own transformations"
  on public.transformations for select
  using (auth.uid() = user_id);

create policy "Users can create own transformations"
  on public.transformations for insert
  with check (auth.uid() = user_id);

-- Service orders: users can view their own
create policy "Users can view own orders"
  on public.service_orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.service_orders for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- Indexes
-- ============================================================================

create index idx_projects_user_id on public.projects (user_id);
create index idx_image_states_project_id on public.image_states (project_id);
create index idx_transformations_user_id on public.transformations (user_id);
create index idx_transformations_status on public.transformations (status);
create index idx_service_orders_user_id on public.service_orders (user_id);
