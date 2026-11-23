# Performance Guidelines

## 1. Purpose
This document defines performance expectations and optimization guidelines for
SystemHealer.

## 2. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| App startup | < 3 seconds | Time from launch to UI ready |
| Dashboard load | < 1 second | Time to render history cards |
| SFC scan | User-visible progress | Streaming output |
| Backend API | < 100ms (cache hit) | Response time p95 |
| Database query | < 10ms | Simple queries by ID |
| Memory usage | < 500MB | During heavy operations |

## 3. Backend Performance

### 3.1 Database Query Optimization

#### N+1 Problem Prevention
Use JOIN FETCH or @EntityGraph:

```java
@EntityGraph(attributePaths = {"restorePoints"})
Optional<RepairHistory> findById(Long id);

// Not recommended - causes N+1
List<RepairHistory> histories = repository.findAll();
histories.forEach(h -> System.out.println(h.getRestorePoints().size()));
```

#### Pagination for Large Lists
```java
@GetMapping("/history")
public Page<HistoryEntry> getHistory(Pageable pageable) {
    return historyRepository.findAll(pageable);
}
```

#### Index Usage
All foreign key columns are indexed. Frequently queried columns (`status`,
`start_time`) also have indexes.

### 3.2 Caching Strategy

#### In-Memory Caching
Use `@Cacheable` for read-heavy operations:

```java
@Cacheable("config")
public AppSettings getSettings() {
    return settingsRepository.findFirst();
}
```

Cache invalidation:
```java
@CacheEvict("config")
public AppSettings updateSettings(AppSettings settings) {
    return settingsRepository.save(settings);
}
```

### 3.3 Streaming for Large Responses

Use SSE for log streaming:

```java
@GetMapping(value = "/repair/{id}/logs", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> streamLogs(@PathVariable Long id) {
    return logService.streamLogs(id);
}
```

### 3.4 Connection Pooling

HikariCP is the default (Spring Boot 3.x). Configure:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
```

### 3.5 Process Execution Optimization

- Execute Windows commands in parallel when possible
- Use timeouts to prevent hanging (`process.waitFor(30, TimeUnit.SECONDS)`)
- Stream output instead of buffering

## 4. Frontend Performance

### 4.1 Code Splitting

React.lazy for route-based code splitting:

```tsx
const RepairPage = lazy(() => import('./pages/RepairPage'));

const router = createBrowserRouter([
  { path: '/repair', element: <Suspense fallback={<Progress />}><RepairPage /></Suspense> },
]);
```

### 4.2 Memoization

Use React.memo for expensive components:

```tsx
const HistoryCard = React.memo(({ repair }) => {
  return (
    <Card>
      <h3>{repair.operationType}</h3>
      <p>{formatDate(repair.startTime)}</p>
    </Card>
  );
});
```

Use useMemo for computed values:

```tsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 4.3 Virtualized Lists

For large lists of history entries:

```tsx
import {FixedSizeList} from 'react-window';

const HistoryList = () => (
  <FixedSizeList height={600} itemCount={1000} itemSize={80}>
    {({ index, style }) => (
      <div style={style}><HistoryCard id={index} /></div>
    )}
  </FixedSizeList>
);
```

### 4.4 Image Optimization
- SVG icons from shadcn/ui (inline, no network request)
- No raster images in v1

### 4.5 Bundle Optimization

Check bundle size:

```bash
npm run build
npx vite-bundle-analyzer dist/stats.json
```

Bundle budget:
- Initial load: < 500KB gzipped
- Each route: < 200KB additional

## 5. Windows System Performance

### 5.1 Background Operations

Long-running operations (DISM, SFC) run in background:
- Don't block the UI
- Provide real-time progress
- Allow cancellation

### 5.2 Resource Usage Limits

Monitor and limit:
- CPU: Target < 50% during normal operation
- Memory: Release resources after operations
- Disk I/O: Queue file operations

### 5.3 Cancellation Support

```java
public void cancelRepair(Long id) {
    Process process = processRegistry.get(id);
    if (process != null) {
        process.destroy();
    }
    historyRepository.updateStatus(id, Status.CANCELLED);
}
```

## 6. Performance Testing

### 6.1 Load Testing

API endpoints tested with:
- k6 or similar tool
- Concurrent users: 10 (local usage)
- Requests per second: 100

### 6.2 Stress Testing

- Large database (100k+ history entries)
- Concurrent repairs (not possible, but API handles multiple requests)
- Low memory conditions

### 6.3 Performance Profiling

Backend:
```bash
# Enable profiling
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-XX:+FlightRecorder"

# Analyze with JDK Mission Control
```

Frontend:
```bash
# Chrome DevTools Performance tab
# React DevTools Profiler
```

## 7. Optimization Checklist

Before each release:

- [ ] Check API response times (should be < 100ms for cached ops)
- [ ] Profile heavy UI components
- [ ] Verify database query plans for new queries
- [ ] Measure app startup time
- [ ] Check memory usage after long operations
- [ ] Test on low-end hardware (if feasible)