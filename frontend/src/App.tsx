import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { HealthBadge } from '@/components/HealthBadge'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/lib/theme'
import { DashboardPage } from '@/pages/DashboardPage'
import { SystemRepairPage } from '@/pages/SystemRepairPage'
import { DeepUninstallerPage } from '@/pages/DeepUninstallerPage'
import { CacheCleanerPage } from '@/pages/CacheCleanerPage'
import { SoftwareUpdaterPage } from '@/pages/SoftwareUpdaterPage'
import { DuplicateFinderPage } from '@/pages/DuplicateFinderPage'
import { RestorePointsPage } from '@/pages/RestorePointsPage'
import { DiskAnalyzerPage } from '@/pages/DiskAnalyzerPage'
import { StartupManagerPage } from '@/pages/StartupManagerPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

function Layout() {
  const { data: settings } = useSettings()
  useTheme(settings?.theme)

  return (
    <div className="flex h-screen w-full bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-end border-b border-border px-6 py-3">
          <HealthBadge />
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-6 focus:outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/system-repair', element: <SystemRepairPage /> },
      { path: '/deep-uninstaller', element: <DeepUninstallerPage /> },
      { path: '/cache-cleaner', element: <CacheCleanerPage /> },
      { path: '/software-updater', element: <SoftwareUpdaterPage /> },
      { path: '/duplicate-finder', element: <DuplicateFinderPage /> },
      { path: '/restore-points', element: <RestorePointsPage /> },
      { path: '/disk-analyzer', element: <DiskAnalyzerPage /> },
      { path: '/startup-manager', element: <StartupManagerPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
