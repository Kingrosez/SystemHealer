-- V8: Create app settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY NOT NULL,
    log_retention_days INTEGER NOT NULL DEFAULT 90,
    default_scan_roots_json TEXT NOT NULL DEFAULT '["C:\\Users"]',
    theme TEXT NOT NULL DEFAULT 'system',
    create_restore_point_by_default INTEGER NOT NULL DEFAULT 1
);