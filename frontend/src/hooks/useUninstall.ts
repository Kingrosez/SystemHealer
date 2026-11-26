import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface Program {
  id: string
  name: string
  publisher: string
  version: string
  installDate: string
  sizeBytes: number
  uninstallString: string
}

export interface ProgramsResponse {
  items: Program[]
  page: number
  size: number
  total: number
}

export interface UninstallRequest {
  force?: boolean
}

export interface UninstallResponse {
  taskId: string
  streamUrl: string
}

export interface LeftoversPreviewResponse {
  files: { path: string; sizeBytes: number }[]
  registryKeys: string[]
  confirmToken: string
}

export interface LeftoversExecuteRequest {
  confirmToken: string
  files: string[]
  registryKeys: string[]
}

export interface LeftoversExecuteResponse {
  deleted: number
  failed: number
  failures: string[]
}

export const programsQueryKey = ['programs'] as const

export function usePrograms(search = '', page = 0, size = 100) {
  return useQuery({
    queryKey: [...programsQueryKey, search, page, size],
    queryFn: () =>
      apiFetch<ProgramsResponse>(
        `/programs?search=${encodeURIComponent(search)}&page=${page}&size=${size}`
      ),
    staleTime: 60_000,
    retry: 2,
    placeholderData: (previousData) => previousData,
  })
}

export function useUninstall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: UninstallRequest }) =>
      apiFetch<UninstallResponse>(`/programs/${id}/uninstall`, {
        method: 'POST',
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programsQueryKey })
    },
  })
}

export function useLeftoversPreview() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<LeftoversPreviewResponse>(
        `/programs/${id}/leftovers/preview`,
        { method: 'POST' }
      ),
  })
}

export function useLeftoversExecute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: LeftoversExecuteRequest
    }) =>
      apiFetch<LeftoversExecuteResponse>(
        `/programs/${id}/leftovers/execute`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programsQueryKey })
    },
  })
}