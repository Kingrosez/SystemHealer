import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpCircle,
  Copy,
  Eraser,
  HardDrive,
  History as HistoryIcon,
  LayoutDashboard,
  PackageX,
  Power,
  RotateCcw,
  Settings as SettingsIcon,
  Wrench,
} from 'lucide-react'

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
  | 'history'
  | 'settings'

export const navMeta: Record<
  NavFeature,
  { label: string; desc: string; icon: LucideIcon }
> = {
  dashboard: {
    label: 'Dashboard',
    desc: 'System health overview and quick actions',
    icon: LayoutDashboard,
  },
  'system-repair': {
    label: 'System Repair',
    desc: 'Run SFC, DISM, and other repair tools',
    icon: Wrench,
  },
  'deep-uninstaller': {
    label: 'Deep Uninstaller',
    desc: 'Remove programs with leftover cleanup',
    icon: PackageX,
  },
  'cache-cleaner': {
    label: 'Cache Cleaner',
    desc: 'Clean temporary and cache files',
    icon: Eraser,
  },
  'software-updater': {
    label: 'Software Updater',
    desc: 'Batch update installed programs',
    icon: ArrowUpCircle,
  },
  'duplicate-finder': {
    label: 'Duplicate Finder',
    desc: 'Find and remove duplicate files',
    icon: Copy,
  },
  'restore-points': {
    label: 'Restore Points',
    desc: 'Create and manage system restore points',
    icon: RotateCcw,
  },
  'disk-analyzer': {
    label: 'Disk Analyzer',
    desc: 'Visualize disk usage and find large files',
    icon: HardDrive,
  },
  'startup-manager': {
    label: 'Startup Manager',
    desc: 'Control startup programs and services',
    icon: Power,
  },
  history: {
    label: 'History',
    desc: 'Past repair runs and their outcomes',
    icon: HistoryIcon,
  },
  settings: {
    label: 'Settings',
    desc: 'Preferences, retention, and safety defaults',
    icon: SettingsIcon,
  },
}