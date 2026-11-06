# OneCode Technical Requirements and Design

**Status:** Draft  
**Product:** OneCode (working name)  
**Audience:** Engineering, architecture, security, and QA  
**Source:** [Reference document](./old-ref-docs/prd-ref.md)  
**Product requirements:** [PRD](./PRD.md)  
**Companions:** [Agent operating rules](./AGENT-OPERATING-RULES.md), [Engineering standards](./ENGINEERING-STANDARDS.md), [ADR index](./adr/README.md)

## 1. Purpose and design status

This document translates the OneCode product vision into a proposed technical architecture, implementation requirements, coding lifecycle, verification strategy, and delivery sequence. It is a design baseline, not a description of an already implemented system.

Where the source leaves choices open, this document labels the choice as **proposed** or **open**. Resolve open choices through recorded architecture decision records (ADRs) before they become non-reversible implementation dependencies.

The [Autonomous One-Shot SDLC & ADLC Super-Harness specification](./Autonomous%20One-Shot%20SDLC%20%26%20ADLC%20Super-Harness%20-%20Technical%20Architecture%20Specification.md) is supplemental, non-normative reference material. Its compatible workflow ideas may inform implementation, but the PRD, this TRD, accepted ADRs, and agent operating rules govern OneCode. “One-shot” means a user can request an end-to-end task; routine, reversible choices should be handled by the agent/advisor within the approved scope, while required approvals and materially consequential user decisions remain gated. The user can interrupt or review changes before integration.

## 2. Technical principles

- Local-first execution and storage; external services are optional and governed.
- Rust for core orchestration and system services where its concurrency, safety, and distribution benefits apply.
- Stable typed contracts between components and agents.
- Least privilege, isolation, explicit approvals, and auditable side effects.
- Evidence-linked retrieval and reproducible verification.
- Reversible changes, idempotent jobs, and recoverable task state.
- Pluggable providers behind narrow interfaces; avoid provider-specific assumptions in core workflows.
- Incremental delivery with a working, tested vertical slice at each milestone.
- Reuse maintained open-source components for commodity capabilities when they meet OneCode's requirements; keep product-specific policy, orchestration, data contracts, and trust boundaries under OneCode's control.

## 3. Proposed architecture

```text
 Desktop UI (editor, terminal, browser, source control, panels) / CLI / IDE integration
                |
       Local application API  (sessions, tasks, approvals, observations, events)
                |
     Rust orchestrator and policy  (permission modes, rules, hooks, workspace trust)
       /          |           \                     \
 Repo intelligence  Agent runtime  Model/tool router    Workspace services
       |                |                |              (editor/LSP, terminal/PTY,
 AST/index/store   Worktree sandbox   Local models /    browser/DevTools, source
       |                |             approved APIs     control, process registry,
       |                |                |              diagnostics bus)
       +----------- Quality engine ------+-----------------------+
                |
      Task state, sessions, audit, memory
                |
           Git / CI / PR
```

### 3.1 Components and responsibilities

| Component | Responsibility | Boundary |
|---|---|---|
| User interfaces | Task submission, approvals, plan/diff/evidence display, recovery controls. | Call the local application API; do not access agent internals directly. |
| Application API | Authenticates local clients, validates requests, streams task events, exposes status and approvals. | Local-only by default; stable versioned request/response contracts. |
| Orchestrator | Classifies work, manages task state and DAGs, budgets, policy decisions, retries, and completion. | Sole authority for task transitions, write permission, and merge/integration actions. |
| Repository intelligence | Scans, parses, indexes, retrieves, and reports impact/context; maintains the code knowledge graph, repository map, and knowledge map (§5.5, §5.6). | Read-only access to the target repository except for generated index artifacts in the configured data directory. |
| Standards resolver | Detects stack/version and resolves path-scoped rules, checks, local examples, and version-matched technical guidance into a `StandardsProfile`. | Read-only evidence gathering; does not silently rewrite project rules or install dependencies. |
| Model registry | Lists compatible model artifacts, records provenance and compatibility, and manages explicit user-approved downloads and local model files. | Downloads only pinned, supported artifacts; never executes model-supplied code or uploads repository content. |
| Skill/plugin registry | Validates, indexes, versions, and scopes reusable workflows and plugin packages. | Imported content is untrusted until reviewed and explicitly enabled; capability enforcement remains in the gateway. |
| Agent runtime | Executes role-scoped model/tool steps and returns typed artifacts. | No direct merge authority; task-specific context and tool permissions. |
| Model router | Selects provider/model and applies privacy, capability, budget, and availability constraints. | Receives only the minimum context required for a model call. |
| Tool/MCP gateway | Discovers, describes, authorizes, invokes, and audits tools and skills. | All side-effecting tool use passes through policy enforcement. |
| Quality engine | Runs deterministic checks and independent critique; manages repair evidence. | Critic roles are read-only; quality failures cannot be marked successful by a builder. |
| Second-brain service | Captures, reviews, links, maintains, recalls, and backs up source-linked project knowledge (§5.8). | SQLite holds authoritative records and lifecycle state; only accepted knowledge is eligible for recall; redact before persistence; local-first with no automatic cloud sync. The code graph and vector index are derived retrieval aids. |
| Delivery adapter | Prepares Git commits, PRs, CI checks, and release artifacts. | Explicit approval for external publication or destructive Git actions. |
| Workspace services | Host the surfaces the user and agents share: editor and language service, terminal, built-in browser and annotations, source control, process and port registry, and diagnostics bus (§3.4). | Agent observation and action pass through the gateway and policy; user actions are logged for attribution only. |
| Session service | Sessions, turns, steering queue, interruption, compaction, and transcripts (§4.2). | Owns session state; tasks belong to sessions; agents cannot change conversation or permission mode. |
| Policy engine | Evaluates hard policy, permission modes, rules, protected paths, and workspace trust into `PermissionDecision`s (§8.5 to §8.7). | Deterministic; server-side; never trusts UI- or model-supplied approval state. |
| Hooks engine | Runs configured lifecycle hooks and applies their outcomes (§8.6). | Sandboxed; cannot grant permissions or change policy; requires workspace trust for project hooks. |
| Settings and instructions service | Layered configuration, schema validation, instruction-file loading with provenance (FR-101, FR-102). | Secrets excluded; governing files are protected paths. |
| Notification service | Operating-system notifications and attention state (FR-106). | Titles and redacted summaries only; no source or secrets. |

### 3.2 Process model

**Proposed:** start with a single local application process with internal Rust modules and bounded worker tasks. Use IPC for separately managed MCP servers and model runtimes. This minimizes initial operational complexity while keeping process boundaries around untrusted or independently updated providers.

**Open ADR:** whether to introduce local gRPC/JSON-RPC services or retain in-process Rust actors beyond the first vertical slice.

### 3.3 Cross-platform architecture

The initial release targets Windows, macOS, and Linux for both desktop and CLI use. Keep shared task, repository, model, and policy behavior in platform-neutral core modules; isolate operating-system-specific packaging, process management, filesystem watching, credential storage, and sandbox integrations behind narrow platform adapters.

- Establish native build, test, and packaging checks for all three operating systems in the first vertical slice; do not defer basic OS support to final productization.
- Run the same release-blocking core acceptance suite on every supported OS, covering install/launch, repository onboarding and indexing, isolated coding task, verification report, and initial-release local-model workflows. Add OS-specific checks for native packaging, filesystem paths/permissions, process cancellation, and model-runtime integration.
- Maintain a versioned compatibility matrix for minimum OS versions, desktop/CLI package status, supported local model runtimes and formats, filesystem/process behavior, and security-sensitive capabilities.
- Provide equivalent permission and security guarantees across platforms. A platform adapter must not silently fall back to weaker isolation; if the required OS-enforced sandbox is unavailable, block execution of target-controlled code and report the limitation.
- Keep user-visible workflows and persisted formats consistent across platforms where technically possible. Any initial-release feature gap requires an explicit, documented release exception and safe alternative; do not claim full support for a workflow that is unavailable on an OS.
- Run platform-sensitive behavior in native CI or on native test machines; cross-compilation alone does not establish runtime compatibility.
- On Windows, treat the Windows Subsystem for Linux as a distinct workspace target with its own shell, path mapping, process registry entries, and sandbox verification (FR-81); never present a WSL toolchain as a native Windows one.

The exact minimum Windows, macOS, and Linux versions, packaging formats, and signing/notarization requirements remain open technical decisions.

### 3.4 Workspace services

Workspace services host the surfaces the user and agents share. Each service exposes two interfaces: a **user interface** used directly by the desktop application, and an **agent interface** reachable only through the tool/MCP gateway (§8), so that every agent observation and action is policy-checked, budgeted, attributed, and audited. User actions are recorded for attribution and history but never pass through agent policy.

#### 3.4.1 Editor and language service

- **Document model.** One in-memory document store is the single source of truth for open buffers. The user's editor, agent edits, and language servers operate on versioned documents; every edit carries a document version and an actor (user, agent with task ID, or formatter/hook).
- **Agent edit protocol.** Agents submit edits as patches against a document version within the task worktree. If the user has edited the same region since that version, the edit is rebased when unambiguous and otherwise presented as a conflict for the user to resolve; agent edits never overwrite unsaved user edits silently. Applied agent edits remain tracked as reviewable hunks until accepted (FR-66) and are included in turn-level revert (FR-92).
- **Language-server manager.** Start at most one language server per language per workspace root, lazily on first open, under the workspace trust state (§8.7): repository-provided binaries and configurations run only in trusted workspaces. Apply CPU and memory budgets, restart with backoff, and report a server as unavailable instead of hanging. The manager translates diagnostics, code actions, and symbol information into OneCode's typed `DiagnosticSet` and symbol contracts; it never exposes raw server processes to agents.
- **Compiler and checker ingestion.** Where the project's tooling emits structured output (compiler JSON message formats, type-checker JSON reports), ingest it into the diagnostics bus with command, version, and exit status so Problems and agents see the same facts.
- **Editor engine (open ADR).** Evaluate Monaco Editor and CodeMirror before considering a custom editor engine. The selected component decides large-file strategy and rendering; measure keystroke latency (PRD §12), accessibility, extension support, and the cost of exposing a versioned document API to the Rust core. The OneCode document model and agent edit semantics remain authoritative regardless of editor choice.

#### 3.4.2 Terminal service

- **Pseudo-terminal per tab** through the platform adapter (ConPTY on Windows, forkpty on macOS and Linux, WSL through its interop launcher), with the user's configured shell, a per-worktree working directory, and environment construction that never injects secrets into interactive shells.
- **Shell integration** emits command-boundary marks (start, end, exit code, working directory) so the service can address "the last command and its output" precisely, drive run controls from conversation, and distinguish a prompt from a running command.
- **Attribution.** Agent-run commands execute through the gateway's process-run operation (sandboxed, budgeted, cancellable), stream into the terminal with a visible agent marker and task ID, and are logged with command, working directory, exit code, duration, and a bounded output reference. The user can type into the same tab; the service records which actor issued each command.
- **Sharing and capture.** Agents read only tabs they started or tabs the user shared (FR-70). A capture is a bounded, redacted snapshot (selection, last command output, or ring buffer up to a configured limit) stored as a `TerminalCapture` with tab ID, command boundaries, timestamps, and hash; captured text is labeled untrusted.
- **Background processes.** Commands exceeding a duration threshold or marked long-running are promoted into the process registry (§3.4.5) with output files and stop controls; the terminal tab stays usable.
- **Safety.** Command strings proposed by agents pass permission-rule evaluation (§8.5) before execution; compound commands are evaluated per segment. The service refuses to run when the sandbox required by the current mode is unavailable and reports that limitation rather than running unsandboxed.
- **Rendering.** Reuse a maintained VT/ANSI terminal emulator (evaluate xterm.js for a web UI) for scrollback, search, link detection, and bracketed paste; do not implement a terminal emulator in OneCode. The emulator choice is an open ADR. Rendering does not provide the PTY, process lifecycle, permission checks, or sandbox, which remain OneCode/platform responsibilities.

#### 3.4.3 Browser service and annotations

