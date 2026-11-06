# OneCode Task List

Execution detail, acceptance criteria, and product acceptance live in the [implementation plan](./plan.md). User-facing behavior is specified in the [PRD](../docs/PRD.md), and technical contracts and verification detail in the [TRD](../docs/TRD.md).

Epic numbers Task 1 to Task 13 are stable and never renumbered, because the [ADR index](../docs/adr/README.md) cites them. Slices take sub-IDs under their epic. The **Depends on** and **Blocks** annotations below are the phase-relevant subset; the [full edge list](./plan.md#full-edge-list) and the [dependency graph](./plan.md#dependency-graph) are authoritative for ordering.

Phases 0 and 1 are decomposed into slices. Phases 2 to 5 stay epic-level until they are decomposed before execution.

## Phase 0: Resolve release contracts

- [ ] **Task 1: Resolving architecture and support decisions** — Record the still-open choices as ADRs. ADR-0002, 0003, 0005, and 0020 are already accepted and are implemented by Phase 1 slices, not re-decided here. Evaluate the [tech-stack candidates](../docs/TECH-STACK.md); the catalog is not an approved dependency list. **Depends on:** none.
  - [ ] **1.1** ADR-0001 minimum OS versions, packaging, signing/notarization, update channel. **Depends on:** none. **Blocks:** 2.3, 2.6, Task 9. *Critical path.*
  - [ ] **1.2** ADR-0004 sandbox strategy and per-OS isolation, including WSL. **Depends on:** none. **Blocks:** 3.9, Tasks 6, 7. *Critical path.*
  - [ ] **1.3** ADR-0006 bundled embedding model, catalog and format policy, vector index. **Depends on:** 1.1. **Blocks:** Task 5.
  - [ ] **1.4** ADR-0007 offline model-bundle container, signatures, trusted-key lifecycle. **Depends on:** 1.3. **Blocks:** Task 5.
  - [ ] **1.5** ADR-0008 first language and framework support matrix; tree-sitter grammar set. **Depends on:** none. **Blocks:** 1.16, Task 4.
  - [ ] **1.6** ADR-0009 provider APIs versus OpenAI-compatible proxy abstraction. **Depends on:** 1.1. **Blocks:** 3.3, Task 6.
  - [ ] **1.7** ADR-0010 skill packaging, plugin ABI, compatibility guarantees. **Depends on:** none. **Blocks:** Task 6.
  - [ ] **1.8** ADR-0011 editor engine and the versioned document-model bridge, with benchmarks. **Depends on:** 13.1. **Blocks:** 3.8, Task 10.
  - [ ] **1.9** ADR-0012 terminal emulator and PTY per OS, including WSL. **Depends on:** 1.1. **Blocks:** 3.8, Task 10. *Critical path.*
  - [ ] **1.10** ADR-0013 built-in browser engine and element-to-source mapping sources. **Depends on:** 1.1. **Blocks:** Task 10.
  - [ ] **1.11** ADR-0014 source-control implementation and credential-helper handling. **Depends on:** none. **Blocks:** 3.4, Task 10.
  - [ ] **1.12** ADR-0015 language-server distribution and trust model; debugger scope. **Depends on:** 1.1. **Blocks:** Task 10.
  - [ ] **1.13** ADR-0016 hook, rule, and custom-command formats. **Depends on:** none. **Blocks:** Task 11.
  - [ ] **1.14** ADR-0018 knowledge-map rendering and layout, note storage, export format. **Depends on:** 1.16. **Blocks:** Task 12.
  - [ ] **1.15** ADR-0019 OpenTelemetry instrumentation and export policy. **Depends on:** none. **Blocks:** Task 9, only if export is enabled.
  - [ ] **1.16** ADR-0017 accept or revise LadybugDB, then graph schema versioning, community algorithm, repository-map ranking. Needs native build, benchmark, and symlink-containment evidence; `lbug` pinned at 0.21.1 during the cool-down. **Depends on:** 1.5. **Blocks:** 1.14, Task 4. *Critical path.*
  - [ ] **1.17** ADR-0021 accept or revise encrypted portable backups and restored-record re-review. **Depends on:** none. **Blocks:** Task 12.
  - [ ] **1.18** ADR-0022 accept the root `VERSION` source of truth (already implemented) and wire the CI gate. **Depends on:** 2.5. **Blocks:** Task 9.
- [ ] **Checkpoint: Phase 0 critical path** — 1.1, 1.2, 1.9, and 1.16 accepted or bounded before Phase 1 proceeds past 2.2. The remaining slices are just-in-time and do not block the scaffold.

## Phase 1: Cross-platform foundation and verified core

- [ ] **Task 2: Establishing native platform build foundations** — The Cargo workspace, contracts, adapters, CI, and compatibility matrix in the layout [ADR-0002](../docs/adr/0002-process-model.md) fixed. **Depends on:** 1.1, 1.2; slice 2.1 can start immediately.
  - [ ] **2.1** Cargo workspace scaffold: root `Cargo.toml`, `rust-toolchain.toml`, `deny.toml`, `crates/onecode-*`, `apps/desktop/src-tauri`, per-crate README and `tests/`, `#![forbid(unsafe_code)]` outside `platform-*`, workspace added to the `sync-version.mjs` targets. **Depends on:** none. **Blocks:** 2.2–2.5, 3.1, 3.3, 13.5.
  - [ ] **2.2** `onecode-api` contract crate per ADR-0020: camelCase, `schemaVersion`, kebab-case `kind`, ts-rs bindings, `schemars` schemas with golden tests, CI regeneration check, strict inbound validation. **Depends on:** 2.1. **Blocks:** 2.5, 3.2, 13.4, 13.5.
  - [ ] **2.3** Platform traits and the three OS adapters, with typed `Unsupported` results and no silent weaker fallback. **Depends on:** 2.1, 1.1. **Blocks:** 2.4, 2.5, 2.6, 3.4, 3.9.
  - [ ] **2.4** Data-directory ownership: `directories` location, exclusive OS file lock, second-host refusal, stale-lock recovery. **Depends on:** 2.1, 2.3. **Blocks:** 2.5, 3.1.
  - [ ] **2.5** Native three-OS CI matrix and repository gates, including "zero tests selected" failing and budget benchmarks. **Depends on:** 2.1–2.4. **Blocks:** 1.18, 3.10.
  - [ ] **2.6** Versioned compatibility matrix with documented release exceptions; WSL listed as a distinct target. **Depends on:** 1.1, 2.3. **Blocks:** 3.10, Task 9.
- [ ] **Checkpoint: Task 2** — Native builds and tests green on all three OSes, contracts generate cleanly, gates are red-on-broken, matrix published.
- [ ] **Task 3: Delivering the verified coding vertical slice** — Complete an isolated, evidence-backed coding task on all three OSes, including FR-125's three Architect then three Advisor attempts and the human decision brief. **Depends on:** Task 2; slices 1.2, 1.6, 1.9, 1.11.
  - [ ] **3.1** Storage layer per ADR-0005: three stores, SQLCipher state, keyring with Argon2id fallback, forward-only migrations with encrypted backup, retention, export and deletion with `VACUUM`, hash-chained audit. **Depends on:** 2.1, 2.4. **Blocks:** 3.2.
  - [ ] **3.2** Task and session state model with typed artifacts, cancellation, and crash recovery. **Depends on:** 3.1, 2.2. **Blocks:** 3.3–3.7.
  - [ ] **3.3** `onecode-model-worker` child process with supervision and limits, plus the first provider adapter. **Depends on:** 2.1, 3.2, 1.6. **Blocks:** 3.6.
  - [ ] **3.4** Worktree isolation, checkpoints, worktree registry, turn-level revert. **Depends on:** 3.2, 2.3, 1.11. **Blocks:** 3.6.
  - [ ] **3.5** Scan with the `ignore` walker, keyword retrieval, stack detection, minimal source-linked `StandardsProfile`. **Depends on:** 3.2. **Blocks:** 3.6.
  - [ ] **3.6** Planner → Coder → Tester on the fixture repository with an inspectable diff and check report. **Depends on:** 3.3, 3.4, 3.5. **Blocks:** 3.7, 3.8, 3.9.
  - [ ] **3.7** FR-125 escalation with durable blocker IDs, no reset, and counters separate from FR-29. **Depends on:** 3.6. **Blocks:** 3.10.
  - [ ] **3.8** Minimal workspace surfaces: editor hunks, attributed terminal with bounded captures, Problems panel, process registry, steering, permission mode, workspace trust. **Depends on:** 3.6, 1.8, 1.9, 13.1, 13.3, 13.5. **Blocks:** 3.10.
  - [ ] **3.9** Policy engine and gateway minimum: evaluation order, hard-policy asks, audited tool calls, sandbox fail-closed. **Depends on:** 3.6, 1.2, 2.3. **Blocks:** 3.10.
  - [ ] **3.10** Cross-platform core acceptance suite green natively on Windows, macOS, and Linux, recorded as evidence. **Depends on:** 2.5, 2.6, 3.1–3.9. **Blocks:** Tasks 4, 6, 8, 10, 11.
- [ ] **Checkpoint: Foundation** — Review identical core acceptance evidence on Windows, macOS, and Linux.

## Phase 1U: Desktop UI product track (parallel stream)

- [ ] **Task 13: Bringing the existing desktop UI to production** — `apps/desktop` runs on a fixture adapter with no Tauri shell. In flight now; feeds 3.8. [frontend-progress.md](./frontend-progress.md) is the evidence log. **Depends on:** none to start.
  - [ ] **13.1** Rebuild Mission Control and Chat as distinct navigable screens against the real `4173`/`4174` mocks, sample data labeled. **Depends on:** none. **Blocks:** 13.2, 13.3, 1.8, 3.8.
  - [ ] **13.2** Fresh blind visual critique against `4173`/`4174`; the earlier `4179` verdict does not apply. **Depends on:** 13.1. **Blocks:** Task 8 quality bar.
  - [ ] **13.3** Responsive, accessibility, console, and keyboard recheck plus `npm run build`. **Depends on:** 13.1. **Blocks:** 3.8, Task 8.
  - [ ] **13.4** Replace hand-written `src/api/types.ts` with re-exports from the generated bindings; fixture adapter unchanged. **Depends on:** 2.2. **Blocks:** 13.5.
  - [ ] **13.5** Land the Tauri shell so `createDesktopApi()` uses real commands and channels; add `tauri.conf.json` to the version targets. **Depends on:** 2.1, 2.2, 13.4. **Blocks:** 3.8, Task 8, Task 10.
- [ ] **Checkpoint: UI track** — Both screens match their mocks under a fresh blind critique, the build passes all five stages, and the UI runs on generated contracts.

## Phase 2: Repository intelligence and local retrieval

- [ ] **Task 4: Building repository intelligence and standards resolution** — Indexing and retrieval with maintained parsers and graph algorithms where suitable, context bundles, stack-aware standards, provenance-labeled graph operations, and context economy. Index data in the per-repository SQLite database; graph records move to LadybugDB only if 1.16 is accepted. **Depends on:** Task 3; 1.5, 1.16.
- [ ] **Task 5: Adding user-controlled local embedding models** — Bundled default embedding model and its measured uses, pinned downloads, signed offline imports, maintained inference/format/verification libraries where suitable, local-only vectorization, fallback, and benchmark. **Depends on:** Task 4; 1.3, 1.4.
- [ ] **Checkpoint: Repository intelligence** — Review retrieval quality, standards provenance, model/import verification, privacy, and no-model fallback.

## Phase 3: Governed agency and verification

- [ ] **Task 6: Governing tool, skill, and plugin use** — Permission gateway, approvals, audit, and reviewed extensions. **Depends on:** Tasks 3 and 4; 1.6, 1.7.
- [ ] **Task 7: Enforcing quality gates and defensive audit workflow** — Required checks, independent critique, FR-29 bounded code repair separate from FR-125 decision escalation, and source audits. **Depends on:** Tasks 3 and 6; 1.2.
- [ ] **Checkpoint: Governance** — Review policy bypass tests, security gates, sandbox guarantees, and audit completeness.

## Phase 4: Product experience and release readiness

- [ ] **Task 8: Completing desktop and CLI product workflows** — Approval, context, model acquisition/import, diff, evidence, and recovery UX using the selected design-system and accessibility primitives. **Depends on:** Tasks 3–7, 13.
- [ ] **Task 10: Delivering the workspace surfaces** — Integrate the ADR-selected editor, terminal renderer, browser protocol/client, graph/chart visualizations, and accessible UI primitives; implement OneCode's document model, process/policy/security boundaries, and workspace semantics around them. **Depends on:** Tasks 3, 4, 6, 13; 1.8–1.12, 1.14.
- [ ] **Task 11: Delivering fix workflows, sessions, permissions, and configuration** — Fix-from-evidence engine, sessions and steering, permission modes and rules, workspace trust, hooks, settings, instructions, palette, notifications, onboarding. **Depends on:** Tasks 3, 6, 10, 13; 1.13.
- [ ] **Task 9: Releasing and operating the cross-platform product** — Packages, release automation, support matrix, docs, recovery, ADR-0022 release identity, ADR-0019-governed telemetry export if enabled, and complete SBOM/dependency review. **Depends on:** Tasks 1–8, 10, 11, 13; 1.1, 1.15, 1.18, 2.6.
- [ ] **Checkpoint: Release** — Approve native OS evidence, exceptions, security/privacy gates, benchmarks, and rollback.

## Phase 5: P1 second-brain follow-up (v1.5)

- [ ] **Task 12: Delivering the second-brain knowledge lifecycle** — User-reviewed capture, typed/provenance-bearing memory, explainable recall, and encrypted offline backup/restore with re-review. **Depends on:** Tasks 4, 6, 8, 10, 11; 1.14, 1.16, 1.17.
