import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, AlertCircle } from 'lucide-react'
import { useLeftoversPreview, useLeftoversExecute } from '@/hooks/useUninstall'

interface LeftoversPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programId?: string
  programName?: string
  onFinished?: () => void
}

export function LeftoversPreviewDialog({
  open,
  onOpenChange,
  programId,
  programName = 'the uninstaller',
  onFinished,
}: LeftoversPreviewDialogProps) {
  const preview = useLeftoversPreview()
  const execute = useLeftoversExecute()

  const data = preview.data
  const items = data?.files ?? []
  const registryKeys = data?.registryKeys ?? []
  const confirmToken = data?.confirmToken

  const handlePreview = () => {
    if (!programId) return
    preview.mutate(programId)
  }

  const handleRemoveAll = () => {
    if (!programId || !confirmToken) return
    execute.mutate(
      {
        id: programId,
        data: {
          confirmToken,
          files: items.map((f) => f.path),
          registryKeys,
        },
      },
      {
        onSuccess: () => {
          onFinished?.()
          onOpenChange(false)
        },
      }
    )
  }

  const formatSize = (size: string) => size
  const getItemIcon = (type: 'file' | 'folder') => {
    return type === 'folder' ? '📁' : '📄'
  }

  const isWorking = preview.isPending || execute.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="size-5" />
            Leftover Files Preview
          </DialogTitle>
          <DialogDescription>
            {preview.data
              ? `Found ${items.length} leftover items from ${programName}`
              : `Scan for leftover items from ${programName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2">
          {!preview.data ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Click preview to scan for leftover files and registry keys.</p>
            </div>
          ) : items.length === 0 && registryKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No leftover items found.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, i) => (
                <div
                  key={item.path || i}
                  className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {getItemIcon('file')}
                    </span>
                    <div>
                      <div className="font-medium">{item.path}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSize(String(item.sizeBytes))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard?.writeText(item.path)}
                  >
                    Copy Path
                  </Button>
                </div>
              ))}
              {registryKeys.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-1">
                    Registry Keys ({registryKeys.length})
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {registryKeys.slice(0, 5).map((key, i) => (
                      <li key={i} className="truncate">{key}</li>
                    ))}
                    {registryKeys.length > 5 && (
                      <li className="text-xs">
                        +{registryKeys.length - 5} more keys
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {preview.isError && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm">
            <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <span className="text-foreground">
              Failed to preview leftovers. Please try again.
            </span>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isWorking}
          >
            Cancel
          </Button>
          {!preview.data ? (
            <Button onClick={handlePreview} disabled={preview.isPending || !programId}>
              {preview.isPending ? 'Scanning...' : 'Preview Leftovers'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleRemoveAll}
              disabled={execute.isPending || items.length === 0 && registryKeys.length === 0 || !confirmToken}
            >
              {execute.isPending ? 'Removing...' : 'Remove All'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}