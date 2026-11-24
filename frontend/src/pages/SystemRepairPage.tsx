import { useRepairOptions, useRepairHistory } from '@/hooks/useRepair'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function SystemRepairPage() {
  const { data: options, isLoading: optionsLoading } = useRepairOptions()
  const { data: history, isLoading: historyLoading } = useRepairHistory()

  if (optionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">System Repair</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Run SFC, DISM, and other repair tools to fix system issues.
        </p>
      </div>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Available Tools</h3>
        <div className="space-y-2">
          {options?.options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{opt.name}</p>
                <p className="text-xs text-muted-foreground">ID: {opt.id}</p>
              </div>
              <Badge
                variant={
                  opt.risk === 'low'
                    ? 'default'
                    : opt.risk === 'medium'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {opt.risk}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Recent Repairs</h3>
        {historyLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : history && history.items.length > 0 ? (
          <div className="space-y-2">
            {history.items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.actions.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.startedAt).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={item.status === 'SUCCESS' ? 'default' : 'secondary'}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No repair history yet.</p>
        )}
      </Card>
    </div>
  )
}