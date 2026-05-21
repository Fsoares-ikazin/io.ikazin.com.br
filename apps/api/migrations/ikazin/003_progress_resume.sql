-- Ikazin.io — progress resume/completion support
-- Run AFTER 002_seed_builds.sql
-- Apply: psql $DB_URL < migrations/ikazin/003_progress_resume.sql

BEGIN;

ALTER TABLE ikazin_progress_meta
    ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE ikazin_progress_meta
SET
    last_watched_at = COALESCE(last_watched_at, updated_at, now()),
    completed = COALESCE(completed, FALSE),
    completed_at = CASE
        WHEN COALESCE(completed, FALSE) = TRUE AND completed_at IS NULL THEN updated_at
        ELSE completed_at
    END;

CREATE INDEX IF NOT EXISTS idx_ikazin_progress_user_last_watched
    ON ikazin_progress_meta(user_id, last_watched_at DESC);

COMMIT;
