# OneCode High-Level Task List

Execution detail and product acceptance live in the [implementation plan](./plan.md). User-facing behavior is specified in the [PRD](../docs/PRD.md), and technical contracts/verification detail in the [TRD](../docs/TRD.md).

## Phase 0: Resolve release contracts

- [ ] **Task 1: Resolving architecture and support decisions** — Define OS parity, sandbox, storage/index, model catalog and offline bundle trust/key lifecycle, packaging, and reuse-vs-build decisions for commodity subsystems. Evaluate the [tech-stack candidates](../docs/TECH-STACK.md); do not treat the catalog as an approved dependency list. **Depends on:** none.

## Phase 1: Cross-platform foundation and verified core

- [ ] **Task 2: Establishing native platform build foundations** — Native build/test/package checks and OS compatibility matrix. **Depends on:** Task 1.
- [ ] **Task 3: Delivering the verified coding vertical slice** — Complete an isolated, evidence-backed coding task on all three OSes. **Depends on:** Task 2.
- [ ] **Checkpoint: Foundation** — Review identical core acceptance evidence on Windows, macOS, and Linux.

## Phase 2: Repository intelligence and local retrieval

- [ ] **Task 4: Building repository intelligence and standards resolution** — Indexing and retrieval with maintained parsers/graph algorithms where suitable, context bundles, stack-aware standards, provenance-labeled graph operations, and context economy. **Depends on:** Task 3.
- [ ] **Task 5: Adding user-controlled local embedding models** — Bundled default embedding model and its measured uses, pinned downloads, signed offline imports, maintained inference/format/verification libraries where suitable, local vectorization, fallback, and benchmark. **Depends on:** Task 4.
- [ ] **Checkpoint: Repository intelligence** — Review retrieval quality, standards provenance, model/import verification, privacy, and no-model fallback.

## Phase 3: Governed agency and verification

- [ ] **Task 6: Governing tool, skill, and plugin use** — Permission gateway, approvals, audit, and reviewed extensions. **Depends on:** Tasks 3 and 4.
- [ ] **Task 7: Enforcing quality gates and defensive audit workflow** — Required checks, independent critique, bounded repair, and source audits. **Depends on:** Tasks 3 and 6.
- [ ] **Checkpoint: Governance** — Review policy bypass tests, security gates, sandbox guarantees, and audit completeness.

## Phase 4: Product experience and release readiness

- [ ] **Task 8: Completing desktop and CLI product workflows** — Approval, context, model acquisition/import, diff, evidence, and recovery UX using the selected design-system and accessibility primitives. **Depends on:** Tasks 3–7.
- [ ] **Task 10: Delivering the workspace surfaces** — Integrate the ADR-selected editor, terminal renderer, browser protocol/client, graph/chart visualizations, and accessible UI primitives; implement OneCode's document model, process/policy/security boundaries, and workspace semantics around them. **Depends on:** Tasks 3, 4, and 6.
- [ ] **Task 11: Delivering fix workflows, sessions, permissions, and configuration** — Fix-from-evidence engine, sessions and steering, permission modes and rules, workspace trust, hooks, settings, instructions, palette, notifications, onboarding. **Depends on:** Tasks 3, 6, and 10.
- [ ] **Task 9: Releasing and operating the cross-platform product** — Packages, release automation, support matrix, docs, recovery, ADR-0019-governed telemetry export if enabled, and complete SBOM/dependency review. **Depends on:** Tasks 1–8, 10, and 11.
- [ ] **Checkpoint: Release** — Approve native OS evidence, exceptions, security/privacy gates, benchmarks, and rollback.
