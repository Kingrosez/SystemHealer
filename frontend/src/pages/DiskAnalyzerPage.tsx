import { useDiskDrives, useDiskScan } from '@/hooks/useDiskAnalyzer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, HardDrive, FolderOpen, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export function DiskAnalyzerPage() {
  const [selectedDrive, setSelectedDrive] = useState('C:')
  const { data: diskData, isLoading } = useDiskDrives()
  const scan = useDiskScan()

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

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Drives</h3>
        {diskData && diskData.drives.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {diskData.drives.map((drive) => (
              <div
                key={drive.letter}
                className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-accent ${
                  selectedDrive === drive.letter ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedDrive(drive.letter)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-primary" />
                    <span className="font-medium">{drive.letter}</span>
                  </div>
                  <Badge variant="secondary">{drive.fileSystem}</Badge>
                </div>
                <Progress
                  value={(drive.usedBytes / drive.totalBytes) * 100}
                  className="mt-2 h-2"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {(drive.usedBytes / 1073741824).toFixed(1)} GB used of{' '}
                  {(drive.totalBytes / 1073741824).toFixed(1)} GB
                </p>
              </div>
            ))}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No drives detected</AlertTitle>
            <AlertDescription>Could not detect disk drives.</AlertDescription>
          </Alert>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Usage for {selectedDrive}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scan.mutate({ drive: selectedDrive })}
            disabled={scan.isPending}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {scan.isPending ? 'Scanning...' : 'Scan'}
          </Button>
        </div>
        {diskData && diskData.usage.length > 0 ? (
          <div className="mt-3 max-h-96 overflow-y-auto">
            {diskData.usage.map((item, i) => (
              <div key={i} className="flex items-center gap-2 border-b py-2 text-sm">
                <FolderOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{item.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {(item.sizeBytes / 1048576).toFixed(1)} MB
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Click "Scan" to analyze disk usage for {selectedDrive}.
          </p>
        )}
      </Card>
    </div>
  )
}