import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { DashboardPage } from '@/pages/DashboardPage'
import { SystemRepairPage } from '@/pages/SystemRepairPage'
import { DeepUninstallerPage } from '@/pages/DeepUninstallerPage'
import { CacheCleanerPage } from '@/pages/CacheCleanerPage'
import { SoftwareUpdaterPage } from '@/pages/SoftwareUpdaterPage'
import { DuplicateFinderPage } from '@/pages/DuplicateFinderPage'
import { RestorePointsPage } from '@/pages/RestorePointsPage'
import { DiskAnalyzerPage } from '@/pages/DiskAnalyzerPage'
import { StartupManagerPage } from '@/pages/StartupManagerPage'

const queryClient = new QueryClient()

function Layout() {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
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
