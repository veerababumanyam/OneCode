---
paths:
  - "**/package.json"
  - "**/Cargo.toml"
  - "**/deny.toml"
  - "rust-toolchain.toml"
  - "docs/TECH-STACK.md"
  - "VERSION"
  - "scripts/sync-version.mjs"
---
# Dependencies and manifests

- Before adding a dependency: is it already done by the standard library or an existing dependency? Is it in docs/TECH-STACK.md? Use the `add-dependency` skill.
- Choose the newest stable, non-yanked release that has no open advisory, has been public at least 14 days, and fits the pinned toolchain and peers (docs/DEPENDENCY-POLICY.md §4).
- npm: exact versions (no `^` or `~`), committed lockfile, install with `npm ci`. Change lockfiles only through npm, never by hand.
- The `version` in a manifest is generated from the root `VERSION` file; never hand-edit it. To bump: edit `VERSION`, run `node scripts/sync-version.mjs`, then `npm install --package-lock-only` in each affected package. `check:version` runs first in every `npm run build` and fails on drift (ADR-0022, docs/ENGINEERING-STANDARDS.md §11).
- Cargo: committed `Cargo.lock`; `cargo deny` for licenses, advisories, duplicates, and sources.
- Licenses: allowed / review / denied per docs/DEPENDENCY-POLICY.md §3. GPL, AGPL, SSPL, BUSL, and unlicensed code are denied.
- A dependency with system reach (sandbox, browser engine, editor engine, database, PTY, IPC, crypto, credentials) needs an ADR with a threat model.
- Record the justification in the PR and update docs/TECH-STACK.md in the same change.
