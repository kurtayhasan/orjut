create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- For real app references auth.users
  org_id uuid,
  subscription jsonb not null,
  created_at timestamptz default now()
);
