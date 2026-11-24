import { useUpdaterScan, useUpdaterExecute } from '@/hooks/useUpdater'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function SoftwareUpdaterPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { data: scanData, isLoading, refetch } = useUpdaterScan()
  const execute = useUpdaterExecute()

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Software Updater</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check for outdated software and batch-update installed programs.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Rescan
        </Button>
      </div>

      {scanData && scanData.updates.length === 0 && scanData.available ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>All up to date</AlertTitle>
          <AlertDescription>
            No outdated software found. Check back later for new updates.
          </AlertDescription>
        </Alert>
      ) : scanData && scanData.updates.length > 0 ? (
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">
              {scanData.updates.length} update(s) available
            </h3>
            <Button
              variant="default"
              size="sm"
              onClick={() => setSelectedIds(scanData.updates.map((u) => u.id))}
            >
              Select All
            </Button>
          </div>
          <div className="space-y-2">
            {scanData.updates.map((update) => (
              <div
                key={update.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(update.id)}
                    onChange={() => toggleSelect(update.id)}
                  />
                  <div>
                    <p className="font-medium">{update.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {update.currentVersion} → {update.availableVersion}
                    </p>
                  </div>
                </label>
                <Badge variant="secondary">v{update.availableVersion}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="default"
              disabled={selectedIds.length === 0 || execute.isPending}
              onClick={() => execute.mutate({ ids: selectedIds })}
            >
              {execute.isPending ? 'Updating...' : `Update ${selectedIds.length} program(s)`}
            </Button>
          </div>
        </Card>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Scan failed</AlertTitle>
          <AlertDescription>
            Could not scan for software updates. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}