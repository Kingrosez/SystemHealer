# Backup and Recovery

## 1. Purpose
This document defines how SystemHealer backs up and restores its own data
(SQLite database, logs, settings) and how it recovers from crashes, corruption,
or failed migrations. Note: this is about **app data**; system-level recovery
(restore points, rollback) is covered in `docs/security/SECURITY.md` and the
Recovery module docs.

## 2. What Needs Backup

| Data | Location | Criticality |
|------|----------|-------------|
| SQLite database | `%APPDATA%\SystemHealer\systemhealer.db` | High |
| Logs | `%APPDATA%\SystemHealer\logs\` | Medium |
| Settings | Inside DB (`app_settings`) | High |
| Registry backups (`.reg`) | `%APPDATA%\SystemHealer\registry-backups\` | High |

## 3. Backup Strategy

### 3.1 Automatic Backups
- Before each Flyway migration: copy `systemhealer.db` →
  `systemhealer.db.bak-<timestamp>`.
- Before any destructive cleanup/uninstall: optional DB snapshot (cheap, small).
- Keep the last 5 automatic backups; prune older ones.

### 3.2 Manual Backup
- Settings → "Backup data now" → creates a ZIP with DB + settings + registry
  backups.
- Saved to a user-chosen folder.

### 3.3 Backup Format

```text
systemhealer-backup-2026-11-23.zip
├── systemhealer.db
├── registry-backups/
├── logs/ (last 7 files)
└── manifest.json (version, date, app version)
```

## 4. Restore Strategy

### 4.1 Manual Restore
1. Close the app.
2. Settings → "Restore from backup" (or replace the DB file manually).
3. App validates the backup (manifest + DB integrity) before restoring.
4. Existing DB is renamed to `systemhealer.db.pre-restore-<timestamp>` (safety).
5. Restore proceeds; app restarts.

### 4.2 Restore Validation
- Check `manifest.json` exists and matches schema version.
- Run `PRAGMA integrity_check` on the SQLite file.
- If validation fails, abort and keep the current DB.

### 4.3 Version Compatibility
- Restoring an older DB triggers Flyway migrations on next start.
- Restoring a newer DB (from a future version) is rejected with a clear message.

## 5. Crash Recovery

### 5.1 Startup Recovery
- On startup, mark any `RUNNING` tasks as `FAILED` (app crashed mid-operation).
- Detect incomplete cleanup sessions and log them.
- If the DB is locked or corrupt:
  - Try to open read-only.
  - Offer the user a "Restore from backup" prompt.

### 5.2 Corrupt DB Handling
- If `PRAGMA integrity_check` fails:
  1. Rename the corrupt DB to `systemhealer.db.corrupt-<timestamp>`.
  2. Attempt to open the latest automatic backup.
  3. If none, create a fresh DB and inform the user.

## 6. Migration Safety

- Flyway migrations run at startup.
- Before migrating: automatic DB backup (see 3.1).
- If a migration fails:
  - Restore the pre-migration backup automatically.
  - Log the failure with the migration version.
  - App starts with the previous schema and shows an error.

## 7. Log Rotation & Retention

- Logs roll daily or at 10 MB; keep 7 files.
- DB log lines pruned per `logRetentionDays` (default 90).
- Backup ZIPs are not pruned automatically (user-managed).

## 8. Data Export

- Export history to CSV/JSON (future) for external record-keeping.
- Export logs as ZIP (see `OBSERVABILITY.md`).

## 9. Disaster Scenarios

| Scenario | Response |
|----------|----------|
| App won't start (DB corrupt) | Offer restore from backup; else fresh DB |
| Migration failure | Auto-restore pre-migration backup |
| Power loss mid-cleanup | Tasks marked FAILED; audit log shows what completed |
| Disk full during backup | Abort backup; warn user; no partial file kept |
| User deleted DB file | App recreates empty DB; history lost (warn) |

## 10. Testing Recovery

- Automated test: corrupt DB → app recovers from backup.
- Automated test: failed migration → auto-restore.
- Manual test: export → wipe → restore → verify history intact.

## 11. Related Documents
- `docs/architecture/DATABASE_DESIGN.md`
- `docs/database/DATABASE_DESIGN.md`
- `docs/operations/CONFIGURATION.md`
- `docs/operations/OBSERVABILITY.md`
- `docs/security/SECURITY.md`

## 12. Status
Draft — v0.1