-- Ikazin.io — initial schema
-- Run AFTER LearnHouse migrations. Never modifies LH tables.
-- Apply manually: psql $DB_URL < migrations/ikazin/001_initial.sql

BEGIN;

CREATE TYPE ikazin_build_tier AS ENUM ('basic', 'essentials', 'advanced', 'premium');

CREATE TABLE IF NOT EXISTS ikazin_builds (
    id              SERIAL PRIMARY KEY,
    uuid            UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    number          SMALLINT NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 25),
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    tier            ikazin_build_tier NOT NULL,
    vimeo_video_id  TEXT,
    exe_file_key    TEXT,
    tia_portal_file_key TEXT,
    pdf_guide_key   TEXT,
    duration_minutes SMALLINT,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ikazin_progress_meta (
    id                      SERIAL PRIMARY KEY,
    user_id                 TEXT NOT NULL,
    build_id                INTEGER NOT NULL REFERENCES ikazin_builds(id) ON DELETE CASCADE,
    percent                 SMALLINT NOT NULL DEFAULT 0 CHECK (percent BETWEEN 0 AND 100),
    last_position_seconds   INTEGER NOT NULL DEFAULT 0,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, build_id)
);

CREATE TABLE IF NOT EXISTS ikazin_downloads (
    id              SERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL,
    build_id        INTEGER NOT NULL REFERENCES ikazin_builds(id) ON DELETE CASCADE,
    file_type       TEXT NOT NULL CHECK (file_type IN ('exe', 'tia_portal', 'pdf_guide')),
    downloaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ikazin_progress_user ON ikazin_progress_meta(user_id);
CREATE INDEX IF NOT EXISTS idx_ikazin_downloads_user ON ikazin_downloads(user_id);

COMMIT;
