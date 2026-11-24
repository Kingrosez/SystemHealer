import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HardHat, AlertCircle, Shield } from 'lucide-react'
import { useStartRepair } from '@/hooks/useRepair'

interface HighRiskConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operationType?: 'sfc' | 'dism' | 'registry' | 'cleanup'
  confirmToken?: string
  onConfirm?: () => void
  onCancel?: () => void
  isExecuting?: boolean
}

export function HighRiskConfirmationDialog({
  open,
  onOpenChange,
  operationType = 'sfc',
  confirmToken,
  onConfirm,
  onCancel,
  isExecuting,
}: HighRiskConfirmationDialogProps) {
  const startRepair = useStartRepair()

  const handleConfirm = () => {
    if (!confirmToken) return
    startRepair.mutate({ actions: [operationType], createRestorePoint: true })
    onConfirm?.()
    onOpenChange(false)
  }
  const getOperationLabel = () => {
    switch (operationType) {
      case 'sfc':
        return 'System File Checker'
      case 'dism':
        return 'DISM Image Repair'
      case 'registry':
        return 'Registry Cleaning'
      case 'cleanup':
        return 'System Cleanup'
      default:
        return 'System Repair'
    }
  }

  const getDescription = () => {
    switch (operationType) {
      case 'sfc':
        return (
          <ul className="ml-4 list-disc space-y-1">
            <li>Scan and repair corrupted system files</li>
            <li>Restore Windows component integrity</li>
            <li>May take 15-30 minutes to complete</li>
          </ul>
        )
      case 'dism':
        return (
          <ul className="ml-4 list-disc space-y-1">
            <li>Repair Windows image corruption</li>
            <li>Restore component store health</li>
            <li>May take 30-60 minutes to complete</li>
          </ul>
        )
      case 'registry':
        return (
          <ul className="ml-4 list-disc space-y-1">
            <li>Remove invalid registry entries</li>
            <li>Clean orphaned application references</li>
            <li>Always creates restore point first</li>
          </ul>
        )
      case 'cleanup':
        return (
          <ul className="ml-4 list-disc space-y-1">
            <li>Remove temporary system files</li>
            <li>Clean cache and log files</li>
            <li>Always creates restore point first</li>
          </ul>
        )
      default:
        return (
          <ul className="ml-4 list-disc space-y-1">
            <li>Scan and repair system files</li>
            <li>Restore Windows component integrity</li>
            <li>Backup current system state</li>
          </ul>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardHat className="size-5 text-orange-600" />
            {getOperationLabel()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm">
            <AlertCircle className="size-4 shrink-0 text-warning mt-0.5" />
            <span className="text-foreground">
              This is a high-risk operation that makes permanent changes to your system.
            </span>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-info/10 p-3 text-sm">
            <Shield className="size-4 shrink-0 text-info mt-0.5" />
            <span className="text-foreground">
              A system restore point will be created before proceeding.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onOpenChange(false)
            }}
            disabled={isExecuting || startRepair.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isExecuting || startRepair.isPending}
          >
            {isExecuting || startRepair.isPending ? 'Executing...' : 'Proceed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}