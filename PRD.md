# Product Requirements Document (PRD)

## 1. Product Overview
SystemHealer is a Windows desktop utility that helps non-technical and semi-technical
users diagnose, repair, clean, and recover their PCs through one unified interface.
It replaces the need to run CMD commands, hunt through Control Panel, and juggle
multiple third-party tools.

## 2. Problem Statement
Windows users face:
- Corrupted system files requiring CMD commands they don't understand
- Bloated storage from caches, duplicates, and leftover uninstall data
- Outdated software scattered across the system
- Fear of "cleaning" tools that break things with no undo
- No single tool that safely combines repair, cleanup, update, and recovery

## 3. Target Users

### Persona 1: Non-Technical Home User
- Doesn't know what SFC or DISM mean
- Wants a "Fix my PC" button
- Fears breaking something
- Needs clear warnings and safe defaults

### Persona 2: Power User / Gamer
- Understands system maintenance
- Wants granular control and logs
- Cares about performance and disk space
- Will read the preview before deleting

### Persona 3: IT Support / Technician
- Repairs multiple PCs
- Needs logs, history, and repeatable actions
- Values recovery and rollback above all

## 4. User Stories

- As a home user, I want to click "Repair" and have SFC + DISM run automatically
  so I don't have to type commands.
- As a power user, I want to preview what will be deleted before cleaning so I
  don't lose files.
- As an IT tech, I want a log of every repair so I can document what was done.
- As any user, I want a restore point created before risky actions so I can undo them.
- As a home user, I want to uninstall a program and remove all its leftovers in
  one click.
- As a gamer, I want to find duplicate files taking up disk space and remove them
  safely.
- As any user, I want to see which apps are outdated and update them in bulk.

## 5. Feature Prioritization (MoSCoW)

### Must Have (MVP)
- System repair (SFC, DISM, network reset)
- Restore point creation before risky actions
- Junk/temp file cleaner with preview
- Installed programs list + standard uninstall

### Should Have
- Leftover file/registry cleanup after uninstall
- Duplicate file finder
- Software updater (winget)
- Repair history log with revert option

### Could Have
- Force uninstall for broken programs
- Registry backup/restore
- BitLocker detection and warning
- Scheduled automatic cleanup

### Won't Have (v1)
- Real-time antivirus
- Cloud sync / remote management
- macOS/Linux support
- Driver updating

## 6. Key User Flows

### Flow 1: One-Click Repair
Home screen → "Repair My PC" → confirmation (restore point will be created) →
progress with live log → results summary → option to roll back

### Flow 2: Deep Uninstall
Programs list → select program → uninstall → standard uninstaller runs →
leftover scan → review leftovers → confirm delete → done

### Flow 3: Safe Cleanup
Cleaner tab → scan → preview results (files + sizes) → select items →
confirm → delete to Recycle Bin → summary

### Flow 4: Recovery
History tab → select a past repair → "Restore to this point" → confirmation →
system restore runs → reboot if needed

## 7. UX Principles
- Safety first: every destructive action has a preview and a confirmation
- Plain language: no jargon in the main UI (SFC = "System File Repair")
- Show progress: never leave the user guessing during long operations
- Recovery always available: every risky action is reversible
- Administrator awareness: clearly indicate when elevation is required

## 8. Success Metrics
- User can complete a full repair without opening CMD
- Zero data loss reported from cleanup operations
- 80%+ of risky actions have a tested rollback path
- User can find and remove duplicate files in under 3 clicks

## 9. Open Questions
- Should the updater use winget only, or also support Chocolatey?
- How long should repair logs be retained?
- Should scheduled cleanup be in v1 or v1.1?

## 10. Status
Draft — v0.1