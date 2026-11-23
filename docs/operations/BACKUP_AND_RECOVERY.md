# Backup and Recovery Guide

## 1. Purpose
This document describes how to back up and recover SystemHealer data, ensuring business continuity and protection against data loss.

## 2. Backup Strategy

### 2.1 What to Backup
| Item | Location | Frequency |
|------|----------|-----------|
| Database | `%APPDATA%\SystemHealer\systemhealer.db` | Before major operations |
| Configuration | `%APPDATA%\SystemHealer\application.yml` | When changed |
| Logs | `%APPDATA%\SystemHealer\logs\` | Retention: 30 days |
| Restore Points | Windows System Restore | Automatic |

### 2.2 Backup Types

#### 2.2.1 Full Backup
Complete copy of all data.

```powershell
# Full backup command
$source = "$env:APPDATA\SystemHealer"
$dest = "D:\Backups\SystemHealer\$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path $source -Destination $dest -Recurse
```

#### 2.2.2 Incremental Backup
Only changes since last backup.

```powershell
# Incremental backup using robocopy
robocopy "$env:APPDATA\SystemHealer" "D:\Backups\SystemHealer\incremental" /MIR /XD logs /XF *.log
```

## 3. Manual Backup Procedures

### 3.1 Using the Application (Future Feature)
Planned: Backup button in Settings → Backup & Recovery.

### 3.2 Command Line Backup
```powershell
# Create backup directory with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "D:\Backups\SystemHealer-$timestamp"

# Create backup
New-Item -ItemType Directory -Path $backupDir -Force
Copy-Item -Path "$env:APPDATA\SystemHealer\systemhealer.db" -Destination $backupDir
Copy-Item -Path "$env:APPDATA\SystemHealer\application.yml" -Destination $backupDir

Write-Host "Backup created at: $backupDir"
```

### 3.3 Automated PowerShell Script
```powershell
# Save as: backup-systemhealer.ps1
param(
    [string]$BackupRoot = "D:\Backups",
    [int]$RetentionDays = 30
)

$sourceDir = "$env:APPDATA\SystemHealer"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $BackupRoot "SystemHealer-$timestamp"

# Create backup
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item -Path "$sourceDir\systemhealer.db" -Destination $backupDir
Copy-Item -Path "$sourceDir\application.yml" -Destination $backupDir

# Clean old backups
Get-ChildItem $BackupRoot -Directory |
    Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-$RetentionDays) } |
    Remove-Item -Recurse -Force

Write-Host "Backup completed: $backupDir"
```

## 4. Automated Backups

### 4.1 Windows Task Scheduler
Create scheduled task for daily backups:

```powershell
# Register scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Scripts\backup-systemhealer.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Register-ScheduledTask -TaskName "SystemHealer Backup" -Action $action -Trigger $trigger -Settings $settings -User "SYSTEM"
```

### 4.2 Backup Configuration
| Setting | Recommended Value |
|---------|-------------------|
| Frequency | Daily |
| Retention | 30 days |
| Backup time | 2:00 AM (off-peak) |
| Storage location | External drive or network share |

## 5. Backup Verification

### 5.1 Verify Database Integrity
```bash
# SQLite integrity check
sqlite3 "%APPDATA%\SystemHealer\systemhealer.db" "PRAGMA integrity_check;"
```

### 5.2 Verify Backup Files
```powershell
# Check backup exists and is readable
$backupFile = "D:\Backups\SystemHealer-latest\systemhealer.db"
if (Test-Path $backupFile) {
    $size = (Get-Item $backupFile).Length
    Write-Host "Backup verified: $size bytes"
} else {
    Write-Error "Backup file not found"
}
```

## 6. Recovery Procedures

### 6.1 Stop Application
```powershell
# Stop SystemHealer if running
tasklist /FI "IMAGENAME eq java.exe" /FO LIST /NH | Select-String "systemhealer"
Stop-Process -Name "java" -Force
```

### 6.2 Restore Database
```powershell
# Stop application first
# Navigate to backup
$backupDir = "D:\Backups\SystemHealer-20240115-020000"

# Restore database
Stop-Service "SystemHealer" -Force  # If installed as service
Copy-Item -Path "$backupDir\systemhealer.db" -Destination "$env:APPDATA\SystemHealer" -Force

