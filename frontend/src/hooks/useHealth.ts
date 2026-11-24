import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export interface HealthStatus {
  status: 'ok' | 'error'
  version: string
  uptimeSeconds: number
}

export interface SystemInfo {
  os: string
  build: string
  cpu: string
  ramGb: number
  isAdmin: boolean
  bitLockerEnabled: boolean
  wingetAvailable: boolean
}

export const healthQueryKey = ['health'] as const

export function useHealth() {
  return useQuery({
    queryKey: healthQueryKey,
    queryFn: () => apiFetch<HealthStatus>('/health'),
    staleTime: 30_000,
    retry: 2,
  })
}

export const systemInfoQueryKey = ['system', 'info'] as const

export function useSystemInfo() {
  return useQuery({
    queryKey: systemInfoQueryKey,
    queryFn: () => apiFetch<SystemInfo>('/system/info'),
    staleTime: 60_000,
    retry: 2,
  })
}