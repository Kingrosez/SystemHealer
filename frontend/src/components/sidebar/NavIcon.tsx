export type NavFeature =
  | 'dashboard'
  | 'system-repair'
  | 'deep-uninstaller'
  | 'cache-cleaner'
  | 'software-updater'
  | 'duplicate-finder'
  | 'restore-points'
  | 'disk-analyzer'
  | 'startup-manager'

export const navMeta: Record<NavFeature, { label: string; desc: string }> = {
  dashboard: {
    label: 'Dashboard',
    desc: 'System health overview and quick actions',
  },
  'system-repair': {
    label: 'System Repair',
    desc: 'Run SFC, DISM, and other repair tools',
  },
  'deep-uninstaller': {
    label: 'Deep Uninstaller',
    desc: 'Remove programs with leftover cleanup',
  },
  'cache-cleaner': {
    label: 'Cache Cleaner',
    desc: 'Clean temporary and cache files',
  },
  'software-updater': {
    label: 'Software Updater',
    desc: 'Batch update installed programs',
  },
  'duplicate-finder': {
    label: 'Duplicate Finder',
    desc: 'Find and remove duplicate files',
  },
  'restore-points': {
    label: 'Restore Points',
    desc: 'Create and manage system restore points',
  },
  'disk-analyzer': {
    label: 'Disk Analyzer',
    desc: 'Visualize disk usage and find large files',
  },
  'startup-manager': {
    label: 'Startup Manager',
    desc: 'Control startup programs and services',
  },
}