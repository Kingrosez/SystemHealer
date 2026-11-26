import { useHealth, useSystemInfo } from '@/hooks/useHealth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isApiError } from '@/lib/api'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpCircle,
  CheckCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  Terminal,
  Trash2,
  Wrench,
} from 'lucide-react'

function formatUptime(seconds: number | undefined) {
  if (!seconds || seconds <= 0) return '—'

  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const QUICK_ACTIONS = [
  { to: '/system-repair', label: 'System Repair', icon: Wrench },
  { to: '/cache-cleaner', label: 'Cache Cleaner', icon: Trash2 },
  { to: '/software-updater', label: 'Software Updater', icon: ArrowUpCircle },
  { to: '/restore-points', label: 'Restore Points', icon: RotateCcw },
]

export function DashboardPage() {
  const healthQuery = useHealth()
  const infoQuery = useSystemInfo()
  const health = healthQuery.data
  const systemInfo = infoQuery.data

  const isLoading = healthQuery.isLoading || infoQuery.isLoading
  const isFetching = healthQuery.isFetching || infoQuery.isFetching

  const refresh = () => {
    void healthQuery.refetch()
    void infoQuery.refetch()
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">System Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current health status and system information
          </p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={isFetching}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {healthQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Health check failed</AlertTitle>
          <AlertDescription>
            {isApiError(healthQuery.error)
              ? healthQuery.error.userMessage
              : 'Could not fetch backend health status.'}
          </AlertDescription>
        </Alert>
      )}

      {infoQuery.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System information unavailable</AlertTitle>
          <AlertDescription>
            {isApiError(infoQuery.error)
              ? infoQuery.error.userMessage
              : 'Could not fetch system information.'}
          </AlertDescription>
        </Alert>
      )}

      {systemInfo && !systemInfo.isAdmin && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Administrator access required</AlertTitle>
          <AlertDescription>
            Some repair and cleanup operations need administrator privileges.
          </AlertDescription>
        </Alert>
      )}

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
          <p className="mt-2 text-lg font-semibold capitalize">
            {health?.status ?? 'unknown'}
          </p>
          <p className="text-xs text-muted-foreground">
            v{health?.version ?? '—'}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-lg font-semibold">
            {formatUptime(health?.uptimeSeconds)}
          </p>
          <p className="text-xs text-muted-foreground">Backend process</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">OS</span>
            <Server className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-lg font-semibold">{systemInfo?.os ?? '—'}</p>
          <p className="text-xs text-muted-foreground">
            Build {systemInfo?.build ?? '—'}
          </p>
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
          <p className="mt-2 text-lg font-semibold">
            {systemInfo?.ramGb ?? '—'} GB
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Admin</span>
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <Badge
            variant={systemInfo?.isAdmin ? 'default' : 'secondary'}
            className="mt-2"
          >
            {systemInfo?.isAdmin ? 'Yes' : 'No'}
          </Badge>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">BitLocker</span>
            <HardDrive className="h-5 w-5 text-primary" />
          </div>
          <Badge
            variant={systemInfo?.bitLockerEnabled ? 'default' : 'secondary'}
            className="mt-2"
          >
            {systemInfo?.bitLockerEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Winget</span>
            <ArrowUpCircle className="h-5 w-5 text-primary" />
          </div>
          <Badge
            variant={systemInfo?.wingetAvailable ? 'default' : 'secondary'}
            className="mt-2"
          >
            {systemInfo?.wingetAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Quick Actions</h3>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                {action.label}
              </Link>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
