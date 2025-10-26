-- Tipos (idempotentes)
do $$ begin create type short_access as enum ('free','premium'); exception when duplicate_object then null; end $$;

-- Tabla de SHORTS
create table if not exists public.shorts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.users(id) on delete cascade,
  source text not null check (source in ('youtube','tiktok','instagram','facebook')),
  embed_url text not null,
  title text,
  description text,
  tags text[],
  access short_access not null default 'free',
  created_at timestamptz default now(),
  verification_status text default 'unverified',
  verification_score numeric default 0,
  verification_count int default 0,
  confirms int default 0,
  contexts int default 0,
  denies int default 0,
  mod_status text default 'visible',
  mod_reason text,
  mod_updated_at timestamptz,
  is_public boolean default true
);

-- Índices críticos para feed y búsqueda
create index if not exists idx_shorts_created on public.shorts (created_at desc);
create index if not exists idx_shorts_creator on public.shorts (creator_id);
create index if not exists idx_shorts_status on public.shorts (mod_status, is_public);
create index if not exists idx_shorts_tags_gin on public.shorts using gin (tags);

-- Vista materializada para “hot feed”: orden inicial por recencia y score
create materialized view if not exists public.mv_shorts_hot as
select
  id, creator_id, source, embed_url, title, access, created_at,
  (extract(epoch from (now() - created_at)) / 3600.0) as hours_old,
  greatest(0, verification_score) as vscore
from public.shorts
where mod_status = 'visible' and is_public = true;

-- Índices sobre la MV
create index if not exists mv_shorts_hot_created on public.mv_shorts_hot (created_at desc);
create index if not exists mv_shorts_hot_rank on public.mv_shorts_hot (vscore desc, created_at desc);
