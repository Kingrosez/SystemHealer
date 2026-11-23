# Deployment

## 1. Purpose
This document describes how SystemHealer is built, packaged, and delivered to
Windows users. It covers development builds, production packaging, elevation,
installer options, and release distribution.

## 2. Deployment Model

SystemHealer is a **local desktop application** consisting of:

- A React frontend (static files)
- A Spring Boot backend (JAR)
- A Windows launcher that starts the backend and opens the UI

In v1, the frontend is served by the Spring Boot backend as static resources, so
the user runs a single process. A desktop wrapper (Electron/Tauri) is deferred to
v1.1 (see ADR-010).

## 3. Build Pipeline

### 3.1 Frontend Build
```bash
cd frontend
npm ci
npm run build
# Output: frontend/dist/
```

### 3.2 Backend Build
```bash
cd backend
./mvnw clean package
# Output: backend/target/systemhealer-<version>.jar
```

### 3.3 Combined Build (Frontend into Backend)
Copy `frontend/dist/*` into `backend/src/main/resources/static/` before packaging,
or use the Maven frontend plugin. The resulting JAR serves both API and UI.

```bash
# Example combined build
cd frontend && npm ci && npm run build
rm -rf ../backend/src/main/resources/static/*
cp -r dist/* ../backend/src/main/resources/static/
cd ../backend && ./mvnw clean package
```

## 4. Runtime Configuration

| Setting | Default | Override |
|---------|---------|----------|
| Server port | 8080 | `SERVER_PORT` env / `application.yml` |
| Bind address | 127.0.0.1 | fixed (do not expose) |
| DB path | `%APPDATA%\SystemHealer\systemhealer.db` | `SYSTEMHEALER_DB_PATH` |
| Log level | INFO | `LOGGING_LEVEL_ROOT` |

Production profile: `application-prod.yml` with SQLite and file logging.

## 5. Administrator Elevation

Most repair features require administrator privileges. Options:

1. **Manifest elevation** (preferred): embed a manifest requesting
   `requireAdministrator` in the launcher EXE.
2. **Launcher script**: a small `.bat`/`.ps1` that relaunches elevated.
3. **Runtime check**: backend returns `ADMIN_REQUIRED` if not elevated; UI prompts.

The app must clearly indicate admin status in the top bar (see UI guidelines).

## 6. Installer Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Portable ZIP | Simple, no install | Manual updates | Good for early testing |
| MSI (WiX) | Standard, uninstall entry | More setup | **Recommended for v1** |
| EXE (Inno Setup) | Easy, scriptable | Non-MS standard | Good alternative |
| MSIX | Modern, sandboxed | Signing requirements, FS limits | Future |

Recommended v1 path: **MSI via WiX**, bundling a JRE (jlink) and the JAR, with a
Start Menu shortcut and uninstall entry.

## 7. Bundling a Java Runtime

Users may not have Java installed. Bundle a trimmed JRE with `jlink`:

```bash
jlink --add-modules java.base,java.sql,java.desktop,java.logging,java.management \
      --output runtime --strip-debug --compress=2 --no-header-files --no-man-pages
```

The installer places `runtime/`, the JAR, and the launcher in
`C:\Program Files\SystemHealer\`.

## 8. Release Process

1. Update `CHANGELOG.md` (move Unreleased → version).
2. Bump version in `pom.xml` and `package.json`.
3. Tag the release: `git tag v0.1.0 && git push origin v0.1.0`.
4. CI builds the JAR + installer and attaches them to the GitHub Release.
5. Write release notes from `CHANGELOG.md`.
6. Publish the installer.

## 9. Distribution

- Primary: GitHub Releases (installer + checksum).
- Provide SHA-256 checksums for downloads.
- Future: code signing certificate to avoid SmartScreen warnings.

## 10. Rollback

- Keep the previous installer version available.
- The app's data (SQLite) is backward compatible; migrations are additive.
- If a release is broken, publish a patch release rather than yanking.

## 11. Environment Matrix

| OS | Version | Support |
|----|---------|---------|
| Windows 11 | 22H2+ | Primary |
| Windows 10 | 21H2 (19044+) | Supported |
| Windows 10 | older | Best effort |

## 12. Related Documents
- `docs/operations/CONFIGURATION.md`
- `docs/operations/OBSERVABILITY.md`
- `docs/operations/BACKUP_AND_RECOVERY.md`
- `docs/architecture/ARCHITECTURE_DECISIONS.md` (ADR-010)

## 13. Status
Draft — v0.1