- **Engine (open ADR).** Annotation, console and network capture, DOM and accessibility-tree reading, and screenshots require DevTools-protocol-level access. Platform WebViews differ in what they expose (WebView2 supports the Chrome DevTools Protocol; WKWebView does not). Evaluate a bundled Chromium with the DevTools protocol against platform WebViews on per-OS parity, package size, update cadence, and security; FR-64 parity makes a consistent engine the likely choice.
- **Isolation.** One browser profile per project under the application data directory, never the user's system profile. No access to the user's cookies, saved passwords, extensions, or history. Profiles are deletable from the UI.
- **Host classification.** A target is *local* only when its host is `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, or ends in `.localhost` or `.test`; `.local` names are not local. Users may name additional *test environments* per project (for example a staging host). Everything else is *external*.
- **Agent capability classes:** `navigate`, `read` (text, DOM, accessibility tree, console, network metadata, screenshots), `interact` (click, type, scroll, select), `mutate` (submit forms, trigger actions with persistent effect), `download`, and `grant_site_permission`. On local and named test hosts, `interact` and `mutate` follow the session's permission mode; on external hosts, `mutate` requires per-action approval, and `download` and `grant_site_permission` always require approval. Credentials, payment details, government identifiers, and CAPTCHA solving are never performed by agents on any host; test credentials for the user's own application on local or named test hosts come only from project fixtures or session-generated values, as the agent operating rules specify.
- **Untrusted content.** Page text, DOM attributes, console output, and network bodies are data. Instruction-like text found in a page is surfaced to the user and never acted on. Links matching sign-out, delete, remove, cancel, unsubscribe, or purchase patterns are not followed by agents on external hosts.
- **Capture.** Console and network capture are bounded ring buffers with request and response metadata, redaction of authorization headers, cookies, and tokens, and no persistence of response bodies beyond the task's evidence limits.
- **Annotation model.** `Annotation { id, session, url, viewport, color_scheme, selector_path, accessible_name, role, bounding_box, computed_style_summary, screenshot_ref, console_errors_ref, source_candidates: [{ file, line, component, method, confidence }], comment, intent (comment | fix | question), created_by, created_at }`.
- **Element-to-source mapping** runs in confidence order: framework development attributes or debug metadata (component name, source file and line) when the dev server exposes them; JavaScript and CSS source maps; design-system or test identifiers (`data-testid`, stable class names) matched against the repository index; and finally text and structure matching. Each candidate records its method and confidence. Mapping is a suggestion to the agent, which must confirm against the source before editing; unmapped annotations are reported (FR-74).
- **Annotation-to-fix.** The service produces a `FixRequest` from the selected annotations (§6.6) and records the capture state. After the agent's change it reloads the preview, re-locates the element by selector path and accessible name, re-captures at the same viewport and scheme, and produces a before/after pair and pixel diff for the Evidence view.
- **Emulation.** Viewport presets, device metrics and touch emulation, color scheme, reduced motion, and locale; emulation state is recorded with each capture.
- **Tool-provided UI.** User-interface content supplied by a tool or MCP server renders only in a strictly sandboxed frame with a content security policy and auditable message passing; it is a tool result, never a trusted surface.

#### 3.4.4 Source control service

- **Operations** mirror the panel (FR-76): status, stage and unstage per file and hunk, discard with confirmation, commit, branch create and switch, worktree list, add, and remove, stash, log, blame, diff between refs, and three-way conflict resolution with a merge model that preserves both the user's and the agent's sides.
- **Worktree registry.** Every session's worktree is recorded with branch, base, path, owning session, and cleanup state. Worktree removal preserves unmerged work unless the user confirms.
- **Policy.** Destructive actions (force push, branch deletion, history rewrite, reset of tracked changes, discarding user edits) are action-specific approvals; protected refs and the active branch are never modified by agents without approval (§6.4). Pushes, pull-request creation, and other code-host interactions are explicitly approved and receipted like any external egress.
- **Commit messages.** Generated from the diff and task record in the detected convention (FR-111); signing and hook configuration pass through from the user's Git configuration; repository Git hooks run only in trusted workspaces.
- **Implementation (open ADR).** Git CLI versus an embedded library: the CLI preserves user configuration and credential helpers, the library gives structured results. Either must respect the user's existing credential helpers without ever reading credential contents into model context.

#### 3.4.5 Process and port registry

- **Record.** `ProcessRecord { id, command, args, cwd, worktree, session, pid, ports: [..], started_at, status, log_ref, started_by (user | agent | hook | run_config), launcher }`.
- **Launch protocol.** Before starting a development server, watcher, database, container set, or preview server: consult the registry and the OS listener table for the project. If a matching instance exists, reuse it and say so. If the port is occupied by an unrelated process, report the conflict and ask. Never pick an alternate port automatically, never kill the occupant, and honor launchers that refuse to start a duplicate.
- **Ownership.** A process can be stopped only by its owner (the session that started it, or the user) or by the user explicitly; agents request a stop through the gateway, and the request is denied for processes they do not own.
- **Lifecycle.** Orphan detection on startup, configurable cleanup on exit of processes OneCode started, log rotation, and cross-session visibility in the Processes panel.
- **Lock records.** Launch configurations can declare a pid or lock file; the registry reads and writes those records so CLI runs and desktop runs agree on what is live.

#### 3.4.6 Diagnostics bus

A single stream of `Diagnostic { source (lsp | compiler | test | browser_console | hook | critic | check), severity, file, range, code, message, related, fingerprint, revision, captured_at }`, deduplicated by fingerprint and keyed to the worktree revision. It feeds the Problems panel, the Evidence view, and agent observation. "No diagnostics" is always reported together with the set of sources that were active, so absence of evidence is never mistaken for evidence of absence.

#### 3.4.7 Reuse-first component strategy

The [central tech-stack inventory](./TECH-STACK.md) records researched candidates and dated versions. It is not an approved dependency manifest. For each capability below, compare an established library with a custom implementation before building; record high-coupling architectural choices in the owning ADR and lower-coupling dependency choices in the dependency review, then isolate the library behind a narrow adapter. Recheck compatibility, maintenance, license, transitive dependencies, binary/runtime payload, accessibility, security, MSRV, and all supported OSes before adoption.

| Capability | Reuse candidates to evaluate | Keep OneCode-owned |
|---|---|---|
| Desktop UI primitives and design | OneQuill design tokens; Radix Primitives if the selected UI framework supports them | Product information architecture, accessible workflows, and policy-driven controls |
| Editor | Monaco Editor or CodeMirror (ADR-0011) | Versioned document model, agent patch/conflict semantics, reviewable hunks, and document-to-service bridge |
| Terminal rendering | xterm.js for the web terminal; platform PTY/process libraries per ADR-0012 | Process ownership, sandbox, permission checks, attribution, bounded capture, and cancellation |
| Syntax and language protocols | Tree-sitter grammars and maintained LSP protocol/client libraries | Supported-language policy, parser coverage/provenance, workspace trust, process management, and normalized OneCode diagnostics |
| Knowledge graph and workflow visualization | Sigma.js with Graphology, or Cytoscape.js for graph exploration; React Flow only for editable node/edge workflows (ADR-0018) | Authoritative graph semantics, extracted/inferred/ambiguous provenance, authorization, result budgets, and source evidence |
| Charts | Apache ECharts for quantitative metrics and charts | Metric definitions, privacy filtering, accessible table/detail alternatives, and product interpretation |
| Browser automation and protocol | A maintained DevTools Protocol client with the selected browser engine (ADR-0013) | Profile isolation, host classification, capability policy, redaction, and annotation evidence |
| Serialization and validation | Serde, JSON Schema tooling, and established format parsers | Versioned OneCode schemas, boundary policy, compatibility guarantees, and actionable error semantics |
| Telemetry | `tracing` and OpenTelemetry crates/exporters, if explicitly enabled | Default-off egress policy, approved attributes, redaction, receipts, retention, and user controls |
| Testing and supply chain | Established test, browser automation, accessibility, license/advisory, and SBOM tooling | Acceptance criteria, security threat model, platform evidence, and release decisions |

These are candidates rather than framework decisions. Do not copy upstream application code wholesale or depend on a library for guarantees it does not provide: for example, a terminal renderer is not a PTY or sandbox, a chart/graph renderer is not the graph authority, and an OpenTelemetry exporter does not establish privacy. Implement a custom component only when an evidenced gap cannot be closed with a maintained library, and record why the added maintenance/security burden is justified.

## 4. Core task lifecycle and state model

Each task is persisted with an explicit state and append-only event history.

```text
submitted -> classifying -> understanding -> specifying -> planning
     -> awaiting_approval -> implementing -> verifying -> critiquing
     -> repairing (bounded loop) -> ready_to_deliver -> delivered
Any active state -> blocked | cancelled | failed
```

`awaiting_approval` is entered only when policy requires a user decision. A task may return from planning or implementation to specification when new evidence changes scope. A critical security, data-loss, broken-build, or existing-test failure transitions to `blocked` until a user or authorized policy resolves it.

### 4.1 State transition requirements

- Every transition records timestamp, actor, reason, and relevant artifact/evidence IDs.
- Transitions are validated centrally by the orchestrator.
- Retried operations use idempotency keys and bounded retry policies.
- Restart recovery resumes only from a persisted safe checkpoint; never repeat an external side effect without checking its recorded outcome.
- Cancellation stops new work, terminates cancellable child processes, and preserves logs and checkpoints.
- A task cannot become `delivered` while required acceptance criteria or policy checks are unresolved.

### 4.2 Session model

A **session** is the unit of conversation and isolation; a **task** is the unit of governed work inside it.

```text
Session { id, repository, worktree, conversation_mode (ask | plan | build),
          permission_mode, model_profile, instruction_set_ref, status, created, updated }
Turn    { id, session, user_message, attachments[], steps[], artifacts[], checkpoints[], status }
```

- A session owns one worktree; parallel sessions use separate worktrees. Tasks (§4) are created within a session and inherit its conversation mode, permission mode, and worktree.
- **Safe points** are the boundaries between tool calls and between agent steps. Steering messages are delivered at the next safe point. An interrupt stops the current tool (cancelling cancellable processes), preserves checkpoints and logs, and waits for the user; cancel ends the turn and records partial artifacts.
- **Compaction** replaces older conversation content with a `CompactionSummary` artifact that keeps the identifiers of evidence items, pending approvals, unapplied hunks, open findings, and checkpoints. Compaction is user-visible and editable. Pending approvals and unapplied changes live in session state outside the conversation text, so compaction can never remove them.
- **Subagents** are child sessions with a narrower instruction set, context, tool allowlist, and budget; they return typed artifacts and cannot widen permissions. Background sessions run detached and raise attention state when they finish or need a decision.
- **Advisor role.** An advisor agent may resolve routine, reversible implementation choices within the user's request and current permission scope by following repository guidance and recording its rationale or assumption. The orchestrator carries out ordinary actions when the active permission mode allows them; it does not ask for a separate user approval on every such action. The advisor cannot grant permissions, change policy or mode, approve hard-policy actions, or mark checks passed. Ask the user only when the answer materially changes behavior, scope, risk, or cost, or when the active mode or policy requires approval (PRD step 5 and FR-96; R-03, R-04, R-11, R-34).
- **Persistence.** Sessions, turns, and steps are persisted with the task event history; restart recovery (§4.1) applies per session.

### 4.3 Evidence-backed decision escalation

For a material architectural or implementation blocker that the local Architect role cannot resolve, the orchestrator uses the separate FR-125 decision budget:

1. **Architect stage:** Give the local Architect role up to three distinct attempts to resolve the same blocker. Each attempt records its proposed resolution, acceptance/check criteria, relevant evidence, and outcome. A failed check or an unresolved blocker counts as one strike; repeated turns, tool calls, or restatements without a materially different evidence-backed approach do not.
2. **Advisor stage:** After the Architect stage has three unresolved strikes, send the Advisor role the original request, blocker, criteria, evidence, and concise record of all Architect attempts. The Advisor gets up to three distinct evidence-backed attempts under a separate counter. On every attempt it must consult relevant repository instructions and project documents (including applicable PRD, TRD, ADRs, source, tests, and local references), identify comparable projects and authoritative technical sources, and research them where relevant and permitted. Every citation in an attempt or decision brief must resolve to a gateway-produced evidence artifact (TRD §6.1), not a model-supplied URL alone. External research is performed only when authorized by the existing egress policy; its evidence artifact records canonical URL, retrieval time, source revision/date when available, content hash and cited span, plus the approval receipt. A failed or denied fetch is not evidence; record that limitation and do not imply research was performed.
3. **Human stage:** If the blocker remains unresolved after three Advisor strikes, pause the task and present a decision brief containing the blocker, acceptance criteria, evidence, approaches tried and outcomes, relevant project-document citations, any permitted research, remaining options, and a recommended question. Resume only after the user responds or changes scope. Do not repeatedly prompt during the two bounded agent stages.

The orchestrator assigns each blocker a durable `BlockerEpisode.id` and `root_blocker_id`, linked to its task, core-assigned acceptance criteria, affected scope, and evidence. Each episode has its own three-plus-three counters; linked episodes preserve the full prior history. Attempts refer to the episode identity; model output cannot create IDs, reset counters, or reopen a resolved episode. The same root blocker retains its identity when rephrased, moved to another file, or continued in another turn, session, or model. The core may open a linked episode only after a user-confirmed material scope/criteria change, or a new root episode only after evidence of an independent failure tied to a distinct acceptance criterion or diagnostic/test fingerprint and affected scope. The core records the comparison and reason; agents cannot request a reset by relabeling. When evidence does not establish a distinct root, retain the existing root ID and counters. These decision attempts neither consume nor extend FR-29's configurable code-repair budget; exhausting that budget halts code repair and cannot be bypassed by relabeling retries as Architect or Advisor attempts. Hard-policy approvals, required user decisions, and interrupts remain immediate and are never delayed by this escalation sequence. Routine reversible choices within scope continue without per-action prompts.

## 5. Repository onboarding and indexing

### 5.1 Scan and profile pipeline

1. Canonicalize the repository root and verify it is an accessible directory.
2. Detect Git state, languages, frameworks, monorepo/package structure, build/test commands, CI files, and generated/vendor directories.
3. Resolve ignore policy from Git ignore files and OneCode-specific exclusions; apply binary, secret, and size limits.
4. Record a manifest of eligible files and their content hashes.
5. Parse supported languages into files, modules, symbols, imports, routes, schemas, components, and tests using maintained syntax/format parsers where suitable; do not build bespoke parsers for commodity language grammars.
6. Build relationships such as import, call, type, route, and test-to-code links where reliable.
7. Optionally create local embeddings and hybrid retrieval indexes.
8. Infer project profile and conventions with evidence links and confidence.
9. Produce an onboarding/readiness report, including skipped paths, parser gaps, and errors.

Existing repositories are observe-only during onboarding. No repository file or configuration is changed without a separate approved bootstrap task.

### 5.2 Incremental update requirements

- Watch relevant file and Git changes and re-index only changed content and affected graph edges.
- Use content hashes to avoid unnecessary parsing/embedding.
- Detect branch changes and associate index metadata with the correct revision.
- Support explicit full re-indexing and index schema migration.
- Surface stale, incomplete, or failed index state; retrieval must not represent a partial index as complete.
- Keep generated index data outside the repository by default, with a documented override.

### 5.3 Retrieval contract

Return a `ContextBundle` containing ranked evidence items, source path and revision, symbol/file identifiers, line or byte range where available, retrieval method, score, and reason for selection. Bundle construction must enforce token/size budgets, deduplicate overlapping evidence, and preserve relationships needed to understand the change.

Retrieval modes include symbol lookup, feature context, bug context, impact analysis, design context, and audit context. Search results must distinguish direct source evidence from generated summaries or model inferences. Impact analysis and relationship-heavy modes are answered from the code knowledge graph (§5.5), and bundles are filled using the progressive-disclosure ladder (§6.7).

#### 5.3.1 Local embedding lifecycle

- Embeddings are a default-on signal in hybrid retrieval, not a prerequisite for onboarding, keyword search, symbol search, or dependency-based context. OneCode ships a default embedding model in its application package (FR-123), so semantic retrieval is available on first run without a download. If the user disables it, it fails verification, or the hardware cannot run it, preserve the other retrieval paths and report that semantic retrieval is off. Where embeddings are used beyond retrieval is set out in §5.7.
- Generate embeddings on the user's device using the selected local model. Apply the repository's ignore, generated/vendor, binary, size, and secret exclusions before chunking; do not transmit source text or embeddings to the model catalog or model publisher.
- Store index metadata with the repository identity and revision, chunking and normalization configuration, embedding dimensions, model identifier and immutable revision, and index schema version.
- Never combine vectors from incompatible embedding spaces. A model or embedding-configuration change marks the affected index stale and requires an explicit rebuild or a separately versioned index; report progress, failures, and usable fallback modes.
- Reuse content hashes for incremental updates. Keep index data outside the repository by default and support scoped deletion and rebuild without deleting source files or unrelated task data.
- Evaluate candidate models against a versioned retrieval set and a keyword/symbol baseline. Record relevance metrics, p50/p95 query latency, initial and incremental indexing time, peak RAM/VRAM, disk footprint, hardware, runtime, and model revision.

### 5.4 Coding standards discovery and resolution

Before an implementation agent is dispatched, the standards resolver builds or refreshes a `StandardsProfile` for the affected package and paths:

1. Detect language, framework, runtime, compiler, package manager, and versions from manifests, lockfiles, tool-version files, and project configuration. Record the evidence and confidence; do not infer an exact version from a directory name or code syntax alone.
2. Resolve applicable workspace and path-scoped agent instructions, architecture decisions, organization policies, formatter/linter/type-check settings, tests, and CI gates.
3. Retrieve relevant local code and test examples. Treat observed conventions as evidence of current practice, not proof that a practice is secure, supported, or correct.
4. When network and source policy permit, consult authoritative technical documentation matched to the detected version. Record the full source URL, relevant version, retrieval time, and applicability. Never silently substitute the latest documentation for an older detected runtime.
5. Separate immutable platform/security constraints, user requirements, repository rules, verified technical guidance, local examples, and task-specific recommendations. When material sources conflict, preserve the evidence, report the conflict, and request a decision where behavior or compatibility changes.
6. Deliver a concise profile plus source references to each task agent. Do not copy all documentation or repository instructions into every model prompt.
7. Mark missing, stale, conflicting, unsupported, or unverified guidance explicitly. If a change to manifests, lockfiles, scoped instructions, CI, or relevant quality configuration invalidates the profile, refresh it before the next affected implementation task.

The resolver must not assume that one workspace's framework version or rules apply to other packages in a monorepo. A profile identifies its repository revision, path scope, detected toolchain, rule source/provenance, freshness, and unresolved findings.

Platform security/privacy controls and organization-mandated policies cannot be overridden by model instructions or task prompts. The user's requested outcome applies within those controls; repository rules and supported-version requirements determine project compatibility. Verified official guidance informs technical correctness, but conflicts with local practices are surfaced for resolution rather than silently overridden.

### 5.5 Code knowledge graph and agent navigation

Steps 5 and 6 of §5.1 already extract symbols and relationships; this section makes them a first-class, queryable **code knowledge graph** that agents navigate directly, instead of only feeding `ContextBundle` construction. The goal is fewer and smaller model reads: an agent asks "who calls this", "what is this file's API", or "what does this change touch" and receives a few hundred tokens of cited structure, rather than reading whole files to find out.

**Expected benefit, stated honestly.** Graph navigation reduces context tokens and agent turns on medium and large repositories and on navigation-heavy tasks (impact analysis, refactors, unfamiliar code). On small repositories that fit in the context window the reduction is near zero; the value there is structure, not compression. It does not make the application itself faster: graph construction is additional indexing work that must stay within the incremental re-index budget (PRD §12). No reduction factor is claimed until the benchmark in §14.2 measures it against the keyword/symbol baseline and the whole-file baseline (FR-60, PRD §12 context efficiency).

#### 5.5.1 Graph model

```text
Node { id, kind (repository | package | module | file | symbol | route | schema | test
       | config | doc_section | adr | requirement | memory_note | community),
       name, path, span, language, signature, revision, content_hash }
