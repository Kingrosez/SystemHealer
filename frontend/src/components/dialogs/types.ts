import type { ReactNode } from 'react'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  actionLabel?: string
  onAction?: () => void
  actionVariant?: 'default' | 'destructive' | 'outline'
  isActionDisabled?: boolean
  isActionLoading?: boolean
  showRestorePoint?: boolean
  previewItems?: PreviewItem[]
}

export interface PreviewItem {
  id: string
  name: string
  path?: string
  size: string
  type: 'file' | 'folder'
}

export interface RepairStatus {
  sfcStatus: 'idle' | 'scanning' | 'complete' | 'failed'
  dismStatus: 'idle' | 'scanning' | 'complete' | 'failed'
  repairCount: number
  errors: string[]
}

export interface UninstallInfo {
  displayName: string
  displayVersion: string
  publisher: string
  installDate: string
  estimatedSize: string
  uninstallString: string
}

export interface DuplicateGroup {
  id: string
  name: string
  fileCount: number
  totalSize: string
  previewItems: PreviewItem[]
}