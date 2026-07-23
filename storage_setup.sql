-- Supabase Storage setup for per-store logo / favicon hosting
-- Run this once in: Supabase Dashboard -> SQL Editor
--
-- Why this is needed: store logos/favicons were previously saved as base64 data
-- (embedded directly in the page). Google Search, Facebook link previews, etc.
-- cannot fetch a base64 image as a site's favicon/OG image - they need a real
-- public URL. This creates a public storage bucket so uploaded logos/favicons
-- get a real https:// URL every store can use.

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

-- Allow anyone to read files in this bucket (needed so Google/Facebook/browsers can load them)
drop policy if exists "Public read store-assets" on storage.objects;
create policy "Public read store-assets" on storage.objects
  for select using (bucket_id = 'store-assets');

-- Allow uploads from the app (same permissive model already used for admin panel writes)
drop policy if exists "Public upload store-assets" on storage.objects;
create policy "Public upload store-assets" on storage.objects
  for insert with check (bucket_id = 'store-assets');

drop policy if exists "Public update store-assets" on storage.objects;
create policy "Public update store-assets" on storage.objects
  for update using (bucket_id = 'store-assets');
