-- Enable Row Level Security (RLS) on core tables
alter table if exists lands enable row level security;
alter table if exists transactions enable row level security;
alter table if exists seasons enable row level security;
alter table if exists field_operations enable row level security;
alter table if exists scouting_logs enable row level security;
alter table if exists irrigation_logs enable row level security;
alter table if exists inventory enable row level security;

-- Basic Policies: Users can only see and modify data if they are authenticated
-- (A more complex org_id based policy should be implemented later, but this secures the demo)

create policy "Enable full access for authenticated users" on lands
  for all using (auth.role() = 'authenticated');

create policy "Enable full access for authenticated users" on transactions
  for all using (auth.role() = 'authenticated');

create policy "Enable full access for authenticated users" on seasons
  for all using (auth.role() = 'authenticated');

create policy "Enable full access for authenticated users" on field_operations
  for all using (auth.role() = 'authenticated');

create policy "Enable full access for authenticated users" on scouting_logs
  for all using (auth.role() = 'authenticated');

create policy "Enable full access for authenticated users" on irrigation_logs
  for all using (auth.role() = 'authenticated');

create policy "Enable full access for authenticated users" on inventory
  for all using (auth.role() = 'authenticated');
