-- V6: Create duplicate groups and files tables
CREATE TABLE IF NOT EXISTS duplicate_groups (
    id TEXT PRIMARY KEY NOT NULL,
    hash TEXT NOT NULL,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    file_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_duplicate_groups_hash ON duplicate_groups(hash);

CREATE TABLE IF NOT EXISTS duplicate_files (
    id TEXT PRIMARY KEY NOT NULL,
    group_id TEXT NOT NULL,
    path TEXT NOT NULL,
    modified_at TEXT,
    is_selected INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES duplicate_groups(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_duplicate_files_group_id ON duplicate_files(group_id);