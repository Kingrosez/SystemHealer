-- V7: Create restore points table
CREATE TABLE IF NOT EXISTS restore_points (
    id TEXT PRIMARY KEY NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL,
    sequence_number INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_restore_points_created_at ON restore_points(created_at);
CREATE INDEX IF NOT EXISTS idx_restore_points_sequence ON restore_points(sequence_number);