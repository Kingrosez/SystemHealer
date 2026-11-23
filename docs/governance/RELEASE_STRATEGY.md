# Release Strategy

## 1. Purpose
This document defines how SystemHealer versions, releases, and communicates
updates. It covers semantic versioning, release cadence, branching for releases,
hotfixes, and deprecation policy.

## 2. Versioning

SystemHealer follows **Semantic Versioning 2.0.0** (`MAJOR.MINOR.PATCH`):

| Part | Increment when |
|------|----------------|
| MAJOR | Breaking changes to API, DB schema, or user-facing behavior |
| MINOR | New features, backward compatible |
| PATCH | Bug fixes, backward compatible |

Pre-release tags: `-alpha.N`, `-beta.N`, `-rc.N` (e.g., `0.2.0-beta.1`).

## 3. Release Cadence

| Type | Frequency | Notes |
|------|-----------|-------|
| Patch | As needed | Bug/security fixes |
| Minor | Every 4–6 weeks | New features |
| Major | Rare, planned | Breaking changes + migration guide |

v1.0.0 is the first stable release. Before that, `0.x.y` is pre-stable.

## 4. Branching for Releases

We use **GitHub Flow** (see `CONTRIBUTING.md`). Releases are cut from `main`:

1. Update `CHANGELOG.md` (move `[Unreleased]` → new version).
2. Bump version in `pom.xml` and `package.json`.
3. Commit: `chore(release): v0.2.0`.
4. Tag: `git tag -a v0.2.0 -m "Release v0.2.0"`.
5. Push: `git push origin main --tags`.
6. CI builds artifacts and creates a GitHub Release.

No long-lived release branches in v1. If maintenance of old majors is needed
later, introduce `release/x.y` branches then.

## 5. Release Checklist

- [ ] All tests pass (frontend + backend)
- [ ] `CHANGELOG.md` updated
- [ ] Version bumped in `pom.xml` and `package.json`
- [ ] Docs updated for behavior changes
- [ ] Installer built and smoke-tested on Windows 10 + 11
- [ ] SHA-256 checksums generated
- [ ] GitHub Release created with notes
- [ ] Tag pushed

## 6. Hotfix Process

For urgent fixes to a released version:

1. Branch from `main`: `git checkout -b fix/<issue>`.
2. Fix + test.
3. Merge via PR.
4. Bump PATCH version, update changelog, tag, release.

If `main` has unreleased changes that can't ship, cherry-pick the fix onto a
temporary `release/x.y` branch (introduced only when needed).

## 7. Pre-Releases

- `alpha`: internal, unstable.
- `beta`: feature-complete, testing.
- `rc`: release candidate, only critical fixes.

Pre-releases are marked on GitHub and not recommended for general users.

## 8. Deprecation Policy

- Deprecated features are announced in `CHANGELOG.md` under `Deprecated`.
- They remain for at least one MINOR release before removal in the next MAJOR.
- Removal requires a migration note in the release notes.

## 9. Communication

- **GitHub Releases**: primary channel (notes from `CHANGELOG.md`).
- **README**: links to latest release.
- **In-app**: "What's new" panel after update (future).

## 10. Rollback of a Release

- If a release is broken, publish a PATCH fix promptly.
- Do not delete tags or releases; mark them as "yanked" in notes if necessary.
- Keep previous installers available for manual rollback.

## 11. Related Documents
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `docs/operations/DEPLOYMENT.md`
- `docs/governance/RISK_REGISTER.md`

## 12. Status
Draft — v0.1