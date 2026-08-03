-- Pelita Anak / PROOF CMS relational migration for Supabase
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.product_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.game_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.mother_categories (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

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
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  excerpt text, body text, author text, category_id uuid references public.article_categories(id) on delete set null,
  media_id uuid references public.media_uploads(id) on delete set null, thumbnail_url text,
  status text not null default 'draft' check(status in ('draft','publish')), published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  description text, category_id uuid references public.product_categories(id) on delete set null,
  media_id uuid references public.media_uploads(id) on delete set null, image_url text, price numeric(12,2) not null default 0, buy_link text,
  status text not null default 'publish' check(status in ('draft','publish')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  description text, category_id uuid references public.game_categories(id) on delete set null,
  media_id uuid references public.media_uploads(id) on delete set null, thumbnail_url text, game_link text, module_link text,
  status text not null default 'publish' check(status in ('draft','publish')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.mother_sharing (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  body text, author text, category_id uuid references public.mother_categories(id) on delete set null,
  media_id uuid references public.media_uploads(id) on delete set null, image_url text,
  status text not null default 'draft' check(status in ('draft','publish')), published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique,
  subtitle text, media_id uuid references public.media_uploads(id) on delete set null, image_url text, cta_text text, cta_link text,
  status text not null default 'publish' check(status in ('draft','publish')), sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists articles_status_idx on public.articles(status);
create index if not exists products_status_idx on public.products(status);
create index if not exists games_status_idx on public.games(status);
create index if not exists mother_status_idx on public.mother_sharing(status);
create index if not exists banners_status_idx on public.banners(status);

insert into storage.buckets (id, name, public) values ('pelita-images','pelita-images',true) on conflict (id) do update set public = true;

alter table public.users enable row level security;
alter table public.article_categories enable row level security; alter table public.product_categories enable row level security; alter table public.game_categories enable row level security; alter table public.mother_categories enable row level security;
alter table public.media_uploads enable row level security; alter table public.articles enable row level security; alter table public.products enable row level security; alter table public.games enable row level security; alter table public.mother_sharing enable row level security; alter table public.banners enable row level security;

drop policy if exists "users self read" on public.users; create policy "users self read" on public.users for select using (auth.uid() = id);
drop policy if exists "users self upsert" on public.users; create policy "users self upsert" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);

do $$ declare t text; begin
  foreach t in array array['article_categories','product_categories','game_categories','mother_categories','media_uploads'] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format('create policy "public read %1$s" on public.%1$I for select using (true)', t);
    execute format('drop policy if exists "auth write %1$s" on public.%1$I', t);
    execute format('create policy "auth write %1$s" on public.%1$I for all using (auth.role()=''authenticated'') with check (auth.role()=''authenticated'')', t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['articles','products','games','mother_sharing','banners'] loop
    execute format('drop policy if exists "public read published %1$s" on public.%1$I', t);
    execute format('create policy "public read published %1$s" on public.%1$I for select using (status=''publish'' or auth.role()=''authenticated'')', t);
    execute format('drop policy if exists "auth write %1$s" on public.%1$I', t);
    execute format('create policy "auth write %1$s" on public.%1$I for all using (auth.role()=''authenticated'') with check (auth.role()=''authenticated'')', t);
  end loop;
end $$;

drop policy if exists "public read pelita images" on storage.objects; create policy "public read pelita images" on storage.objects for select using (bucket_id = 'pelita-images');
drop policy if exists "auth upload pelita images" on storage.objects; create policy "auth upload pelita images" on storage.objects for insert with check (bucket_id = 'pelita-images' and auth.role() = 'authenticated');
drop policy if exists "auth update pelita images" on storage.objects; create policy "auth update pelita images" on storage.objects for update using (bucket_id = 'pelita-images' and auth.role() = 'authenticated') with check (bucket_id = 'pelita-images' and auth.role() = 'authenticated');
drop policy if exists "auth delete pelita images" on storage.objects; create policy "auth delete pelita images" on storage.objects for delete using (bucket_id = 'pelita-images' and auth.role() = 'authenticated');

-- Game CMS expansion: dynamic public game page, notes, PDF, assessment
alter table public.games add column if not exists banner_url text;
alter table public.games add column if not exists age text;
alter table public.games add column if not exists duration text;
alter table public.games add column if not exists tools text;
alter table public.games add column if not exists objective text;
alter table public.games add column if not exists pdf_url text;
alter table public.games add column if not exists play_instruction text;
alter table public.games add column if not exists observation_questions text;
alter table public.games add column if not exists note_form_json jsonb;
alter table public.games add column if not exists assessment_json jsonb;

create table if not exists public.game_notes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  title text,
  fields jsonb not null default '[]'::jsonb,
  template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.game_assessments (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  title text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.game_assessments(id) on delete cascade,
  question text not null,
  answer_type text not null default 'scale' check(answer_type in ('choice','scale','text','checklist')),
  options jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games add column if not exists note_form_id uuid references public.game_notes(id) on delete set null;
alter table public.games add column if not exists assessment_id uuid references public.game_assessments(id) on delete set null;

alter table public.game_notes enable row level security;
alter table public.game_assessments enable row level security;
alter table public.assessment_questions enable row level security;

drop policy if exists "public read game notes" on public.game_notes;
create policy "public read game notes" on public.game_notes for select using (true);
drop policy if exists "auth write game notes" on public.game_notes;
create policy "auth write game notes" on public.game_notes for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
drop policy if exists "public read game assessments" on public.game_assessments;
create policy "public read game assessments" on public.game_assessments for select using (true);
drop policy if exists "auth write game assessments" on public.game_assessments;
create policy "auth write game assessments" on public.game_assessments for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
drop policy if exists "public read assessment questions" on public.assessment_questions;
create policy "public read assessment questions" on public.assessment_questions for select using (true);
drop policy if exists "auth write assessment questions" on public.assessment_questions;
create policy "auth write assessment questions" on public.assessment_questions for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
