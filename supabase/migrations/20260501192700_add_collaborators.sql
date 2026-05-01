create table land_collaborators (
  id uuid primary key default gen_random_uuid(),
  land_id uuid, -- references lands(id) on delete cascade (mocked relation without fk for demo speed)
  user_id uuid, -- references auth.users
  role text check (role in ('owner', 'editor', 'viewer')) default 'viewer',
  invited_by uuid, -- references auth.users
  accepted_at timestamptz,
  created_at timestamptz default now()
);