# Start application
Start-Process "C:\Program Files\SystemHealer\systemhealer.exe"
```

### 6.3 Restore Configuration
```powershell
# Restore configuration (optional)
Copy-Item -Path "D:\Backups\SystemHealer-20240115-020000\application.yml" -Destination "$env:APPDATA\SystemHealer" -Force
```

## 7. Point-in-Time Recovery

### 7.1 Database WAL Mode
When WAL mode is enabled:
- Multiple WAL checkpoint files created
- Point-in-time recovery possible using SQLite backup command

```bash
# Backup with current state
sqlite3 "$env:APPDATA\SystemHealer\systemhealer.db" ".backup 'D:\Backups\systemhealer-pitr.db'"
```

### 7.2 Restore to Specific Time
```bash
# Requires WAL files available
sqlite3 "$env:APPDATA\SystemHealer\systemhealer.db" "PRAGMA wal_checkpoint(TRUNCATE);"
```

## 8. Disaster Recovery Plan

### 8.1 Recovery Time Objective (RTO)
- **Critical**: 4 hours (major data loss)
- **Standard**: 24 hours (full restore)

### 8.2 Recovery Point Objective (RPO)
- **Maximum data loss**: 1 day (daily backup frequency)

### 8.3 Recovery Steps

| Step | Action | Owner | Time |
|------|--------|-------|------|
| 1 | Confirm data loss | Administrator | 15 min |
| 2 | Stop SystemHealer | Administrator | 5 min |
| 3 | Identify latest backup | Administrator | 15 min |
| 4 | Restore database | Administrator | 30 min |
| 5 | Verify restore | Administrator | 15 min |
| 6 | Document incident | Administrator | 30 min |

## 9. Backup Encryption (Future)

### 9.1 Encrypted Backup
```powershell
# Export encrypted backup
$secureString = Read-Host "Enter backup password" -AsSecureString
$credential = New-Object System.Management.Automation.PSCredential ("user", $secureString)

# Encrypt using 7-Zip
7z a -p"$($credential.GetNetworkCredential().Password)" "backup.7z" $backupDir
```

### 9.2 Encrypted Restore
```powershell
7z e -p"password" backup.7z -o$restoreDir
```

## 10. Testing Backups

### 10.1 Regular Restore Tests
Schedule quarterly test restores:

```powershell
# Test restore to alternate location
$testDir = "C:\Temp\SystemHealer-Test"
Copy-Item -Path "$backupDir\systemhealer.db" -Destination $testDir
# Verify database accessible
sqlite3 "$testDir\systemhealer.db" "SELECT COUNT(*) FROM operation_history;"
```

### 10.2 Backup Test Checklist
- [ ] Backup completes without errors
- [ ] Database integrity check passes
- [ ] Configuration file is readable
- [ ] Restore to test location successful
- [ ] Application starts with restored data
- [ ] Recent operations visible in history

## 11. Offsite Backup

### 11.1 Cloud Storage Integration
```powershell
# Upload to cloud storage (example using rclone)
rclone copy "$backupDir" "cloud-provider:systemhealer-backups/"
```

### 11.2 Network Backup
```powershell
# Network share backup
$networkShare = "\\backup-server\systemhealer-backups"
Copy-Item -Path "$backupDir" -Destination $networkShare -Recurse
```

## 12. Backup Best Practices

### 12.1 General Guidelines
- Store backups on separate physical devices
- Verify backup integrity monthly
- Test restore procedure quarterly
- Encrypt backups containing sensitive data
- Document backup locations and credentials securely

### 12.2 Warning Signs
| Symptom | Action Required |
|---------|-----------------|
| Backup job fails | Investigate cause, retry |
| Backup file size too small | Check exclusion rules |
| Cannot verify backup | Re-run backup, check permissions |

### 12.3 Maintenance Tasks
1. **Monthly**: Verify all backups are accessible
2. **Quarterly**: Test restore to new location
3. **Annually**: Review and update backup strategy
4. **After major updates**: Create backup before upgrade

## 13. Data Recovery Without Backup

### 13.1 SQLite Recovery
If database is corrupted but no backup exists:

```bash
# Attempt recovery with sqlite3
sqlite3 "$env:APPDATA\SystemHealer\systemhealer.db" ".recover" > recovered.sql
sqlite3 recovered.db < recovered.sql
```

### 13.2 Windows System Restore
Restore Points created by SystemHealer can be used to recover Windows system state, but database data will be lost unless also backed up.

## 14. Documentation

### 14.1 Backup Log
Maintain record of backup activities:

```
Backup Log - SystemHealer
=========================
2024-01-15: Daily backup completed (2.3GB)
2024-01-15 02:00: Backup verification passed
2024-01-16: Manual backup before SFC operation
...
```

### 14.2 Recovery Runbook
Keep recovery instructions in:
- `%APPDATA%\SystemHealer\docs\Recovery-Runbook.md`
- Emergency contact list
- Backup location inventory