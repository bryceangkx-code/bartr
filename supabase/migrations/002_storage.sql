-- ============================================================
-- Bartr MVP — Storage buckets
-- ============================================================

-- Portfolio images bucket
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "portfolio_upload_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone to read portfolio images (bucket is public)
create policy "portfolio_read_all"
  on storage.objects for select
  using (bucket_id = 'portfolio');

-- Allow users to delete their own images
create policy "portfolio_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
