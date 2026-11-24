import { navMeta, type NavFeature } from '@/components/sidebar/NavIcon'
import { DashboardPage } from '@/pages/DashboardPage'
import { SystemRepairPage } from '@/pages/SystemRepairPage'
import { DeepUninstallerPage } from '@/pages/DeepUninstallerPage'
import { CacheCleanerPage } from '@/pages/CacheCleanerPage'
import { SoftwareUpdaterPage } from '@/pages/SoftwareUpdaterPage'
import { DuplicateFinderPage } from '@/pages/DuplicateFinderPage'
import { RestorePointsPage } from '@/pages/RestorePointsPage'
import { DiskAnalyzerPage } from '@/pages/DiskAnalyzerPage'
import { StartupManagerPage } from '@/pages/StartupManagerPage'

interface FeaturePageProps {
  feature: NavFeature
}

const FEATURE_PAGES: Record<NavFeature, React.ComponentType> = {
  dashboard: DashboardPage,
  'system-repair': SystemRepairPage,
  'deep-uninstaller': DeepUninstallerPage,
  'cache-cleaner': CacheCleanerPage,
  'software-updater': SoftwareUpdaterPage,
  'duplicate-finder': DuplicateFinderPage,
  'restore-points': RestorePointsPage,
  'disk-analyzer': DiskAnalyzerPage,
  'startup-manager': StartupManagerPage,
}

export function FeaturePage({ feature }: FeaturePageProps) {
  const { label, desc } = navMeta[feature]
  const PageComponent = FEATURE_PAGES[feature]

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{label}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6">
        <PageComponent />
      </div>
    </div>
  )
}