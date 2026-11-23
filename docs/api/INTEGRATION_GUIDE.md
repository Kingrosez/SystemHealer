# Integration Guide

## 1. Purpose
This guide explains how the React frontend integrates with the Spring Boot backend
defined in `API_CONTRACT.md`. It covers the API client, TanStack Query patterns,
SSE streaming, error normalization, and the confirmation-token flow.

## 2. Base Setup

- Backend base URL: `http://127.0.0.1:8080/api`
- The URL is read from `VITE_API_BASE_URL` (defaults to the above in dev).
- All requests are JSON unless noted (SSE uses `text/event-stream`).

`.env.development`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

## 3. API Client (`src/lib/api.ts`)

All API calls go through a single typed client. Components never call `fetch`
directly.

### 3.1 Error Normalization

```ts
export type ApiError = {
  status: number;
  code: string;
  message: string;
  userMessage: string;
  traceId?: string;
};

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      status: res.status,
      code: body.code ?? 'UNKNOWN',
      message: body.message ?? res.statusText,
      userMessage: body.userMessage ?? 'Something went wrong. Please try again.',
      traceId: body.traceId,
    } satisfies ApiError;
  }
  return res.json() as Promise<T>;
}
```

### 3.2 Typed Endpoint Helpers

```ts
export const api = {
  health: () => apiFetch<Health>('/health'),
  systemInfo: () => apiFetch<SystemInfo>('/system/info'),
  repair: {
    options: () => apiFetch<RepairOptions>('/repair/options'),
    start: (body: StartRepairRequest) =>
      apiFetch<StartTaskResponse>('/repair/start', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    cancel: (taskId: string) =>
      apiFetch<void>(`/repair/${taskId}/cancel`, { method: 'POST' }),
    history: (page = 0, size = 50) =>
      apiFetch<Page<RepairHistoryItem>>(`/repair/history?page=${page}&size=${size}`),
  },
  // ...one namespace per module
};
```

## 4. TanStack Query Patterns

### 4.1 Query Client Setup

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 4.2 Read Queries

```tsx
export function useRepairHistory(page = 0) {
  return useQuery({
    queryKey: ['repair', 'history', page],
    queryFn: () => api.repair.history(page),
  });
}
```

### 4.3 Mutations

```tsx
export function useStartRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StartRepairRequest) => api.repair.start(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repair', 'history'] });
    },
  });
}
```

### 4.4 Query Key Conventions

| Module | Key pattern |
|--------|-------------|
| Repair | `['repair', 'options']`, `['repair','history',page]` |
| Programs | `['programs', {search,page}]` |
| Cleaner | `['cleaner','scan',scanId]`, `['cleaner','duplicates',page]` |
| Updater | `['updater','scan']` |
| Recovery | `['recovery','restorePoints']` |
| Settings | `['settings']` |

## 5. SSE Streaming

Long-running tasks return a `taskId` and a `streamUrl`. The frontend opens an
`EventSource` and listens for `log`, `progress`, and `complete` events.

```ts
export function useTaskStream(taskId: string | null) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [status, setStatus] = useState<'idle'|'running'|'done'>('idle');

  useEffect(() => {
    if (!taskId) return;
    setStatus('running');
    const es = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}/tasks/${taskId}/stream`
    );
    es.addEventListener('log', (e) => {
      setLines((prev) => [...prev, JSON.parse((e as MessageEvent).data)]);
    });
    es.addEventListener('progress', (e) => {
      // update progress bar
    });
    es.addEventListener('complete', (e) => {
      setStatus('done');
      es.close();
    });
    es.onerror = () => {
      setStatus('done');
      es.close();
    };
    return () => es.close();
  }, [taskId]);

  return { lines, status };
}
```

Rules:
- Always close the `EventSource` on unmount and on `complete`.
- Cap rendered log lines (e.g., last 5,000) to avoid UI slowdown.
- Show a "connection lost" banner if `onerror` fires unexpectedly.

## 6. Confirmation Token Flow (Destructive Actions)

Destructive endpoints are two-step. The frontend must:

1. Call `.../preview` → receive items + `confirmToken`.
2. Show a confirmation dialog with the preview.
3. On confirm, call `.../execute` with the token and selected items.

```ts
const preview = await api.cleaner.preview({ roots, categories });
// show dialog with preview.items and preview.totalSizeBytes
await api.cleaner.execute({
  confirmToken: preview.confirmToken,
  paths: selectedPaths,
});
```

Rules:
- Never auto-confirm — always require a user click.
- Tokens expire in 5 minutes; if expired, re-preview.
- If the server returns 409 `WOULD_DELETE_ALL_COPIES`, show a warning and keep
  at least one file selected per group.

## 7. Error Handling in the UI

- Every query/mutation shows loading, error, and empty states.
- Display `userMessage` from `ApiError`, never `message` or stack traces.
- Provide a "Retry" button on error states.
- Log the `traceId` in the console (dev only) for debugging.

```tsx
if (query.isLoading) return <Skeleton />;
if (query.isError) {
  return (
    <ErrorPanel
      message={(query.error as ApiError).userMessage}
      onRetry={() => query.refetch()}
    />
  );
}
if (!query.data?.items.length) return <EmptyState />;
```

## 8. Environment & CORS

- Backend CORS allows `http://localhost:5173` (Vite dev) and the packaged origin.
- In production (static files served by Spring Boot), requests are same-origin.
- No credentials/cookies are used in v1.

## 9. Testing the Integration

- Mock the API client with MSW (Mock Service Worker) in component tests.
- Contract tests: validate response shapes against fixtures generated from
  `API_CONTRACT.md`.
- Manual smoke test: `GET /api/health` from the browser should return
  `{"status":"ok"}`.

## 10. Related Documents
- `docs/api/API_CONTRACT.md`
- `docs/engineering/ERROR_HANDLING.md`
- `docs/frontend/UI_UX_GUIDELINES.md`
- `docs/architecture/TECH_STACK.md`

## 11. Status
Draft — v0.1