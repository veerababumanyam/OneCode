# OneCode Engineering Standards

**Status:** Draft  
**Scope:** The OneCode codebase itself: Rust core and services, desktop UI, CLI, fixtures, and documentation  
**Not in scope:** The rules agents follow at runtime, which live in the [Agent operating rules](./AGENT-OPERATING-RULES.md)  
**Related:** [PRD](./PRD.md), [TRD](./TRD.md), [ADR index](./adr/README.md), [Implementation plan](../tasks/plan.md)

These standards apply to every contributor, human or agent, including OneCode working on its own repository. Where a standard is enforced by tooling, the tooling is named; where it relies on review, the review checklist (§10) names it.

This document owns the gates. Detailed practice lives in companion documents that link back here instead of restating it: [coding standards](./CODING-STANDARDS.md) (YAGNI/KISS/DRY, naming, folder structure, language practice), [secure coding](./SECURE-CODING.md), [dependency policy](./DEPENDENCY-POLICY.md), [design guidelines](./DESIGN-GUIDELINES.md), [accessibility](./ACCESSIBILITY.md), and the [SOC 2 control baseline](./SOC2-CONTROLS.md). The product's purpose and the order in which conflicting rules win are in [INTENT.md](../INTENT.md).

## 1. Principles

1. **Invariants in code, guidance in prompts.** Anything that must never happen is enforced by a type, a policy check, a sandbox, or a test, never only by a prompt or a comment.
2. **Narrow interfaces, typed contracts.** Components talk through versioned, validated artifacts (TRD §6.1); platform differences hide behind adapters (TRD §3.3).
3. **Fail closed.** A missing security capability disables the dependent feature with an explanation; it never degrades silently.
4. **Evidence over assertion.** Every behavior change ships with a test, and every "done" cites the check that proved it.
5. **Small, reversible steps.** Prefer additive, feature-flagged changes behind interfaces to broad rewrites.
6. **Same rules for agents and humans.** The verification economy and single-instance rules (§7) apply to everyone working in the repository.
7. **Reuse before rebuilding.** Before implementing commodity functionality, inspect the approved stack and evaluate maintained dependencies; custom code must be justified by a documented requirement or a measured gap.

## 2. Repository layout (proposed, pending ADR-0002)

A single Cargo workspace with one crate per TRD component, named `onecode-<component>`:

| Area | Crates | TRD |
|---|---|---|
| Core | `core` (shared types, artifacts, schemas), `orchestrator`, `policy`, `session`, `hooks`, `settings` | §4, §6.1, §8.5 to §8.7 |
| Intelligence | `repo-intel`, `standards`, `memory` | §5, §5.4, §10 |
| Models and tools | `model-registry`, `router`, `providers/*`, `gateway`, `skills` | §7, §8 |
| Quality | `quality`, `fix`, `audit` | §9, §6.6 |
| Workspace services | `ws-editor`, `ws-terminal`, `ws-browser`, `ws-scm`, `process-registry`, `diagnostics` | §3.4 |
| Platform | `platform` (traits) with `platform-windows`, `platform-macos`, `platform-linux` | §3.3 |
| Surfaces | `api`, `cli`, `desktop` (Tauri shell with React/TypeScript UI per ADR-0003) | §11, PRD §11 |
| Fixtures | `fixtures/` (sample repositories, adversarial inputs, fixture web apps for annotation tests) | §14.2 |

Rules:

- A crate depends only on `core` and on crates below it in this table; `desktop` and `cli` depend only on `api`.
- Platform-specific code lives only in the `platform-*` crates behind the traits in `platform`.
- Every crate has a `README.md` stating its responsibility, boundary, and owners, and a `tests/` directory.

## 3. Code standards

### 3.1 Rust

