# OneCode Implementation Plan

## Overview

This is a milestone-level implementation roadmap for OneCode, a local-first coding application. Product behavior and acceptance detail remain in the [PRD](../docs/PRD.md); component boundaries, workflows, and test strategy remain in the [TRD](../docs/TRD.md). The tasks below deliberately stay high-level. Break each epic into small, independently verifiable implementation slices before coding; resolve its referenced open decisions first.

The target initial release supports Windows, macOS, and Linux, including the same core coding workflow and initial-release local-model capabilities. A platform limitation must be explicit and must not weaken security guarantees.

## Architecture and sequencing decisions

- Follow the four proposed delivery milestones in [TRD §16](../docs/TRD.md#16-proposed-implementation-milestones): verified vertical slice, repository intelligence, governed agency, and productization.
- Keep shared task, repository, model, and policy behavior platform-neutral; use narrow OS adapters as described in [TRD §3.3](../docs/TRD.md#33-cross-platform-architecture).
- Prefer maintained open-source libraries for commodity capabilities; resolve the library-versus-custom decision in the owning ADR and keep OneCode-specific policy, semantics, contracts, and trust boundaries in OneCode code. The [tech-stack inventory](../docs/TECH-STACK.md) is a dated candidate list, not an approved manifest.
- Preserve non-embedding search when local models are absent. Embeddings augment retrieval; they do not replace the task router or permission gateway.
- Make security, privacy, isolation, traceability, and native OS validation release gates, not deferred polish.
- Record decisions in ADRs for the open choices listed in [TRD §17](../docs/TRD.md#17-open-technical-decisions), especially minimum OS versions, sandboxing, persistence/indexing, model formats, and packaging; the reserved ADR numbers are in the [ADR index](../docs/adr/README.md).
- Treat the workspace surfaces (editor, terminal, browser with annotations, source control, process registry) as initial-release scope per [PRD §10.11](../docs/PRD.md#1011-workspace-surfaces-editor-terminal-browser-and-source-control) and [TRD §3.4](../docs/TRD.md#34-workspace-services); land their minimal forms inside the vertical slice and complete them in Tasks 10 and 11.
- Apply the [engineering standards](../docs/ENGINEERING-STANDARDS.md) to every task, including the verification-economy and single-instance rules, and trace each task to `FR-nn` IDs and agent rules `R-nn`.

## Task List

### Phase 0: Resolve release contracts

#### Task 1: Resolving architecture and support decisions

**Description:** Resolve the open choices that determine cross-platform implementation and security boundaries. Record alternatives, decision rationale, compatibility constraints, and revisit triggers in the repository's ADR convention.

**Acceptance criteria:**
- [ ] Minimum supported Windows, macOS, and Linux versions and the initial-release feature-parity bar are recorded.
- [ ] Accepted desktop/UI architecture in ADR-0003 is reflected in implementation constraints; remaining decisions or bounded proposals exist for sandbox strategy, persistence/vector index, local-model formats/catalog, and packaging/signing.
- [ ] Offline model-bundle format, signed-manifest trust root/key lifecycle, and failure handling are defined without requiring network access at import time.
- [ ] Any capability that cannot meet the security bar on a supported OS is specified to fail closed, with its user-visible limitation documented.
- [ ] Each high-impact commodity subsystem has an ADR-backed library-versus-custom decision that records candidates, current versions, license/security/maintenance/MSRV review, performance/accessibility evidence, and a migration or revisit trigger.

**Verification:** Review ADRs against PRD §§10.9–10.10 and 15, FR-64–FR-65, and TRD §§3.3–3.4.7, 7.1.2, and 17; confirm each open decision has an owner or a clear release-blocking status and a recorded reuse evaluation.

**Dependencies:** None.

**Files likely touched:** ADR documents and, if needed, linked updates to PRD/TRD.

**Estimated scope:** Large; decision-making epic, decompose into individual ADRs.

### Phase 1: Cross-platform foundation and verified core

#### Task 2: Establishing native platform build foundations

**Description:** Set up the shared core and native development/build/test/package foundations for Windows, macOS, and Linux. Add only the OS adapters and CI needed to establish executable parity.

**Acceptance criteria:**
- [ ] Native CI or test machines build and run the core and CLI on all three supported operating systems.
- [ ] The compatibility matrix records OS versions, package status, and platform-specific process, filesystem, and security capabilities.
- [ ] Core platform adapters have tests for path and permission behavior, process cancellation, and safe handling when an OS capability is unavailable.

**Verification:** Run native build, test, install/launch smoke checks on each OS; cross-compilation alone does not count as runtime verification.

**Dependencies:** Task 1.

**Files likely touched:** Build/CI configuration, platform adapters, compatibility documentation; see TRD §§3.3, 14, and 15.

**Estimated scope:** Large.

#### Task 3: Delivering the verified coding vertical slice

**Description:** Implement the smallest complete local coding path: repository selection, task state and recovery, isolated worktree, one model provider, basic file/keyword retrieval, planner/coder/tester flow, and inspectable diff/check evidence.

**Acceptance criteria:**
- [ ] A user can complete one bounded coding task in an isolated worktree on each supported OS.
- [ ] Task state, cancellation/recovery, permissions, and check failures are accurately recorded and surfaced.
- [ ] Material unresolved blockers follow FR-125: up to three distinct, evidence-backed local Architect attempts precede up to three Advisor attempts; unresolved blockers then pause with an evidence-backed user decision brief. This counter is independent of the FR-29 code-repair budget.
- [ ] Every Advisor attempt references applicable project instructions, PRD/TRD/ADRs, local source/tests, and other relevant project documents; relevant comparable-project/authoritative-source research is recorded when permitted, while unauthorized or unavailable external research is explicitly marked as not performed.
- [ ] The slice includes the minimal workspace from TRD §16 Milestone 1: an editor showing agent hunks, an integrated terminal with attributed agent commands and captures, a Problems panel, a process registry that reuses a running instance, sessions with steering and a visible permission mode, and the workspace-trust prompt; Task 10 completes these surfaces.
- [ ] The same core acceptance scenario passes on Windows, macOS, and Linux.

**Verification:** Run the end-to-end sample workflow and native core acceptance suite on all supported OSes; verify cancellation, recovery, and a deliberately failing check. Add acceptance tests for Architect-to-Advisor handoff only after three distinct failures, durable blocker IDs and non-reset across relabeling/sessions/models, linked episodes only after a user scope change or a distinct acceptance criterion/diagnostic fingerprint with separate affected scope, separate FR-29 counters, non-counting repeated turns/tool calls, Advisor project-document/source research, gateway-validated citations, no network use without approval, and user escalation after three unresolved Advisor attempts.

**Dependencies:** Task 2.

**Files likely touched:** Core orchestration, task persistence, worktree/process adapters, model adapter, CLI, and end-to-end fixtures; see PRD §§7–8 and FR-125, and TRD §§4, 6, 7, 9, 14, and 16.

**Estimated scope:** Large.

**Checkpoint — Foundation:** Review the vertical slice and OS parity evidence before expanding repository intelligence or agent autonomy.

### Phase 2: Repository intelligence and local retrieval

#### Task 4: Building repository intelligence and standards resolution

**Description:** Add incremental repository indexing, syntax-aware symbols/relationships, hybrid keyword/symbol retrieval, context bundles, stack/version detection, and path-scoped coding-standards profiles. Expose the relationships as a provenance-labeled code knowledge graph with agent graph operations, and apply progressive code disclosure and context economy to every model call. Use LadybugDB for graph persistence as proposed in ADR-0017; keep SQLite for relational and lexical index data, with `sqlite-vec` only if ADR-0006 selects it for vector search.

**Acceptance criteria:**
- [ ] Repository onboarding respects exclusions and reports indexing coverage, errors, and stale state.
- [ ] Context results link to source/revision and explain why files or symbols were selected.
- [ ] Implementation tasks receive applicable standards or an explicit unknown/unverified status before editing.
- [ ] Every graph edge carries extracted, inferred, or ambiguous provenance; graph results report revision, staleness, coverage, and omitted items; inferred edges are never accepted as evidence.
- [ ] The code graph and GraphRAG remain derived indexes; they link to authoritative source artifacts and accepted second-brain records without auto-promoting generated or inferred content.
- [ ] Use a maintained parser and graph-algorithm library where it meets language and provenance requirements; document measured coverage gaps before adding custom parsing or algorithms.
- [ ] Agents can call map, skeleton, locate, find-all, neighbors, impact, path, and status operations, and whole-file reads are recorded with a reason.
- [ ] Large outputs are stored by reference, and per-layer token accounting is visible for each task.

**Verification:** Evaluate retrieval and context size on versioned representative repositories; test incremental refresh, monorepo scoping, exclusions, stale-index handling, and standards conflicts. Measure tokens and turns per accepted task with graph navigation on and off, by repository size class, against the whole-file and keyword/symbol baselines; check graph query latency and that graph updates stay inside the re-index budget. Confirm derived and inferred results remain distinguishable from accepted memory and source evidence.

**Dependencies:** Task 3; ADR-0017 before the graph store is locked in.

**Files likely touched:** Repository scanner/index, parsers, code graph, retrieval, gateway graph operations, context builder, standards resolver, and fixtures; see PRD FR-01–FR-07, FR-36–FR-45, and FR-114–FR-117, plus TRD §§5–6 and 14.

**Estimated scope:** Large.

#### Task 5: Adding user-controlled local embedding models

**Description:** Ship a default embedding model inside the application package and use it where it measurably helps retrieval and the code graph; add a curated, pinned Hugging Face model catalog for alternatives, and user-initiated offline model-bundle import with verified provenance and integrity.

**Acceptance criteria:**
- [ ] The user can inspect model role, source/revision, license, format, size, and hardware requirements before explicitly downloading; integrity is verified before load.
- [ ] In an air-gapped test, a user can import a supported bundle with a valid signed manifest and artifact hashes without network access; invalid, missing, or untrusted signatures and mismatched hashes fail closed.
- [ ] Repository chunks and embeddings stay local, and vector indexes are bound to model/config revisions and safely invalidated or rebuilt when these change.
- [ ] Retrieval quality and resource costs are measured against a versioned keyword/symbol baseline; search remains useful with no embedding model installed.
- [ ] The bundled default model works on first run with no network access, is verified at build and before load, can be disabled or replaced, and each of its uses (TRD §5.7) is measured on and off; uses without a measured gain ship switched off.
- [ ] Model formats, inference/runtime adapters, and cryptographic verification use maintained, compatible libraries where suitable; dependency choices pass license, security, offline, and supported-platform review.

**Verification:** Test download approval, offline bundle signature/hash and archive-path failures, import cancellation, no-network behavior, no-model fallback, index invalidation/rebuild, and retrieval quality, latency, indexing time, RAM/VRAM, and disk usage on each supported OS/runtime combination.

**Dependencies:** Task 4.

**Files likely touched:** Model catalog/acquisition, offline bundle verifier, local inference adapter, index metadata, retrieval, UI/CLI controls, and evaluation fixtures; see PRD FR-56–FR-60, FR-64–FR-65, and FR-123–FR-124, and TRD §§5.3.1, 5.7, 7.1.1–7.1.2, 10, 12, and 14.

**Estimated scope:** Large.

**Checkpoint — Repository intelligence:** Review source-grounded retrieval, standards profiles, no-model fallback, catalog and offline-import verification, and model privacy behavior before adding optional model roles.

### Phase 3: Governed agency and verification

#### Task 6: Governing tool, skill, and plugin use

**Description:** Implement the least-privilege tool/MCP gateway, task-scoped discovery, approval/audit records, and a reviewed, versioned skills registry. Keep optional marketplace/plugin adapters staged according to PRD priority.

**Acceptance criteria:**
- [ ] Every side-effecting tool call is schema-validated, policy-checked, and audited; required approvals cannot be bypassed by model output.
- [ ] Skills/plugins remain disabled until provenance, revision, license, dependencies, and capabilities are reviewed and the user enables them.
- [ ] Tool/skill discovery can suggest candidates but cannot authorize or invoke them.

**Verification:** Test denied-permission bypass attempts, malformed tool arguments, approval flows, untrusted instructions, skill/plugin revocation, and audit history.

**Dependencies:** Tasks 3 and 4.

**Files likely touched:** Tool/MCP gateway, policy engine, skill registry, approval UX, and security tests; see PRD FR-16–FR-20 and FR-46–FR-48, and TRD §8.

**Estimated scope:** Large.

#### Task 7: Enforcing quality gates and defensive audit workflow

**Description:** Add project-appropriate verification, independent critique, bounded repair, and the separately governed defensive source-audit workflow.

**Acceptance criteria:**
- [ ] Required checks and acceptance criteria block completion when failing, skipped, or unsupported; evidence is recorded.
- [ ] Critics are read-only and FR-29 code-repair loops are bounded with repeated-failure detection; these retries neither consume nor extend FR-125 Architect/Advisor decision attempts.
- [ ] Decision escalation records evidence and outcomes for each distinct attempt, preserves blocker identity/counters across turns and sessions, rejects agent-requested resets and citations without gateway evidence, and stops after three unresolved Architect attempts plus three unresolved Advisor attempts with a human decision brief.
- [ ] Security audits track coverage, validate structured findings, require independent verification, and report incomplete runs honestly; target code executes only within the specified OS-enforced sandbox.

**Verification:** Test quality-gate behavior, critic separation, independent repair and decision-escalation budgets, blocker relabel/reset resistance, source-evidence integrity (fabricated, unreachable, and mismatched citations), attempt evidence/counter semantics, human fallback, finding schemas, coverage gaps, verifier independence, and sandbox denial on each OS.

**Dependencies:** Tasks 3 and 6.

**Files likely touched:** Quality engine, test/report artifacts, audit workflow, sandbox adapters, and adversarial fixtures; see PRD FR-26–FR-33, FR-49–FR-55, and FR-125, and TRD §§4.3, 9, 12, and 14.

**Estimated scope:** Large.

**Checkpoint — Governance:** Review permission bypass resistance, quality gates, cross-platform sandbox guarantees, and incomplete-audit behavior before release UX integration.

### Phase 4: Product experience and release readiness

#### Task 8: Completing desktop and CLI product workflows

**Description:** Deliver the inspectable desktop and CLI surfaces for tasks, approvals, context, model management (including offline import and verification states), diffs, evidence, and recovery.

**Acceptance criteria:**
- [ ] Users can inspect task state, selected context, model/index status, permissions, diffs, and verification evidence.
- [ ] Approval, error, empty, loading, cancellation, and recovery states are accessible and consistent across supported OSes.
- [ ] Core desktop and CLI acceptance scenarios pass on Windows, macOS, and Linux.
- [ ] UI workflows reuse the selected design-system and accessibility primitives; charts and visualizations reuse the ADR-selected libraries and provide keyboard-accessible, non-canvas alternatives.

**Verification:** Run UI/CLI end-to-end checks, accessibility review, and native OS smoke tests; verify model download and repository indexing status are understandable.

**Dependencies:** Tasks 3–7.

**Files likely touched:** Desktop UI, CLI, local API clients, and UI tests; see PRD §§11–12 and TRD §§11, 13, and 16.

**Estimated scope:** Large.

#### Task 10: Delivering the workspace surfaces

**Description:** Integrate the ADR-selected editor, terminal renderer, browser protocol/client, graph/chart visualizations, and accessible UI primitives into the shared workspace surfaces. Build OneCode's versioned document semantics, language-service integration, terminal process/policy controls, isolated browser profiles, annotations and mapping, source-control workflows, Problems/Tests/Processes panels, process registry, and diagnostics bus around those libraries. A minimal editor, terminal, Problems panel, and process registry land earlier inside Task 3; this task completes them. Do not implement commodity editors, VT emulators, browser engines, parsers, or visualization renderers from scratch without a documented gap.

**Acceptance criteria:**
- [ ] The editor applies agent edits as reviewable hunks against a versioned document model, never overwrites unsaved user edits, and supports turn-level revert.
- [ ] Agent terminal commands are attributed, sandboxed, cancellable, and logged; agents read only started or shared tabs; captures are bounded and redacted.
- [ ] The built-in browser uses an isolated per-project profile, classifies hosts, enforces capability classes, captures console/network/screenshots, and blocks credential entry and dangerous link patterns for agents.
- [ ] A set of annotations becomes a fix task with mapped source candidates and confidence, and the result ships with before/after captures; unmapped annotations are reported.
- [ ] The process registry reuses a running instance, reports port conflicts without switching ports, and denies stops of processes the session does not own.
- [ ] Source control operations, diagnostics aggregation with active-source reporting, and test discovery/run work on all three OSes.
- [ ] Reused components are isolated behind OneCode adapters, and selected versions pass license/security, accessibility, performance, and native OS checks; required OneCode policy and isolation controls remain in OneCode-owned code.

**Verification:** Run the workspace-services test layer in TRD §14.1 on each OS, including document-model concurrency, PTY behavior, browser isolation, host classification, annotation fidelity against fixture web applications, process-registry reuse and ownership, and the latency budgets from PRD §12.

**Dependencies:** Tasks 3, 4, and 6; ADRs 0011 to 0015 and 0018.

**Files likely touched:** Workspace service crates (editor, terminal, browser, source control, process registry, diagnostics), platform adapters, fixture web applications, desktop UI panels; see PRD §§10.11, 11, and 12 and TRD §§3.4, 6.5, and 14.

**Estimated scope:** Large.

#### Task 11: Delivering fix workflows, sessions, permissions, and configuration

**Description:** Implement the fix-from-evidence workflow and engine, sessions with steering, interruption, compaction, and turn-level revert, permission modes and rules, workspace trust, protected paths, lifecycle hooks, layered settings, instruction-file loading, command palette and keybindings, theming, notifications, onboarding, the diagnostics bundle, and commit/PR message generation.

**Acceptance criteria:**
- [ ] A Fix action from each evidence surface (terminal, test, diagnostic, browser console, annotation, failed check, critic finding) creates a fix task that reproduces first, states a root cause, adds a regression test where feasible, and reports before/after evidence; symptom patches are flagged by critics.
- [ ] Steering messages arrive at safe points, interrupts preserve state, compaction keeps pending approvals and unapplied hunks, and parallel sessions run in separate worktrees.
- [ ] Permission evaluation follows hard policy, deny, allow, mode default, ask; no mode or rule can disable FR-18 approvals or protected paths; the sandbox-unavailable fallback is explicit.
- [ ] Untrusted workspaces run nothing repository-provided; hooks run sandboxed, cannot grant permissions, and are listed with provenance; instruction files load with provenance and size limits.
- [ ] Settings validate against the published schema, every command is in the palette and bindable, and notifications carry no source or secrets.

**Verification:** Run the sessions-and-steering, permission-modes-rules-trust-hooks, fix-workflow, and verification-economy test layers in TRD §14.1, plus the adversarial fixtures tied to agent rules R-01 to R-41, on each OS.

**Dependencies:** Tasks 3, 6, and 10; ADR 0016.

**Files likely touched:** Fix engine, session service, policy engine, hooks engine, settings and instructions service, notification service, desktop UI, CLI; see PRD §§10.12–10.16 and TRD §§4.2, 6.6, 8.5–8.7, and 9.5.

**Estimated scope:** Large.

#### Task 9: Releasing and operating the cross-platform product

**Description:** Complete platform packaging/signing, release automation, upgrade/recovery documentation, support matrix, observability, and staged release readiness.

**Acceptance criteria:**
- [ ] Signed or integrity-verifiable packages install, launch, update, and recover on each supported OS/version.
- [ ] All release-blocking acceptance, security, privacy, and performance gates pass on native platforms; exceptions are documented and approved without weakening security.
- [ ] Supported environments, known limitations, model/runtime compatibility, diagnostics, and rollback/recovery procedures are published.
- [ ] OpenTelemetry-compatible instrumentation is available where selected; any export decision follows ADR-0019, remains opt-in, redacted, receipted, and disabled by default; release SBOMs and dependency/security reports cover runtime and bundled components.

**Verification:** Run release-candidate install/upgrade/smoke tests and full native release gates; review SBOM/dependency/license/security artifacts and confirm rollback.

**Dependencies:** Tasks 1–8, 10, and 11; ADR-0019 before enabling telemetry export.

**Files likely touched:** Packaging/release pipelines, platform installers, signing configuration, compatibility/support docs; see PRD §§12–16 and TRD §§3.3, 14–16.

**Estimated scope:** Large.

**Checkpoint — Release:** Product and engineering review the cross-platform support matrix, open exceptions, security evidence, benchmark results, and recovery procedures before release approval.

## Phase 5: P1 second-brain follow-up (v1.5)

#### Task 12: Delivering the second-brain knowledge lifecycle

**Description:** Implement FR-126 to FR-130 as the user-controlled lifecycle for capturing, reviewing, connecting, maintaining, recalling, and portably backing up project knowledge. Treat GraphRAG and the knowledge map as indexing and navigation surfaces, never as the knowledge authority. This is a P1 follow-up and not an initial-release gate.

**Acceptance criteria:**
- [ ] User-selected captures retain scope, provenance, source revision/time, trust, and redaction state; they remain pending until explicitly accepted.
- [ ] Accepted notes preserve revisions, typed provenance-bearing relations, validity/freshness, and author/origin; generated, imported, inferred, and user-authored material stay distinguishable.
- [ ] Source changes, expiry, possible duplicates, and contradictions create review signals without silently changing, merging, deleting, or promoting accepted content.
- [ ] Memory recall is scope-aware and explainable, shows provenance and freshness, accepts usefulness feedback without content mutation, and never treats memory as proof or authorization.
- [ ] Users can export selected scopes and history to passphrase-encrypted OneCode archives; native archive restores and Markdown/wikilink imports enter review, retain prior acceptance only as historical provenance, and require re-acceptance before recall. Plaintext Markdown export shows a warning and requires confirmation.
- [ ] Wrong passphrases, tampering, malformed or excessive KDF parameters, and archive validation failures fail closed without partial restore; passphrases are never stored or logged, and lost passphrases are disclosed as unrecoverable.
- [ ] Backups work offline and remain local by default; automatic cloud sync is not introduced.

**Verification:** Run the second-brain test layer in TRD §14.1, including provenance/freshness, acceptance gating, relation and revision behavior, contradictory/stale memory, retrieval rationale and feedback, untrusted import validation, conflict previews, selective round trips, atomic restore/rollback, deletion/retention, and no implicit egress or execution. Evaluate recall quality and citation validity against the consented benchmark in TRD §14.2.

**Dependencies:** Tasks 4, 6, 8, 10, and 11; ADR-0017, proposed ADR-0021, and the storage decisions in TRD §§10 and 17.

**Files likely touched:** Knowledge capture/review API and UI, memory storage and schema, retrieval/ranking, knowledge-map integration, archive/import/export, security and evaluation fixtures; see PRD FR-126–FR-130 and TRD §§5.6, 5.8, 6.1, 10.1–10.3, 11–14, and 16.

**Estimated scope:** Large.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Supporting three operating systems expands the release surface | High | Build native checks in Task 2, keep platform adapters narrow, and make the same core acceptance suite release-blocking. |
| Security capabilities differ between operating systems | High | Verify OS-enforced isolation per platform; fail closed rather than silently weakening protections. |
| Local-model runtime support varies by OS and hardware | Medium | Publish tested runtime/hardware combinations, retain non-embedding fallback, and make unsupported combinations explicit. |
| Broad initial scope delays a usable release | High | Ship the Task 3 vertical slice early; keep follow-up model roles and P1 integrations outside the initial critical path unless required by release acceptance. |
| Open architecture choices cause rework | Medium | Resolve Task 1 decisions before locking persistence, sandbox, UI, model-format, or packaging boundaries. |
| Graph navigation adds indexing cost without saving tokens on typical repositories | Medium | Benchmark by repository size class in Task 4; enable graph-first context by default only where measured savings hold without lowering acceptance; keyword/symbol retrieval stays available. |

## Open questions before task execution

- What minimum versions of Windows, macOS, and Linux are supported?
- Which desktop framework, sandbox mechanism, and native package formats are selected?
- What first-pass language/framework and local-model runtime matrix is release-blocking?
- Who approves documented platform exceptions, and what evidence is required?
- Which open TRD ADRs must be accepted before each phase begins?
