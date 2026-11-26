import { useRestorePoints, useCreateRestorePoint, useRestore } from '@/hooks/useRestorePoints'
import type { RestorePoint } from '@/hooks/useRestorePoints'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { isApiError } from '@/lib/api'
import { Clock, Plus, RotateCcw, Shield, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function RestorePointsPage() {
  const [description, setDescription] = useState('')
  const [pointToRestore, setPointToRestore] = useState<RestorePoint | null>(null)
  const { data: points, isLoading, error } = useRestorePoints()
  const createPoint = useCreateRestorePoint()
  const restore = useRestore()

  const handleCreate = () => {
    const trimmed = description.trim()
    if (!trimmed) return

    createPoint.mutate(
      { description: trimmed },
      {
        onSuccess: () => {
          setDescription('')
          toast.success('Restore point created.')
        },
        onError: (err) => {
          toast.error(
            isApiError(err)
              ? err.userMessage
              : 'Could not create restore point.'
          )
        },
      }
    )
  }

  const handleRestore = () => {
    if (!pointToRestore) return

    restore.mutate(
      { pointId: pointToRestore.id, confirm: true },
      {
        onSuccess: () => {
          setPointToRestore(null)
          toast.success('System restore started.')
        },
        onError: (err) => {
          toast.error(
            isApiError(err)
              ? err.userMessage
              : 'Could not start the system restore.'
          )
        },
      }
    )
  }

  const closeRestoreDialog = () => {
    setPointToRestore(null)
    restore.reset()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Restore Points</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage system restore points.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load restore points</AlertTitle>
          <AlertDescription>
            {isApiError(error)
              ? error.userMessage
              : 'An unexpected error occurred while loading restore points.'}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Create Restore Point</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Before cleanup"
            maxLength={200}
            aria-label="Restore point description"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button
            onClick={handleCreate}
            disabled={createPoint.isPending || !description.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createPoint.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Available Restore Points</h3>
        {points && points.points.length > 0 ? (
          <div className="space-y-2">
            {points.points.map((point) => (
              <div
                key={point.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{point.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {new Date(point.createdAt).toLocaleString()} · Seq #{point.sequenceNumber}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    restore.reset()
                    setPointToRestore(point)
                  }}
                  disabled={restore.isPending}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        ) : !error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No restore points</AlertTitle>
            <AlertDescription>
              No system restore points are available. Create one above.
            </AlertDescription>
          </Alert>
        ) : null}
      </Card>

      <Dialog
        open={pointToRestore !== null}
        onOpenChange={(open) => {
          if (!open && !restore.isPending) {
            closeRestoreDialog()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="size-5" />
              Restore system?
            </DialogTitle>
            <DialogDescription>
              Restore to &quot;{pointToRestore?.description}&quot;? This action is irreversible.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm">
            <AlertCircle className="size-4 shrink-0 text-warning mt-0.5" />
            <span className="text-foreground">
              Save your work before continuing. The system may restart.
            </span>
          </div>

          {restore.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not start restore</AlertTitle>
              <AlertDescription>
                {isApiError(restore.error)
                  ? restore.error.userMessage
                  : 'An unexpected error occurred while starting the restore.'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeRestoreDialog}
              disabled={restore.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestore}
              disabled={restore.isPending}
            >
              {restore.isPending ? 'Restoring...' : 'Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