- Stable toolchain pinned in `rust-toolchain.toml`; edition 2024 or later as the toolchain allows. `cargo fmt --check` and `cargo clippy --all-targets --all-features -D warnings` are CI gates.
- `#![forbid(unsafe_code)]` in every crate except `platform-*`; any `unsafe` block there carries a `// SAFETY:` comment, a test, and a reviewer from the security owners list.
- Library code never panics on input: no `unwrap`, `expect`, or indexing on untrusted data outside tests. Errors are typed at crate boundaries (`thiserror`), contextual inside (`anyhow` or equivalent), and carry an actionable message and an error code that the UI can render.
- Async code uses the workspace's single runtime (`tokio`); no blocking calls on async tasks (use `spawn_blocking`); every long-running future is cancellation-safe and takes a cancellation token.
- Logging uses `tracing` with structured fields. Never log secrets, full source files, prompts, or page contents; log hashes, sizes, and references (TRD §13). A redaction layer is mandatory on every exporter.
- Every public type that crosses a process or UI boundary derives the workspace serialization traits, carries a `schema_version`, and has a generated JSON Schema checked into `schemas/` with a golden test.
- Dependencies: `cargo deny` enforces the license allowlist, bans known-vulnerable versions, and blocks duplicate major versions without an exception; new dependencies need a one-paragraph justification in the PR and a check of maintenance status, compatibility/MSRV, license, transitive dependency graph, security advisories, platform support, and binary payloads. Compare an existing approved library with custom implementation and prefer reuse when it meets the requirements. No build scripts that download at build time.
- Feature flags gate incomplete work; a flag has an owner, a tracking issue, and an expiry.

### 3.2 Desktop UI

- Desktop shell and UI framework: Tauri 2 with React/TypeScript in a WebView per [ADR-0003](./adr/0003-desktop-ui-and-bridge.md); the editor engine per ADR-0011 remains open. Until an editor decision is recorded, UI prototypes stay in `docs/design/` and are sample-data only.
- Reuse the shared design system and vetted UI/editor/graph/chart/terminal libraries selected by ADRs; do not independently implement a commodity editor, VT renderer, graph canvas, or chart renderer. Keep policy, document concurrency, graph provenance, and access controls in OneCode-owned services.
- Design tokens come from the shared OneQuill design system (see [docs/design/onecode-experience/README.md](./design/onecode-experience/README.md)); no hard-coded colors, spacing, or fonts in components.
- No business logic in the UI. The UI renders typed events and state from the application API and sends commands; policy decisions never run in the UI (TRD §11).
- Every user-facing string is externalized (FR-105); layouts support right-to-left mirroring from the start.
- Accessibility is a merge requirement: keyboard operability, focus order, labels, contrast, reduced motion, and screen-reader announcements for status changes (FR-104). Automated accessibility checks run on every UI PR; manual screen-reader checks run before release.
- Latency budgets from PRD §12 are tests, not aspirations: editor keystroke, terminal throughput, and annotation round-trip benchmarks run in CI with thresholds.

### 3.3 Contracts and schemas

- Changes to a schema are additive within a major version: new optional fields only. A breaking change bumps the major version, ships a migration, and updates every reader and the golden tests.
- Validation happens at every boundary (API, gateway, artifacts between agents, persisted state). Unknown required fields are rejected with an actionable error; unknown optional fields are preserved.
- The PRD requirement IDs (`FR-nn`), TRD sections, and agent rule IDs (`R-nn`) are stable identifiers. Never renumber; deprecate and keep the row.

### 3.4 Platform adapters

- Each adapter implements the same trait with the same tests; a capability an OS cannot provide returns a typed `Unsupported` result that the caller must handle by failing closed.
- Adapter behavior is tested on its native OS in CI (TRD §3.3); a cross-compiled build is not evidence of runtime behavior.

## 4. Security engineering

- **Threat model first.** Every new surface or trust boundary (terminal, browser, hooks, MCP server, provider, file format) gets a threat-model section in its ADR: assets, entry points, trust levels, abuse cases, mitigations, and tests.
- **Mandatory security review** for changes to policy, permissions, sandbox, gateway, redaction, credential handling, browser, terminal, hooks, workspace trust, protected paths, and update/signing code. CODEOWNERS routes these paths to the security owners.
- **Untrusted input everywhere.** Repository content, tool results, pages, terminal output, instruction files, and model output are untrusted. Parse with limits (size, depth, time); canonicalize paths; parse shell commands conservatively (TRD §8.5).
- **No dynamic code execution** in the core (`eval`-style constructs, `new Function`, dynamic plugin loading outside the reviewed registry). Tool-provided UI renders only in sandboxed frames with a strict content security policy (TRD §3.4.3).
- **Secrets** live only in the OS credential store or the vault; CI runs secret scanning on every push, and tests assert that no secret-shaped value appears in logs, artifacts, captures, or exports.
- **Sandbox verification** is a test, per OS: the test suite proves that a sandboxed process cannot write protected paths, reach the network when denied, or read credentials.
- **Supply chain:** pinned dependencies and lockfiles, `cargo deny`, SBOM generation, signed release artifacts, reproducible-build goals, and provenance recording for every imported skill, plugin, or model (TRD §7.1, §8.3).
- **Browser isolation tests** prove that the built-in browser cannot read the system browser's profile or saved credentials.

