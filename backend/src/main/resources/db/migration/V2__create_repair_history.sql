-- V2: Create repair history table for completed repair runs
CREATE TABLE IF NOT EXISTS repair_history (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL,
    actions TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL,
    repaired_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    summary TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_repair_history_task_id ON repair_history(task_id);
CREATE INDEX IF NOT EXISTS idx_repair_history_started_at ON repair_history(started_at);