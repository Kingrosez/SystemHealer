import { navMeta, type NavFeature } from './NavIcon'
import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const FEATURES: NavFeature[] = [
  'dashboard',
  'system-repair',
  'deep-uninstaller',
  'cache-cleaner',
  'software-updater',
  'duplicate-finder',
  'restore-points',
  'disk-analyzer',
  'startup-manager',
  'history',
  'settings',
]

export function Sidebar() {
  const location = useLocation()
  const current = location.pathname.replace(/^\//, '') || 'dashboard'

  return (
    <aside
      aria-label="Sidebar"
      className="flex w-16 shrink-0 flex-col border-r border-border bg-card p-2 xl:w-64 xl:p-4"
    >
      <h2 className="mb-4 flex items-center justify-center gap-2 text-lg font-semibold text-foreground xl:justify-start">
        <ShieldCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <span className="hidden xl:inline">SystemHealer</span>
      </h2>
      <nav aria-label="Main navigation" className="space-y-1">
        {FEATURES.map((f) => {
          const active = current === f
          const Icon = navMeta[f].icon
          return (
            <Link
              key={f}
              to={f === 'dashboard' ? '/' : `/${f}`}
              title={navMeta[f].label}
              aria-label={navMeta[f].label}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-center gap-3 rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 xl:justify-start xl:px-3 ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden xl:inline">{navMeta[f].label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}