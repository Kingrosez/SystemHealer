import { useRestorePoints, useCreateRestorePoint, useRestore } from '@/hooks/useRestorePoints'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Clock, Plus, RotateCcw, Shield, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function RestorePointsPage() {
  const [description, setDescription] = useState('')
  const { data: points, isLoading } = useRestorePoints()
  const createPoint = useCreateRestorePoint()
  const restore = useRestore()

  const handleCreate = () => {
    if (description.trim()) {
      createPoint.mutate({ description: description.trim() })
    }
  }

  const handleRestore = (pointId: string) => {
    if (confirm('Are you sure you want to restore the system to this point? This is irreversible.')) {
      restore.mutate({ pointId, confirm: true })
    }
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

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Create Restore Point</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Before cleanup"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button
            onClick={handleCreate}
            disabled={createPoint.isPending || !description.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create
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
                  onClick={() => handleRestore(point.id)}
                  disabled={restore.isPending}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No restore points</AlertTitle>
            <AlertDescription>
              No system restore points are available. Create one above.
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  )
}