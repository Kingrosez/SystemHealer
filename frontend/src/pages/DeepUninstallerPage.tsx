import { usePrograms, useUninstall, useLeftoversPreview } from '@/hooks/useUninstall'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function DeepUninstallerPage() {
  const [search, setSearch] = useState('')
  const { data: programs, isLoading } = usePrograms(search)
  const uninstall = useUninstall()
  const preview = useLeftoversPreview()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Deep Uninstaller</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Remove programs and clean up leftover files and registry entries.
        </p>
      </div>

      <Card className="p-4">
        <input
          type="text"
          placeholder="Search installed programs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div className="max-h-96 overflow-y-auto">
          {programs && programs.items.length > 0 ? (
            <div className="space-y-2">
              {programs.items.map((prog) => (
                <div
                  key={prog.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{prog.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {prog.publisher} · v{prog.version}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => preview.mutate(prog.id)}
                      disabled={preview.isPending}
                    >
                      Preview Leftovers
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => uninstall.mutate({ id: prog.id })}
                      disabled={uninstall.isPending}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Uninstall
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search ? 'No programs found matching your search.' : 'No programs installed.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}