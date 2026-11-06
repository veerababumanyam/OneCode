# ADR-0022: Root VERSION file as the single source of truth for the release version

**Status:** Proposed
**Date:** 2026-11-06
**Deciders:** Product owner; repository maintainers
**Affects:** TRD §15.1 steps 7–8, §15.2; engineering standards §11; no PRD `FR-nn` and no agent rule `R-nn` changes
**Revisit trigger:** A Cargo workspace or Tauri shell lands whose manifest cannot carry a mirrored version, or a second independently releasable artifact appears that must not share the application version.

## Context

The repository had no central version. Two private npm manifests each declared `0.1.0`, `CHANGELOG.md` had only an `[Unreleased]` section, and the repository had no Git tags — so nothing recorded what the product version was, and nothing failed when the two manifests disagreed with each other or with a release.

Two standards already assume a single answer exists. [Engineering standards §11](../ENGINEERING-STANDARDS.md#11-release) requires "Semantic versioning for the application and for every public schema", and the [dependency policy §5](../DEPENDENCY-POLICY.md#5-pinning-and-installation) anticipates "a version file once CI exists". Neither names the file or an enforcement point.

The planned layout multiplies the problem. [Engineering standards §2](../ENGINEERING-STANDARDS.md#2-repository-layout-proposed-pending-adr-0002) describes a Cargo workspace of roughly thirty crates, a Tauri shell, and the React UI. That is at least four more places a version string can live, and the Tauri bundle version drives installer naming, the update channel, and the rollback smoke tests that §11 requires.

If nothing is decided, each manifest drifts independently, release artifacts stop matching the changelog, and the updater and rollback tests in §11 have no stable artifact identity to check against.

## Decision

The root [`VERSION`](../../VERSION) file holds exactly one semantic version string and is the only place a release version is authored. The current value is `0.0.1`.

This implies:

- Every manifest that needs a version carries a **mirror** written from `VERSION` by [`scripts/sync-version.mjs`](../../scripts/sync-version.mjs). Mirrors are generated; they are never hand-edited.
- `node scripts/sync-version.mjs --check` exits non-zero when any mirror disagrees with `VERSION`, or when `VERSION` is not a valid semantic version. It runs first in each package's `npm run build`, so the repository's full check cannot pass on a drifted version.
- Managed targets are the `targets` array in that script. Adding a manifest means adding one line there and nothing else.
- When the Cargo workspace lands, crates inherit with `version.workspace = true` and the workspace `Cargo.toml` becomes a target; `src-tauri/tauri.conf.json` becomes a target when the Tauri shell exists.
- A release is the commit that changes `VERSION`, plus an annotated `vX.Y.Z` tag on that commit. Tags are signed where the contributor's setup allows ([engineering standards §8](../ENGINEERING-STANDARDS.md#8-git-workflow)).
- Public schema versions are **not** derived from `VERSION`. The `schema_version` on typed artifacts ([engineering standards §3.3](../ENGINEERING-STANDARDS.md#33-contracts-and-schemas)) evolves on its own schedule, because a schema must stay stable across application releases. One file cannot express both.

## Alternatives considered

| Option | Summary | Why not (or why not yet) |
|---|---|---|
| A. Root workspace `package.json` as the source | Adopt npm workspaces; the root manifest holds the version and packages inherit it. | Requires committing to npm workspaces before the repository layout is settled (pending ADR-0002). Rust and Tauri manifests still cannot read a `package.json` without a generator, so it solves only the JavaScript side. |
| B. Git tags as the only source | Derive the version from `git describe` at build time. | No version exists in a shallow clone, an exported archive, or before the first tag — which is today's state. npm and the Tauri bundler need a literal version in the manifest, so a build step would still have to write one. |
| C. Hand-maintain each manifest (status quo) | Each package declares its own version; reviewers keep them consistent. | Already drifted: two manifests at `0.1.0` with no release, no tag, and no failing check. Nothing detects disagreement. |
| D. Cargo workspace as the source | The shipped application is Rust, so `Cargo.toml` is authoritative. | The Rust workspace does not exist yet, while two JavaScript manifests do. Reading TOML needs a parser dependency, which the [dependency policy](../DEPENDENCY-POLICY.md) would require justifying for a build script. Revisit when the workspace lands; the script makes `Cargo.toml` a target then. |

## Consequences

- **Positive:** one authoritative file, readable without tooling; drift fails the build rather than surfacing at release time; a version bump is a one-line diff plus regenerated mirrors; the script has no dependencies and needs no network, so it runs identically in CI and on a fresh checkout; extending to Rust and Tauri is a one-line change per manifest.
- **Negative and mitigations:** mirrors are duplicated values, which [coding standards](../CODING-STANDARDS.md) would normally reject as a DRY violation. Mitigated because they are machine-written and machine-checked, never authored by hand, and `check:version` gates every build. `package-lock.json` also carries the version and is refreshed by npm rather than by the script; mitigated by `npm ci`'s own lock-versus-manifest sync check.
- **Platform differences and documented exceptions:** none. The script uses only `node:fs`, `node:path`, and `node:url`. The Node version is still not pinned in `engines` (dependency policy §5); any Active or Maintenance LTS runs it.
- **Migration or rollback path:** both manifests move `0.1.0` → `0.0.1`. This is a deliberate downgrade to an honest pre-release version: no release ever shipped, and `0.1.0` was scaffolding. Neither package is published, so no consumer is affected. Rollback is to delete `VERSION` and the script, restore the literal versions, and drop `check:version` from the two build scripts; no runtime code reads the version.

## Threat model

Not applicable — this adds no trust boundary and no dependency with system reach. `VERSION` is a trusted, reviewed repository file, and the script writes only to paths in its own `targets` array.

Two fail-closed properties are still worth recording: the version is validated against a semantic-version pattern before it is written, so a malformed `VERSION` exits non-zero instead of producing broken manifests; and that same validation excludes `$`, so a crafted value cannot inject a `$&`-style substitution pattern into the `String.prototype.replace` call that rewrites each manifest.

## Verification

Run from the repository root; results are recorded in the PR description per [engineering standards §9](../ENGINEERING-STANDARDS.md#9-definition-of-done).

| Check | Command | Expected |
|---|---|---|
| Mirrors agree with `VERSION` | `node scripts/sync-version.mjs --check` | exit 0, reports both manifests match |
| Drift fails | hand-edit a manifest version, then `node scripts/sync-version.mjs --check` | exit 1, names the file and both versions |
| Malformed version fails | put `1.0` in `VERSION`, then `node scripts/sync-version.mjs --check` | exit 1, rejects the value |
| Gate is wired into the build | `npm run build` in `apps/desktop` and in `docs/design/onecode-experience` | `check:version` runs first and passes |
| Lockfiles agree | `npm ci` in both packages | installs without a lock-versus-manifest sync error |
| Doc links resolve | `node scripts/check-doc-links.mjs` | exit 0 |

Once CI exists, `node scripts/sync-version.mjs --check` becomes a required gate under [TRD §15.2](../TRD.md#152-ci-quality-gates), and the release checklist in §11 adds "tag matches `VERSION`".
