import { useDiskDrives, useDiskScan } from '@/hooks/useDiskAnalyzer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isApiError } from '@/lib/api'
import { formatBytes } from '@/lib/utils'
import { toast } from 'sonner'
import { AlertCircle, HardDrive, FolderOpen, BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DiskAnalyzerPage() {
  const [selectedDrive, setSelectedDrive] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const {
    data: diskData,
    isLoading,
    error,
    refetch,
  } = useDiskDrives()
  const scan = useDiskScan()

  const activeDrive =
    diskData && diskData.drives.length > 0
      ? diskData.drives.some((drive) => drive.letter === selectedDrive)
        ? selectedDrive
        : diskData.drives[0].letter
      : ''

  useEffect(() => {
    if (!isScanning) return

    const interval = setInterval(() => {
      void refetch()
    }, 2000)
    const timeout = setTimeout(() => setIsScanning(false), 60_000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isScanning, refetch])

  const handleScan = () => {
    if (!activeDrive) return

    scan.mutate(
      { drive: activeDrive, maxDepth: 3 },
      {
        onSuccess: () => {
          setIsScanning(true)
          toast.success('Disk scan started.')
        },
        onError: (err) => {
          toast.error(
            isApiError(err)
              ? err.userMessage
              : 'Could not start the disk scan.'
          )
        },
      }
    )
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
        <h2 className="text-2xl font-semibold text-foreground">Disk Analyzer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze disk usage and find large files and folders.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load disk information</AlertTitle>
          <AlertDescription>
            {isApiError(error)
              ? error.userMessage
              : 'An unexpected error occurred while loading disk information.'}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Drives</h3>
        {diskData && diskData.drives.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {diskData.drives.map((drive) => {
              const usedPercent =
                drive.totalBytes > 0
                  ? Math.min(
                      100,
                      Math.max(0, (drive.usedBytes / drive.totalBytes) * 100)
                    )
                  : 0

              return (
                <button
                  key={drive.letter}
                  type="button"
                  aria-pressed={activeDrive === drive.letter}
                  onClick={() => setSelectedDrive(drive.letter)}
                  className={`w-full rounded-md border p-3 text-left transition-colors hover:bg-accent ${
                    activeDrive === drive.letter
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-primary" />
                      <span className="font-medium">{drive.letter}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {drive.label}
                      </span>
                    </div>
                    <Badge variant="secondary">{drive.fileSystem}</Badge>
                  </div>
                  <Progress value={usedPercent} className="mt-2 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatBytes(drive.usedBytes)} used of{' '}
                    {formatBytes(drive.totalBytes)} ·{' '}
                    {formatBytes(drive.freeBytes)} free
                  </p>
                </button>
              )
            })}
          </div>
        ) : !error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No drives detected</AlertTitle>
            <AlertDescription>Could not detect disk drives.</AlertDescription>
          </Alert>
        ) : null}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Usage for {activeDrive || 'selected drive'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScan}
            disabled={!activeDrive || scan.isPending || isScanning}
          >
            <BarChart3
              className={`mr-2 h-4 w-4 ${isScanning ? 'animate-pulse' : ''}`}
            />
            {scan.isPending || isScanning ? 'Scanning...' : 'Scan'}
          </Button>
        </div>

        {scan.isError && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not start scan</AlertTitle>
            <AlertDescription>
              {isApiError(scan.error)
                ? scan.error.userMessage
                : 'An unexpected error occurred while starting the scan.'}
            </AlertDescription>
          </Alert>
        )}

        {diskData && diskData.usage.length > 0 ? (
          <div className="mt-3 max-h-96 overflow-y-auto">
            {diskData.usage.map((item) => (
              <div
                key={item.path}
                className="flex items-center gap-2 border-b py-2 text-sm"
              >
                <FolderOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate" title={item.path}>
                  {item.name}
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {formatBytes(item.sizeBytes)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {isScanning
              ? 'Scan in progress. Results will appear shortly.'
              : `Click "Scan" to analyze disk usage for ${
                  activeDrive || 'the selected drive'
                }.`}
          </p>
        )}
      </Card>
    </div>
  )
}
