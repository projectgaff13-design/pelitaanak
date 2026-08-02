-- PROOF CMS relational schema for Supabase
create extension if not exists pgcrypto;

create table if not exists public.article_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text unique, created_at timestamptz default now());
create table if not exists public.product_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text unique, created_at timestamptz default now());
create table if not exists public.game_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text unique, created_at timestamptz default now());
create table if not exists public.mother_sharing_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text unique, created_at timestamptz default now());

create table if not exists public.media_uploads (id uuid primary key default gen_random_uuid(), file_name text not null, file_path text not null, public_url text not null, mime_type text, size bigint, created_by uuid references auth.users(id), created_at timestamptz default now());

create table if not exists public.articles (id uuid primary key default gen_random_uuid(), title text not null, slug text unique, excerpt text, body text, author text, category_id uuid references public.article_categories(id) on delete set null, thumbnail_url text, status text not null default 'draft' check(status in ('draft','publish')), published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.products (id uuid primary key default gen_random_uuid(), name text not null, slug text unique, description text, category_id uuid references public.product_categories(id) on delete set null, image_url text, price numeric default 0, buy_link text, status text not null default 'publish' check(status in ('draft','publish')), created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.games (id uuid primary key default gen_random_uuid(), title text not null, slug text unique, description text, category_id uuid references public.game_categories(id) on delete set null, thumbnail_url text, game_link text, module_link text, status text not null default 'publish' check(status in ('draft','publish')), created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.mother_sharing (id uuid primary key default gen_random_uuid(), title text not null, body text, author text, category_id uuid references public.mother_sharing_categories(id) on delete set null, image_url text, status text not null default 'draft' check(status in ('draft','publish')), published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.banners (id uuid primary key default gen_random_uuid(), title text not null, subtitle text, image_url text, cta_text text, cta_link text, status text not null default 'publish' check(status in ('draft','publish')), sort_order int default 0, created_at timestamptz default now(), updated_at timestamptz default now());

alter table public.article_categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.game_categories enable row level security;
alter table public.mother_sharing_categories enable row level security;
alter table public.media_uploads enable row level security;
alter table public.articles enable row level security;
alter table public.products enable row level security;
alter table public.games enable row level security;
alter table public.mother_sharing enable row level security;
alter table public.banners enable row level security;

-- Public read; authenticated admin write. For stricter admin-only access, restrict by email/role later.
do $$ begin
  perform 1;
end $$;

create policy if not exists "public read article categories" on public.article_categories for select using (true);
create policy if not exists "auth write article categories" on public.article_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read product categories" on public.product_categories for select using (true);
create policy if not exists "auth write product categories" on public.product_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read game categories" on public.game_categories for select using (true);
create policy if not exists "auth write game categories" on public.game_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read mother categories" on public.mother_sharing_categories for select using (true);
create policy if not exists "auth write mother categories" on public.mother_sharing_categories for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read media" on public.media_uploads for select using (true);
create policy if not exists "auth write media" on public.media_uploads for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read published articles" on public.articles for select using (status='publish' or auth.role()='authenticated');
create policy if not exists "auth write articles" on public.articles for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read published products" on public.products for select using (status='publish' or auth.role()='authenticated');
create policy if not exists "auth write products" on public.products for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read published games" on public.games for select using (status='publish' or auth.role()='authenticated');
create policy if not exists "auth write games" on public.games for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read published mother" on public.mother_sharing for select using (status='publish' or auth.role()='authenticated');
create policy if not exists "auth write mother" on public.mother_sharing for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy if not exists "public read published banners" on public.banners for select using (status='publish' or auth.role()='authenticated');
create policy if not exists "auth write banners" on public.banners for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
