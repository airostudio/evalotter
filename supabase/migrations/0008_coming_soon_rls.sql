drop policy "assessments_public_read_published" on assessments;
create policy "assessments_public_read_published" on assessments for select
  using (status in ('published', 'coming_soon') or is_editor_or_above());
