import { useDuplicateScan, useDuplicateGroups, useDuplicateExecute } from '@/hooks/useCleaner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Copy, FolderOpen, Trash2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function DuplicateFinderPage() {
  const [roots, setRoots] = useState('D:\\')
  const [minSize, setMinSize] = useState(1024)
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const scan = useDuplicateScan()
  const { data: groups, refetch } = useDuplicateGroups()
  const execute = useDuplicateExecute()

  const handleScan = () => {
    scan.mutate({ roots: [roots], minSizeBytes: minSize })
  }

  const toggleFile = (fileId: string, allCopiesSelected: boolean) => {
    if (allCopiesSelected) {
      // Don't allow selecting all copies in a group
      return
    }
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Duplicate Finder</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Find and remove duplicate files to free up disk space.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Scan Root</label>
            <input
              type="text"
              value={roots}
              onChange={(e) => setRoots(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="D:\"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Min File Size (bytes)</label>
            <input
              type="number"
              value={minSize}
              onChange={(e) => setMinSize(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={handleScan} disabled={scan.isPending}>
            {scan.isPending ? 'Scanning...' : 'Scan for Duplicates'}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={!groups}>
            Refresh Groups
          </Button>
        </div>
      </Card>

      {scan.isPending && (
        <Card className="p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      )}

      {groups && groups.items.length > 0 ? (
        <Card className="p-4">
          <h3 className="mb-3 font-semibold">
            {groups.total} duplicate group(s) found
          </h3>
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {groups.items.map((group) => (
              <div key={group.groupId} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {group.files.length} copies ·{' '}
                      {group.sizeBytes.toLocaleString()} bytes
                    </span>
                  </div>
                  <Badge variant="secondary">{group.hash.slice(0, 12)}...</Badge>
                </div>
                <div className="ml-6 space-y-1">
                  {group.files.map((file) => {
                    const allSelected =
                      group.files.length === selectedFileIds.length &&
                      group.files.every((f) => selectedFileIds.includes(f.id))
                    const isLastCopy = group.files.length === 1
                    return (
                      <div key={file.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedFileIds.includes(file.id)}
                          onChange={() =>
                            toggleFile(file.id, allSelected || isLastCopy)
                          }
                          disabled={isLastCopy}
                        />
                        <FolderOpen className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate">{file.path}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="destructive"
              disabled={selectedFileIds.length === 0 || execute.isPending}
              onClick={() =>
                execute.mutate({
                  confirmToken: 'tok_dupe',
                  fileIds: selectedFileIds,
                })
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedFileIds.length} duplicate file(s)
            </Button>
          </div>
        </Card>
      ) : scan.data && groups ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No duplicates found</AlertTitle>
          <AlertDescription>
            Scan completed but no duplicate files were detected.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}