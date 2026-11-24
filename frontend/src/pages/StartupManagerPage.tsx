import { useStartupPrograms, useToggleStartup } from '@/hooks/useStartup'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Power, PowerOff, Settings } from 'lucide-react'

export function StartupManagerPage() {
  const { data: programs, isLoading } = useStartupPrograms()
  const toggle = useToggleStartup()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Startup Manager</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage programs that start with Windows.
        </p>
      </div>

      <Card className="p-4">
        {programs && programs.items.length > 0 ? (
          <div className="space-y-2">
            {programs.items.map((prog) => (
              <div
                key={prog.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{prog.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {prog.publisher} · {prog.path}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      prog.impact === 'high'
                        ? 'destructive'
                        : prog.impact === 'medium'
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {prog.impact}
                  </Badge>
                  <Button
                    variant={prog.enabled ? 'outline' : 'default'}
                    size="sm"
                    onClick={() =>
                      toggle.mutate({ id: prog.id, enabled: !prog.enabled })
                    }
                    disabled={toggle.isPending}
                  >
                    {prog.enabled ? (
                      <PowerOff className="h-3 w-3" />
                    ) : (
                      <Power className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No startup programs</AlertTitle>
            <AlertDescription>
              No startup programs detected.
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  )
}