## 5. Testing standards

- Test layers follow TRD §14.1. Each PR states which layers it touched and why the others were not needed.
- Every behavior change ships with a test in the same PR. A bug fix ships with a reproducing test first (characterization test for legacy behavior).
- Unit and component tests make no network calls and need no model runtime; integration tests that need a local model use the fixture model profile and are tagged so they can be skipped where unavailable. Tagged-skipped tests are reported, never counted as passed.
- Fixtures live in `fixtures/` and are versioned: sample repositories (clean, monorepo, large, adversarial), fixture web applications for annotation and browser tests, and injection corpora. No proprietary user repository is used without consent and sanitization (TRD §14.2).
- Adversarial tests are first-class: prompt injection, path traversal, rule bypass, hook escalation, browser host misclassification, duplicate-instance launch, and sandbox denial each have a named fixture tied to an agent rule ID.
- Flaky tests are quarantined within one day with an owner and an expiry; a quarantined test does not block merge but does block release until fixed or removed with justification.
- "Zero tests selected" fails CI. A filter that selects nothing is a configuration error, not a pass.
- Performance budgets (PRD §12) run as benchmarks in CI on reference hardware profiles with thresholds; regressions block merge unless an exception is recorded.
- Golden tests cover every checked-in schema and every structured output format (diagnostics, findings, receipts).

## 6. Documentation

- Docs are code: reviewed in the same PR as the change, linted for broken links, and published from the repository.
- The [PRD](./PRD.md) owns user-facing behavior; the [TRD](./TRD.md) owns architecture and controls; the [agent operating rules](./AGENT-OPERATING-RULES.md) own enforced runtime rules; ADRs own decisions. A change that affects two of them updates both in one PR.
- The [tech-stack inventory](./TECH-STACK.md) is a dated candidate catalog, not an approved dependency list. ADRs record the selected library/version, alternatives (including custom implementation), evidence, license/security/platform review, MSRV impact, and revisit trigger. Production manifests and lockfiles are authoritative after implementation begins.
- Every task links to one or more `FR-nn` IDs and the TRD sections it implements; tests and PR descriptions carry the same IDs, so traceability is a search, not a spreadsheet.
- An ADR is required for: a new dependency with system reach (sandbox, browser engine, editor engine, database), a new trust boundary, a schema major version, a change to permission semantics, a platform-specific exception, or a choice listed in TRD §17. Use the [template](./adr/0000-template.md).
- User documentation for a feature ships with the feature: what it does, what it never does, its approvals, and its limitations per OS.
- A `CHANGELOG.md` entry accompanies every user-visible change, written for users, not for contributors.

## 7. Working in this repository: verification economy and live instances

These rules bind every contributor and every agent working on OneCode, and mirror the product's own FR-78 and FR-113.

- **Check setup before compiling.** Confirm the test target and filter, fixtures, environment variable names, working directory, feature flags, database or schema state, and the running instance with cheap reads. Fix or report a missing prerequisite first; a build is never the way to discover that the environment is not ready.
- **Compile once per material change.** Compile only the relevant target, once per change to sources, dependencies, features, toolchain, or flags, with the shared cache and stable flags. For Rust, use scoped `cargo check` for compiler feedback and `cargo test --no-run` when tests must execute; note the executable path it prints.
- **Reuse the binary** while its inputs are unchanged: list tests with it and rerun selected tests after setup or fixture fixes. Confirm the filter selects the intended tests; zero tests is not a pass. Keep the binary path, filter, test count, last result, and open prerequisites in the task notes so a later turn or a compacted context reuses them.
- **Rerun only for new evidence.** Before rerunning anything expensive, name what changed and what new evidence the run can give. An unchanged failure, a runtime prerequisite failure, or wanting more confidence is not a reason to rebuild. Never clean caches, switch profiles or flags, or use another target directory to retry the same check.
- **Stop proportionately** and report what was obtained, what blocked, and what stays unverified. Stopping never turns an unrun or failed check into a pass; required release checks still apply.
- **One live instance per project.** Before any launch, restart, or browser check, look at the project's listeners and pid or lock records. If an instance is running, use it. Never start a second development server, preview server, watcher, container set, or database; never move to an alternate port; never bypass a launcher's "reuse existing" refusal. Worktrees, subagents, and spawned sessions use the main checkout's instance and never start, stop, or rebuild it themselves. If the instance is down, say so and restart only the same instance in place after agreement. Never stop a process another session started.
- **One browser per check**, closed when the check ends.

