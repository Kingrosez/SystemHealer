import { useEffect } from 'react'

export type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'systemhealer.theme'

export function getStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'system' || value === 'light' || value === 'dark') {
      return value
    }
  } catch {
    return null
  }
  return null
}

export function storeTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    return
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)

  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

export function useTheme(theme: Theme | undefined) {
  useEffect(() => {
    if (!theme) return

    applyTheme(theme)

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyTheme(theme)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [theme])
}
