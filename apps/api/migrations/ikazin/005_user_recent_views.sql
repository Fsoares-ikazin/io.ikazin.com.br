-- Ikazin.io — user recent views for personalization/continue-watching
-- Run AFTER 004_max_tier_ever.sql
-- Apply: psql $DB_URL < migrations/ikazin/005_user_recent_views.sql

BEGIN;

CREATE TABLE IF NOT EXISTS ikazin_user_recent_views (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 TEXT NOT NULL,
    build_id                INTEGER NOT NULL REFERENCES ikazin_builds(id) ON DELETE CASCADE,
    first_viewed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_viewed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_position_seconds   INTEGER NOT NULL DEFAULT 0,
    last_percent            SMALLINT NOT NULL DEFAULT 0 CHECK (last_percent BETWEEN 0 AND 100),
    completed               BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at            TIMESTAMPTZ,
    total_views             INTEGER NOT NULL DEFAULT 1 CHECK (total_views >= 1),
    UNIQUE (user_id, build_id)
);

CREATE INDEX IF NOT EXISTS idx_ikazin_recent_views_user_last_viewed
    ON ikazin_user_recent_views(user_id, last_viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ikazin_recent_views_build
    ON ikazin_user_recent_views(build_id);

INSERT INTO ikazin_user_recent_views (
    user_id,
    build_id,
    first_viewed_at,
    last_viewed_at,
    last_position_seconds,
    last_percent,
    completed,
    completed_at,
    total_views
)
SELECT
    p.user_id,
    p.build_id,
    COALESCE(p.last_watched_at, p.updated_at, now()) AS first_viewed_at,
    COALESCE(p.last_watched_at, p.updated_at, now()) AS last_viewed_at,
    COALESCE(p.last_position_seconds, 0) AS last_position_seconds,
    COALESCE(p.percent, 0) AS last_percent,
    COALESCE(p.completed, FALSE) AS completed,
    p.completed_at,
    1 AS total_views
FROM ikazin_progress_meta p
ON CONFLICT (user_id, build_id) DO UPDATE SET
    first_viewed_at = LEAST(
        ikazin_user_recent_views.first_viewed_at,
        EXCLUDED.first_viewed_at
    ),
    last_viewed_at = GREATEST(
        ikazin_user_recent_views.last_viewed_at,
        EXCLUDED.last_viewed_at
    ),
    last_position_seconds = CASE
        WHEN EXCLUDED.last_viewed_at >= ikazin_user_recent_views.last_viewed_at
            THEN EXCLUDED.last_position_seconds
        ELSE ikazin_user_recent_views.last_position_seconds
    END,
    last_percent = GREATEST(ikazin_user_recent_views.last_percent, EXCLUDED.last_percent),
    completed = ikazin_user_recent_views.completed OR EXCLUDED.completed,
    completed_at = COALESCE(ikazin_user_recent_views.completed_at, EXCLUDED.completed_at),
    total_views = GREATEST(ikazin_user_recent_views.total_views, 1);

COMMIT;
