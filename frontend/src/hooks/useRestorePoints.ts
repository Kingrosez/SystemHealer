import { useMutation, useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface RestorePoint {
  id: string
  description: string
  createdAt: string
  sequenceNumber: number
}

export interface RestorePointsResponse {
  points: RestorePoint[]
}

export interface CreateRestorePointRequest {
  description: string
}

export interface CreateRestorePointResponse {
  id: string
  createdAt: string
}

export interface RestoreRequest {
  pointId: string
  confirm: boolean
}

export interface RestoreResponse {
  taskId: string
}

export const restorePointsQueryKey = ['recovery', 'restore-points'] as const

export function useRestorePoints() {
  return useQuery({
    queryKey: restorePointsQueryKey,
    queryFn: () => apiFetch<RestorePointsResponse>('/recovery/restore-points'),
    staleTime: 30_000,
    retry: 2,
  })
}

export function useCreateRestorePoint() {
  return useMutation({
    mutationFn: (data: CreateRestorePointRequest) =>
      apiFetch<CreateRestorePointResponse>('/recovery/restore-points', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useRestore() {
  return useMutation({
    mutationFn: (data: RestoreRequest) =>
      apiFetch<RestoreResponse>('/recovery/restore', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}