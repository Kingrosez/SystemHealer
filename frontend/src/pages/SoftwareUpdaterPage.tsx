import { useUpdaterScan, useUpdaterExecute } from '@/hooks/useUpdater'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isApiError } from '@/lib/api'
import { toast } from 'sonner'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function SoftwareUpdaterPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const {
    data: scanData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUpdaterScan()
  const execute = useUpdaterExecute()

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const allSelected =
    !!scanData &&
    scanData.updates.length > 0 &&
    selectedIds.length === scanData.updates.length

  const handleRescan = () => {
    setSelectedIds([])
    void refetch()
  }

  const handleExecute = () => {
    if (selectedIds.length === 0) return

    const count = selectedIds.length
    execute.mutate(
      { ids: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([])
          toast.success(`Update started for ${count} program(s).`)
        },
        onError: (err) => {
          toast.error(
            isApiError(err) ? err.userMessage : 'Could not start the update.'
          )
        },
      }
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
        <Button variant="outline" onClick={handleRescan} disabled={isFetching}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          {isFetching ? 'Scanning...' : 'Rescan'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Scan failed</AlertTitle>
          <AlertDescription>
            {isApiError(error)
              ? error.userMessage
              : 'Could not scan for software updates. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {execute.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not start update</AlertTitle>
          <AlertDescription>
            {isApiError(execute.error)
              ? execute.error.userMessage
              : 'An unexpected error occurred while starting the update.'}
          </AlertDescription>
        </Alert>
      )}

      {scanData && !scanData.available && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Software updates unavailable</AlertTitle>
          <AlertDescription>
            The software updater is not available on this system.
          </AlertDescription>
        </Alert>
      )}

      {scanData &&
      scanData.available &&
      scanData.updates.length === 0 ? (
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
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedIds(
                  allSelected ? [] : scanData.updates.map((u) => u.id)
                )
              }
              disabled={execute.isPending}
            >
              {allSelected ? 'Clear selection' : 'Select all'}
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
                    disabled={execute.isPending}
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
              onClick={handleExecute}
            >
              {execute.isPending
                ? 'Updating...'
                : `Update ${selectedIds.length} program(s)`}
            </Button>
          </div>
        </Card>
      ) : !scanData && !error && !isFetching ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No scan results</AlertTitle>
          <AlertDescription>
            Run a rescan to check for available software updates.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
