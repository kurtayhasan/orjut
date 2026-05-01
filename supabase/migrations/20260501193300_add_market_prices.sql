create table market_prices (
  id uuid primary key default gen_random_uuid(),
  crop_name text not null,
  price_per_kg numeric(10,4),
  source text, -- "TMO", "Ticaret Borsası"
  region text,
  fetched_at timestamptz default now()
);
