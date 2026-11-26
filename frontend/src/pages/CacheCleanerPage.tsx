import { useState } from 'react'
import { useCleanerScan } from '@/hooks/useCleaner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CleanupPreviewDialog } from '@/components/dialogs/CleanupPreviewDialog'
import { isApiError } from '@/lib/api'
import { AlertCircle, FolderOpen } from 'lucide-react'

export function CacheCleanerPage() {
  const [roots, setRoots] = useState('C:\\Users\\%USERNAME%\\AppData\\Local\\Temp')
  const [categories, setCategories] = useState(['temp', 'logs', 'cache'])
  const [previewOpen, setPreviewOpen] = useState(false)
  const scan = useCleanerScan()

  const handleScan = () => {
    scan.mutate({ roots: [roots], categories })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Cache Cleaner</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan and clean temporary files, logs, and cached data.
        </p>
      </div>

      {scan.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Scan failed</AlertTitle>
          <AlertDescription>
            {isApiError(scan.error)
              ? scan.error.userMessage
              : 'Could not start the cleaner scan.'}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Scan Configuration</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="cleaner-root" className="mb-1 block text-sm font-medium">Root Path</label>
            <Input
              id="cleaner-root"
              type="text"
              value={roots}
              onChange={(e) => setRoots(e.target.value)}
              placeholder="C:\Users\..."
            />
          </div>
          <div>
            <span id="cleaner-categories" className="mb-1 block text-sm font-medium">
              Categories
            </span>
            <div role="group" aria-labelledby="cleaner-categories" className="flex gap-4">
              {['temp', 'logs', 'cache', 'browser'].map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCategories([...categories, cat])
                      } else {
                        setCategories(categories.filter((c) => c !== cat))
                      }
                    }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleScan}
              disabled={scan.isPending || !roots.trim() || categories.length === 0}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              {scan.isPending ? 'Scanning...' : 'Scan'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(true)}
              disabled={!roots.trim() || categories.length === 0}
            >
              Preview Cleanup
            </Button>
          </div>
        </div>
      </Card>

      {scan.isPending && (
        <Card className="p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      )}

      <CleanupPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
