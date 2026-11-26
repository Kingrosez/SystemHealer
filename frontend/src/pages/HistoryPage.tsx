import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepairHistory } from '@/hooks/useRepair'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isApiError } from '@/lib/api'
import { AlertCircle, History } from 'lucide-react'

const PAGE_SIZE = 20

function formatDuration(startedAt: string, finishedAt: string | null) {
  if (!finishedAt) return '—'

  const milliseconds =
    new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '—'

  const seconds = Math.round(milliseconds / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function statusVariant(status: string) {
  switch (status) {
    case 'SUCCESS':
      return 'success' as const
    case 'FAILED':
      return 'destructive' as const
    case 'RUNNING':
      return 'warning' as const
    default:
      return 'secondary' as const
  }
}

export function HistoryPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isFetching, error } = useRepairHistory(
    page,
    PAGE_SIZE
  )

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">History</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Past repair runs and their outcomes.
          </p>
        </div>
        <Link
          to="/system-repair"
          className="text-sm text-primary hover:underline"
        >
          Run a repair
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load history</AlertTitle>
          <AlertDescription>
            {isApiError(error)
              ? error.userMessage
              : 'An unexpected error occurred while loading history.'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <Card className="divide-y divide-border p-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {item.actions.length > 0
                      ? item.actions.join(', ')
                      : 'Repair run'}
                  </p>
                  <Badge variant={statusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(item.startedAt).toLocaleString()} ·{' '}
                  {formatDuration(item.startedAt, item.finishedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="text-success">
                  {item.summary?.repaired ?? 0} repaired
                </span>
                <span className="text-destructive">
                  {item.summary?.failed ?? 0} failed
                </span>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <History className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="font-semibold">No history yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Repair runs will appear here after they complete.
          </p>
          <Button asChild className="mt-4">
            <Link to="/system-repair">Run a repair</Link>
          </Button>
        </Card>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages} · {total} run(s)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0 || isFetching}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
              disabled={page >= totalPages - 1 || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
