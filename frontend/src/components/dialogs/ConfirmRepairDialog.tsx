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

interface ConfirmRepairDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: string[]
  createRestorePoint?: boolean
}

export function ConfirmRepairDialog({
  open,
  onOpenChange,
  actions,
  createRestorePoint = true,
}: ConfirmRepairDialogProps) {
  const startRepair = useStartRepair()

  const handleConfirm = () => {
    startRepair.mutate({ actions, createRestorePoint })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={startRepair.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={startRepair.isPending}
          >
            {startRepair.isPending ? 'Starting...' : 'Start Repair'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}