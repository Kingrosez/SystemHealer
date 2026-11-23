# Scalability

## 1. Purpose
This document defines what scalability means for SystemHealer, the dimensions in
which the system must grow gracefully, and the strategies used to handle growth.
Because SystemHealer is a **single-user Windows desktop tool**, scalability here is
primarily **vertical** (larger drives, more files, longer history) — not horizontal
(more users, more servers).

## 2. Scope of Scalability

| Dimension | Growth Vector | Concern |
|-----------|---------------|---------|
| Storage scanned | Small SSD → multi-TB HDD | Duplicate scan time, memory |
| File count | Thousands → millions | Directory walk, hashing |
| Repair history | Days → years | DB size, query time |
| Log volume | Hundreds → millions of lines | DB size, UI rendering |
| Concurrent operations | 1 → 2–3 (user multitasking) | Thread pools, cancellation |
| Installed programs | Dozens → hundreds | List rendering, update scan |

## 3. Explicit Non-Goals

SystemHealer is **not** designed to scale horizontally:

- No multi-user support.
- No remote/cloud deployment.
- No distributed command execution.
- No clustered database.

If any of these become requirements, they require a new architecture (see
`docs/architecture/ARCHITECTURE_DECISIONS.md`).

## 4. Strategies by Dimension

### 4.1 Large Drives / Many Files
- Streaming directory walk — never load a full tree into memory.
- Two-pass duplicate detection (size grouping → hash candidates only).
- Bounded thread pool for hashing (default 4 threads).
- Configurable scan roots; default excludes `C:\Windows`, `$Recycle.Bin`,
  and system restore folders.
- Progress reporting via SSE so long scans don't appear frozen.

### 4.2 Growing Repair History
- Paginated history API (`?page=&size=`); default page size 50.
- Indexed queries on `created_at` and `status`.
- Retention policy (configurable, default 90 days) with background pruning
  (see `docs/operations/BACKUP_AND_RECOVERY.md`).

### 4.3 Growing Log Volume
- Per-operation log cap in memory (last 5,000 lines).
- Batch inserts to DB (500 rows per batch).
- Virtualized log viewer in the frontend for long logs.
- Archived logs compressed or pruned per retention policy.

### 4.4 Multiple Concurrent Operations
- Each long-running operation has a `taskId` and its own SSE channel.
- Background thread pool with bounded size for command execution.
- Cancel endpoint per task (`POST /api/tasks/{id}/cancel`).
- UI shows per-task status; no global blocking.

### 4.5 Installed Programs List
- Virtualized list rendering once > 100 rows.
- Cached registry scan with short TTL (e.g., 30 s) to avoid repeated reads.
- Winget upgrade scan is throttled and cached.

## 5. Limits and Guardrails

| Limit | Default | Configurable |
|-------|---------|--------------|
| Max log lines in memory per task | 5,000 | Yes |
| DB batch insert size | 500 | Yes |
| Hashing thread pool size | 4 | Yes |
| History page size | 50 | Yes |
| Log retention (days) | 90 | Yes |
| Max concurrent long tasks | 2 | Yes |
| Duplicate scan max file size (skip above) | 4 GB | Yes |

These limits prevent runaway memory/CPU use and keep the app responsive.

## 6. When to Revisit This Document

Revisit scalability if any of the following become true:

- Users report scans taking > 5 minutes on typical drives.
- DB size exceeds 1 GB for a typical user.
- More than 2 concurrent long operations are commonly needed.
- A multi-user or remote-management requirement emerges.
- The app is ported to a new platform.

Each of these may require a new ADR.

## 7. Related Documents
- `docs/engineering/PERFORMANCE.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/ARCHITECTURE_DECISIONS.md`
- `docs/operations/BACKUP_AND_RECOVERY.md`
- `docs/database/DATABASE_DESIGN.md`

## 8. Status
Draft — v0.1