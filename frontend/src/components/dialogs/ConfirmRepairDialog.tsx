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
import { Shield, AlertCircle } from 'lucide-react'
import { useStartRepair } from '@/hooks/useRepair'
import { isApiError } from '@/lib/api'
import { RestorePointWarningDialog } from './RestorePointWarningDialog'

interface ConfirmRepairDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: string[]
  createRestorePoint?: boolean
  onStarted?: (taskId: string) => void
}

export function ConfirmRepairDialog({
  open,
  onOpenChange,
  actions,
  createRestorePoint = true,
  onStarted,
}: ConfirmRepairDialogProps) {
  const startRepair = useStartRepair()
  const [error, setError] = useState<string | null>(null)
  const [restorePointToken, setRestorePointToken] = useState<string | null>(null)
  const [showRestorePointWarning, setShowRestorePointWarning] = useState(false)

  const resetState = () => {
    setError(null)
    setRestorePointToken(null)
    setShowRestorePointWarning(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetState()
    }
    onOpenChange(next)
  }

  const start = (confirmToken?: string) => {
    setError(null)
    startRepair.mutate(
      { actions, createRestorePoint, confirmToken },
      {
        onSuccess: (data) => {
          toast.success('Repair started', {
            description: data.taskId ? `Task ${data.taskId}` : undefined,
          })
          onStarted?.(data.taskId)
          resetState()
          onOpenChange(false)
        },
        onError: (err) => {
          if (!isApiError(err)) {
            setError('Could not start the repair.')
            return
          }

          const data =
            err.data && typeof err.data === 'object'
              ? (err.data as {
                  restorePointStatus?: string
                  restorePointToken?: string
                })
              : undefined

          if (
            err.status === 409 &&
            data?.restorePointStatus === 'restore_point_required' &&
            data.restorePointToken
          ) {
            setRestorePointToken(data.restorePointToken)
            setShowRestorePointWarning(true)
            return
          }

          setError(err.userMessage || 'Could not start the repair.')
        },
      }
    )
  }

  const handleRestorePointAcknowledged = () => {
    if (!restorePointToken) {
      return
    }
    setShowRestorePointWarning(false)
    start(restorePointToken)
  }

  return (
    <>
      <Dialog open={open && !showRestorePointWarning} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Confirm System Repair
            </DialogTitle>
            <DialogDescription>
              Start repair run for: {actions.join(', ')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm">
              <AlertCircle className="size-4 shrink-0 text-warning mt-0.5" />
              <span className="text-foreground">
                This will run system repair tools. Ensure you have a restore
                point before proceeding.
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
              disabled={startRepair.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => start()}
              disabled={startRepair.isPending || actions.length === 0}
            >
              {startRepair.isPending ? 'Starting...' : 'Start Repair'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RestorePointWarningDialog
        open={showRestorePointWarning}
        onOpenChange={(next) => {
          setShowRestorePointWarning(next)
          if (!next) {
            setRestorePointToken(null)
          }
        }}
        description={`Pre-repair: ${actions.join(', ')}`}
        onCreated={handleRestorePointAcknowledged}
      />
    </>
  )
}
