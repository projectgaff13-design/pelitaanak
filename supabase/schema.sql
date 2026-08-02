-- PROOF CMS migration for Supabase
-- Run this in Supabase SQL Editor. It creates normalized CMS tables, RLS policies, and storage policies.

create extension if not exists pgcrypto;

-- Optional public user profile table linked to Supabase Auth users.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'admin' check (role in ('admin','editor','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mother_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null unique,
  public_url text not null,
  mime_type text,
  size bigint,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  author text,
  category_id uuid references public.article_categories(id) on delete set null,
  thumbnail_url text,
  media_id uuid references public.media_uploads(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','publish')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.product_categories(id) on delete set null,
  image_url text,
  media_id uuid references public.media_uploads(id) on delete set null,
  price numeric(12,2) default 0,
  buy_link text,
  status text not null default 'publish' check (status in ('draft','publish')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.game_categories(id) on delete set null,
  thumbnail_url text,
  media_id uuid references public.media_uploads(id) on delete set null,
  game_link text,
  module_link text,
  status text not null default 'publish' check (status in ('draft','publish')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mother_sharing (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text,
  author text,
  category_id uuid references public.mother_categories(id) on delete set null,
  image_url text,
  media_id uuid references public.media_uploads(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','publish')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  media_id uuid references public.media_uploads(id) on delete set null,
  cta_text text,
  cta_link text,
  status text not null default 'publish' check (status in ('draft','publish')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists trg_article_categories_updated_at on public.article_categories;
create trigger trg_article_categories_updated_at before update on public.article_categories for each row execute function public.set_updated_at();
drop trigger if exists trg_product_categories_updated_at on public.product_categories;
create trigger trg_product_categories_updated_at before update on public.product_categories for each row execute function public.set_updated_at();
drop trigger if exists trg_game_categories_updated_at on public.game_categories;
create trigger trg_game_categories_updated_at before update on public.game_categories for each row execute function public.set_updated_at();
drop trigger if exists trg_mother_categories_updated_at on public.mother_categories;
create trigger trg_mother_categories_updated_at before update on public.mother_categories for each row execute function public.set_updated_at();
drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at before update on public.articles for each row execute function public.set_updated_at();
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists trg_games_updated_at on public.games;
create trigger trg_games_updated_at before update on public.games for each row execute function public.set_updated_at();
drop trigger if exists trg_mother_sharing_updated_at on public.mother_sharing;
create trigger trg_mother_sharing_updated_at before update on public.mother_sharing for each row execute function public.set_updated_at();
drop trigger if exists trg_banners_updated_at on public.banners;
create trigger trg_banners_updated_at before update on public.banners for each row execute function public.set_updated_at();

-- Seed categories so dropdown IDs can be filled manually if desired.
insert into public.article_categories (name, slug) values ('Umum','umum') on conflict (slug) do nothing;
insert into public.product_categories (name, slug) values ('Umum','umum') on conflict (slug) do nothing;
insert into public.game_categories (name, slug) values ('Umum','umum') on conflict (slug) do nothing;
insert into public.mother_categories (name, slug) values ('Umum','umum') on conflict (slug) do nothing;

-- Row Level Security
alter table public.users enable row level security;
alter table public.article_categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.game_categories enable row level security;
alter table public.mother_categories enable row level security;
alter table public.media_uploads enable row level security;
alter table public.articles enable row level security;
alter table public.products enable row level security;
alter table public.games enable row level security;
alter table public.mother_sharing enable row level security;
alter table public.banners enable row level security;

-- Re-create policies safely.
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname='public' and tablename in ('users','article_categories','product_categories','game_categories','mother_categories','media_uploads','articles','products','games','mother_sharing','banners') loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create policy "users read own/auth" on public.users for select using (auth.uid() = id or auth.role() = 'authenticated');
create policy "users write own" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "public read article categories" on public.article_categories for select using (true);
create policy "auth write article categories" on public.article_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read product categories" on public.product_categories for select using (true);
create policy "auth write product categories" on public.product_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read game categories" on public.game_categories for select using (true);
create policy "auth write game categories" on public.game_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read mother categories" on public.mother_categories for select using (true);
create policy "auth write mother categories" on public.mother_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read media" on public.media_uploads for select using (true);
create policy "auth write media" on public.media_uploads for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

create policy "public read published articles" on public.articles for select using (status='publish' or auth.role()='authenticated');
create policy "auth write articles" on public.articles for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read published products" on public.products for select using (status='publish' or auth.role()='authenticated');
create policy "auth write products" on public.products for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read published games" on public.games for select using (status='publish' or auth.role()='authenticated');
create policy "auth write games" on public.games for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read published mother" on public.mother_sharing for select using (status='publish' or auth.role()='authenticated');
create policy "auth write mother" on public.mother_sharing for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read published banners" on public.banners for select using (status='publish' or auth.role()='authenticated');
create policy "auth write banners" on public.banners for all using (auth.role()='authenticated') with check (auth.role()='authenticated');

-- Storage bucket + policies for images.
insert into storage.buckets (id, name, public)
values ('pelita-images', 'pelita-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read pelita images" on storage.objects;
drop policy if exists "auth upload pelita images" on storage.objects;
drop policy if exists "auth update pelita images" on storage.objects;
drop policy if exists "auth delete pelita images" on storage.objects;
create policy "public read pelita images" on storage.objects for select using (bucket_id = 'pelita-images');
create policy "auth upload pelita images" on storage.objects for insert with check (bucket_id = 'pelita-images' and auth.role() = 'authenticated');
create policy "auth update pelita images" on storage.objects for update using (bucket_id = 'pelita-images' and auth.role() = 'authenticated') with check (bucket_id = 'pelita-images' and auth.role() = 'authenticated');
create policy "auth delete pelita images" on storage.objects for delete using (bucket_id = 'pelita-images' and auth.role() = 'authenticated');
