-- Storage buckets. Palmistry images and generated reports are private;
-- access is only ever via signed URLs generated server-side.

insert into storage.buckets (id, name, public)
values ('palmistry', 'palmistry', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('assessment-media', 'assessment-media', true)
on conflict (id) do nothing;

-- Palmistry: users may only read/write objects under a path prefixed with
-- their own user id, e.g. palmistry/{user_id}/left.jpg
create policy "palmistry_owner_rw" on storage.objects for all
  using (
    bucket_id = 'palmistry'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'palmistry'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reports_owner_rw" on storage.objects for all
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Assessment media (icons, question images) is public read, editor-managed.
create policy "assessment_media_public_read" on storage.objects for select
  using (bucket_id = 'assessment-media');

create policy "assessment_media_editor_write" on storage.objects for insert
  with check (bucket_id = 'assessment-media' and is_editor_or_above());

create policy "assessment_media_editor_update" on storage.objects for update
  using (bucket_id = 'assessment-media' and is_editor_or_above());

create policy "assessment_media_editor_delete" on storage.objects for delete
  using (bucket_id = 'assessment-media' and is_editor_or_above());
