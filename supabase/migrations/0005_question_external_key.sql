-- A stable, human-assigned key for questions authored via the seed pipeline
-- (or, later, an admin builder), independent of the internal UUID. Lets
-- `npm run seed` upsert idempotently instead of duplicating rows on every
-- run, and is what makes cross-assessment question reuse addressable by
-- name (e.g. the flagship profile reusing Logical Reasoning's items).
alter table questions add column external_key text unique;

create index questions_external_key_idx on questions (external_key);
