-- Ikazin.io — rename column + add tags + seed 25 builds
-- Run AFTER 001_initial.sql
-- Apply: psql $DB_URL < migrations/ikazin/002_seed_builds.sql

BEGIN;

ALTER TABLE ikazin_builds RENAME COLUMN number TO build_number;
ALTER TABLE ikazin_builds ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

INSERT INTO ikazin_builds (build_number, title, tier, tags) VALUES
(1,  'Boolean Logic Fundamentals',    'basic',       '{logic,ladder}'),
(2,  'Timer & Counter Basics',        'basic',       '{timer,counter,ladder}'),
(3,  'Analog Sensor 0-10V',           'basic',       '{analog,sensor}'),
(4,  'Multiaxis Drive Fundamentals',  'basic',       '{drive,sinamics}'),
(5,  'Esteira Digital',               'basic',       '{conveyor,digital}'),
(6,  'Volume Encoder+Laser',          'basic',       '{encoder,sensor}'),
(7,  'G120 SINA_SPEED',               'basic',       '{g120,sinamics,speed}'),
(8,  'SINA_POS Sync',                 'basic',       '{sinamics,positioning}'),
(9,  'PID Control Loop',              'essentials',  '{pid,control}'),
(10, 'Cam Profile Basics',            'essentials',  '{cam,motion}'),
(11, 'Synchronized Axes',             'essentials',  '{sync,axis}'),
(12, 'Flying Sheet',                  'essentials',  '{flying,sheet,sync}'),
(13, 'Conveyor + Reject System',      'essentials',  '{conveyor,reject}'),
(14, 'SINAMICS S120 Commissioning',   'advanced',    '{s120,commissioning,starter}'),
(15, 'Speed Control MC_MoveVelocity', 'advanced',    '{s120,plcopen,motion}'),
(16, 'Electronic Gearing',            'advanced',    '{gearing,sync,flying-saw}'),
(17, 'Rotary Knife Application',      'advanced',    '{rotary-knife,position,cam}'),
(18, 'Winder Tension Control',        'advanced',    '{winder,tension,pid}'),
(19, 'Pick & Place',                  'premium',     '{pick-place,cartesian,kinematics}'),
(20, 'Cut / Fill On The Fly',         'premium',     '{cut,fill,sync}'),
(21, 'SCARA Robot',                   'premium',     '{scara,kinematics,robot}'),
(22, 'Delta Robot',                   'premium',     '{delta,parallel,high-speed}'),
(23, 'CNC G-code',                    'premium',     '{cnc,g-code,trajectory}'),
(24, 'SIMOTION D',                    'premium',     '{simotion,advanced}'),
(25, 'Digital Twin Communication',    'premium',     '{digital-twin,opc-ua}')
ON CONFLICT (build_number) DO NOTHING;

COMMIT;
