import { useMutation, useQuery } from '@tanstack/react-query'
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

export function useUpdaterScan() {
  return useQuery({
    queryKey: [...updaterQueryKey, 'scan'],
    queryFn: () => apiFetch<UpdaterScanResponse>('/updater/scan'),
    staleTime: 60_000,
    retry: 2,
  })
}

export function useUpdaterExecute() {
  return useMutation({
    mutationFn: (data: UpdaterExecuteRequest) =>
      apiFetch<UpdaterExecuteResponse>('/updater/execute', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}