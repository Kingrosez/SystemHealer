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
import { useDuplicateExecute } from '@/hooks/useCleaner'
import type { DuplicateGroup } from '@/hooks/useCleaner'

interface DuplicateDeletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  confirmToken?: string
  duplicates?: DuplicateGroup[]
  onFinished?: () => void
}

export function DuplicateDeletionDialog({
  open,
  onOpenChange,
  confirmToken,
  duplicates = [],
  onFinished,
}: DuplicateDeletionDialogProps) {
  const execute = useDuplicateExecute()

  const handleDelete = () => {
    if (!confirmToken) return
    // Keep one original per group; delete the rest.
    const fileIds = duplicates.flatMap((group) =>
      group.files.slice(1).map((f) => f.id)
    )
    if (fileIds.length === 0) return
    execute.mutate(
      { confirmToken, fileIds },
      {
        onSuccess: () => {
          onFinished?.()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="size-5" />
            Duplicate Files
          </DialogTitle>
          <DialogDescription>
            Found {duplicates.length} group{duplicates.length !== 1 ? 's of' : ''} duplicates
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {duplicates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No duplicate files found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {duplicates.map((group) => (
                <div
                  key={group.groupId}
                  className="border rounded-md p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{group.files.length} copies</h4>
                      <p className="text-sm text-muted-foreground">
                        {group.sizeBytes.toLocaleString()} bytes · hash{' '}
                        {group.hash.slice(0, 12)}...
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.files.map((file, i) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded bg-muted/30 p-2 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs">📄</span>
                          <span className="truncate" title={file.path}>
                            {file.path}
                          </span>
                          {i === 0 && (
                            <span className="text-xs text-muted-foreground">
                              (kept)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {execute.isError && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm">
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <span className="text-foreground">
                Failed to delete duplicates. Please try again.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={execute.isPending}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={
              execute.isPending ||
              !confirmToken ||
              duplicates.flatMap((g) => g.files.slice(1).map((f) => f.id)).length === 0
            }
          >
            {execute.isPending ? 'Deleting...' : 'Delete Duplicates'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}