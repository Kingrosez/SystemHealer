import { useState } from 'react'
import { useRepairOptions, useRepairHistory } from '@/hooks/useRepair'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmRepairDialog } from '@/components/dialogs/ConfirmRepairDialog'
import { isApiError } from '@/lib/api'
import { Link } from 'react-router-dom'
import { AlertCircle, Play } from 'lucide-react'

export function SystemRepairPage() {
  const {
    data: options,
    isLoading: optionsLoading,
    error: optionsError,
  } = useRepairOptions()
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useRepairHistory()
  const [selected, setSelected] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggleAction = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const allIds = options?.options.map((option) => option.id) ?? []
  const allSelected = allIds.length > 0 && selected.length === allIds.length

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

      {optionsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load repair tools</AlertTitle>
          <AlertDescription>
            {isApiError(optionsError)
              ? optionsError.userMessage
              : 'Could not fetch the available repair tools.'}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Available Tools</h3>
          {allIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelected(allSelected ? [] : allIds)
              }
            >
              {allSelected ? 'Clear' : 'Select All'}
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {options?.options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.id)}
                  onChange={() => toggleAction(opt.id)}
                />
                <div>
                  <p className="font-medium">{opt.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {opt.id}</p>
                </div>
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
            </label>
          ))}
          {options && options.options.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No repair tools are available.
            </p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selected.length} tool(s) selected
          </p>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={selected.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Repair
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Recent Repairs</h3>
          <Link
            to="/history"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {historyError ? (
          <p className="text-sm text-destructive">
            {isApiError(historyError)
              ? historyError.userMessage
              : 'Could not load repair history.'}
          </p>
        ) : historyLoading ? (
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

      <ConfirmRepairDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        actions={selected}
        onStarted={() => setSelected([])}
      />
    </div>
  )
}
