import { useState } from 'react'
import { usePrograms, type Program } from '@/hooks/useUninstall'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UninstallConfirmationDialog } from '@/components/dialogs/UninstallConfirmationDialog'
import { LeftoversPreviewDialog } from '@/components/dialogs/LeftoversPreviewDialog'
import { isApiError } from '@/lib/api'
import { formatBytes } from '@/lib/utils'
import { AlertCircle, Package, Trash2 } from 'lucide-react'

export function DeepUninstallerPage() {
  const [search, setSearch] = useState('')
  const { data: programs, isLoading, isFetching, error } = usePrograms(search)
  const [programToUninstall, setProgramToUninstall] = useState<Program | null>(null)
  const [leftoversProgram, setLeftoversProgram] = useState<Program | null>(null)

  if (isLoading && !programs) {
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load programs</AlertTitle>
          <AlertDescription>
            {isApiError(error)
              ? error.userMessage
              : 'Could not fetch the installed programs.'}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Input
            type="search"
            aria-label="Search installed programs"
            placeholder="Search installed programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isFetching && (
            <span className="shrink-0 text-xs text-muted-foreground">Searching...</span>
          )}
        </div>
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
                      {prog.publisher} · v{prog.version} · {formatBytes(prog.sizeBytes)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeftoversProgram(prog)}
                    >
                      Preview Leftovers
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setProgramToUninstall(prog)}
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

      <UninstallConfirmationDialog
        open={programToUninstall !== null}
        onOpenChange={(next) => {
          if (!next) {
            setProgramToUninstall(null)
          }
        }}
        programId={programToUninstall?.id}
        displayName={programToUninstall?.name}
        displayVersion={programToUninstall?.version}
        publisher={programToUninstall?.publisher}
        installDate={programToUninstall?.installDate}
        estimatedSize={
          programToUninstall
            ? formatBytes(programToUninstall.sizeBytes)
            : undefined
        }
        onUninstalled={() => {
          const target = programToUninstall
          if (target) {
            setLeftoversProgram(target)
          }
        }}
      />

      <LeftoversPreviewDialog
        open={leftoversProgram !== null}
        onOpenChange={(next) => {
          if (!next) {
            setLeftoversProgram(null)
          }
        }}
        programId={leftoversProgram?.id}
        programName={leftoversProgram?.name}
      />
    </div>
  )
}
