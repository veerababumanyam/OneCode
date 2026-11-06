# Architecture Decision Records

The [TRD](../TRD.md) labels choices as **proposed** or **open** and requires an ADR before an open choice becomes a non-reversible dependency. This directory holds those records.

## Convention

- One decision per file, named `NNNN-short-title.md`, numbered sequentially and never reused.
- Use the [template](./0000-template.md). Keep the decision, its alternatives, and its consequences factual and short; link evidence (benchmarks, prototypes, audits) rather than restating it.
- Statuses: `Proposed`, `Accepted`, `Superseded by NNNN`, `Deprecated`. An accepted ADR changes only through a new ADR that supersedes it.
- Every ADR that introduces a trust boundary or a dependency with system reach includes a threat-model section ([Engineering standards §4](../ENGINEERING-STANDARDS.md)).
- Each ADR lists the PRD requirement IDs and TRD sections it affects, and the revisit trigger that would reopen it.
- Before creating a custom implementation of a commodity capability, evaluate suitable maintained libraries in the [tech-stack inventory](../TECH-STACK.md). Record the selected library/version or the evidence-based reason for not reusing one, including license, maintenance, platform, security, performance, and MSRV consequences.

## Decisions to record

These map to [TRD §17](../TRD.md#17-open-technical-decisions) and the [PRD's open product decisions](../PRD.md#15-open-product-decisions). Numbers are reserved; files are created when a decision is drafted.

| ADR | Decision | TRD §17 item | Blocks |
|---|---|---|---|
| 0001 | Minimum supported OS versions, packaging, signing and notarization, update channel | 9 | Task 1, Task 2 |
| 0002 | Process model: in-process modules versus local IPC service boundaries | 2 | Accepted: [ADR-0002](./0002-process-model.md); Task 2 |
| 0003 | Desktop UI framework and UI-to-core protocol | 3 | Accepted: [ADR-0003](./0003-desktop-ui-and-bridge.md); Task 3, Task 10 |
| 0004 | Sandbox strategy and per-OS isolation guarantees (including WSL) | 7 | Task 3, Task 6 |
| 0005 | Task and index storage engine, encryption, retention, and migration | 6 | Accepted: [ADR-0005](./0005-storage-engine.md); Task 3, Task 4 |
| 0006 | Default embedding model bundled with the app (redistribution license, size, hardware floor), catalog and format policy, vector index | 1 | Task 5 |
| 0007 | Offline model-bundle container and signature formats, trusted-key lifecycle | 10 | Task 5 |
| 0008 | First language and framework support matrix | 4 | Task 4 |
| 0009 | Frontier provider APIs versus OpenAI-compatible proxy abstraction | 5 | Task 6 |
| 0010 | Skill packaging, plugin ABI, and compatibility guarantees | 8 | Task 6 |
| 0011 | Editor engine and the document-model bridge | 11 | Task 10 |
| 0012 | Terminal emulator and pseudo-terminal implementation per OS | 12 | Task 3, Task 10 |
| 0013 | Built-in browser engine and element-to-source mapping sources | 13 | Task 10 |
| 0014 | Source-control implementation and credential-helper handling | 14 | Task 10 |
| 0015 | Language-server distribution and trust model; debugger-adapter scope | 15 | Task 10 |
| 0016 | Hook, rule, and custom-command definition formats and compatibility | 16 | Task 11 |
| 0017 | Proposed: LadybugDB graph store; graph schema versioning, community algorithm, repository-map ranking | 17 | Task 4 |
| 0018 | Knowledge map rendering and layout, linked-note storage, Markdown/wikilink export format | 18 | v1.5 Knowledge map (FR-119, FR-120) |
| 0019 | OpenTelemetry-compatible instrumentation and telemetry export policy | 19 | Task 9, only if telemetry export is enabled |
| 0020 | Contract casing and TypeScript bindings: camelCase JSON contracts with ts-rs-generated types | — (not a §17 item) | Accepted: [ADR-0020](./0020-contract-casing-and-bindings.md); Task 2, Task 3 |
| 0021 | Proposed: encrypt portable knowledge backups and re-review restored records | 20 | v1.5 second brain (FR-130) |
| 0022 | Proposed: root `VERSION` file as the single source of truth for the release version | — (not a §17 item) | Release identity; [engineering standards §11](../ENGINEERING-STANDARDS.md#11-release) |

Task numbers refer to the [implementation plan](../../tasks/plan.md).
