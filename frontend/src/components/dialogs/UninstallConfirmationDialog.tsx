import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, AlertCircle } from 'lucide-react'
import { useUninstall } from '@/hooks/useUninstall'
import { isApiError } from '@/lib/api'

interface UninstallConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programId?: string
  displayName?: string
  displayVersion?: string
  publisher?: string
  installDate?: string
  estimatedSize?: string
  onUninstalled?: (programId: string) => void
}

export function UninstallConfirmationDialog({
  open,
  onOpenChange,
  programId,
  displayName = 'application',
  displayVersion,
  publisher,
  installDate,
  estimatedSize,
  onUninstalled,
}: UninstallConfirmationDialogProps) {
  const uninstall = useUninstall()
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setError(null)
    }
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!programId) return
    setError(null)
    uninstall.mutate(
      { id: programId, data: { force: false } },
      {
        onSuccess: () => {
          toast.success('Uninstall started', {
            description: `${displayName} is being removed.`,
          })
          handleOpenChange(false)
          onUninstalled?.(programId)
        },
        onError: (err) => {
          setError(
            isApiError(err)
              ? err.userMessage
              : 'Could not start the uninstall.'
          )
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5" />
            Uninstall Application
          </DialogTitle>
          <DialogDescription>
            Confirm uninstall of {displayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {(displayVersion || publisher || installDate || estimatedSize) && (
            <div className="text-sm text-muted-foreground">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {displayVersion && (
                  <div>
                    <span className="font-medium">Version:</span>
                    <span className="ml-2 text-muted-foreground">
                      {displayVersion}
                    </span>
                  </div>
                )}
                {publisher && (
                  <div>
                    <span className="font-medium">Publisher:</span>
                    <span className="ml-2 text-muted-foreground">
                      {publisher}
                    </span>
                  </div>
                )}
                {installDate && (
                  <div>
                    <span className="font-medium">Install Date:</span>
                    <span className="ml-2 text-muted-foreground">
                      {installDate}
                    </span>
                  </div>
                )}
                {estimatedSize && (
                  <div>
                    <span className="font-medium">Size:</span>
                    <span className="ml-2 text-muted-foreground">
                      {estimatedSize}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm">
            <AlertCircle className="size-4 shrink-0 text-warning mt-0.5" />
            <span className="text-foreground">
              This will remove the application and may leave behind residual files
              and settings.
            </span>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uninstall.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={uninstall.isPending || !programId}
          >
            {uninstall.isPending ? 'Uninstalling...' : 'Uninstall'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
