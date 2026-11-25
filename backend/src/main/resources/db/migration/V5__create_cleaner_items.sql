-- V5: Create cleaner items table for junk/cache scan results
CREATE TABLE IF NOT EXISTS cleaner_items (
    id TEXT PRIMARY KEY NOT NULL,
    path TEXT NOT NULL,
    category TEXT NOT NULL,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    is_selected INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cleaner_items_category ON cleaner_items(category);
CREATE INDEX IF NOT EXISTS idx_cleaner_items_created_at ON cleaner_items(created_at);