-- 1. Create scouting_images bucket
insert into storage.buckets (id, name, public) values ('scouting_images', 'scouting_images', true) on conflict do nothing;

-- 2. Alter scouting_records table to add image_url and sync_status
alter table scouting_records add column if not exists image_url text;
alter table scouting_records add column if not exists sync_status text default 'synced';

-- 3. pgvector
create extension if not exists vector;

-- 4. ministry_guidelines table
create table if not exists ministry_guidelines (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  embedding vector(1536)
);

-- 5. RLS policies
alter table ministry_guidelines enable row level security;
create policy "Allow read access to all authenticated users for guidelines" on ministry_guidelines for select to authenticated using (true);

-- Storage RLS
create policy "Authenticated users can upload scouting images" on storage.objects for insert to authenticated with check (bucket_id = 'scouting_images');
create policy "Users can view scouting images" on storage.objects for select to authenticated using (bucket_id = 'scouting_images');
