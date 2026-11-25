-- V1: Create tasks table for tracking long-running operations
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    current_step TEXT,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    error_code TEXT,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_started_at ON tasks(started_at);