Edge { from, to, kind (contains | imports | calls | references | implements | extends
       | instantiates | tests | routes_to | reads_config | documents | decides | traces_to
       | mentions | similar_to),
       provenance (extracted | inferred | ambiguous), method, confidence, revision, evidence_span }
```

- **Provenance is mandatory on every edge.** `extracted` edges come from deterministic parsing (syntax trees, import resolution, language-server symbol data, manifest and route parsing) and cite the source span that produced them. `inferred` edges come from heuristics or model output (name matching, documentation-to-code mentions, embedding similarity, summarizer concept extraction). `ambiguous` edges record multiple candidate targets, for example dynamic dispatch or an unresolved import.
- **Only extracted edges are evidence.** Inferred and ambiguous edges are navigation hints: an agent confirms them against the cited source before editing, citing, or stating a root cause, as with annotation source candidates (§3.4.3). Critique and root-cause citations must reference source spans at a revision, never a bare inferred edge (R-39).
- **Requirements and decisions are nodes.** `FR-nn`, `R-nn`, and `ADR-nnnn` identifiers found in documents, tests, and commit messages become nodes with `traces_to` and `decides` edges, so traceability (§18) is a graph query rather than a search.

#### 5.5.2 Construction, freshness, and privacy

- **Build from the existing pipeline.** The graph is derived from the §5.1 manifest and parse output; it never reads files the ignore, secret, binary, generated, or size policy excluded.
- **Reuse parsers and algorithms.** Prefer maintained syntax parsers and established graph algorithms over bespoke language grammars or graph primitives. Pin parser/algorithm versions in index metadata, validate coverage and provenance against fixture repositories, and record gaps rather than treating unsupported syntax as a negative result.
- **Incremental by content hash.** A changed file invalidates its own nodes and the edges whose `from` or `evidence_span` lies in it; incoming edges to removed symbols become dangling and are re-resolved or dropped. Graph maintenance shares the §5.2 watcher and counts against the p95 per-file re-index budget.
- **Revision-keyed.** Every query result carries the revision it was computed at. A query against a worktree whose index is behind reports `stale` with the lag instead of answering as if current (§5.2).
- **Language coverage is explicit.** Files whose language has no parser contribute file nodes only; the graph reports per-language coverage so missing call edges are never read as "no callers".
- **Local concept extraction only.** Concept and relationship extraction from documentation, design notes, and images uses the local Summarizer role (§7.2) and produces `inferred` edges labeled as derived content. Sending repository documents or images to an external model for extraction is external egress: it requires the FR-23 configuration, FR-18 approval, redaction, and an egress receipt (§7.3). There is no silent cloud extraction step.
- **Storage.** LadybugDB is the proposed store for graph nodes, edges, communities, and repository-map layers (ADR-0017). It lives in the repository-index domain outside the repository (§10.1), bound to parser, graph-schema, and (for similarity edges) embedding-model revisions; changing any of them marks the affected graph data stale. SQLite remains the relational and lexical index store under ADR-0005; ADR-0006 decides whether vector search uses SQLite with `sqlite-vec` or another embedded store.

#### 5.5.3 Communities and the repository map

- **Communities.** A deterministic community-detection pass (algorithm selected in ADR-0017) groups densely connected files and symbols into named clusters with a generated label, top members, and inbound and outbound hubs. Community labels are derived content; membership is computed from extracted edges only.
- **Repository map.** A `RepoMap` is a compact, budget-fitted outline of the repository: directory clusters, hub symbols, and the signatures most relevant to the current task. Ranking uses graph centrality personalized to the task's seed files and symbols (mentioned paths, selection, diagnostics, annotation candidates), then truncates to a token budget. The task-independent part of the map is a stable prompt layer eligible for caching (§7.4); the personalized part is task context.

#### 5.5.4 Agent graph operations

The gateway exposes these read-only operations (§8.1). Each returns a typed, cited, budgeted result and is listed in the Context Inspector like any other observation (§6.5):

| Operation | Returns | Typical use |
|---|---|---|
| `graph_map(scope, budget)` | `RepoMap` for the repository, a package, or a community. | Orientation in unfamiliar code; first step of exploration tasks. |
| `graph_skeleton(path)` | `CodeSkeleton`: every signature, its span, and doc-comment first lines, without bodies. | Learn a file's API at a fraction of the file's tokens. |
| `graph_locate(query, budget)` | Ranked symbols and spans with the matching code excerpt inlined. | "Where is X handled"; replaces iterative keyword search. |
| `graph_find_all(literal)` | Every occurrence grouped by enclosing symbol. | Exhaustive rename or audit sweeps where ranked results would miss instances. |
| `graph_neighbors(symbol, direction, depth, edge_kinds)` | Callers, callees, references, implementers, or tests with spans. | Blast radius before a change; tracing a failure path. |
| `graph_impact(change_set)` | `ImpactSet`: affected symbols, files, tests, routes, and requirement IDs, each with the path of edges that links it. | Planning, test selection (§9.6), and review scope. |
| `graph_path(from, to)` | Shortest extracted-edge paths between two nodes. | Explaining how a request reaches a handler or a value reaches a sink. |
| `graph_status()` | Revision, staleness, per-language coverage, and build errors. | Deciding whether graph answers can be trusted for this worktree. |

Results distinguish extracted from inferred edges, state the revision and coverage, and never truncate silently: a budget cut reports how many items were omitted and how to page for them.

### 5.6 Knowledge map

The knowledge map is the human-facing, linked-notes view of the same graph, in the style of a personal knowledge base: one note per significant node (module, community, ADR, requirement, memory entry, key symbol), connected by typed links with backlinks.

Use one maintained graph visualization library selected through ADR-0018 (evaluate Sigma.js with Graphology and Cytoscape.js for graph exploration); use React Flow only for editable workflow/DAG canvases, not as the default knowledge-map engine. Use Apache ECharts for quantitative charts if needed, not as a substitute for graph semantics. Keep keyboard navigation, accessible details, and a non-canvas representation available; the visualization library is a view over the authoritative graph, not its storage or source of truth.

- **Notes.** A `KnowledgeNote { id, node_ref, title, body, links: [{ target, kind, provenance }], backlinks, source_spans, revision, derived }` is generated from graph data plus, optionally, a local Summarizer paragraph. Generated prose is labeled derived and invalidated when its source revision changes (§7.2). Notes the user writes or edits are user content and are never silently regenerated over.
- **Memory as linked notes.** Accepted project-memory entries (FR-37) are represented as knowledge notes linked to the code, ADRs, and requirements they describe. The second-brain record and its review/history lifecycle (§5.8) remain authoritative; the graph stores derived links and retrieval metadata. Recall is scope- and freshness-aware, and contradiction review (R-31) suggests every affected note for user review without silently changing it.
- **Views.** The desktop shows a force-directed graph view filterable by node kind, community, edge provenance, and changed-in-this-task, plus a backlinks pane for the active file or note. Selecting a node opens the source, note, or document; the graph view is a navigation aid, and source remains the authority.
- **Export and import.** On explicit user action, the knowledge map can be exported as a folder of Markdown files with wikilinks and front matter that opens in Obsidian-compatible tools. Export applies redaction (R-30), excludes content the index excluded, writes outside the repository unless the user chooses a path, and is recorded. Because Markdown files are plaintext, export shows the destination and a disclosure warning and requires confirmation. Full Markdown/wikilink import is a P1 follow-up under FR-130, not initial-release scope; imported notes are untrusted and enter the review queue, with no implicit fetching or execution (§10.3, R-01).
- **Performance.** The view renders from a precomputed layout per scope and loads node bodies on demand, so opening the map never blocks the editor (PRD §11.3 rule 2).

### 5.7 Default embedding model: where it is used

OneCode ships a default embedding model inside the application package (FR-123; lifecycle in §5.3.1 and §7.1.1). Because it is present on first run, features can rely on it by default, but every use stays a ranking or suggestion signal over the deterministic index and graph, never a replacement for them (FR-124).

| Use | What the embedding adds | Guardrail |
|---|---|---|
| Hybrid retrieval and `graph_locate` | Finds code by meaning when the query shares no keywords with the symbol, and re-ranks lexical and symbol hits. | Fused with keyword, symbol, and graph scores; results still cite source spans; keyword/symbol-only ranking when disabled. |
| Repository-map seeds (§5.5.3) | Adds semantically related files and symbols to the seeds taken from the task text, before centrality ranking. | Seeds only change ranking within the budget; they never add unindexed or excluded content. |
| Link suggestions (§5.5.1, §5.6) | Proposes `documents` edges from documentation sections to code and `similar_to` edges between notes and code. | Stored as `inferred` with method `embedding` and the similarity score; shown as suggestions; a user confirmation turns one into a user-authored note link; a dismissal is remembered. |
| Memory and context de-duplication | Detects near-duplicate memory notes and overlapping context items so the bundle carries one copy. | Duplicates are merged into a review prompt for memory (R-31) and into a single cited item for context; nothing is deleted silently. |
| Community labels (§5.5.3) | Names a community from the member text closest to its centroid. | Labels are derived content; membership comes from extracted edges only. |
| Tool and skill ranking (FR-63) | Ranks candidate tools and skills for a task. | Ranking only; the gateway still authorizes every invocation. |
| Annotation-to-source text matching (§3.4.3) | Matches visible page text to source strings when source maps and debug metadata are absent. | Lowest-confidence mapping method; candidates are confirmed against source before editing. |
| Check selection (§9.6) | May add tests whose names or bodies are similar to the changed code. | May add, never remove, a test. |

**Measurement and defaults.** Each use is benchmarked with the embedding on and off on the same versioned task set (§14.2). A use whose benchmark shows no gain in relevance, tokens, or turns, or that costs more than its latency budget, ships switched off by default for that repository size class. The index records which uses were active for each task so results stay reproducible.

**Resources.** Embedding runs on-device in a background worker with its own CPU and memory budget, yields to the editor and terminal, batches by content hash, and pauses on battery-saver or low-memory signals. Incremental re-embedding is part of the per-file re-index budget.

### 5.8 Second-brain knowledge lifecycle

The second brain is the user-facing lifecycle over project knowledge; the code knowledge graph and GraphRAG are indexing and retrieval components, not the knowledge authority. Source code, project documents, and user-reviewed decisions remain authoritative.

- **Capture inbox.** Create a capture only from user-selected content or an explicitly enabled capture action. Supported sources include project docs/code/ADRs/requirements, task decisions and verified outcomes, user-authored notes, and permitted workspace observations. Apply repository exclusions, trust labels, redaction, and retention controls before persistence. Store scope, source link, source revision or capture time, selected span/content hash, and origin. External content is captured only when already available through an authorized observation or after an approved fetch; no background crawling.
- **Review and acceptance.** Captures and machine-generated suggestions enter a review queue. The user can inspect source and scope, edit, link, accept, reject, archive, or delete. A candidate is not accepted memory until user acceptance; model confidence, embeddings, or repeated retrieval never auto-promote it. Bulk acceptance, if offered, must preview the exact items and scope.
- **Typed knowledge and relations.** Keep user-authored accepted notes distinct from imported and derived content. Represent relations such as `supports`, `contradicts`, `supersedes`, `derived_from`, and `applies_to` with provenance, source/evidence references, author, timestamps, and validity interval where known. Preserve revision history for accepted edits. A derived note is reproducible and refreshable; refresh creates a new derived revision and never overwrites user-authored text.
- **Maintenance.** Detect possible duplicates and contradictions as review suggestions. A source change, removed source, changed repository revision, or expired validity interval marks dependent knowledge stale or needing review; it does not silently rewrite or delete accepted notes. Provide explicit resolve, supersede, archive, restore, and delete operations while retaining user-configured history.
- **Recall and resurfacing.** Rank by scope/applicability, graph relations, lexical match, semantic similarity, recency, and the active task. Return a reason, provenance, source/revision, freshness, and an exact evidence reference with each result. Show recalled items in relevant task context or in user-requested review; unsolicited notifications are opt-in. User feedback (useful, irrelevant, stale, incorrect) may tune ranking but cannot edit accepted content. A recalled note is context, not proof or authorization; claims must cite current source/evidence where available.
- **Portability and recovery.** Support explicit, versioned, passphrase-encrypted backup of accepted user-authored memory, links, provenance, and revision history. Reuse the Argon2id and XChaCha20-Poly1305 dependencies selected by ADR-0005 (proposed archive policy: ADR-0021); never persist or log the passphrase, and disclose that a lost passphrase prevents recovery. Authenticated encryption protects confidentiality and integrity but does not prove original authorship. Restore and import are untrusted and land in a review queue; archived acceptance is historical provenance only until the user re-accepts a record. Validate archive authentication, KDF parameter bounds, schema, paths, sizes, and content; preview scope/conflicts before restore. Never execute embedded code or fetch links implicitly. Restore is atomic and rollback-capable; indexes and model files are excluded unless separately selected. Plaintext Markdown export requires warning and confirmation. Cloud sync is out of scope.

## 6. Agent runtime and coding techniques

### 6.1 Typed artifact contracts

Agents communicate through validated artifacts rather than relying solely on free-form conversational state:

- `Intent`: goal, scope, constraints, ambiguity, risk, and user-supplied references.
- `ContextBundle`: evidence items, source revisions, selection rationale, and budget.
- `StandardsProfile`: affected paths/workspaces, stack and versions, applicable mandatory controls and project rules, verified guidance sources, local examples, quality commands, confidence/freshness, and unresolved conflicts.
- `SkillDescriptor`: skill ID/version, task triggers, input/output contracts, compatibility, provenance, license, referenced resources, declared capabilities, and review/enablement status.
- `SecurityAuditBundle`: authorization scope, audit profile/budget, coverage ledger, candidate fingerprints, validation records, schema version, and complete/incomplete status.
- `Brief`: outcomes, assumptions, functional/non-functional criteria, and quality bars.
- `Plan`: ordered tasks, dependency edges, affected areas, approvals, and verification plan.
- `PatchSet`: changed paths, patch/checkpoint identifiers, and task links.
- `TestReport`: commands, environment, exit status, duration, output references, and classification.
- `Critique`: finding IDs, severity, evidence, affected acceptance criteria, and recommendation.
- `DeliveryPackage`: final diff reference, checks, residual risks, and integration state.
- `Session` and `Turn`: conversation identity, modes, worktree, attachments, steps, and checkpoints (§4.2).
- `WorkspaceObservation`: a labeled, bounded, redacted snapshot from an editor, terminal, browser, diagnostics, source-control, or process source with trust level and budget cost (§6.5).
- `TerminalCapture` and `BrowserCapture`: bounded command output or page state with provenance, hashes, and redaction status (§3.4.2, §3.4.3).
- `Annotation`: a user annotation on the built-in browser with element, screenshot, console, and source-candidate data (§3.4.3).
- `DiagnosticSet`: deduplicated diagnostics keyed to a revision together with the active sources (§3.4.6).
- `FixRequest`: originating surface, evidence references, reproduction command, worktree, and expected outcome (§6.6).
- `ProcessRecord`: a tracked process with ownership and ports (§3.4.5).
- `PermissionDecision`: the evaluated rule chain, mode, outcome, approver, scope, and expiry for a requested action (§8.5).
- `HookEvent` and `HookResult`: lifecycle event, hook identity and provenance, outcome, and output references (§8.6).
- `InstructionSet`: the resolved, path-scoped instruction files with provenance, sizes, and conflicts (FR-102).
- `RepoMap`, `CodeSkeleton`, and `ImpactSet`: budgeted graph query results with revision, coverage, edge provenance, and omitted-item counts (§5.5).
- `KnowledgeNote`: a linked note over a graph node with links, backlinks, source spans, and a derived flag (§5.6).
- `OutputRef`: a handle to tool or command output stored outside the model context, with size, hash, and the excerpt that was shown (§6.7).
- `BlockerEpisode`: a core-generated durable `id` and `root_blocker_id` linked to task, acceptance-criterion IDs, affected scope, evidence references, counters, and any verified parent episode.
- `DecisionAttempt`: blocker episode ID, stage, ordinal, stated criteria, proposed resolution, gateway evidence references, and outcome; model output cannot create or reset episode IDs/counters.
- `ResearchEvidence`: a gateway-issued source reference with source kind, canonical path/URL, retrieval time, repository/source revision when available, content hash, cited span, trust label, and external-egress approval receipt where applicable. A model-supplied URL or failed/denied fetch is not evidence.
- `KnowledgeCapture`: user-selected source, selected span or content reference, scope, trust/provenance, source revision or capture time, redaction state, and review status.
- `KnowledgeNoteRevision`: immutable revision ID, note type, body/reference, author/origin, created time, source/evidence references, scope, validity interval, and derived/imported flags.
- `KnowledgeRelation`: typed relation (`supports | contradicts | supersedes | derived_from | applies_to` and graph relation kinds), endpoints, provenance, evidence reference, confidence where inferred, validity, and acceptance status.
- `MemoryFeedback`: note/result reference, user-selected relevance/freshness label, and time; it changes ranking signals only, not note content or acceptance state.
- `KnowledgeSnapshot`: archive schema/version, selected scopes, included user-authored records and history, content manifest/hashes, and restore validation report.

Schemas must be versioned, validated at boundaries, and reject unknown or malformed required fields with actionable errors.

### 6.2 Implementation practices

- Keep changes small and trace each patch to a plan task and acceptance criterion.
- Load the applicable `StandardsProfile` before editing. Follow its supported stack versions, repository-scoped instructions, architecture, formatting, naming, error-handling, and test conventions; verify technical guidance against the detected versions.
- Inspect nearby implementation and tests before choosing a pattern. Reuse a compatible local pattern, but surface it when evidence indicates it is insecure, deprecated, incompatible, or contradicted by enforced policy.
- Build prompts around the requested outcome, relevant repository evidence, acceptance criteria, constraints, measurable targets, and a concrete verification/output contract. Include referenced files, logs, screenshots, and other user-provided artifacts when available and authorized.
- Keep always-on agent instructions concise; retrieve detailed task procedures only for the task that needs them.
- Prefer existing abstractions and dependencies; new dependencies require license, vulnerability, and policy checks.
- For behavior changes, add or update tests alongside the implementation; use test-first development where behavior can be specified before code.
- For legacy behavior without adequate tests, add characterization tests before risky refactoring when feasible.
- Use property-based, fuzz, or mutation testing selectively for parsers, serializers, validation, and other high-risk logic.
- Avoid broad rewrites when a focused patch satisfies the acceptance criteria.
- Preserve migrations, compatibility notes, and rollback strategy for data or public API changes.
- Keep generated code, formatting churn, and unrelated cleanup out of task diffs unless explicitly required.

### 6.3 Task-specific workflow selection

The orchestrator selects and records a workflow by intent; these are default procedures, not rigid prompts that override user goals:

| Task | Required workflow |
|---|---|
| Repository exploration | Inspect structure and evidence, summarize architecture and conventions, and do not edit without an implementation request. |
| Feature | Find related code and interfaces, define acceptance criteria, plan the smallest complete slice, implement, test, and review. |
| Bug fix | Capture reproduction steps and error output, trace the failing path, add a reproducing test when feasible, fix the root cause, and run regression tests. |
| Refactor | Establish behavior-preserving checks, make incremental changes, and verify behavior and compatibility after each meaningful step. |
| Testing | Match test layout, fixtures, and assertion style; target required behavior, edge cases, and failure paths; run focused then relevant regression tests. |
| Documentation/delivery | Read the authoritative implementation and current docs, make linked updates, and validate relevant examples/links and delivery evidence. |

Each workflow may branch based on repository evidence, task risk, and user constraints. The agent reports skipped steps and why; mandatory policy and quality gates remain deterministic regardless of model output.

### 6.4 Isolation and checkpoints

- Each task writes to a dedicated Git worktree or equivalent isolated sandbox.
- The orchestrator owns worktree creation, cleanup, checkpoint creation, and integration.
- Agents receive per-task path, process, network, and time limits.
- Before applying a patch, validate path scope and reject repository escapes or writes to protected locations.
- Checkpoint before risky multi-file changes and before repair cycles.
- Rollback must restore the task worktree without altering unrelated user work.
- Never force-push, delete user branches, or merge to the active branch without explicit approval.

### 6.5 Workspace awareness

Agents perceive the workspace only through observation operations exposed by the gateway:

| Operation | Returns | Limits |
|---|---|---|
| `observe_editor` | Active file, selection, cursor, open editors, unsaved-change flags. | Content bounded by range; unsaved buffers labeled as such. |
| `observe_diagnostics` | `DiagnosticSet` for the worktree or a path. | Filtered by severity and path; includes the active sources. |
| `observe_terminal` | `TerminalCapture` from an agent-started or user-shared tab. | Size-bounded, redacted, labeled untrusted. |
| `observe_browser` | `BrowserCapture`: URL, title, text, DOM or accessibility tree, console, network metadata, screenshot; annotations. | Shared tabs only; redacted; labeled untrusted. |
| `observe_scm` | Status, current branch, worktree, diff summary for a ref range. | No credential data. |
| `observe_processes` | Process records visible to the session. | Logs by bounded reference. |

Every observation is a `WorkspaceObservation` with source, actor, timestamp, trust level (`workspace`, `user_shared`, or `untrusted_external`), size, and hash. It is listed in the Context Inspector, counted against the context budget, and audited. Observations are never taken from other applications, the system clipboard, the user's system browser, or unshared terminal tabs. Observed content cannot grant permissions or change policy (§8.2).

### 6.6 Fix workflow engine

A `FixRequest` is created by the Fix action on any evidence surface (FR-82) or by an auto-fix source (FR-85). The engine runs the fix as a task with these mandatory stages, each recording evidence:

1. **Reproduce:** run the reproduction command or re-capture the annotated element in the sandboxed worktree. If no reproduction exists, record that and treat the later verification as weaker evidence.
2. **Localize:** map evidence to code with the repository index, stack traces, diagnostics, source maps, and annotation source candidates; present candidates with confidence.
3. **Root cause:** state the cause with cited evidence before proposing a change. A change proposed without a stated cause is a blocker finding for critics.
4. **Patch:** the smallest change that addresses the cause, following the `StandardsProfile`.
5. **Regression test:** add or update a test when feasible; record why when not.
6. **Re-verify:** rerun the originating reproduction, the regression test, and the relevant checks under verification economy (§9.5).
7. **Compare:** attach before/after evidence (output, screenshots, diagnostic counts) to the `DeliveryPackage`.

Critics applied to fix tasks check specifically for symptom patches: swallowed or downgraded errors; deleted, skipped, or weakened tests; widened types or loosened validation; disabled lint rules; retries that hide the failure; and changes outside the localized cause without justification. Auto-fix sources run under the repair-loop limits (§9.3), produce reviewable diffs only, and never push, post, or merge.

### 6.7 Context economy

Context is the scarcest resource for local models, and wasted context costs latency, quality, and, for approved external models, money. The runtime treats every token in a model call as budgeted (FR-13) and applies these mechanisms in order:

1. **Progressive code disclosure.** Context construction and agents climb a ladder and stop at the first rung that answers the question: repository map (§5.5.3), file skeleton, located symbol span, neighbors of that span, and only then a whole file. A whole-file read records its reason (editing the file, a file under the skeleton threshold, or a failed narrower query) and is shown in the Context Inspector. The `ContextBundle` (§5.3) uses the same ladder when filling its budget. Graph-first construction becomes the default for a repository size class only after the §14.2 benchmark shows lower tokens or turns without lower acceptance; otherwise keyword/symbol retrieval leads and the graph operations remain available as tools.
2. **Output by reference.** Tool, command, test, and capture output above a configured size is stored as an `OutputRef`; the model receives a head, a tail, the matched error lines, and the handle, and can request a specific range. This generalizes the bounded output references of §3.4.2 to every tool.
3. **Superseded-observation clearing.** When a later observation replaces an earlier one (a newer diagnostics set, a re-read of an edited span, a rerun of the same test), the earlier content is dropped from the active context and replaced by its handle and a one-line summary. Pending approvals, unapplied hunks, open findings, and evidence identifiers are never cleared (§4.2 compaction invariants). Clearing rewrites the conversation from that point and invalidates cached prefixes after it (§7.4), so it runs in batches or at compaction rather than per observation, and its net effect is measured with cache reads counted.
4. **Patch-shaped output.** Agents return edits as patches or span replacements against a document version (§3.4.1), never as regenerated whole files, which also keeps unrelated lines out of diffs (§6.2).
5. **Constrained structured output.** For typed artifacts (§6.1), the router requests schema- or grammar-constrained decoding when the selected runtime supports it, which reduces invalid-artifact retries on local models. Boundary validation still runs on every artifact; constrained decoding is an optimization, not a substitute for validation.
6. **Stable prefix, dynamic tail.** Policy, tool schemas, project rules, and the task-independent repository map form the stable prefix (§7.4); task evidence follows.

**Accounting.** Each model call records input and output tokens by context layer (policy, tools, instructions, repository map, evidence, conversation, observations), cache reads where the provider reports them, and the disclosure rung of each code item. The Privacy and cost view and the evaluation harness (§14.2) aggregate these into tokens per accepted task.

## 7. Model routing and external escalation

### 7.1 Provider abstraction

Define a provider interface that supports capability discovery, model metadata, structured/tool output where available, cancellation, timeout, token usage, and typed errors. Adapters should cover local runtimes first; frontier APIs are opt-in.

Do not assume every provider supports identical context limits, tool calling, streaming, or structured output. The router must validate capabilities against a task before dispatch.

#### 7.1.1 Local model catalog and acquisition

The model registry exposes a curated catalog of compatible models hosted on Hugging Face, with a recommended embedding model and supported alternatives. Catalog entries record role, publisher/repository, immutable revision, artifact hashes, license, supported runtime and file format, embedding dimensions or other role-specific capabilities, download size, and measured or conservatively estimated hardware requirements. Catalog membership is a compatibility and provenance signal, not a guarantee of quality or safety.

- **Bundled default.** The default embedding model (selected in ADR-0006) ships inside each signed application package, so it involves no download or network approval. Its catalog entry is marked `bundled`; its artifact hashes are recorded in the release manifest, verified at build time and again before every load, and its license must permit redistribution. It loads lazily on first indexing, can be disabled or replaced by a catalog or imported model, and an application update that changes it invalidates and rebuilds affected vector indexes (§5.3.1). A verification failure disables it with an explicit error rather than falling back to an unverified file.
- Show model details, disk space, hardware fit, license, and required external download before acquisition. Downloads require an explicit user action and the applicable network approval; never download because an agent merely selected a model.
- Pin the requested revision and verify each artifact against an integrity-protected catalog manifest before loading. Fail with an actionable error on revision, hash, format, license-metadata, or compatibility mismatch.
- Load only supported non-executable model formats through the selected runtime. Do not execute repository-provided scripts, custom model code, or remote code as part of model loading.
- Keep downloaded model files in an application-managed location outside the target repository. Allow the user to inspect, deactivate, and remove downloaded models; model removal must not silently erase repository source or task history.
- Treat the download as the only network operation in this flow. Repository content, prompts, chunks, and embeddings remain local; record the source, revision, artifact hashes, license, approval, and outcome in local model-management history.

#### 7.1.2 Offline model import

Offline import supports model bundles obtained through a separate, trusted process when the target device cannot reach the catalog. It must not attempt a network lookup, silently fall back to an unsigned model, or report a model as verified when its trust chain cannot be established.

- Require an explicit user-selected bundle containing model artifacts, role/runtime metadata, and a signed manifest with immutable source/revision, license, supported format, resource estimates, and a cryptographic hash for every artifact.
- Verify the manifest signature against a trusted public key shipped with OneCode, then verify every artifact hash, declared size, format, and compatibility before import. A checksum supplied only by the same untrusted bundle is not proof of authenticity. Missing, revoked, unknown, or invalid trust metadata fails closed.
- Accept only explicitly supported non-executable model formats; never run bundle scripts or remote/custom model code. Validate archive entry paths and declared/actual sizes before extraction to prevent path traversal and resource-exhaustion attacks.
- Stage validated files in the application-managed model store and promote them atomically only after verification succeeds. Keep the original bundle untouched; on cancellation or failure, remove only the scoped staging data and leave the model unavailable.
- Record the offline source label, model identity/revision, manifest key identifier, artifact hashes, license, verification result, and outcome in local model-management history. Keep repository source, prompts, chunks, and embeddings out of the bundle/import flow.
- Apply the same approval, managed-storage, activation, removal, runtime, and OS-parity controls as catalog acquisition. Preserve keyword/symbol retrieval if an imported embedding model is absent, invalidated, or unsupported.

### 7.2 Routing policy

Choose a model using workload role, task class, privacy classification, context size, hardware, latency, cost budget, user preference, and measured task quality. A policy decision should include selected provider/model and a machine-readable rationale. Keep model roles distinct so an embedding model is not treated as a prompt-reasoning model.

Local model roles may include:

| Role | Responsibility | Policy boundary |
|---|---|---|
| Embedding | Encode eligible repository chunks and queries for semantic retrieval. | Local retrieval signal only; lexical/symbol paths remain available without it. |
| Reranker | Reorder a bounded set of already retrieved candidates. | Cannot add permissions or broaden repository scope. |
| Classifier | Return structured task/workflow labels and confidence. | Low-confidence or invalid output falls back to the existing task router; output cannot authorize tools. |
| Summarizer | Produce source-linked project or code summaries. | Label summaries as derived content and invalidate them when their source revision changes. |

Reranking, local classification, and summarization are optional follow-up capabilities. They must use explicit role-specific configuration and resource budgets; do not require a separate model download for any workflow to remain usable.

### 7.3 Escalation controls

- Require explicit configuration and approval before any external model call.
- Minimize payload to the brief, relevant evidence, failing output, patch, critique, and constraints.
- Redact secrets, credentials, personal/customer data, and policy-designated sensitive content before transmission.
- Block transmission if redaction status is uncertain or a secret is detected.
- Create an egress receipt with destination, purpose, data classes, model, timestamp, approval, and payload reference/hash.
- Never place secrets in prompts, context bundles, logs, embeddings, or persisted model memory.

### 7.4 Prompt and context caching

Prompt caching is a provider/runtime optimization, not a coding-quality control. Use it only when the selected model/runtime documents compatible caching behavior and the configured endpoint preserves the required cache metadata.

- Structure prompts so stable system policy, tool schemas, and stable project rules precede task-specific evidence and conversation content where the provider's cache mechanism benefits from stable prefixes.
- Keep dynamic repository evidence, current diffs, and task results in a separate context layer; do not bake stale, path-specific content into a long-lived shared prefix.
- Key OneCode-managed cached context by provider/model, relevant configuration and standards-profile revision, and policy version. Invalidate or rebuild it when any keyed dependency changes; use provider-side cache controls only as documented by that provider.
- Expect provider/runtime differences: model switches, changed tool sets, gateways, or context updates may miss or invalidate caches. Do not report cache hits, savings, or persistence unless the provider exposes trustworthy measurements.
- Honor provider retention and privacy controls. Never cache or retain secrets or sensitive repository content contrary to the approved data policy.
- If caching is unsupported, disabled, or unobservable, preserve correct behavior without it.

The [Claude Code prompt-caching guide](https://code.claude.com/docs/en/prompt-caching) describes Claude Code's own prefix-matching and provider-dependent behavior. These are design inputs, not guarantees about OneCode adapters or other providers.

## 8. Tool, skill, and MCP gateway

### 8.1 Progressive discovery

The model context exposes a minimal discovery surface. For each task, the Tool Advisor searches the catalog and returns a small relevant set. The gateway must support these logical operations:

| Operation | Required behavior |
|---|---|
| `tool_search(query, task_context)` | Return ranked candidate tools/skills with relevance and permission metadata. |
| `tool_describe(tool_id)` | Return input schema, examples, permissions, side effects, risk, and cost. |
| `tool_plan(task)` | Recommend a minimal tool set and explain selection. |
| `tool_invoke(tool_id, arguments)` | Validate arguments and policy, obtain approval where needed, invoke, and record outcome. |
| `tool_audit()` | Return scoped invocation and egress history. |

These are logical interface requirements; concrete transport and wire schemas are an open ADR.

### 8.2 Permission classes

| Capability | Default |
|---|---|
| Read repository and local index | Allowed within selected repository scope. |
| Write repository | Isolated worktree only. |
| Run local process/checks | Policy-controlled allowlist and resource limits. |
| Connect to local model endpoint | Allowed only under local network policy. |
| External network/model/API | Explicit approval and audit receipt. |
| Read secrets | Not available to model context; inject only at approved execution time when required. |
| Destructive Git/database action | Explicit, action-specific confirmation. |

Untrusted issue, web, documentation, and MCP content must be labeled as data, not instructions. It cannot grant permissions, change policy, or trigger tool execution by itself.

### 8.3 Skill package loading and progressive disclosure

Implement a provider-neutral skill descriptor and staged loader:

1. **Catalog stage:** index the skill's name, description, version, trigger metadata, compatibility, provenance, declared permissions, dependencies, and license. Keep catalog context small.
2. **Activation stage:** load the primary task instructions only after the task router selects the skill.
3. **Resource stage:** load referenced documentation/assets and run scripts only when needed and only after policy checks.

Support the portable directory layout described by the [Agent Skills specification](https://agentskills.io/specification) (`SKILL.md` with optional scripts, references, and assets) through a validated parser. Preserve source-specific fields and provide format adapters instead of claiming identical behavior across runtimes. In particular, experimental `allowed-tools` metadata must not grant runtime permissions; the gateway remains authoritative.

Before enabling an imported skill:

- Pin the source to an immutable commit/release and record the fetched content hashes.
- Parse and validate required metadata, paths, references, schemas, and compatibility.
- Review the precise license and dependency notices for the selected package; do not infer a folder's license from its repository peers.
- Inspect executable scripts and declared tool/network/process permissions; scan for secrets and supply-chain risks.
- Display source, revision, publisher, license, capabilities, risks, and requested permissions for user approval.
- Store it disabled until the user approves it; support revocation, update diff, rollback, and complete removal.

Treat instructions, bundled documents, and repository-provided scripts as untrusted inputs. Skills may recommend actions, but they cannot elevate permissions, bypass approval, change hard policy, or directly access credentials.

### 8.4 Plugin marketplace adapters and reference code

Plugin manifests may declare agents, skills, commands, MCP servers, source paths, and marketplace metadata. Parse these declaratively into OneCode's internal capability model; do not execute installer hooks or launch MCP processes merely because a marketplace lists them. Verify source and revision, review per-plugin licensing, inspect every requested capability, and ask approval before enabling.

An official or curated marketplace is a discovery source, not a security attestation. Plugin names and marketplace metadata are publisher-controlled; retain immutable package identity internally and provide an explicit migration path for renamed entries. Keep Claude Code-specific plugin semantics in a compatibility adapter, not in the provider-neutral policy engine.

Quickstarts are educational examples. Review the selected subdirectory's license, supported dependency versions, secrets handling, sandboxing, and production limitations before adopting a pattern. Do not copy or redistribute a sample whose subdirectory terms do not permit it.

### 8.5 Permission modes and rule evaluation

Permission modes (FR-96) set the defaults, rules (FR-97) refine them, and hard policy sits above both. For a requested action the policy engine evaluates in this order and records a `PermissionDecision`:

1. **Hard policy:** actions in the FR-18 set (external network and model calls, paid tools, destructive Git and database actions, policy-designated high-risk operations), protected-path writes (FR-100), and actions blocked by workspace trust (§8.7) require approval or are denied regardless of mode or rules.
2. **Deny rules:** any matching deny rule denies, and the agent receives the reason.
3. **Allow rules:** a matching allow rule permits without a prompt, within the sandbox the mode requires.
4. **Mode default:** *Ask* prompts; *Auto-edit* permits worktree edits and allowlisted read-only commands; *Autonomous, sandboxed* permits sandboxed commands and edits; *Read-only* denies side effects.
5. **Prompt:** otherwise ask, offering scoped "remember" options that write a rule to the chosen layer.

Rules are `{ tool, matcher, effect (allow | deny | ask), scope (user | project | session), provenance, expiry }`. Shell-command matchers are evaluated per command segment after conservative parsing of chaining, pipes, redirection, and substitution; an unparseable or dynamically constructed command falls back to *ask*. Rules from the repository (project layer) load only in trusted workspaces and are shown with provenance. Rule changes are audited; agents cannot write rules.

The sandbox a mode requires is verified before the first command of a session. If the OS cannot provide it, the session falls back to *Ask* with an explicit explanation instead of running unsandboxed (§3.3).

### 8.6 Hooks engine

- **Events:** `session_start`, `session_stop`, `before_tool_call`, `after_tool_call`, `after_file_edit`, `before_commit`, `on_approval_request`, `on_task_complete`, `on_check_failed`.
- **Definition:** `{ event, matcher, command | script, timeout, scope (user | project), provenance }` stored in the settings layers; project hooks load only in trusted workspaces.
- **Execution:** hooks run through the same sandbox and resource limits as agent commands, with the event payload on standard input and a structured result on standard output. Outcomes are `allow`, `block (reason)`, or `augment (context)`. A failing or timed-out hook blocks side-effecting actions by default and is reported.
- **Guarantees:** hooks cannot grant permissions, change modes or policy, or access credentials. They are listed in the UI with provenance, versioned with the project, and audited as `HookEvent` and `HookResult`.

### 8.7 Workspace trust

- **States:** `untrusted` (the default for a newly opened path), `trusted`, and `trusted_restricted` (trusted with specific capabilities disabled by organization policy).
- **Untrusted behavior:** observe-only. OneCode does not run project scripts, tasks, launch configurations, Git hooks, OneCode hooks, or repository-provided language servers and binaries, and does not load repository instruction files or project-layer rules. Indexing still runs with the standard exclusions, and the user can read, search, and chat about the repository.
- **Prompt:** shown on first open with the path, the origin (clone URL when known), and what trust enables. Decisions are per canonical path, inherited by subfolders, revocable from the status bar, and recorded.
- **Enterprise policy:** an organization can pre-trust or restrict paths and origins; policy decisions are visible, never silent.

## 9. Quality and verification architecture

### 9.1 Verification pipeline

Select checks based on changed paths, project configuration, task risk, and acceptance criteria:

1. Patch validity, scope, formatting, and whitespace.
2. Targeted lint, static analysis, type check, or compilation.
3. Unit tests for changed logic, including edge and error paths.
4. Integration/contract tests for affected service, API, database, queue, or auth boundaries.
5. Build and existing relevant regression tests.
6. Security, secret, and dependency checks based on risk and policy.
7. Browser E2E, accessibility, visual, or performance checks when relevant and available.
8. Documentation and migration consistency checks.

Run the smallest relevant checks first, then expand based on impact. Record exact command, tool version/environment, exit code, duration, and output reference.

### 9.2 Quality bars and critic separation

- Define two or three concrete, testable quality bars for each task.
- Derive bars from requirements, repository conventions, and relevant policy.
- Critics receive the bars, acceptance criteria, diff, and evidence; they do not receive or rely on builder self-assessment.
- Critics are read-only and return blocker, major, minor, or advisory findings.
- Findings must cite source/diff/test evidence and map to an acceptance criterion or explain why they are additional.
- A finding is resolved only with a recorded fix, evidence-backed dismissal, or explicit user acceptance of residual risk.

### 9.3 Repair loop

- Default maximum: five local repair cycles; allow policy/user configuration within bounded limits.
- Each cycle must add new evidence or a changed patch.
- Detect identical repeated failures and stop instead of looping.
- Re-run checks affected by each repair; rerun the full required set before delivery.
- Critical security, data-loss, broken-build, and existing-test failures block completion.
- Escalation or user intervention must preserve the evidence and minimize the outbound context.

### 9.4 Defensive source security-audit workflow

For an explicitly requested, authorized repository audit, run a separate audit profile rather than treating a generic code review as a comprehensive security audit:

1. **Authorize and scope:** record the repository, paths, revision, allowed local checks, exclusions, budget, output destination, and explicit authorization. Do not infer authorization to probe live systems.
2. **Reconnoiter:** produce architecture/trust-boundary notes and a coverage ledger for relevant entry points, principals, assets, controls, and security classes.
3. **Hunt by coverage unit:** assign bounded source-review tasks, record checks/evidence per unit, and use an independent coverage critic to identify gaps.
4. **Validate candidates:** deduplicate by stable fingerprint; assign each candidate to a fresh verifier who did not discover it; re-read cited source and reproduce only the minimum decisive local check in the sandbox.
5. **Emit structured findings:** validate output against a versioned schema. Keep verdict and severity separate: `confirmed` requires a concrete boundary failure and supported impact; `needs_validation` names the precise missing fact and carries no speculative severity; `rejected` records why the candidate was disproved.
6. **Verify final records:** a fresh independent reviewer checks evidence paths/lines, exploit preconditions, impact, severity, and verdict. Material promotions or root-cause/evidence changes require another independent verifier.
7. **Report coverage honestly:** derive human-readable summaries from validated structured records and the ledger. Any uncovered units, exhausted budget, missing sandbox controls, or unverified runtime assumptions make the audit `incomplete`, not a clean bill of health.

Sandbox requirements for target-controlled builds, tests, fuzzers, browsers, and fixture processing are strict: OS-enforced isolation, external networking disabled (except isolated loopback when a local check requires it), sanitized allowlisted environment, no credentials or host/shared services, resource limits, and write access only to assigned scratch paths. Do not install dependencies or allow build scripts to fetch them during an audit. If any mandatory control is unavailable, do not execute target-controlled code; preserve the exact limitation as a validation blocker and provide a safe follow-up plan.

The workflow is defensive and source/local-only. Do not probe production or deployed endpoints, external/shared services, live identities, or systems outside the authorized repository and isolated fixtures. Audit depth and invocation limits must reserve time/budget for coverage review and independent verification before candidate hunting begins.

### 9.5 Verification economy

Verification is a budgeted activity (FR-113). The check scheduler enforces these rules for agents, and tests verify them:

- **Prerequisites before compilation.** Confirm with cheap reads the target and filter, fixtures, environment variable names, working directory, feature flags, database or schema state, and the running instance (§3.4.5). A missing prerequisite is fixed or reported first; a build is never the way to discover that the environment is not ready.
- **One compile per material change.** Compile only the relevant target, once per change to sources, dependencies, features, toolchain, or flags, using the shared cache and stable flags. Record the produced artifact path.
- **Reuse artifacts.** While inputs are unchanged, reuse the compiled test binary or build output: list tests with it and rerun selected tests after setup or fixture fixes. Verify that the filter selects the intended tests; zero selected tests is not a pass.
- **Rerun only for new evidence.** Before any expensive rerun, name what changed and what new evidence the run can give. An unchanged failure, a runtime prerequisite failure, or a wish for more confidence is not a reason to rebuild. Never clean caches, switch profiles or flags, or use another target directory to retry the same check.
- **Stop proportionately.** Stop when the cost is out of proportion to the change and the remaining uncertainty, or when another run would add nothing; do cheaper inspection instead, and do not widen the suite to make a report look complete.
- **Report faithfully.** Record the artifact path, filter, test counts, last result, and open prerequisites in the task notes so a later turn or a compacted session reuses them; report what stays unverified. Stopping never turns an unrun or failed check into a pass, and required release checks still apply.

### 9.6 Graph-assisted check selection

The check scheduler uses `graph_impact` (§5.5.4) to order and narrow checks during implementation and repair:

- Select the tests linked to changed symbols by `tests`, `calls`, and `references` edges first, then tests in the same community, then the configured regression set.
- Use only extracted edges to drop a test from an early run; inferred edges can add tests, never remove them.
- When graph coverage for a changed language is incomplete or the graph is stale, fall back to the project's configured selection and record why.
- Graph selection shortens the repair loop; it never shrinks the required pre-delivery set (§9.3). The `TestReport` records which tests were selected by graph impact and which by configuration.

## 10. Data and persistence

### 10.1 Data domains

| Domain | Example contents | Lifecycle |
|---|---|---|
| Repository index | File hashes, symbols, relationships, embeddings, source revision. | Rebuildable; local; scoped to repository. |
| Code knowledge graph | Nodes, provenance-labeled edges, communities, repository-map layers, and layout caches keyed to revision and graph-schema version (§5.5). | Rebuildable from the index; local; outside the repository; invalidated per file by content hash. |
| Second-brain knowledge | Capture inbox, accepted user-authored memory, immutable note revisions, provenance-bearing relations, feedback, and portable snapshots (§5.8). | Captures await review; source changes mark linked notes stale; user content is never silently overwritten; user controls retention, export, restore, and deletion. |
| Output references | Large tool, command, and test outputs stored outside model context (§6.7). | Task evidence retention; redacted; size-capped; deleted with the task. |
| Local model catalog and files | Model-role metadata, source/revision, license, artifact hashes, compatibility, downloaded weights, and verified offline imports. | Stored outside target repositories; acquisition and removal are user-controlled and distinct from repository index retention. |
| Task state | Brief, plan, transitions, approvals, patches, checks, critiques. | Durable until user retention policy deletes it. |
| Audit records | Tool calls, policy decisions, external egress, approval outcomes. | Append-only; retention configurable; sensitive payloads minimized. |
| Project memory | Accepted architecture, conventions, domain terms, constraints, and links represented in the second-brain lifecycle (§5.8). | User-controlled; source-linked, revisioned, retained/exported/deleted under the configured policy. |
| User/team preferences | Model and approval preferences, standards. | Explicitly controlled and access-scoped. |
| Credentials | Provider and tool credentials. | OS credential store or dedicated vault; never model-readable. |
| Sessions and transcripts | Session metadata, turns, steps, compaction summaries, attachments by reference. | Durable; export and delete per session; redacted on export. |
| Terminal and browser captures | Bounded output snapshots, screenshots, console and network metadata, annotations. | Task evidence retention; redacted; size-capped; deleted with the task. |
| Browser profiles | Per-project isolated browser profile data (cookies and storage for local and named test hosts). | Outside the repository; deletable per project; never shared with the system browser. |
| Settings, rules, hooks, instructions | Layered configuration, permission rules, hook definitions, resolved instruction sets. | User and local layers in the application data directory; project layer in the repository; schema-versioned; protected paths. |
| Process registry | Process records, ports, lock records, log references. | Runtime state with cleanup on exit; logs rotated. |

### 10.2 Storage requirements

- Persist metadata and task state transactionally.
- Store large logs and artifacts by reference with integrity hashes and retention policy.
- Encrypt sensitive local data where the platform supports it and protect credentials with the operating system's secure storage.
- Provide export and deletion workflows for user-controlled memories and task data.
- Keep index records associated with source revision and parser/index schema version.
- Do not write indexes or OneCode runtime state into the target repository by default.

**Storage decisions:** ADR-0005 selects SQLite for transactional state and relational index data. Store authoritative second-brain records, revisions, relations, provenance, and review state there; LadybugDB under proposed ADR-0017 holds the derived code graph and references to accepted knowledge records, not canonical note content. ADR-0006 still selects the local vector index; `sqlite-vec` is an optional candidate, not a required dependency. Repository-derived index and graph data remain rebuildable, and storage interfaces stay replaceable until cross-platform and workload evidence validates the proposal.

### 10.3 Knowledge backup, import, and restore

- Snapshots include the user-selected scopes of accepted user-authored notes, revision history, provenance, links, and approved feedback. Captures awaiting review are excluded. Derived graph/index data and model files are excluded unless separately selected.
- The native archive carries a versioned manifest, inventory, schema version, and bounded Argon2id parameters. Encrypt and authenticate the manifest and payload with XChaCha20-Poly1305 using a fresh random salt and nonce. Export requires a user passphrase, writes only encrypted native archives, applies redaction and index exclusions, and reports what was omitted.
- Import supports the encrypted OneCode archive and supported Markdown/wikilink format. Treat every archive path, frontmatter field, link, and body as untrusted data; enforce path containment and size/depth/KDF limits, reject malformed or duplicate identifiers safely, and never execute scripts, macros, or embedded instructions. Do not fetch linked URLs implicitly.
- Before applying an import or restore, show target scope, provenance (including that archive integrity does not establish authorship), conflicts, unsupported fields, and validation outcomes. Native-archive restore and Markdown import both enter the review queue; preserve prior acceptance only as historical metadata, and require explicit re-acceptance before restored records can be recalled.
- Restore validates all contents before mutation, applies changes transactionally or via staged replacement, and preserves a rollback point. On any failure, restore the prior state and report the exact failure; do not produce a partial success state.
- Backup/restore works offline and never uploads data. Automatic cloud sync and cross-device replication require a separate product and security decision.

## 11. API and event requirements

Concrete public endpoints are not fixed yet. The local application API should provide equivalent operations for:

- Create, inspect, cancel, and resume a task.
- Retrieve task events, plan, diff references, check reports, and delivery summary.
- Submit approval/denial decisions with the relevant action scope.
- Inspect repository scan/index status and initiate a refresh.
- Query the code knowledge graph (map, skeleton, locate, find-all, neighbors, impact, path, status) under the same policy and budgets as agents (§5.5.4); open the knowledge map, read and edit notes, and export it on explicit user action (§5.6).
- Create, list, inspect, edit, accept, reject, link, merge, supersede, mark stale, archive, restore, and delete knowledge captures/notes; inspect provenance and revisions; record memory relevance feedback; retrieve memory with explanation and freshness; export a selected-scope snapshot; validate, preview, and restore/import an archive or supported Markdown notes (§5.8, §10.3).
- List compatible local models, inspect their provenance and resource requirements, download after approval, select a model by role, inspect model/index status, and remove downloaded models or rebuild/delete an embedding index.
- Import an offline model bundle through an explicit local selection, inspect manifest/signature and artifact-verification results, and activate it only after verification succeeds; the import flow makes no network requests.
- Inspect model, tool, policy, and memory settings without exposing secrets.
- Create, list, resume, fork, archive, and delete sessions; send messages, steer, interrupt, cancel, change conversation mode and permission mode, and compact (§4.2).
- Observe the editor, diagnostics, terminal, browser, source control, and processes within policy (§6.5); share and unshare terminal and browser tabs.
- Terminal: create tabs, run attributed commands, capture output. Browser: navigate, read, interact, capture, annotate, and create tasks from annotations. Source control operations (§3.4.4). Process registry queries and owner-scoped stop (§3.4.5).
- Fix: create a `FixRequest` from an evidence reference; preview and apply quick fixes (§6.6).
- Inspect settings, rules, hooks, trust state, and the resolved instruction set; apply user-initiated changes; read notification and attention state.

Task events should be ordered, timestamped, typed, and replayable. UI clients must handle reconnects without duplicating side effects. API schemas should be versioned; policy checks must run server-side and must not trust UI-supplied approval status.

## 12. Security, privacy, and reliability requirements

- Run agents with filesystem, process, network, and Git scopes limited to the task.
- Validate all tool arguments, file paths, model outputs, and inter-agent artifacts.
- Treat retrieved repository content and external tool results as untrusted input.
- Redact secrets before prompts, external egress, logs, embeddings, and memory persistence.
- Keep repository chunks, prompts, and embeddings on-device for local model workflows; a model download must not upload repository data. Verify pinned artifact hashes, load only explicitly supported formats, do not execute remote model code, and apply runtime/resource limits to model loading and inference.
- For offline imports, verify a signed manifest against the app's trusted key set and every artifact hash before activation; reject bundle traversal, unsupported formats, invalid signatures, and partial/corrupt imports without a success-shaped fallback.
- Parse imported knowledge archives and Markdown as untrusted data: enforce canonical path containment, format allowlists, size/depth limits, schema validation, safe link handling, and atomic restore; never execute embedded content or fetch remote links implicitly.
- Require authenticated encryption for portable OneCode backups, bound untrusted key-derivation parameters before running a KDF, never store/log passphrases, and keep restored/imported records out of recall until explicitly re-accepted.
- Keep user-authored, imported, inferred, and derived memory distinguishable. Memory retrieval cannot authorize actions, override project policy, or substitute for current source evidence; external-source capture follows existing egress approval, redaction, and receipt requirements.
- Treat model weights and all model outputs as untrusted; model output can rank or summarize evidence but cannot change permissions, policy, or task scope.
- Enforce external egress policy centrally and record receipts.
- Restrict MCP servers to an explicit approved registry and audit discovery/invocation.
- Apply resource limits, timeouts, cancellation, and bounded retries to agents and child processes.
- Make task execution recoverable after application restart; record incomplete operations distinctly.
- Surface failures explicitly, with actionable errors; never report a failed or skipped check as passing.
- Use dependency pinning, license review, vulnerability scanning, and provenance checks in build/release pipelines.
- Run every agent command, hook, test, and repository-provided tool inside the OS-enforced sandbox the session's mode requires; for agent processes, mount Git hooks, OneCode configuration and policy, permission rules, hook definitions, credential stores, and governing instruction files read-only (§8.5, FR-100). Never run unsandboxed when a mode requires a sandbox; fall back to prompting with an explanation.
- Isolate the built-in browser per project, classify hosts, require approval for mutating actions on external hosts, never enter credentials or payment data, never read browser storage or saved passwords, and treat page content as data (§3.4.3).
- Treat terminal output, pasted content, attachments, instruction files, hook output, and observed workspace content as untrusted data that cannot authorize actions (§6.5, §8.2).
- Enforce workspace trust before running anything the repository provides (§8.7).

## 13. Observability and diagnostics

Each task should expose:

- Correlation/task ID and lifecycle transitions.
- Agent role, model/provider, prompt/context identifiers, and latency/token/cost usage where available.
- Local model role/revision/runtime, download outcome, inference latency, indexing duration, peak memory, index size, and retrieval evaluation version where available.
- Selected files/symbols/tools and selection rationale.
- Approval and policy decisions.
- Tool and process calls with exit status and bounded output references.
- Patch/checkpoint identifiers and test/critic evidence.
- External egress receipts.
- Session and turn identifiers, conversation mode, permission mode, steering and interruption events, and compaction events.
- Workspace observations by source with sizes and trust levels; terminal commands by actor with exit status; browser actions by capability class and host class; annotation creation and mapping confidence.
- Permission decisions with the evaluated rule chain, hook events and results, trust changes, and process registry events (launch, reuse, conflict, stop).
- Context economy (§6.7): tokens by context layer, disclosure rung per code item, whole-file reads with their reasons, output references created and expanded, cleared observations, and constrained-decoding use and artifact-validation retries.
- Graph operations: query kind, latency, result size, omitted-item count, revision lag, and whether inferred edges were returned; graph build and incremental-update durations.
- Second-brain operations: capture/review status counts, stale/contradictory/duplicate suggestion counts, retrieval rationale and freshness class, user feedback labels, and snapshot/restore validation outcomes. Record metadata and references only; do not log note bodies, source text, or private content.

Logs must be structured, locally retained by default, redacted, and configurable. Avoid recording full source or secrets when a hash, source reference, or bounded diagnostic is sufficient.

Use `tracing` as the Rust instrumentation boundary and evaluate the OpenTelemetry Rust crates for interoperable traces, metrics, and logs. Local structured diagnostics remain available without telemetry export. Export is disabled by default; enabling an exporter requires the decision and threat model in ADR-0019, explicit configuration and egress approval, redaction before export, a destination/purpose receipt, and user-visible retention controls. Do not add a vendor endpoint or collect source, prompts, credentials, or page contents as telemetry.

## 14. Testing strategy

### 14.1 Test layers

- **Unit:** state transitions, policy decisions, redaction, retrieval ranking, schema validation, retry/budget behavior.
- **Component:** model adapters, parser/indexer, tool gateway, worktree manager, storage, and event replay.
- **Integration:** orchestrator-to-agent workflows, local model runtime, repository indexing, and task recovery.
- **End-to-end:** bootstrap a sample project, implement a bounded change, run tests, review evidence, and recover/cancel.
- **Security:** permission bypass attempts, path traversal, prompt injection in retrieved content, secret leakage, unsafe external egress, and malicious tool responses.
- **Cross-platform:** native build/install/launch and core lifecycle checks on Windows, macOS, and Linux; filesystem path/permission semantics, process cancellation, model-runtime availability, offline model import with network disabled, and sandbox enforcement must be tested on their target OS. Test both successful platform capabilities and safe denial where a required guarantee is unavailable.
- **Local model supply chain:** pinned-revision and hash mismatch, offline manifest signature/key and artifact-hash failures, archive path traversal, unsupported or malformed formats, missing/ambiguous license metadata, disabled remote-code execution, interrupted downloads/imports, low disk/resource limits, model load failures, atomic activation, and explicit removal behavior.
- **Skill/plugin supply chain:** malformed manifests, path escape, tampered revision/hash, undeclared tools/network use, license gaps, disabled-by-default behavior, revocation, and update/rollback.
- **Security audits:** coverage-ledger and finding-schema validation, independent verifier separation, exact source traceability, sandbox denial, no-network behavior, no-credential exposure, strict budget accounting, and honest incomplete-run reporting.
- **Performance:** indexing time, retrieval relevance/latency, memory usage, task startup, and context-token reduction.
- **Dependency reuse:** for each chosen library, test the actual supported feature set, accessibility, platform behavior, resource budgets, license/advisory status, and upgrade compatibility; justify bespoke replacements with reproducible evidence of a requirement gap.
- **Retrieval/model evaluation:** compare embedding-assisted search against the same versioned keyword/symbol baseline; report relevance, query latency, initial/incremental indexing time, peak RAM/VRAM, disk footprint, runtime, model revision, and test hardware. Verify fallback behavior with no model installed and index invalidation after model/configuration changes.
- **Standards resolution:** version detection from manifests/lockfiles, monorepo path scoping, source provenance and freshness, conflicting instructions, unavailable network/docs, stale-profile invalidation, and unsupported-version handling.
- **Prompt/context construction:** task-specific evidence inclusion, stable-prefix behavior, profile-version invalidation, cache-unavailable provider fallback, and assurance that cache optimization cannot bypass privacy or verification.
- **Compatibility:** supported operating systems, model runtimes, repository sizes, and language/parser versions.
- **Workspace services:** document-model concurrency between user and agent edits (rebase, conflict, no silent overwrite); terminal PTY behavior per OS, shell-integration marks, attribution, capture bounds and redaction, and sharing rules; browser isolation (no system-profile access), host classification, capability-class enforcement, blocked link patterns, download and permission prompts, console/network redaction, annotation capture fidelity, element-to-source mapping accuracy on fixture applications, and before/after re-capture; source-control operations and destructive-action approvals; process-registry reuse, port-conflict handling, stop ownership, and orphan cleanup; diagnostics-bus deduplication and "sources active" reporting.
- **Sessions and steering:** safe-point delivery, interrupt and cancel semantics, compaction invariants (pending approvals and unapplied hunks survive), turn-level revert, parallel sessions in separate worktrees, and subagent scope narrowing.
- **Decision escalation (FR-125):** three distinct failed Architect attempts precede three distinct Advisor attempts; counters are separate and do not alter FR-29 repair limits; repeated turns do not count as new strikes; every Advisor attempt cites applicable project documentation and records comparable-project/authoritative-source research when relevant and authorized; denied or unavailable egress is recorded without network access; the sixth unresolved attempt pauses with a complete human decision brief; hard-policy prompts remain immediate.
- **Decision-escalation identity and citation integrity:** the same blocker keeps its core-generated root identity and counters across relabeling, turns, sessions, and model changes; only a user-confirmed material scope/criteria change or a distinct acceptance criterion/diagnostic fingerprint with separate affected scope can start a linked episode. Test forged resets, cross-session recovery, independent-root evidence, and unchanged FR-29 counters. Reject citations or research-derived claims without matching gateway evidence artifacts; test fabricated URLs, failed/unreachable fetches, mismatched source revisions/spans, verified local-document citations, valid external receipts, and denied-egress paths.
- **Permission modes, rules, trust, and hooks:** rule-chain evaluation order, deny precedence, command-segment parsing and unparseable fallback, "remember" writes, hard-policy immutability across modes, sandbox-unavailable fallback, untrusted-workspace blocking, trust revocation, hook outcomes and timeouts, and the inability of hooks or instruction files to grant permissions.
- **Fix workflows:** fix-from-evidence creation from each surface, reproduction-first behavior, symptom-patch detection by critics, and auto-fix bounds (no push, post, or merge).
- **Verification economy:** prerequisite checks before compilation, a single compile per material change, artifact reuse, zero-test detection, and stop rules.
- **Code knowledge graph:** extracted-edge accuracy against hand-labeled fixture repositories per language; provenance labeling (no model- or heuristic-derived edge labeled extracted); incremental invalidation after edits, renames, deletions, and branch switches; stale reporting; per-language coverage reporting; exclusion parity with the index; deterministic communities on unchanged input; budget truncation that reports omissions; and no egress from concept extraction unless approved and receipted.
- **Context economy:** disclosure-ladder behavior and whole-file-read reasons, output-reference creation and range expansion, superseded-observation clearing that never drops approvals, hunks, findings, or evidence identifiers, patch-shaped edit output, and constrained-decoding fallback when a runtime lacks support.
- **Knowledge map:** derived-note invalidation on revision change, preservation of user-edited notes, backlink correctness, redacted export with index exclusions applied, and editor responsiveness while the map is open.
- **Second brain:** capture source attribution, scope, trust, and redaction; review-before-acceptance; derived-versus-user-authored separation; immutable revision history; source-change and expiry staleness; duplicate/contradiction suggestions without automatic merge; typed relations and backlinks; retrieval explanation, scope/freshness ranking and feedback without content mutation; stale-memory warnings; encrypted archive/Markdown round trips; wrong-passphrase and authenticated-integrity failures; hostile KDF parameters; restored records pending re-acceptance; plaintext-export disclosure; malformed metadata and path traversal; oversized/deep archives; malicious instruction-like content; no implicit network fetch or execution; preview/conflict handling; atomic restore, rollback, selective export, and deletion/retention.
- **Graph-assisted check selection:** inferred edges never remove a test, stale-graph fallback, and an unchanged required pre-delivery set.
- **Default embedding model:** bundled-artifact verification at build and load, tamper and missing-file failure that disables semantic retrieval with an explicit error, first-run indexing without network access, disable/replace/re-enable flows, index invalidation when an update changes the model, background-worker resource limits that keep editor latency within budget, embedding suggestions stored as inferred until confirmed, and each §5.7 use measured on and off.
- **Desktop UX:** keyboard operability, screen-reader announcements, theme and high-contrast rendering, layout persistence, and latency budgets for editor, terminal, and annotation flows on each OS.

### 14.2 Test data and evaluation

- Maintain synthetic and licensed benchmark repositories with known tasks and expected outcomes.
- Maintain a separate, consented memory benchmark with known source provenance, validity intervals, duplicates, contradictions, task queries, and expected recall/exclusion behavior.
- Include clean, incomplete, monorepo, large, and adversarial repository fixtures.
- Version benchmark tasks, acceptance rubrics, model/provider versions, and hardware profiles.
- Measure acceptance, regression, context efficiency, latency, escalation, privacy incidents, and approval frequency.
- Evaluate second-brain citation validity, task relevance, freshness accuracy, duplicate/contradiction handling, user usefulness feedback, and backup/restore integrity; set release thresholds from a measured baseline.
- Report **tokens per accepted task** and **agent turns per accepted task** for three context strategies on the same task set: whole-file baseline, keyword/symbol retrieval, and graph-assisted navigation (§5.5, §6.7). Break results down by repository size class, since graph navigation is expected to help little on repositories that fit in the context window. A context-saving strategy that lowers acceptance or raises regressions is a failure, not a saving.
- Keep agent trajectories (tool calls, context layers, disclosure rungs, and outcomes) for benchmark runs so regressions in navigation behavior can be diagnosed, not only detected.
- Do not use proprietary user repositories in shared evaluation unless explicitly consented and sanitized.

## 15. Build, release, and operational lifecycle

### 15.1 Engineering delivery lifecycle

1. **Specify:** link each implementation task to a PRD requirement and acceptance criterion.
2. **Resolve standards:** detect the affected stack versions, load applicable repository rules and checks, consult version-matched official documentation when permitted, and record uncertainty/conflicts.
3. **Design:** record cross-component or security-sensitive decisions as ADRs.
4. **Implement:** make narrow changes behind interfaces; add tests with behavior changes; use the task-appropriate workflow and Coding Standards Profile.
5. **Review:** require human review for policy, security, schema, and permission changes; use independent automated review as additional evidence.
6. **Validate:** run detected/configured formatting, lint, type/build, focused tests, then required regression/security checks; block completion on mandatory failures.
7. **Package:** produce signed or integrity-verifiable platform artifacts and a software bill of materials where supported.
8. **Release:** staged rollout with versioned release notes, migration plan, rollback strategy, and known limitations.
9. **Operate:** collect opt-in, privacy-preserving diagnostics; monitor crashes, task failures, latency, and regression.
10. **Maintain:** patch dependencies, rotate/revoke compromised credentials, migrate local state safely, refresh affected standards profiles, and retire unsupported interfaces through deprecation.

### 15.2 CI quality gates

At minimum, CI should enforce formatting, linting, compilation/type checks, unit and component tests, dependency/license policy, secret scanning, and platform build checks. Integration and end-to-end suites should run on relevant change classes and before release. A failed required gate blocks release; exceptions require documented owner, rationale, scope, and expiry.

## 16. Proposed implementation milestones

The following four milestones adapt the reference plan into testable technical increments; calendar estimates require validation against team size and supported platforms.

### Milestone 1 — Verified vertical slice

- Rust workspace and local application/CLI entry point.
- Windows, macOS, and Linux build/test foundations and native checks for the CLI and core coding lifecycle.
- Task state model, structured logs, and configuration.
- Git worktree/checkpoint operations.
- One local model adapter plus compatible-provider interface.
- Stack/toolchain detection and a minimal source-linked Coding Standards Profile for the active package.
- File scan and keyword retrieval.
- Planner → Coder → Tester flow with a sample repository.
- Focused tests and an inspectable final diff/check report.
- Minimal workspace: editor with agent hunks, integrated terminal with attributed agent commands and captures, source-control status, Problems panel, process registry with instance reuse, sessions with steering and permission modes, and workspace trust.

**Exit:** pass the same core acceptance suite and complete one bounded task in an isolated worktree on each supported OS, survive cancellation, and accurately report check failures.

### Milestone 2 — Repository intelligence

- Syntax-aware parsing and symbol store for selected languages.
- Dependency/test relationships, incremental indexing, and file watcher.
- Context bundles with evidence links and token budgets.
- Code knowledge graph with provenance-labeled edges, revision keying, and stale and coverage reporting; agent graph operations (map, skeleton, locate, find-all, neighbors, impact, path, status); the progressive-disclosure ladder, output references, and per-layer token accounting (§5.5, §6.7).
- Bundled default embedding model verified at build and load, with its retrieval and graph uses measured on and off (§5.7); curated, user-controlled Hugging Face catalog for compatible alternatives; pinned downloads and signed offline bundles, artifact verification, hardware/storage disclosure, explicit approval, local-only vectorization, and fallback search.
- Version/path-scoped Coding Standards Profiles, relevant local rules/examples, and observe-only readiness report.
- Optional retrieval of official version-matched technical documentation when network policy permits.

**Exit:** demonstrate retrieval quality and context reduction against a documented keyword/symbol baseline, and report tokens and turns per accepted task with graph navigation on and off by repository size class; report latency, indexing time, memory, disk, model revision, and hardware, pass with embeddings disabled or unavailable, and verify signed-bundle import with network access disabled plus fail-closed tamper cases.

### Milestone 3 — Governed agency

- Typed agent artifacts and role-scoped runtime.
- Progressive MCP/tool discovery, a validated skill registry and package adapters, plugin review/enablement flow, and permission engine.
- Secret redaction, egress approvals/receipts, and audit history.
- Independent critic and bounded repair loop.
- Defensive source-audit workflow with an isolated execution boundary, coverage ledger, independent verification, and schema-validated reporting.
- Permission rules, hooks engine, protected paths, workspace-awareness operations, and the fix workflow engine from terminal, test, and diagnostic evidence.
- Built-in browser preview with an isolated profile, host classification, capability classes, and console/network/screenshot capture.

**Exit:** verify that denied permissions cannot be bypassed and critical failures cannot be marked complete.

### Milestone 4 — Productization

- Desktop diff/evidence/approval workflows and tested, platform-appropriate Windows, macOS, and Linux packages.
- Browser/accessibility/visual checks where supported.
- Browser annotations, element-to-source mapping, and the annotation-to-fix loop with before/after evidence; language-server manager and editor quick fixes.
- Layered settings, instruction-file compatibility, command palette and keybindings, theming and accessibility, notifications, onboarding, diagnostics bundle, and commit/PR message generation.
- CI/PR integrations, model routing policies, cost controls, and evaluation dashboard.
- Optional local reranking, task classification, codebase summarization, and semantic tool/skill candidate discovery, each separately configured and unable to bypass gateway permissions.
- Complete the supported local runtime matrix and retrieval capabilities required by the PRD.
- Signing/notarization, installer and update validation, and release smoke tests on each supported OS.

**Exit:** release candidate meets PRD readiness criteria and has recovery, migration, privacy, and support documentation.

### Follow-up release — Knowledge map and second brain (v1.5)

- Deliver communities and the task-personalized repository map, graph-assisted check selection, constrained structured output where runtimes support it, and the knowledge map with linked-note memory and Obsidian-compatible export (§5.5.3, §5.6, §6.7, §9.6; FR-118 to FR-124).
- Deliver the full second-brain capture inbox, user-reviewed knowledge lifecycle, provenance/temporal relations, explainable hybrid recall and feedback, and versioned offline backup/restore with reviewed Markdown/wikilink import (§5.8, §10.3; FR-126 to FR-130).

**Exit:** P1 knowledge features meet the PRD acceptance criteria without making P1 functionality a dependency of the initial release.

## 17. Open technical decisions

Track each as an ADR with options, evidence, consequences, and revisit criteria:

For each decision, evaluate a maintained open-source candidate and a custom implementation where applicable. Use the [tech-stack inventory](./TECH-STACK.md) to find candidates, but verify versions and compatibility at decision time; neither the catalog nor a prototype makes a production dependency decision.

1. Default embedding model bundled with the application (redistribution license, package size, hardware floor, per-OS runtime), curated Hugging Face catalog/format policy, vector storage engine, and index migration strategy.
2. In-process Rust actors versus local IPC/service boundaries.
3. Desktop UI framework and UI-to-core protocol — resolved by [ADR-0003](./adr/0003-desktop-ui-and-bridge.md).
4. First language/framework support matrix.
5. Frontier provider APIs versus OpenAI-compatible proxy abstraction.
6. Task/index storage engine, encryption, retention, and schema migration.
7. Sandbox strategy and platform-specific isolation guarantees.
8. Skill packaging, plugin ABI, and compatibility guarantees.
9. Minimum supported OS versions, platform packaging/installers, model acquisition, updates, signing/notarization, and license/commercial model.
10. Offline model-bundle container and signature formats, trusted-key rotation/revocation, and how trust metadata is refreshed for air-gapped installations.
11. Editor engine and the document-model bridge between the UI, agents, and language servers.
12. Terminal emulator and pseudo-terminal implementation per OS, including WSL.
13. Built-in browser engine (platform WebView versus bundled Chromium with the DevTools protocol) and the element-to-source mapping sources to support.
14. Source-control implementation (Git CLI versus embedded library) and credential-helper handling.
15. Language-server distribution and trust model, and the scope of debugger-adapter support.
16. Hook, rule, and custom-command definition formats and compatibility with other agent tools' formats.
17. Dedicated embedded graph store: LadybugDB is proposed by ADR-0017; graph schema versioning, community-detection algorithm, and repository-map ranking method remain open.
18. Knowledge map rendering engine and layout strategy for large graphs, linked-note storage format, and the Markdown/wikilink export format and its compatibility guarantees.
19. OpenTelemetry-compatible instrumentation and export protocol, allowed data/destinations, user controls, retention, and threat model for telemetry egress (ADR-0019).
20. Second-brain archive schema, Markdown/wikilink compatibility, and conflict policy (FR-130); portable-backup encryption and the re-review rule for restored records are proposed in [ADR-0021](./adr/0021-encrypt-portable-knowledge-backups.md) and require product-owner acceptance before implementation.

## 18. Traceability

The [PRD](./PRD.md) defines user outcomes and functional requirements. This TRD defines proposed system responsibilities and controls. Implementation work should link each feature/task to one or more PRD requirement IDs (`FR-01` through `FR-130`) and to the relevant technical section, tests, and evidence. Changes to requirements should update both documents and any impacted ADRs.

## 19. Source references for agent practices

These official Claude Code references informed transferable product and workflow requirements. They describe Claude Code behavior; OneCode must adapt them to its own model providers, repository policy, and detected technology versions rather than assume feature parity.

- [Best practices](https://code.claude.com/docs/en/best-practices): inspect what is already in the repository, provide concrete task context and verification, keep persistent instructions concise, and use deterministic controls for requirements that must never be skipped.
- [Prompt library](https://code.claude.com/docs/en/prompt-library): outcome-focused prompts, explicit checks, project references, measurable targets, supplied artifacts, and requested output formats.
- [Common workflows](https://code.claude.com/docs/en/common-workflows): codebase exploration, bug reproduction, incremental refactoring, project-convention-aware testing, and verification.
- [Prompt caching](https://code.claude.com/docs/en/prompt-caching): stable-prefix matching, cache invalidation considerations, and provider-dependent caching behavior.

## 20. Reference repositories and specifications

The following sources informed skill packaging, plugin review, example-app evaluation, and security auditing. They are references, not trusted-by-default packages; actual imported content must be checked at a pinned revision and licensed per package.

- [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill): source-first, coverage-led defensive audits; separate candidate and final-record verifiers; schema validation; bounded budgets; and a strict rule not to run target-controlled code without OS-enforced network/filesystem/process isolation. Its README identifies the repository license as MIT.
- [Anthropic claude-quickstarts](https://github.com/anthropics/claude-quickstarts): educational application and agent examples. The autonomous-coding demo illustrates persisted feature tracking across sessions and sandbox/allowlist controls, but labels itself for internal Anthropic use; do not copy/redistribute its contents without confirming applicable rights.
- [Anthropic skills](https://github.com/anthropics/skills): demonstration skills and templates. Its README states that licensing differs across packages, including source-available document skills.
- [Agent Skills specification](https://agentskills.io/specification): portable skill directory and `SKILL.md` metadata shape, optional scripts/references/assets, validation, and progressive disclosure. Experimental fields are not assumed to be enforced uniformly.
- [Anthropic claude-plugins-official](https://github.com/anthropics/claude-plugins-official): Claude Code plugin marketplace/manifest examples. The repository warns that plugins may contain software Anthropic does not control; listing in the marketplace is not a security guarantee.

- [Graphify](https://github.com/safishamsi/graphify) (PyPI package `graphifyy`): a coding-assistant skill that builds a knowledge graph from code (syntax-tree and call-graph passes) and from documents and images (model-based concept extraction), labels edges extracted, inferred, or ambiguous, groups communities, and exports an Obsidian vault. Its self-reported token reductions range from about 1x on a six-file repository to 5.4x and 71.5x on larger mixed corpora. OneCode adopts the provenance labels, community map, and linked-note export (§5.5, §5.6), keeps concept extraction local or approval-gated, and claims no reduction factor without its own benchmark (§14.2).

The branch URLs above are discovery links. Record immutable revisions, per-package licenses, compatibility, and review status in OneCode's registry whenever a particular source is evaluated or imported.
