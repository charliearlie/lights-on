-- ============================================================================
-- Stadium Forge: Storage bucket for generated images
-- ============================================================================

-- Create public storage bucket for stadium forge images
insert into storage.buckets (id, name, public)
values ('stadium-forge', 'stadium-forge', true);

-- Allow authenticated users to upload to stadium-forge bucket
create policy "Allow authenticated uploads to stadium-forge"
on storage.objects for insert
with check (
  bucket_id = 'stadium-forge'
  and auth.role() = 'authenticated'
);

-- Allow public reads from stadium-forge bucket (images are meant to be downloaded)
create policy "Allow public reads from stadium-forge"
on storage.objects for select
using (
  bucket_id = 'stadium-forge'
);

-- Allow authenticated users to update/overwrite their uploads
create policy "Allow authenticated updates to stadium-forge"
on storage.objects for update
using (
  bucket_id = 'stadium-forge'
  and auth.role() = 'authenticated'
);
