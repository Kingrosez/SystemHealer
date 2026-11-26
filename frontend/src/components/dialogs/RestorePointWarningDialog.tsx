import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Shield, AlertCircle } from 'lucide-react'
import { useCreateRestorePoint } from '@/hooks/useRestorePoints'
import { isApiError } from '@/lib/api'

interface RestorePointWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description?: string
  onCreated?: () => void
}

export function RestorePointWarningDialog({
  open,
  onOpenChange,
  description = 'SystemHealer pre-operation',
  onCreated,
}: RestorePointWarningDialogProps) {
  const createPoint = useCreateRestorePoint()
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setError(null)
    }
    onOpenChange(next)
  }

  const handleCreate = () => {
    setError(null)
    createPoint.mutate(
      { description },
      {
        onSuccess: () => {
          onCreated?.()
          onOpenChange(false)
        },
        onError: (err) => {
          setError(
            isApiError(err)
              ? err.userMessage
              : 'Could not create a restore point.'
          )
        },
      }
    )
  }

  const handleSkip = () => {
    setError(null)
    onCreated?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Create Restore Point
          </DialogTitle>
          <DialogDescription>
            Create a system restore point before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm">
            <AlertCircle className="size-4 shrink-0 text-warning mt-0.5" />
            <span className="text-foreground">
              Creating a restore point allows you to undo this action if
              something goes wrong.
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>System restore points capture:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>System files and registry</li>
              <li>Installed programs</li>
              <li>System settings</li>
            </ul>
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
            onClick={handleSkip}
            disabled={createPoint.isPending}
          >
            Skip
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createPoint.isPending}
          >
            {createPoint.isPending ? 'Creating...' : 'Create Restore Point'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}