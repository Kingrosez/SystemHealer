import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface RepairOption {
  id: string
  name: string
  risk: 'low' | 'medium' | 'high'
}

export interface RepairOptionsResponse {
  options: RepairOption[]
}

export interface RepairStartRequest {
  actions: string[]
  createRestorePoint?: boolean
}

export interface RepairStartResponse {
  taskId: string
  streamUrl: string
  restorePointStatus?: string | null
  restorePointToken?: string | null
}

export interface StartRepairVariables extends RepairStartRequest {
  confirmToken?: string
}

export interface RepairHistoryItem {
  id: string
  startedAt: string
  finishedAt: string | null
  actions: string[]
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  summary: { repaired: number; failed: number }
}

export interface RepairHistoryResponse {
  items: RepairHistoryItem[]
  page: number
  size: number
  total: number
}

export interface RepairDetail {
  id: string
  startedAt: string
  finishedAt: string
  actions: string[]
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED'
  summary: { repaired: number; failed: number }
  logs: { line: string; level: string; timestamp: string }[]
}

export const repairOptionsQueryKey = ['repair', 'options'] as const
export const repairHistoryQueryKey = ['repair', 'history'] as const

export function useRepairOptions() {
  return useQuery({
    queryKey: repairOptionsQueryKey,
    queryFn: () => apiFetch<RepairOptionsResponse>('/repair/options'),
    staleTime: 5 * 60_000,
    retry: 2,
  })
}

export function useRepairHistory(page = 0, size = 50) {
  return useQuery({
    queryKey: [...repairHistoryQueryKey, page, size],
    queryFn: () =>
      apiFetch<RepairHistoryResponse>(
        `/repair/history?page=${page}&size=${size}`
      ),
    staleTime: 60_000,
    retry: 2,
  })
}

export function useRepairDetail(id: string) {
  return useQuery({
    queryKey: [...repairHistoryQueryKey, id],
    queryFn: () => apiFetch<RepairDetail>(`/repair/history/${id}`),
    enabled: !!id,
    staleTime: 60_000,
    retry: 2,
  })
}

export function useStartRepair() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ confirmToken, ...data }: StartRepairVariables) =>
      apiFetch<RepairStartResponse>('/repair/start', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: confirmToken
          ? { 'X-Confirm-Token': confirmToken }
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repairHistoryQueryKey })
    },
  })
}

export function useCancelRepair() {
  return useMutation({
    mutationFn: (taskId: string) =>
      apiFetch<void>(`/repair/${taskId}/cancel`, {
        method: 'POST',
      }),
  })
}