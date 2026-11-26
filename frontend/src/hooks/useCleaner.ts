import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface CleanerScanRequest {
  roots: string[]
  categories: string[]
}

export interface CleanerScanResponse {
  taskId: string
  streamUrl: string
}

export interface CleanerPreviewItem {
  path: string
  category: string
  sizeBytes: number
}

export interface CleanerPreviewResponse {
  items: CleanerPreviewItem[]
  totalSizeBytes: number
  confirmToken: string
}

export interface CleanerExecuteRequest {
  confirmToken: string
  paths: string[]
}

export interface CleanerExecuteResponse {
  deleted: number
  freedBytes: number
  failures: string[]
}

export interface DuplicateScanRequest {
  roots: string[]
  minSizeBytes?: number
}

export interface DuplicateScanResponse {
  taskId: string
  streamUrl: string
}

export interface DuplicateFile {
  id: string
  path: string
  modifiedAt: string
}

export interface DuplicateGroup {
  groupId: string
  hash: string
  sizeBytes: number
  files: DuplicateFile[]
}

export interface DuplicateGroupsResponse {
  items: DuplicateGroup[]
  page: number
  size: number
  total: number
}

export interface DuplicateExecuteRequest {
  confirmToken: string
  fileIds: string[]
}

export interface DuplicateExecuteResponse {
  deleted: number
  freedBytes: number
  failures: string[]
}

export interface DuplicatePreviewRequest {
  page?: number
  size?: number
}

export interface DuplicatePreviewResponse extends DuplicateGroupsResponse {
  confirmToken: string
}

export const cleanerQueryKey = ['cleaner'] as const

export function useCleanerScan() {
  return useMutation({
    mutationFn: (data: CleanerScanRequest) =>
      apiFetch<CleanerScanResponse>('/cleaner/scan', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useCleanerPreview() {
  return useMutation({
    mutationFn: () =>
      apiFetch<CleanerPreviewResponse>('/cleaner/preview', {
        method: 'POST',
      }),
  })
}

export function useCleanerExecute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CleanerExecuteRequest) =>
      apiFetch<CleanerExecuteResponse>('/cleaner/execute', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleanerQueryKey })
    },
  })
}

export function useDuplicateScan() {
  return useMutation({
    mutationFn: (data: DuplicateScanRequest) =>
      apiFetch<DuplicateScanResponse>('/cleaner/duplicates/scan', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useDuplicateGroups(page = 0, size = 50) {
  return useQuery({
    queryKey: [...cleanerQueryKey, 'duplicates', 'groups', page, size],
    queryFn: () =>
      apiFetch<DuplicateGroupsResponse>(
        `/cleaner/duplicates/groups?page=${page}&size=${size}`
      ),
    staleTime: 30_000,
    retry: 2,
  })
}

export function useDuplicatePreview() {
  return useMutation({
    mutationFn: (data: DuplicatePreviewRequest = {}) =>
      apiFetch<DuplicatePreviewResponse>('/cleaner/duplicates/preview', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useDuplicateExecute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DuplicateExecuteRequest) =>
      apiFetch<DuplicateExecuteResponse>('/cleaner/duplicates/execute', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleanerQueryKey })
    },
  })
}