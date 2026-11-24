import { useCleanerScan, useCleanerPreview, useCleanerExecute } from '@/hooks/useCleaner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, FolderOpen } from 'lucide-react'
import { useState } from 'react'

export function CacheCleanerPage() {
  const [roots, setRoots] = useState('C:\\Users\\%USERNAME%\\AppData\\Local\\Temp')
  const [categories, setCategories] = useState(['temp', 'logs', 'cache'])
  const scan = useCleanerScan()
  const preview = useCleanerPreview()
  const execute = useCleanerExecute()

  const handleScan = () => {
    scan.mutate({ roots: [roots], categories })
  }

  const handlePreview = () => {
    preview.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Cache Cleaner</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan and clean temporary files, logs, and cached data.
        </p>
      </div>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Scan Configuration</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Root Path</label>
            <input
              type="text"
              value={roots}
              onChange={(e) => setRoots(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="C:\Users\..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Categories</label>
            <div className="flex gap-4">
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
            <Button onClick={handleScan} disabled={scan.isPending}>
              <FolderOpen className="mr-2 h-4 w-4" />
              {scan.isPending ? 'Scanning...' : 'Scan'}
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={preview.isPending || !scan.data}
            >
              Preview Cleanup
            </Button>
          </div>
        </div>
      </Card>

      {preview.data && (
        <Card className="p-4">
          <h3 className="mb-3 font-semibold">Preview Results</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            {preview.data.items.length} items · Total:{' '}
            {preview.data.totalSizeBytes.toLocaleString()} bytes
          </p>
          <div className="max-h-64 overflow-y-auto">
            {preview.data.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b py-2 text-sm"
              >
                <span className="truncate">{item.path}</span>
                <Badge variant="secondary" className="ml-2">
                  {item.category}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="destructive"
              onClick={() =>
                execute.mutate({
                  confirmToken: preview.data.confirmToken,
                  paths: preview.data.items.map((i) => i.path),
                })
              }
              disabled={execute.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Execute Cleanup
            </Button>
          </div>
        </Card>
      )}

      {scan.isPending && (
        <Card className="p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
      )}
    </div>
  )
}