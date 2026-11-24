import { useMutation, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface DiskDrive {
  letter: string
  label: string
  totalBytes: number
  usedBytes: number
  freeBytes: number
  fileSystem: string
}

export interface DiskUsageItem {
  path: string
  name: string
  sizeBytes: number
  isDirectory: boolean
  children?: DiskUsageItem[]
}

export interface DiskScanRequest {
  drive: string
  maxDepth?: number
}

export interface DiskScanResponse {
  taskId: string
  streamUrl: string
}

export interface DiskUsageResponse {
  drives: DiskDrive[]
  usage: DiskUsageItem[]
}

export const diskQueryKey = ['disk'] as const

export function useDiskDrives() {
  return useQuery({
    queryKey: [...diskQueryKey, 'drives'],
    queryFn: () => apiFetch<DiskUsageResponse>('/disk/usage'),
    staleTime: 60_000,
    retry: 2,
  })
}

export function useDiskScan() {
  return useMutation({
    mutationFn: (data: DiskScanRequest) =>
      apiFetch<DiskScanResponse>('/disk/scan', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}