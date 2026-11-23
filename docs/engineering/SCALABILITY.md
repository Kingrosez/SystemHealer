# Scalability Guidelines

## 1. Purpose
This document describes scalability considerations and strategies for SystemHealer.

## 2. Scalability Model

SystemHealer is designed as a **single-user desktop application**. Scalability
is measured as data volume and operation frequency, not concurrent users.

### 2.1 User Scale
- Primary user: One person per installation
- Maximum: Multiple installs in an organization
- No multi-user support planned for v1

### 2.2 Data Scale
- Expected: Hundreds of repair operations logged
- Maximum: Tens of thousands of history entries
- Beyond that: Archive or purge old data

## 3. Database Scalability

### 3.1 Current Design (SQLite/Embedded)
- File-based database
- No connection pooling issues (single process)
- Automatic file locking

### 3.2 Growth Strategies

#### Data Archiving
After 90 days, archive old repair history:

```java
@Scheduled(cron = "0 0 2 * * ?") // 2 AM daily
public void archiveOldHistory() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
    List<RepairHistory> oldRecords = historyRepository
        .findByStartTimeBefore(cutoff, PageRequest.of(0, 1000));

    if (!oldRecords.isEmpty()) {
        // Move to archive file
        archiveRepository.saveAll(oldRecords);
        historyRepository.deleteAll(oldRecords);
    }
}
```

#### Pagination for Large Lists
Always use pagination in API responses:

```java
@GetMapping("/history")
public Page<HistoryEntry> getHistory(@RequestParam(defaultValue = "0") int page) {
    return historyRepository.findAll(PageRequest.of(page, 50));
}
```

### 3.3 Indexing Strategy
Indexes on:
- `id` (primary key, auto)
- `status` (query by status)
- `start_time` (range queries)
- `operation_type` (filter by type)

## 4. API Scalability

### 4.1 Rate Limiting
For v1, rate limiting is not enforced locally. If cloud sync is added:

```java
@RateLimiter(name = "api", fallbackMethod = "rateLimitFallback")
@PostMapping("/repair")
public ResponseEntity<?> runRepair(@RequestBody RepairRequest request) {
    // ...
}
```

### 4.2 Request Throttling
- Maximum concurrent operations: 1 (system repair is intensive)
- Queue operations if needed (future enhancement)

## 5. Frontend Scalability

### 5.1 Virtualized History List
For displays with many entries:

```tsx
const VirtualizedHistory = () => (
  <FixedSizeList
    height={Math.min(window.innerHeight - 200, 800)}
    itemCount={history.length}
    itemSize={100}
    itemData={history}
  >
    {HistoryRow}
  </FixedSizeList>
);
```

### 5.2 Lazy Loading Data
Only fetch data when needed:

```tsx
// Only fetch detail view when opened
const DetailView = lazy(() => {
  return import('./DetailView').then(module => ({
    default: () => <DetailViewContent />
  }));
});
```

### 5.3 Search and Filtering
Handle large datasets on frontend:

```tsx
const filteredHistory = useMemo(() => {
  return history.filter(item => {
    const matchesSearch = item.operationType.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter 
      ? item.startTime >= dateFilter.start && item.startTime <= dateFilter.end
      : true;
    return matchesSearch && matchesDate;
  });
}, [history, searchTerm, dateFilter]);
```

## 6. Windows Integration Scalability

### 6.1 Concurrent Operations Limit
- Only one Windows system command at a time
- Queue or queue-and-run pattern

```java
@Service
public class CommandQueue {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public CompletableFuture<CommandResult> submit(CommandRequest request) {
        return CompletableFuture.supplyAsync(() -> execute(request), executor);
    }

    public boolean isRunning() {
        return !executor.isShutdown();
    }
}
```

### 6.2 Command Duration Management
- Set timeouts for all commands
- Allow cancellation
- Provide cancel UI

```java
public CommandResult executeWithTimeout(String... args) throws TimeoutException {
    Process process = new ProcessBuilder(args).start();
    if (!process.waitFor(60, TimeUnit.SECONDS)) {
        process.destroyForcibly();
        throw new TimeoutException("Command timed out");
    }
    return new CommandResult(process.exitValue(), stdout, stderr);
}
```

## 7. Future Scalability Enhancements

### 7.1 Optional Cloud Sync (Post-v1)
- Sync history to cloud
- Cross-device restore
- Backup and recovery

### 7.2 Multi-Device Management (Post-v1)
- Manage multiple PCs from one interface
- Network deployment

### 7.3 Enterprise Features (Post-v1)
- Centralized logging
- Deployment policies
- Remote management

## 8. Monitoring Scalability

### 8.1 Key Metrics to Track

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Database size | < 100MB | Warn user |
| History entries | < 100k | Recommend archive |
| UI load time | < 1s | Investigate |

### 8.2 Memory Monitoring
Track memory usage during operations:

```java
Runtime runtime = Runtime.getRuntime();
long usedMemory = runtime.totalMemory() - runtime.freeMemory();
if (usedMemory > 500_000_000) { // 500MB
    log.warn("High memory usage: {} MB", usedMemory / 1024 / 1024);
}
```

## 9. Performance vs. Scalability Trade-offs

| Feature | Performance | Scalability | Decision |
|---------|-------------|-------------|----------|
| In-memory search | Fast | Limited to loaded data | Use for < 1000 items |
| Database query | Moderate | Scales well | Use for all queries |
| Full history render | Slow | Memory intensive | Virtualized list |
| Real-time log streaming | Fast | Scales with CPU | SSE streaming |

## 10. Archive Strategy

When history exceeds threshold:

1. **Automatic Archive**: Move entries older than 1 year to `history-archive.db`
2. **Manual Archive**: User triggers export to JSON
3. **Purge**: User can delete archived data

```java
public void archiveHistory(int years = 1) {
    LocalDateTime cutoff = LocalDateTime.now().minusYears(years);
    List<RepairHistory> oldEntries = historyRepository.findByStartTimeBefore(cutoff);
    
    try (ArchiveWriter writer = new ArchiveWriter(archivePath)) {
        writer.write(oldEntries);
        historyRepository.deleteAll(oldEntries);
    }
}
```

## 11. Limits and Boundaries

Current hard limits:
- Database: SQLite limit (~140TB file size, practical limit: 10GB)
- History: No hard limit, but UI performance degrades > 100k entries
- Files monitored: Limited by Windows enumeration speed

These limits are far beyond expected usage and unlikely to be hit in v1.