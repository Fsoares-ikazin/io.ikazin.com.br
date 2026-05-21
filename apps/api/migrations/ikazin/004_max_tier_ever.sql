-- Ikazin.io — backfill highest tier ever into user.details
-- Run AFTER 001_initial.sql
-- Apply: psql $DB_URL < migrations/ikazin/004_max_tier_ever.sql
--
-- Persists `ikazin_max_tier_ever` inside the existing user JSON payload.
-- This is intentionally schema-less, but existing activated users still need
-- an idempotent backfill so the avatar/topbar identity stays consistent.

BEGIN;

DO $$
DECLARE
    target_table text;
BEGIN
    target_table := CASE
        WHEN to_regclass('public.user') IS NOT NULL THEN '"user"'
        WHEN to_regclass('public.users') IS NOT NULL THEN 'users'
        ELSE NULL
    END;

    IF target_table IS NULL THEN
        RAISE EXCEPTION 'Ikazin 004 could not find user table ("user" or users)';
    END IF;

    EXECUTE format($sql$
        UPDATE %s
        SET details = jsonb_set(
            COALESCE(details::jsonb, '{}'::jsonb),
            '{ikazin_max_tier_ever}',
            to_jsonb(
                CASE
                    WHEN COALESCE(details::jsonb ->> 'ikazin_max_tier_ever', '') = 'premium' THEN 'premium'
                    WHEN COALESCE(details::jsonb ->> 'ikazin_plan', '') = 'premium' THEN 'premium'
                    WHEN COALESCE(details::jsonb ->> 'ikazin_max_tier_ever', '') = 'advanced' THEN 'advanced'
                    WHEN COALESCE(details::jsonb ->> 'ikazin_plan', '') = 'advanced' THEN 'advanced'
                    WHEN COALESCE(details::jsonb ->> 'ikazin_max_tier_ever', '') = 'essentials' THEN 'essentials'
                    WHEN COALESCE(details::jsonb ->> 'ikazin_plan', '') = 'essentials' THEN 'essentials'
                    WHEN COALESCE(details::jsonb ->> 'ikazin_max_tier_ever', '') = 'basic' THEN 'basic'
                    ELSE details::jsonb ->> 'ikazin_plan'
                END
            ),
            true
        )::json
        WHERE COALESCE(details::jsonb ->> 'ikazin_plan', '') IN ('basic', 'essentials', 'advanced', 'premium')
          AND (
                COALESCE(details::jsonb ->> 'ikazin_max_tier_ever', '') = ''
                OR (
                    CASE COALESCE(details::jsonb ->> 'ikazin_max_tier_ever', '')
                        WHEN 'basic' THEN 0
                        WHEN 'essentials' THEN 1
                        WHEN 'advanced' THEN 2
                        WHEN 'premium' THEN 3
                        ELSE -1
                    END
                ) < (
                    CASE COALESCE(details::jsonb ->> 'ikazin_plan', '')
                        WHEN 'basic' THEN 0
                        WHEN 'essentials' THEN 1
                        WHEN 'advanced' THEN 2
                        WHEN 'premium' THEN 3
                        ELSE -1
                    END
                )
          )
    $sql$, target_table);
END $$;

COMMIT;
