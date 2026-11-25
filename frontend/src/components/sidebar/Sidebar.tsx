import { navMeta, type NavFeature } from './NavIcon'
import { Link, useLocation } from 'react-router-dom'

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
]

export function Sidebar() {
  const location = useLocation()
  const current = location.pathname.replace(/^\//, '') || 'dashboard'

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold text-foreground">SystemHealer</h2>
      <nav className="space-y-1">
        {FEATURES.map((f) => {
          const active = current === f
          return (
            <Link
              key={f}
              to={`/${f}`}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {navMeta[f].label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}