## 8. Git workflow

- Trunk-based development with short-lived branches named `<type>/<scope>-<summary>` (for example `feat/ws-terminal-capture`). No direct pushes to the default branch; no force-pushes to shared branches.
- Conventional Commits (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `sec`) with a scope that names the crate or document. The body states what changed and why; the footer references the `FR-nn`, `R-nn`, and ADR IDs touched. Agent-assisted commits carry the attribution trailer the repository configures.
- Each PR uses the template: summary, linked requirement IDs, the test layers touched and the commands run with their results, risk and rollback notes, screenshots or recordings for UI changes, and the security-review checkbox when a sensitive path is touched.
- Commits are signed where the contributor's setup allows; releases are always signed.
- Generated files (schemas, lockfiles, SBOM) are committed and verified in CI to match their sources.

## 9. Definition of done

A change is done when all of the following hold:

- [ ] Linked to `FR-nn` IDs, TRD sections, and, where relevant, `R-nn` rule IDs and an ADR.
- [ ] Tests added or updated at the appropriate layers; adversarial tests for any new trust boundary; "zero tests selected" cannot occur for the touched area.
- [ ] `cargo fmt`, `clippy -D warnings`, `cargo deny`, secret scanning, and schema golden tests pass; native CI passes on every supported OS the change affects.
- [ ] Security review completed for sensitive paths; threat model updated for new surfaces.
- [ ] Accessibility, localization, and latency budgets verified for UI changes.
- [ ] Documentation updated: PRD or TRD where behavior or architecture changed, user docs for user-visible features, `CHANGELOG.md`, crate README.
- [ ] Feature flag, owner, and expiry recorded for incomplete work.
- [ ] The PR description reports exactly what was verified, with commands and results, and names anything left unverified.

## 10. Review checklist

Reviewers check, in this order: correctness against the linked requirement; security (untrusted input, path handling, permissions, secrets, sandbox); cross-platform behavior and fail-closed handling; tests and their adversarial coverage; performance against budgets; accessibility and localization for UI; documentation and traceability; and finally readability and simplicity. A review that cannot verify a claim asks for the evidence rather than trusting the description.

## 11. Release

- Semantic versioning for the application and for every public schema.
- Release checklist (TRD §15): all required gates green on native CI per OS; signed and notarized packages; installer, update, and rollback smoke tests per OS; SBOM, license, and vulnerability reports reviewed; compatibility matrix and known limitations updated; release notes written for users; recovery and migration procedures verified.
- Exceptions require an owner, rationale, scope, and expiry, and never weaken a security control (PRD FR-64).

## 12. Performance and resource budgets

Budgets are product requirements from PRD §12 and are enforced as CI benchmarks on reference hardware profiles:

| Budget | Target |
|---|---|
| Startup to interactive | Under 2 s warm, 5 s cold, excluding model-runtime start |
| Editor keystroke-to-render | p95 under 16 ms up to 10,000 lines |
| Terminal throughput | 10 MB/s sustained without UI stalls |
| Incremental re-index | p95 under 1 s per changed file, including code-graph updates |
| Graph query | Proposed: p95 under 200 ms for map, skeleton, locate, and one-hop neighbor queries, to be confirmed from reference-hardware baselines |
| Annotation to task | Under 5 s on the reference project |
| App shell idle memory | Under the documented per-OS ceiling, reported per component |

A change that moves a budget needs a benchmark result in the PR and, if the budget regresses, an exception with an owner and expiry.
