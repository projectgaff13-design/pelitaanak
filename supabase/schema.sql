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


-- Supabase Storage bucket for admin image uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pelita-images',
  'pelita-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

drop policy if exists "Public can read Pelita images" on storage.objects;
create policy "Public can read Pelita images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'pelita-images');

drop policy if exists "Authenticated admins can upload Pelita images" on storage.objects;
create policy "Authenticated admins can upload Pelita images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'pelita-images');

drop policy if exists "Authenticated admins can update Pelita images" on storage.objects;
create policy "Authenticated admins can update Pelita images"
on storage.objects
for update
to authenticated
using (bucket_id = 'pelita-images')
with check (bucket_id = 'pelita-images');

drop policy if exists "Authenticated admins can delete Pelita images" on storage.objects;
create policy "Authenticated admins can delete Pelita images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'pelita-images');
