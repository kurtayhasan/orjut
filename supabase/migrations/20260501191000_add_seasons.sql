create table seasons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- Assuming no auth linked right now, or we leave it open, but we use org_id in AppContext
  org_id uuid, -- Added org_id to match existing architecture
  name text not null, -- "2024 Sezonu", "2025 Sezonu"
  start_date date,
  end_date date,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table lands add column season_id uuid references seasons(id);
alter table transactions add column season_id uuid references seasons(id);
