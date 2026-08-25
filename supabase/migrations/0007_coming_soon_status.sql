-- A distinct status for assessments that are on the public roadmap and
-- shown in the catalogue as a teaser, but have no content authored yet and
-- are never startable. Kept separate from 'draft' (which is
-- admin/editor-only and invisible to regular users) since coming-soon
-- entries are deliberately public-facing.
--
-- Split into its own migration file (rather than combined with the policy
-- update that uses this value): PostgreSQL disallows using a newly added
-- enum value within the same transaction that added it.
alter type assessment_status add value 'coming_soon';
