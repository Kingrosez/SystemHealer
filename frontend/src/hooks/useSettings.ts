import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { storeTheme, type Theme } from '@/lib/theme'

export interface AppSettings {
  logRetentionDays: number
  defaultScanRoots: string[]
  theme: Theme
  createRestorePointByDefault: boolean
}

export type UpdateSettingsRequest = Partial<AppSettings>

export const settingsQueryKey = ['settings'] as const

export function useSettings() {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: () => apiFetch<AppSettings>('/settings'),
    staleTime: 60_000,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) =>
      apiFetch<AppSettings>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsQueryKey, settings)
      storeTheme(settings.theme)
    },
  })
}
