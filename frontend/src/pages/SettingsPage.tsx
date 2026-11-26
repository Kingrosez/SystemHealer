import { useState } from 'react'
import {
  useSettings,
  useUpdateSettings,
  type AppSettings,
} from '@/hooks/useSettings'
import { useHealth } from '@/hooks/useHealth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isApiError } from '@/lib/api'
import type { Theme } from '@/lib/theme'
import { toast } from 'sonner'
import { AlertCircle, Info, Settings, Shield } from 'lucide-react'

export function SettingsPage() {
  const { data, isLoading, error } = useSettings()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Could not load settings</AlertTitle>
        <AlertDescription>
          {isApiError(error)
            ? error.userMessage
            : 'An unexpected error occurred while loading settings.'}
        </AlertDescription>
      </Alert>
    )
  }

  return <SettingsForm settings={data} />
}

function SettingsForm({ settings }: { settings: AppSettings }) {
  const [retentionDays, setRetentionDays] = useState(
    String(settings.logRetentionDays)
  )
  const [scanRoots, setScanRoots] = useState(
    settings.defaultScanRoots.join('\n')
  )
  const [theme, setTheme] = useState<Theme>(settings.theme)
  const [createRestorePoint, setCreateRestorePoint] = useState(
    settings.createRestorePointByDefault
  )

  const update = useUpdateSettings()
  const { data: health } = useHealth()

  const handleSave = () => {
    const days = Number(retentionDays)
    if (!Number.isInteger(days) || days < 1 || days > 3650) {
      toast.error('Retention must be a whole number between 1 and 3650 days.')
      return
    }

    const roots = scanRoots
      .split('\n')
      .map((root) => root.trim())
      .filter(Boolean)

    if (roots.length === 0) {
      toast.error('Add at least one default scan root.')
      return
    }

    update.mutate(
      {
        logRetentionDays: days,
        defaultScanRoots: roots,
        theme,
        createRestorePointByDefault: createRestorePoint,
      },
      {
        onSuccess: (saved) => {
          setRetentionDays(String(saved.logRetentionDays))
          setScanRoots(saved.defaultScanRoots.join('\n'))
          setTheme(saved.theme)
          setCreateRestorePoint(saved.createRestorePointByDefault)
          toast.success('Settings saved.')
        },
        onError: (err) => {
          toast.error(
            isApiError(err) ? err.userMessage : 'Could not save settings.'
          )
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preferences, retention, and safety defaults.
        </p>
      </div>

      {update.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not save settings</AlertTitle>
          <AlertDescription>
            {isApiError(update.error)
              ? update.error.userMessage
              : 'An unexpected error occurred while saving settings.'}
          </AlertDescription>
        </Alert>
      )}

      <Card className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">General</h3>
        </div>
        <div className="max-w-xs space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <select
            id="theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as Theme)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="system">Follow system</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Cleanup</h3>
        </div>
        <div className="max-w-xs space-y-2">
          <Label htmlFor="retention">Log retention (days)</Label>
          <Input
            id="retention"
            type="number"
            min={1}
            max={3650}
            value={retentionDays}
            onChange={(event) => setRetentionDays(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scan-roots">Default scan roots</Label>
          <p className="text-xs text-muted-foreground">
            One path per line. Used as the starting point for scans.
          </p>
          <textarea
            id="scan-roots"
            rows={4}
            value={scanRoots}
            onChange={(event) => setScanRoots(event.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Safety</h3>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={createRestorePoint}
            onChange={(event) => setCreateRestorePoint(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            Create a restore point before high-risk operations by default
          </span>
        </label>
      </Card>

      <Card className="space-y-1 p-4">
        <h3 className="font-semibold">About</h3>
        <p className="text-sm text-muted-foreground">
          SystemHealer v{health?.version ?? '—'}
        </p>
        <p className="text-sm text-muted-foreground">
          Backend status: {health?.status ?? 'unknown'}
        </p>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={update.isPending}>
          {update.isPending ? 'Saving...' : 'Save settings'}
        </Button>
      </div>
    </div>
  )
}
