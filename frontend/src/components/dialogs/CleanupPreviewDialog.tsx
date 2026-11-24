import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Brush, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useCleanerPreview, useCleanerExecute } from '@/hooks/useCleaner'

interface CleanupPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFinished?: () => void
}

export function CleanupPreviewDialog({
  open,
  onOpenChange,
  onFinished,
}: CleanupPreviewDialogProps) {
  const preview = useCleanerPreview()
  const execute = useCleanerExecute()

  const items = preview.data?.items ?? []
  const totalSizeBytes = preview.data?.totalSizeBytes ?? 0
  const confirmToken = preview.data?.confirmToken

  const cacheItems = items.filter((i) => i.category === 'cache' || i.category === 'browser')
  const tempItems = items.filter(
    (i) => i.category === 'temp' || i.category === 'logs'
  )

  const formatBytes = (bytes: number) => {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`
    return `${bytes} B`
  }

  const handlePreview = () => {
    preview.mutate()
  }

  const handleCleanup = () => {
    if (!confirmToken) return
    execute.mutate(
      {
        confirmToken,
        paths: items.map((i) => i.path),
      },
      {
        onSuccess: () => {
          onFinished?.()
          onOpenChange(false)
        },
      }
    )
  }

  const isWorking = preview.isPending || execute.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brush className="size-5" />
            Cleanup Preview
          </DialogTitle>
          <DialogDescription>
            {preview.data
              ? `Review items to be cleaned before proceeding`
              : `Scan for cache and temp files to clean`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {!preview.data ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Click preview to scan for cache and temp files.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 rounded-md bg-muted/30 p-4">
                <div className="flex-1">
                  <div className="text-sm font-medium">Total Items</div>
                  <div className="text-lg font-bold">{items.length}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Total Size</div>
                  <div className="text-lg font-bold">{formatBytes(totalSizeBytes)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Estimated Time</div>
                  <div className="text-lg font-bold">~2 min</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Cache Files ({cacheItems.length})
                  </h4>
                  {cacheItems.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {cacheItems.slice(0, 5).map((item, i) => (
                        <li key={item.path || i} className="flex items-center gap-2">
                          <span className="text-xs">📁</span>
                          <span className="truncate">{item.path}</span>
                        </li>
                      ))}
                      {cacheItems.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          +{cacheItems.length - 5} more items
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No cache items found</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <XCircle className="size-4 text-red-600" />
                    Temp Files ({tempItems.length})
                  </h4>
                  {tempItems.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {tempItems.slice(0, 5).map((item, i) => (
                        <li key={item.path || i} className="flex items-center gap-2">
                          <span className="text-xs">📄</span>
                          <span className="truncate">{item.path}</span>
                        </li>
                      ))}
                      {tempItems.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          +{tempItems.length - 5} more items
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No temp items found</p>
                  )}
                </div>
              </div>
            </>
          )}

          {preview.isError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm">
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <span className="text-foreground">
                Failed to preview cleanup items. Please try again.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isWorking}
          >
            Cancel
          </Button>
          {!preview.data ? (
            <Button onClick={handlePreview} disabled={preview.isPending}>
              {preview.isPending ? 'Scanning...' : 'Preview Cleanup'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleCleanup}
              disabled={execute.isPending || items.length === 0 || !confirmToken}
            >
              {execute.isPending ? 'Cleaning...' : 'Start Cleanup'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}