create table expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- For real app auth.users
  org_id uuid,
  name text not null,
  color text,
  budget_amount numeric(12,2),
  season_id uuid -- references seasons(id)
);

alter table transactions add column category_id uuid; -- references expense_categories(id)

-- Seed defaults
insert into expense_categories (org_id, name, color, budget_amount)
values 
  ('00000000-0000-0000-0000-000000000000', 'Mazot', '#F97316', 50000),
  ('00000000-0000-0000-0000-000000000000', 'Gübre/İlaç', '#22C55E', 30000),
  ('00000000-0000-0000-0000-000000000000', 'Tohum', '#EF4444', 15000),
  ('00000000-0000-0000-0000-000000000000', 'İşçilik', '#3B82F6', 40000),
  ('00000000-0000-0000-0000-000000000000', 'Diğer', '#94A3B8', 10000);
