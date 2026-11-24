import { useHealth } from '@/hooks/useHealth'

export function HealthBadge() {
  const { data, isLoading, isError } = useHealth()

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
        Connecting…
      </span>
    )
  }

  if (isError || !data || data.status !== 'ok') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-destructive bg-destructive/10 px-3 py-1 text-xs text-destructive">
        <span className="h-2 w-2 rounded-full bg-destructive" />
        Backend offline
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-success bg-success/10 px-3 py-1 text-xs text-success">
      <span className="h-2 w-2 rounded-full bg-success" />
      Connected · v{data.version}
    </span>
  )
}