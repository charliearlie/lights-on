-- API keys for external API authentication
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  key_hash text not null unique,        -- SHA-256 hash of the API key (never store plaintext)
  key_prefix text not null,             -- First 8 chars for identification (e.g., "cmb_a1b2...")
  name text not null default 'Default', -- Human-readable label
  is_active boolean default true,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- Index for fast lookup by hash
create index idx_api_keys_hash on public.api_keys (key_hash) where is_active = true;

-- RLS: users can only see/manage their own keys
alter table public.api_keys enable row level security;
create policy "Users manage own keys" on public.api_keys
  for all using (auth.uid() = user_id);
