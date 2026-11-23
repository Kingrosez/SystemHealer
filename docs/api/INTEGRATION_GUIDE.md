# Integration Guide

## 1. Purpose
This guide explains how to consume the SystemHealer API.

## 2. Base URL
All endpoints are available at `http://localhost:8080/api/`.

## 3. Using the Frontend Client

### 3.1 API Client Setup

The frontend uses TanStack Query with Axios:

```ts
// src/api/client.ts
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
});

export const queryClient = new QueryClient();
```

### 3.2 Example: Fetch History

```tsx
// src/api/hooks.ts
import { useQuery } from '@tanstack/react-query';
import { api } from './client';

export function useHistory() {
  return useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const response = await api.get<{totalElements: number; content: HistoryEntry[]}>(
        '/history'
      );
      return response.data;
    },
  });
}

// Usage in component
function HistoryList() {
  const { data, isLoading, error } = useHistory();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;

  return (
    <ul>
      {data?.content.map(item => (
        <li key={item.id}>{item.operationType}</li>
      ))}
    </ul>
  );
}
```

## 4. Using SSE for Log Streaming

### 4.1 Setup

```ts
// src/api/logs.ts
export function useRepairLogs(id: number) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:8080/api/repair/${id}/logs`
    );

    eventSource.onmessage = (event) => {
      setLogs(prev => [...prev, event.data]);
    };

    eventSource.addEventListener('complete', () => {
      setIsComplete(true);
      eventSource.close();
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [id]);

  return { logs, isComplete };
}
```

## 5. Mutations with Confirmation

### 5.1 Two-Step Pattern

```ts
// src/api/repair.ts
export async function previewSfc() {
  const response = await api.post<{items: unknown[]; confirmToken: string}>(
    '/repair/sfc/preview'
  );
  return response.data;
}

export async function executeSfc(token: string) {
  return await api.post('/repair/sfc/execute', { token });
}
```

### 5.2 Usage with Mutation

```tsx
function runSfc() {
  const mutation = useMutation({
    mutationFn: executeSfc,
    onSuccess: () => {
      toast.success('SFC started');
      queryClient.invalidateQueries(['history']);
    },
  });

  const handlePreview = async () => {
    const { items, confirmToken } = await previewSfc();
    if (window.confirm(`This will affect ${items.length} files. Proceed?`)) {
      mutation.mutate(confirmToken);
    }
  };

  return (
    <Button onClick={handlePreview} disabled={mutation.isPending}>
      {mutation.isPending ? 'Running...' : 'Run SFC'}
    </Button>
  );
}
```

## 6. Error Handling

### 6.1 Global Error Interceptor

```ts
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.code) {
      // Known error from backend
      showToast({
        title: error.response.data.code,
        description: error.response.data.message,
        variant: 'destructive',
      });
    } else if (error.request) {
      // No response received
      showToast({
        title: 'Network Error',
        description: 'Unable to connect to the service. Is it running?',
        variant: 'destructive',
      });
    }
    return Promise.reject(error);
  }
);
```

## 7. Manual API Calls (cURL)

### 7.1 Get History

```bash
curl -X GET "http://localhost:8080/api/history?page=0&size=50" \
  -H "Accept: application/json"
```

### 7.2 Run SFC

```bash
curl -X POST "http://localhost:8080/api/repair/sfc" \
  -H "Content-Type: application/json" \
  -d '{"createRestorePoint": true}'
```

### 7.3 Stream Logs

```bash
curl -X GET "http://localhost:8080/api/repair/123/logs" \
  -H "Accept: text/event-stream"
```

## 8. Authentication (Future)

When auth is added:

```ts
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 9. Rate Limiting

Current implementation:
- No rate limiting in v1
- Concurrent operations limited in backend (single process)

## 10. Testing with Mock API

Use MSW (Mock Service Worker) for frontend tests:

```ts
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/history', (req, res, ctx) => {
    return res(
      ctx.json({
        content: [{ id: 1, operationType: 'SFC', status: 'COMPLETED' }],
        totalElements: 1,
      })
    );
  }),
];
```