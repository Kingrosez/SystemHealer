import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface SoftwareUpdate {
  id: string
  name: string
  currentVersion: string
  availableVersion: string
}

export interface UpdaterScanResponse {
  available: boolean
  updates: SoftwareUpdate[]
}

export interface UpdaterExecuteRequest {
  ids: string[]
}

export interface UpdaterExecuteResponse {
  taskId: string
  streamUrl: string
}

export const updaterQueryKey = ['updater'] as const
export const updaterScanQueryKey = [...updaterQueryKey, 'scan'] as const

export function useUpdaterScan() {
  return useQuery({
    queryKey: updaterScanQueryKey,
    queryFn: () => apiFetch<UpdaterScanResponse>('/updater/scan'),
    staleTime: 60_000,
    retry: 2,
  })
}

export function useUpdaterExecute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdaterExecuteRequest) =>
      apiFetch<UpdaterExecuteResponse>('/updater/execute', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<UpdaterScanResponse>(
        updaterScanQueryKey,
        (current) => {
          if (!current) return current

          return {
            ...current,
            updates: current.updates.filter(
              (update) => !variables.ids.includes(update.id)
            ),
          }
        }
      )
    },
  })
}