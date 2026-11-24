import { useHealth, useSystemInfo } from '@/hooks/useHealth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Cpu, HardDrive, MemoryStick, Server, Shield, Terminal } from 'lucide-react'

export function DashboardPage() {
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth()
  const { data: systemInfo, isLoading: infoLoading, error: infoError } = useSystemInfo()

  const isLoading = healthLoading || infoLoading
  const hasError = healthError || infoError

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to connect to backend</AlertTitle>
        <AlertDescription>
          {(healthError as any)?.userMessage || (infoError as any)?.userMessage ||
            'Could not fetch system information. Is the backend running?'}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">System Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current health status and system information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {health?.status === 'ok' ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className="mt-2 text-lg font-semibold capitalize">{health?.status ?? 'unknown'}</p>
          <p className="text-xs text-muted-foreground">v{health?.version ?? '—'}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">OS</span>
            <Server className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-lg font-semibold">{systemInfo?.os ?? '—'}</p>
          <p className="text-xs text-muted-foreground">Build {systemInfo?.build ?? '—'}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">CPU</span>
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-lg font-semibold">{systemInfo?.cpu ?? '—'}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">RAM</span>
            <MemoryStick className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-lg font-semibold">{systemInfo?.ramGb ?? '—'} GB</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Admin</span>
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <Badge variant={systemInfo?.isAdmin ? 'default' : 'secondary'} className="mt-2">
            {systemInfo?.isAdmin ? 'Yes' : 'No'}
          </Badge>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">BitLocker</span>
            <HardDrive className="h-5 w-5 text-primary" />
          </div>
          <Badge variant={systemInfo?.bitLockerEnabled ? 'secondary' : 'default'} className="mt-2">
            {systemInfo?.bitLockerEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Quick Actions</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the sidebar to navigate to specific maintenance tools.
        </p>
      </Card>
    </div>
  )
}