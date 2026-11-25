-- V4: Create installed programs table
CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    publisher TEXT,
    version TEXT,
    install_date TEXT,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    uninstall_string TEXT,
    source TEXT
);

CREATE INDEX IF NOT EXISTS idx_programs_name ON programs(name);
CREATE INDEX IF NOT EXISTS idx_programs_publisher ON programs(publisher);