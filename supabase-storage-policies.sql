-- Supabase Storage RLS setup for the generated-frames bucket
-- Use this in the Supabase SQL editor.

-- 1) Ensure the bucket exists in Supabase Storage.
--    Bucket name must be: generated-frames

-- 2) Allow public read access to objects in the bucket.
create policy if not exists "generated-frames-read" 
on storage.objects
for select
using (bucket_id = 'generated-frames');

-- 3) Allow anon users to upload objects to the bucket.
create policy if not exists "generated-frames-insert-anon"
on storage.objects
for insert
to anon
with check (bucket_id = 'generated-frames');

-- 4) Allow anon users to update objects in the bucket.
create policy if not exists "generated-frames-update-anon"
on storage.objects
for update
to anon
using (bucket_id = 'generated-frames')
with check (bucket_id = 'generated-frames');

-- 5) Allow anon users to delete objects in the bucket.
create policy if not exists "generated-frames-delete-anon"
on storage.objects
for delete
to anon
using (bucket_id = 'generated-frames');

-- 6) Allow authenticated users the same access as well.
create policy if not exists "generated-frames-insert-auth"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'generated-frames');

create policy if not exists "generated-frames-update-auth"
on storage.objects
for update
to authenticated
using (bucket_id = 'generated-frames')
with check (bucket_id = 'generated-frames');

create policy if not exists "generated-frames-delete-auth"
on storage.objects
for delete
to authenticated
using (bucket_id = 'generated-frames');
