import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface StartupProgram {
  id: string
  name: string
  publisher: string
  path: string
  enabled: boolean
  impact: 'high' | 'medium' | 'low'
}

export interface StartupProgramsResponse {
  items: StartupProgram[]
  page: number
  size: number
  total: number
}

export interface ToggleStartupRequest {
  enabled: boolean
}

export const startupQueryKey = ['startup'] as const

export function useStartupPrograms() {
  return useQuery({
    queryKey: startupQueryKey,
    queryFn: () =>
      apiFetch<StartupProgramsResponse>(
        '/startup/programs?page=0&size=100'
      ),
    staleTime: 30_000,
    retry: 2,
  })
}

export function useToggleStartup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiFetch<void>(`/startup/programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled } satisfies ToggleStartupRequest),
      }),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<StartupProgramsResponse>(
        startupQueryKey,
        (current) => {
          if (!current) return current

          return {
            ...current,
            items: current.items.map((item) =>
              item.id === variables.id
                ? { ...item, enabled: variables.enabled }
                : item
            ),
          }
        }
      )
    },
  })
}