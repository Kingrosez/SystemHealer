import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { FeaturePage } from '@/components/FeaturePage'
import type { NavFeature } from '@/components/sidebar/NavIcon'

function Layout() {
  return (
    <div className="flex-1 flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

function FeatureRoute() {
  const feature = (window.location.hash.replace('#/', '') || 'dashboard') as NavFeature
  return <FeaturePage feature={feature} />
}

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <FeaturePage feature="dashboard" />,
      },
      {
        path: '/:feature',
        element: <FeatureRoute />,
      },
    ],
  },
])

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <RouterProvider router={router} />
    </div>
  )
}