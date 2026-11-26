import { useState } from 'react'
import {
  useDuplicateScan,
  useDuplicateGroups,
  useDuplicatePreview,
  type DuplicateGroup,
} from '@/hooks/useCleaner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DuplicateDeletionDialog } from '@/components/dialogs/DuplicateDeletionDialog'
import { isApiError } from '@/lib/api'
import { formatBytes } from '@/lib/utils'
import { Copy, FolderOpen, Trash2, AlertCircle } from 'lucide-react'

export function DuplicateFinderPage() {
  const [roots, setRoots] = useState('D:\\')
  const [minSize, setMinSize] = useState(1024)
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [pendingDelete, setPendingDelete] = useState<{
    token: string
    fileIds: string[]
  } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const scan = useDuplicateScan()
  const {
    data: groups,
    refetch,
    isLoading: groupsLoading,
    error: groupsError,
  } = useDuplicateGroups()
  const duplicatePreview = useDuplicatePreview()

  const handleScan = () => {
    scan.mutate(
      { roots: [roots], minSizeBytes: minSize },
      { onSuccess: () => refetch() }
    )
  }

  const toggleFile = (fileId: string, group: DuplicateGroup) => {
    setSelectedFileIds((prev) => {
      if (prev.includes(fileId)) {
        return prev.filter((id) => id !== fileId)
      }

      const groupIds = group.files.map((file) => file.id)
      const selectedInGroup = groupIds.filter((id) => prev.includes(id))
      if (selectedInGroup.length >= groupIds.length - 1) {
        return prev
      }

      return [...prev, fileId]
    })
  }

  const handleDeleteSelected = () => {
    setDeleteError(null)
    duplicatePreview.mutate(
      { page: 0, size: 50 },
      {
        onSuccess: (data) => {
          setPendingDelete({
            token: data.confirmToken,
            fileIds: selectedFileIds,
          })
        },
        onError: (err) => {
          setDeleteError(
            isApiError(err)
              ? err.userMessage
              : 'Could not prepare duplicate deletion.'
          )
        },
      }
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
            <label htmlFor="duplicate-root" className="mb-1 block text-sm font-medium">Scan Root</label>
            <Input
              id="duplicate-root"
              type="text"
              value={roots}
              onChange={(e) => setRoots(e.target.value)}
              placeholder="D:\"
            />
          </div>
          <div>
            <label htmlFor="duplicate-min-size" className="mb-1 block text-sm font-medium">Min File Size (bytes)</label>
            <Input
              id="duplicate-min-size"
              type="number"
              min={0}
              value={minSize}
              onChange={(e) => setMinSize(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleScan}
            disabled={scan.isPending || !roots.trim()}
          >
            {scan.isPending ? 'Scanning...' : 'Scan for Duplicates'}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={!groups}>
            Refresh Groups
          </Button>
        </div>
        {scan.isError && (
          <p className="mt-2 text-sm text-destructive">
            {isApiError(scan.error)
              ? scan.error.userMessage
              : 'Could not start the duplicate scan.'}
          </p>
        )}
      </Card>

      {scan.isPending && (
        <Card className="p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      )}

      {groupsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load duplicate groups</AlertTitle>
          <AlertDescription>
            {isApiError(groupsError)
              ? groupsError.userMessage
              : 'Could not fetch duplicate groups.'}
          </AlertDescription>
        </Alert>
      )}

      {groupsLoading && !groups ? (
        <Card className="p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      ) : groups && groups.items.length > 0 ? (
        <Card className="p-4">
          <h3 className="mb-1 font-semibold">
            {groups.total} duplicate group(s) found
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Select files to delete. At least one copy of each file must remain.
          </p>
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {groups.items.map((group) => (
              <div key={group.groupId} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {group.files.length} copies · {formatBytes(group.sizeBytes)}
                    </span>
                  </div>
                  <Badge variant="secondary">{group.hash.slice(0, 12)}...</Badge>
                </div>
                <div className="ml-6 space-y-1">
                  {group.files.map((file) => {
                    const isLastCopy = group.files.length === 1
                    return (
                      <div key={file.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          aria-label={`${isLastCopy ? 'Keep' : 'Select'} ${file.path}`}
                          checked={selectedFileIds.includes(file.id)}
                          onChange={() => toggleFile(file.id, group)}
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

          {deleteError && (
            <p className="mt-3 text-sm text-destructive">{deleteError}</p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedFileIds.length} file(s) selected
            </p>
            <Button
              variant="destructive"
              disabled={
                selectedFileIds.length === 0 || duplicatePreview.isPending
              }
              onClick={handleDeleteSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {duplicatePreview.isPending
                ? 'Preparing...'
                : `Delete ${selectedFileIds.length} duplicate file(s)`}
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

      <DuplicateDeletionDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) {
            setPendingDelete(null)
          }
        }}
        confirmToken={pendingDelete?.token}
        duplicates={groups?.items}
        fileIds={pendingDelete?.fileIds}
        onFinished={() => {
          setSelectedFileIds([])
          refetch()
        }}
      />
    </div>
  )
}
