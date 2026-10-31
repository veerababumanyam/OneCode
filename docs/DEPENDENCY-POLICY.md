# OneCode Dependency and Open-Source Reuse Policy

**Status:** Draft (license allowlist and update SLAs are **proposed** until the product owner accepts them)  
**Scope:** Every third-party package, crate, vendored asset, copied snippet, model artifact, and build or CI tool used by this repository  
**Related:** [PRD principle 11](./PRD.md#4-product-principles) (reuse before rebuilding), [TRD §3.4.7](./TRD.md#347-reuse-first-component-strategy) (reuse candidates per capability), [engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust) (dependency gates), [TECH-STACK](./TECH-STACK.md) (dated candidate catalog and versions), [secure coding](./SECURE-CODING.md)

OneCode **reuses maintained open-source components for commodity capabilities** and writes its own code only for what makes OneCode OneCode: policy, orchestration, contracts, trust boundaries, and the product experience. This policy says how to choose, admit, pin, update, and remove dependencies so that reuse makes the product safer, not riskier.

## 1. Decision procedure

Before writing code for a capability, answer in order and record the answer in the PR:

1. **Does the standard library or an existing dependency already do it?** Use that. Do not add a second library for the same job (one HTTP client, one time library, one test runner per stack).
2. **Is there a candidate in [TECH-STACK](./TECH-STACK.md) or [TRD §3.4.7](./TRD.md#347-reuse-first-component-strategy)?** Evaluate it first against section 2.
3. **Are there other maintained libraries?** Evaluate at least two when the choice has system reach or high coupling.
4. **Build it yourself only** when no candidate meets the requirement, with the gap evidenced (a failing requirement, a benchmark, a license or security finding). Write down the maintenance cost you are accepting.

Never build your own: cryptography, TLS, authentication, sandboxing, HTML sanitizing, archive extraction, terminal emulation, editor engines, graph or chart rendering, or diffing. These are the areas where custom code is most likely to be wrong.

A dependency with system reach (sandbox, browser engine, editor engine, database, PTY, IPC, crypto, credential storage) or a new trust boundary requires an ADR with a threat model ([ADR index](./adr/README.md)). Others need the PR justification in section 6.

## 2. Evaluation criteria

| Criterion | What "good" looks like | Blocks adoption when |
|---|---|---|
| Fit | Meets the requirement without forks or heavy patching; API stable | Needs a fork or unmerged patches to work |
| Maintenance | Release or substantive commit within the last 12 months; security issues answered; more than one maintainer preferred | Archived, deprecated, or unanswered security reports |
| Security posture | No unresolved advisories (RustSec, GitHub Advisory Database, OSV); [OpenSSF Scorecard](https://scorecard.dev/) reviewed as a signal; signed releases or provenance where the ecosystem supports it | Open high or critical advisory with no fix |
| License | On the allowlist (section 3), including transitive dependencies | Denied or unknown license anywhere in the tree |
| Footprint | Few transitive dependencies; no unnecessary native binaries; bundle-size impact measured for UI packages | Pulls a second major version of an existing dependency without an exception |
| Platform | Works on Windows, macOS, Linux (and WSL where relevant) with the same guarantees | A platform gap that weakens a security control |
| Compatibility | Supports the pinned Rust toolchain/MSRV, Node version, TypeScript, and React versions | Requires a prerelease toolchain |
| Accessibility (UI) | Keyboard and screen-reader support verified against [accessibility](./ACCESSIBILITY.md) | Cannot meet WCAG 2.2 AA in our integration |
| Build behavior | No network access or code download at build or install time | Install scripts that fetch code, without an approved exception |

## 3. Licenses (proposed)

| Class | Licenses | Rule |
|---|---|---|
| Allowed | MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, Zlib, 0BSD, BSL-1.0, CC0-1.0, Unicode-3.0, Unicode-DFS-2016 | Use; keep notices |
| Allowed with review | MPL-2.0 (unmodified), LGPL-2.1/3.0 (dynamic linking only, not for Rust static linking), CDDL-1.0, font licenses such as OFL-1.1, CC-BY-4.0 for documentation assets | Record the review in the PR |
| Denied | GPL-2.0/3.0, AGPL-3.0, SSPL, BUSL, Commons Clause or other source-available terms, no license | Do not use |

`cargo deny` will enforce this for Rust once the workspace exists ([engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust)), and an equivalent license check for npm packages once it is configured. Until then, the reviewer checks licenses by hand from the PR justification. Model weights carry their own licenses and are reviewed per model (TRD §7.1.1).

## 4. "Latest safe" versions

Adopt the **newest stable release** that is also safe:

1. Stable only: no prerelease, release candidate, yanked, or deprecated versions.
2. No unresolved advisory affecting the features we use.
3. Public for at least **14 days** (cool-down against compromised releases). A fix for an exploitable vulnerability may skip the cool-down with security review.
4. Compatible with the pinned toolchain, peer dependencies, and every supported OS.
5. Published by the expected maintainers; prefer packages with registry provenance or trusted publishing.

[TECH-STACK](./TECH-STACK.md) records the dated versions checked; manifests and lockfiles are authoritative once code exists.

## 5. Pinning and installation

- **npm:** exact versions in `package.json` (no `^`/`~`), committed `package-lock.json`, and `npm ci` in CI and fresh checkouts. Never depend on `latest`, a branch, or a URL; a Git dependency needs a full commit SHA and an exception. Evaluate `ignore-scripts=true` per package (in that package's `.npmrc`) and list any package that genuinely needs install scripts.
- **Cargo:** default caret requirements in `Cargo.toml`, committed `Cargo.lock` for every application and the workspace, `cargo deny` for licenses, advisories, duplicate majors, and allowed sources (crates.io only unless excepted). `cargo audit` may complement it.
- **Local file dependencies** (the shared OneQuill design system) are pinned by the sibling checkout; record its version in [TECH-STACK](./TECH-STACK.md).
- **Toolchains** are pinned: `rust-toolchain.toml` for Rust; the Node version in `engines` and a version file once CI exists.
- **CI actions** are pinned to a full commit SHA, not a tag.
- **No build-time downloads** of code, models, or assets ([engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust)).

## 6. Admitting a dependency

The PR that adds a dependency includes one paragraph covering: the requirement it serves (`FR-nn`/TRD/ADR), the alternatives considered (including custom code), the version and why it is "latest safe", license, maintenance and advisory status, transitive count and size impact, platform support, and how it is isolated. Update [TECH-STACK](./TECH-STACK.md) in the same PR. The `add-dependency` skill in `.claude/skills/` walks agents through this.

Wrap a dependency behind a OneCode adapter only where the TRD already requires a boundary (platform, provider, editor, terminal, browser, storage). Do not wrap every library "in case we swap it" (YAGNI).

## 7. Keeping dependencies current

- Automated update PRs (Renovate or Dependabot, chosen when the repository is hosted) run weekly, grouped by ecosystem, and must pass the full checks.
- **Security update targets (proposed):** critical within 7 days, high within 30 days, medium within 90 days, low at the next routine update. A missed target needs a recorded exception with an owner and expiry ([SOC 2 baseline: CC7](./SOC2-CONTROLS.md)).
- Major upgrades read the upstream changelog and migration guide, update code in the same PR, and note behavior changes.
- Remove unused dependencies promptly; review the tree for unused packages each quarter.

## 8. Copied code, vendored assets, and generated code

- Copying code from another project is a dependency: the license must be on the allowlist, the copy keeps its notice and a source link with commit SHA, and it is listed in third-party notices. Never copy from reference products named in the PRD; they are inspiration only (PRD §18).
- Vendoring (as OneQuill vendors Lucide and axe-core) is for offline or air-gapped requirements; record version, license, and hash, and update it like any dependency.
- AI-generated code follows the same license hygiene: do not accept output that reproduces a recognizable licensed source without its license.

## 9. Release artifacts

Each release ships an SBOM (CycloneDX or SPDX), a third-party notices file generated from the lockfiles, signed packages, and the vulnerability and license reports reviewed at release ([engineering standards §11](./ENGINEERING-STANDARDS.md#11-release)).
