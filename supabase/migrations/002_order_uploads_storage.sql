-- ============================================================================
-- Illuminate: Order Uploads Storage
-- ============================================================================

-- Create storage bucket for order image uploads
insert into storage.buckets (id, name, public)
values ('order-uploads', 'order-uploads', false);

-- Allow anonymous uploads to the order-uploads bucket
-- This supports guest checkout where users don't have accounts
create policy "Allow anonymous uploads to order-uploads"
on storage.objects for insert
with check (
  bucket_id = 'order-uploads'
  and (storage.foldername(name))[1] = 'orders'
);

-- Allow authenticated users to read their uploaded files
create policy "Allow authenticated reads from order-uploads"
on storage.objects for select
using (
  bucket_id = 'order-uploads'
  and auth.role() = 'authenticated'
);
