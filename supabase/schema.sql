-- Pelita Anak CMS schema for Supabase
-- Run this in Supabase SQL Editor.

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamp with time zone not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated admins can insert site content" on public.site_content;
create policy "Authenticated admins can insert site content"
on public.site_content
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update site content" on public.site_content;
create policy "Authenticated admins can update site content"
on public.site_content
for update
to authenticated
using (true)
with check (true);

-- Optional seed row. Admin page can also create/update this row automatically.
insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
