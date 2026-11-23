# Performance

## 1. Purpose
This document defines the performance expectations, budgets, and strategies for
SystemHealer. Because the app runs long system commands and scans large file trees,
performance is about **perceived responsiveness** and **resource safety**, not raw
throughput.

## 2. Performance Goals

| Area | Goal |
|------|------|
| UI first paint | < 1.5 s on a mid-range Windows 10 machine |
| Tab navigation | < 200 ms |
| API response (simple GET) | < 300 ms |
| Scan start feedback | < 1 s (user sees "scanning…" immediately) |
| Live log latency (SSE) | < 500 ms per line |
| Duplicate scan (10,000 files) | < 60 s |
| Memory footprint (idle) | < 300 MB total (frontend + backend) |
| Memory footprint (duplicate scan) | < 800 MB |
| Cancel response time | < 2 s after user clicks Cancel |

## 3. Frontend Performance

### 3.1 Bundle Size
- Initial JS bundle target: **< 300 KB gzipped**.
- Route-level code splitting via `React.lazy` + `Suspense`.
- No large UI libraries beyond Tailwind + shadcn/ui primitives.
- Tree-shake imports; avoid importing entire libraries.

### 3.2 Rendering
- Long lists (installed programs, duplicate groups) must use virtualization
  (TanStack Virtual or equivalent) once > 100 rows.
- Avoid re-rendering entire lists on single-item changes; memoize row components.
- Use `React.memo` only where profiling shows benefit — not by default.

### 3.3 Data Fetching
- TanStack Query caches server state; default `staleTime` = 30 s for read-only
  lists (installed programs, history).
- No polling unless necessary; prefer SSE for live updates.
- Paginate large result sets (history, duplicate files).

### 3.4 Long-Running Operations UI
- Never block the UI thread during scans or repairs.
- Show progress indicator + live log within 1 s of starting.
- Allow cancellation at any time.

## 4. Backend Performance

### 4.1 Startup
- Cold start target: **< 5 s** on a mid-range machine.
- Lazy-initialize heavy components (winget detection, DB migrations) where possible.
- Avoid eager loading of large datasets at startup.

### 4.2 Command Execution
- Stream stdout/stderr line-by-line (do not buffer entire output in memory).
- Cap in-memory log buffer per operation (e.g., last 5,000 lines); persist full
  logs to DB asynchronously.
- Enforce timeouts (see `ERROR_HANDLING.md`).
- Support cancellation: track running processes by task ID; kill on cancel.

### 4.3 File System Scans
- Use streaming directory walks (`Files.walkFileTree`), not recursive list-all.
- Duplicate detection two-pass strategy:
  1. Group by size (fast, in-memory map).
  2. Hash only candidates (SHA-256), in parallel with bounded thread pool.
- Bounded thread pool: default 4 worker threads for hashing (I/O bound).
- Skip system-critical directories by default (`C:\Windows`, `$Recycle.Bin`).

### 4.4 Database
- Batch inserts for log lines and cleanup items (e.g., 500 rows per batch).
- Index foreign keys and frequently queried columns (see `docs/database/DATABASE_DESIGN.md`).
- Prune old log lines per retention policy (see `docs/operations/BACKUP_AND_RECOVERY.md`).

### 4.5 SSE Streaming
- Use a bounded queue per SSE connection to prevent memory blowup on slow clients.
- Drop oldest log lines if the client falls behind (with a "[truncated]" marker).
- Close SSE connections on operation completion or cancellation.

## 5. Resource Safety

- **Memory**: never load an entire file tree into memory; stream and aggregate.
- **CPU**: cap parallel hashing threads; yield to the OS during long scans.
- **Disk**: preview sizes before deletion; never auto-delete without confirmation.
- **Processes**: track all spawned processes; kill on cancel or app shutdown.

## 6. Profiling & Measurement

- Frontend: React DevTools Profiler, Lighthouse (bundle size), Chrome Performance tab.
- Backend: Spring Boot Actuator metrics, JFR (Java Flight Recorder) for CPU/memory.
- Establish baselines before optimizing; do not optimize prematurely.

## 7. Performance Anti-Patterns to Avoid

| Anti-pattern | Why it hurts |
|--------------|--------------|
| Loading all files into memory for duplicate scan | OOM on large drives |
| Polling the backend every second | Wasted CPU, battery drain |
| Rendering 10,000-row tables without virtualization | UI freeze |
| Buffering full command output before streaming | Delayed feedback, memory spikes |
| Synchronous file I/O on the UI thread | Frozen UI |
| Unbounded thread pools for hashing | CPU starvation, disk thrash |

## 8. Regression Guardrails (Future)

- CI should fail if the frontend bundle exceeds 350 KB gzipped.
- CI should fail if cold start exceeds 8 s.
- Benchmark scripts for duplicate scan and SFC streaming (manual for now).

## 9. Related Documents
- `docs/engineering/ERROR_HANDLING.md`
- `docs/engineering/SCALABILITY.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/operations/OBSERVABILITY.md`

## 10. Status
Draft — v0.1