-- V3: Create repair log lines table for SSE streaming
CREATE TABLE IF NOT EXISTS repair_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    line TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'INFO',
    step TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_repair_logs_task_id ON repair_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_repair_logs_timestamp ON repair_logs(timestamp);