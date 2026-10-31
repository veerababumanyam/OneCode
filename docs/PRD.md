# OneCode Product Requirements Document

**Status:** Draft  
**Product name:** OneCode (working name)  
**Audience:** Product, engineering, design, security, and QA  
**Source:** [Reference document](./old-ref-docs/prd-ref.md)
**Companion:** [Technical Requirements Document](./TRD.md), [Agent operating rules](./AGENT-OPERATING-RULES.md), [Engineering standards](./ENGINEERING-STANDARDS.md), [ADR index](./adr/README.md)

## 1. Product summary

OneCode is a local-first AI coding application that helps developers take a software change from an initial request through repository understanding, requirements, planning, implementation, verification, review, and delivery. Its desktop workbench combines repository-aware assistance with source editing, a governed terminal, an isolated local app preview, visual annotations, Git workflows, and reviewable evidence.

The product supports both new-project bootstrap and work in existing repositories. Local models and local tooling are the default; external model or tool use is optional, approval-gated, minimized, and auditable.

OneCode is a coding application, not only a task runner. The user and the agents share one workspace with the same surfaces: a code editor, an integrated terminal, a built-in browser for preview and annotation, source control, diagnostics, tests, and running processes. Agents observe those surfaces within explicit limits and act on them through the same permission policy that governs every tool; the user can watch, interrupt, steer, and take over at any point.

## 2. Vision and value

**Vision:** Make a software engineering task understandable, safely executable, and verifiably complete from one governed workspace.

OneCode's value is not merely generating code. It coordinates the coding lifecycle while preserving developer control:

- Understand the repository before proposing a change.
- Turn requests into testable acceptance criteria and an ordered plan.
- Make changes in an isolated, reversible workspace.
- Verify changes with project-appropriate checks and independent review.
- Show the user the context, tools, decisions, risks, and evidence behind the result.

## 3. Problem statement

Developers using general-purpose coding assistants often have to supply repository context manually, translate vague requests into implementation plans, run checks themselves, and determine whether generated code is safe to integrate. This is inefficient for established projects and can lead to missed conventions, incomplete tests, unreviewed changes, or accidental disclosure of source code.

OneCode addresses this by combining repository intelligence, a structured development lifecycle, bounded agent autonomy, local-first execution, and evidence-based completion.

## 4. Product principles

1. **Retrieve, don't dump:** use the smallest sufficient, source-linked repository context.
2. **Plan before code:** implementation starts only after scope, acceptance criteria, and a task plan are available.
3. **Verify before claiming done:** completion requires recorded evidence, not an agent assertion.
4. **Separate building from judging:** critics assess independently and do not edit the implementation.
5. **Keep autonomy observable:** show plans, selected context, tool activity, diffs, and verification results.
6. **Prefer reversible actions:** isolate changes and checkpoint before risky operations.
7. **Protect user data by default:** local execution is the default; external egress is explicit and auditable.
8. **Keep the human in command:** consequential, destructive, external, or high-risk actions require approval.
9. **Adapt practices to the project:** discover the actual stack, versions, configuration, and established patterns; do not impose a generic coding template on every repository.
10. **Enforce invariants in the product:** prompts guide agents, while deterministic policy and verification enforce rules that cannot be optional.
11. **Reuse before rebuilding:** prefer maintained, compatible open-source components for commodity capabilities; reserve custom implementation for OneCode-specific policy, orchestration, contracts, and user experience where reuse does not meet the requirements.

## 5. Users and needs

| User | Needs |
|---|---|
| Solo developer | Turn feature ideas and bug reports into tested changes without extensive prompt engineering. |
| Small engineering team | Apply consistent architecture, coding, testing, review, and documentation practices. |
| Enterprise developer | Keep source and secrets local and enforce approved models, tools, and policies. |
| Agent/platform builder | Extend the product with model providers, tools, MCP servers, skills, and custom policies. |

## 6. Goals and non-goals

### 6.1 Goals

- Support create, modify, fix, refactor, audit, review, test, document, and migration-preparation tasks.
- Onboard new or existing repositories and build incrementally maintained project intelligence.
- Generate structured requirements, plans, code changes, tests, and delivery summaries.
- Provide an integrated desktop workbench for editing project files, running approved commands, previewing local apps, and attaching visual feedback to tasks.
- Support safe local Git workflows and optional, explicitly approved GitHub issue, pull-request, push, and CI interactions.
- Run suitable workflows offline when local models and tools are available.
- Support local model runtimes including Ollama, vLLM, LM Studio, llama.cpp, and compatible endpoints.
- Offer optional external model escalation without making cloud use mandatory.
- Make user approvals, tool invocations, external data egress, and agent changes auditable.
- Support a desktop application and CLI in the initial product scope; additional interfaces can follow.
- Provide the everyday surfaces of a coding application in the desktop app: editor, file explorer and search, integrated terminal, built-in browser with annotations, source control, problems, tests, and process management.
- Turn any visible problem (terminal error, failing test, diagnostic, browser annotation, review comment) into an evidence-backed fix task in one action.
- Let the user and agents work concurrently in the same workspace with clear attribution, interruption, and steering.

### 6.2 Non-goals for the initial release

- Deploying to production without human approval.
- Training foundation models or guaranteeing frontier-model quality from every local model.
- Replacing source control, CI/CD, issue tracking, or design platforms.
- Running unbounded agents or granting agents unrestricted access to the user's working branch, network, or secrets.
- Supporting every language, framework, or model provider at launch.

## 7. Core user journey

Example request: “Add team invitations with email verification.”

1. **Submit:** the user selects a repository and enters a request.
2. **Classify:** OneCode identifies task type, likely scope, constraints, and risk.
3. **Understand:** repository scanning and retrieval identify conventions, relevant symbols, dependencies, tests, project instructions, toolchain configuration, and prior decisions.
4. **Adapt:** build or refresh a source-linked coding standards profile for the detected applications, languages, framework versions, and repository areas; mark missing or conflicting guidance.
5. **Clarify:** ask only questions whose answers materially change the solution; otherwise record explicit assumptions.
6. **Specify:** produce a brief with user outcomes, acceptance criteria, UX states when relevant, risks, and quality bars.
7. **Plan:** create a dependency-aware task graph, affected-area estimate, task-appropriate engineering workflow, test strategy, and rollback considerations.
8. **Approve:** obtain required approvals for write, network, paid, destructive, or high-risk actions.
9. **Implement:** agents receive only the applicable project rules and workflow, then work in an isolated branch/worktree and create reviewable patches.
10. **Verify:** run detected or configured formatters, static checks, tests, builds, and task-relevant browser, accessibility, security, or performance checks.
11. **Critique and repair:** independent reviewers evaluate the change against the brief, project standards, and evidence; bounded repair cycles address findings.
12. **Deliver:** present the diff, standards/check results, evidence, and remaining risks; prepare local Git changes and, when configured, an explicitly approved GitHub push or pull request.
13. **Learn:** with user-controlled memory settings, retain source-linked project conventions and task outcomes.

The journey does not always start with a typed request. A terminal error, a failing test, a diagnostic, a browser annotation, or a review comment can start a fix task with its evidence already attached (§10.12), and the user can watch and steer every step from the editor, terminal, and browser they are already using (§10.11, §10.13).

## 8. Coding and product development lifecycles

OneCode must support the user's end-to-end software development lifecycle (SDLC), not only code generation.

| Lifecycle stage | OneCode behavior | Completion evidence |
|---|---|---|
| Discover and intake | Classify the request, identify stakeholders and constraints, inspect available issue/context links. | Task intent and scope recorded. |
| Resolve project standards | Detect the affected stack versions, repository rules, applicable official guidance, local examples, and mandatory checks. | Path-scoped Coding Standards Profile with provenance and conflicts. |
| Requirements | Capture user value, assumptions, functional requirements, non-functional needs, and acceptance criteria. | Reviewable brief; unresolved material questions surfaced. |
| Design | Identify affected components, interfaces, data changes, UX states, and alternatives. | Design/technical notes and risk assessment. |
| Plan | Decompose work into ordered tasks with dependencies, ownership, estimates/budgets, and test strategy. | Approved or policy-authorized task graph. |
| Implement | Apply small, scoped patches in an isolated workspace; inspect and edit source in the workbench; follow repository conventions. | Diff, checkpoints, and traceability to tasks. |
| Test and verify | Run approved checks in managed terminal sessions; launch local previews and inspect relevant browser evidence. | Command results, test reports, annotated screenshots, and acceptance evidence. |
| Observe and fix | Capture evidence from the terminal, browser, tests, and diagnostics; reproduce; find the root cause; add a regression test; re-verify. | Fix request with before/after evidence. |
| Review | Use independent code, security, UX/accessibility, or performance critics as relevant. | Findings with severity, evidence, and disposition. |
| Integrate and release | Prepare a local commit and, when GitHub is configured, an explicitly approved branch push/PR; leave merge and production deployment approval to the user. | Delivery summary, PR/CI links where applicable, and explicit integration status. |
| Operate and maintain | Support CI feedback, issue fixes, dependency/security review, and repository re-indexing. | Run history, follow-up actions, and updated project knowledge. |

The workflow is iterative: new evidence may send work back to requirements, design, implementation, or testing. Critical security, data-loss, broken-build, or existing-test failures pause autonomous progress.

## 9. Automatic, stack-aware engineering practices

Agents must adapt their engineering practices to the application and the exact code they are changing. “Best practices” are not one universal checklist: a monorepo may contain multiple languages and framework versions, and a safe convention in one layer may be wrong in another. OneCode resolves the applicable guidance before implementation and passes a concise, task-scoped profile to each agent.

### 9.1 What OneCode discovers

For the repository and affected workspace, OneCode inspects, where present:

- Language, framework, runtime, compiler, and relevant dependency versions using manifests, lockfiles, tool-version files, and project configuration.
- Workspace and package boundaries, build scripts, formatter/linter/type-check settings, test runners, CI gates, and supported platform targets.
- Scoped repository instructions and architectural/security policies.
- Existing production code and tests that establish local naming, error-handling, state-management, API, UI, and testing patterns.
- Applicable, version-matched official technical documentation when available and permitted by the network policy.

OneCode uses evidence rather than guessing. It records source paths, detected versions, confidence, documentation links and review dates, unsupported areas, and conflicting recommendations. In a multi-stack repository, it resolves standards per affected package or path rather than applying the root stack everywhere.

### 9.2 How practices are selected

Each task receives a compact **Coding Standards Profile** that separates:

1. **Non-negotiable controls:** product, security, privacy, and organization policies enforced by the application.
2. **Project rules:** scoped repository instructions, architecture decisions, configured checks, and explicit team conventions.
3. **Stack-specific guidance:** applicable official documentation matched to the detected tool/library version and supported runtime.
4. **Local examples:** relevant source and tests that demonstrate compatible existing patterns.
5. **Task-specific practices:** additional requirements chosen for the task, such as migration safety, accessibility, performance, API compatibility, or regression coverage.

Do not silently treat existing code as correct when it conflicts with a security policy, configured check, known deprecated API, or verified compatibility constraint. Surface material conflicts, explain the evidence and options, and ask when the choice affects behavior or compatibility. Never invent version-specific guidance: mark it unverified and use confirmed project checks/patterns or request direction.

Security/privacy policy and organization-mandated controls cannot be overridden by a task prompt. The user's requested outcome guides the task within those controls; repository rules and supported-version requirements define project compatibility. Official version-matched guidance helps assess correctness, but conflicts with existing project practices must be surfaced rather than silently resolved.

### 9.3 Task-appropriate workflows and prompting

Prompts and workflows are generated from the task type rather than copied as a static prompt for all work:

- **New feature:** inspect analogous code and interfaces, establish acceptance criteria, plan the smallest vertical slice, implement, test, and review.
- **Bug fix:** collect reproduction steps and error evidence, trace the execution path, add a reproducing test where feasible, fix the root cause, and run regression checks.
- **Refactor:** establish behavior-preserving tests, make incremental changes, and validate equivalence and compatibility.
- **Testing:** inspect existing test organization and fixtures, test behaviors and boundary/error cases, run the focused tests, then relevant regression checks.
- **Repository exploration:** summarize architecture and conventions with evidence; do not edit files unless implementation is requested.
- **Documentation or delivery:** inspect current behavior and source, then update the relevant documentation/PR artifacts and verify links or checks where applicable.

Each generated brief should state the desired outcome, relevant repository evidence, acceptance criteria, constraints, measurable target where applicable, verification commands/results, and requested output format. Prompts are guidance, not enforcement: product policy, permissions, and quality gates must enforce requirements that cannot be skipped.

### 9.4 Product acceptance

- Every coding agent receives the standards that apply to its assigned files and task, not a generic project-wide dump.
- Agents use the project's supported APIs, configured tools, existing test patterns, and compatibility requirements unless the user approves a justified change.
- A standards profile shows its evidence, scope, version match, confidence, and unresolved conflicts in the Context Inspector.
- Policy violations and failed mandatory checks block merge-ready status; preferences and advisory recommendations are reported without being misrepresented as hard gates.

## 10. Functional requirements

Priority definitions: **P0** is required for the initial usable release; **P1** is a near-term follow-up; **P2** is a later capability.

### 10.1 Repository onboarding and intelligence

- **FR-01 (P0):** Detect repository languages, frameworks, package managers, build/test systems, monorepo structure, generated paths, and relevant configuration.
- **FR-02 (P0):** Respect `.gitignore`, `.ignore`, configured exclusions, and secret/binary/vendor exclusions during indexing.
- **FR-03 (P0):** Provide keyword and file-level search; retain indexing status and errors.
- **FR-04 (P0):** Extract syntax-aware symbols and relationships using parsers such as tree-sitter.
- **FR-05 (P0):** Provide hybrid retrieval across symbols, keywords, dependency relationships, and recency, adding embeddings when a local embedding model is available; repository onboarding and non-embedding search must remain useful without one.
- **FR-06 (P1):** Incrementally refresh affected index entries after file and Git changes; support explicit full re-indexing.
- **FR-07 (P0):** Existing repositories begin in observe-only mode; profile and propose changes without modifying project files.

### 10.2 Task lifecycle and agents

- **FR-08 (P0):** Classify requests by goal, scope, constraints, ambiguity, and risk.
- **FR-09 (P0):** Produce a structured task brief with assumptions, acceptance criteria, affected areas, and test strategy.
- **FR-10 (P0):** Present a plan before implementation; represent prerequisite relationships explicitly.
- **FR-11 (P0):** Run edits in a task-scoped worktree or equivalent isolated sandbox and preserve checkpoints.
- **FR-12 (P0):** Use typed artifacts between agents, including intent, context bundle, plan, patch set, test report, critique, and delivery package.
- **FR-13 (P0):** Enforce per-agent context, tool, time, retry, and resource budgets.
- **FR-14 (P0):** Show task status, blockers, agent activity, and any required user decision.
- **FR-15 (P0):** For UI-facing tasks, produce a basic design brief covering affected screens, component reuse, responsive behavior, accessibility, and key interface states; specialized visual critique is P1.

### 10.3 Tools, skills, and permissions

- **FR-16 (P0):** Discover only task-relevant tools and skills; expose descriptions and schemas before invocation.
- **FR-17 (P0):** Apply least-privilege permissions to repository reads/writes, process execution, network access, secrets, and destructive operations.
- **FR-18 (P0):** Require explicit approval for external network/model calls, paid tools, destructive Git/database actions, and policy-designated high-risk operations.
- **FR-19 (P0):** Record tool discovery, invocation, approval, outcome, and external egress in an inspectable audit history.
- **FR-20 (P0):** Support a versioned local skill registry with declared task triggers, inputs, outputs, permissions, dependencies, compatibility, provenance, and license; validate a skill before making it available to agents.
- **FR-46 (P1):** Support an Agent Skills-compatible package format and adapters for supported agent/plugin ecosystems; load skill metadata first, task instructions only on activation, and referenced resources only when needed.
- **FR-47 (P1):** Treat imported skills, plugins, scripts, MCP servers, and quickstart code as untrusted until individually reviewed; show publisher, immutable source revision, license, declared capabilities, and risks, and require explicit user approval before enabling or executing them.
- **FR-48 (P1):** Pin imported package sources to an immutable commit or release, check license and dependency policy, scan executable content, and provide update diff, rollback, disable, and removal controls.

### 10.4 Models and privacy

- **FR-21 (P0):** Route tasks using task type, context limits, privacy policy, latency, quality history, hardware, and cost constraints.
- **FR-22 (P0):** Support local model runtimes for Ollama, vLLM, LM Studio, and llama.cpp through an extensible provider interface.
- **FR-23 (P0):** Keep external model use disabled unless configured and approved.
- **FR-24 (P0):** Redact secrets and sensitive data before approved external escalation; send only task-relevant context and record an egress receipt.
- **FR-25 (P1):** Support model profiles for low-resource, workstation, and multi-GPU environments.
- **FR-56 (P0):** Provide a local model catalog that lists the bundled default embedding model (FR-123) and compatible alternatives hosted on Hugging Face; show each model's intended role, source, pinned revision, license, supported runtime/format, download size, and estimated hardware needs.
- **FR-57 (P0):** Download a catalog model only after an explicit user action and any required network approval; pin the artifact revision, verify its integrity against trusted catalog metadata before loading, report failures, and never execute model-supplied code.
- **FR-58 (P0):** Generate and query repository embeddings locally, associate each index with its model revision and embedding configuration, and preserve keyword/symbol retrieval when embeddings are unavailable. Do not send repository content to Hugging Face or another external service to generate embeddings.
- **FR-59 (P0):** Let users inspect model and index status, download progress, storage/resource estimates, selected model, and controls to switch models, rebuild or delete an index, and remove downloaded models; do not download models automatically.
- **FR-60 (P0):** Evaluate embedding-assisted retrieval against a documented keyword/symbol baseline and report relevance, query latency, indexing time, peak resource use, hardware, and model revision; do not claim a general performance improvement without benchmark evidence.
- **FR-61 (P1):** Support optional local reranking of retrieved files or symbols, with explicit model/resource requirements and measured relevance-versus-latency trade-offs.
- **FR-62 (P1):** Support optional local models for prompt/task classification and codebase summarization as separate capabilities from embeddings; neither capability may grant permissions or bypass deterministic task and tool policy.
- **FR-63 (P1):** Use semantic retrieval to suggest relevant tool and skill candidates when enabled; similarity scores may rank candidates but must never authorize or invoke a tool, change its permissions, or replace gateway policy.

### 10.5 Verification, review, and delivery

- **FR-26 (P0):** Run configured formatter/linter, type or compile checks, tests, and build checks relevant to changed files.
- **FR-27 (P0):** Compare results with explicit acceptance criteria and quality bars; never report checks as passing without evidence.
- **FR-28 (P0):** Keep critics read-only and report findings as blocker, major, minor, or advisory with evidence.
- **FR-29 (P0):** Limit repair loops to a configurable maximum (default five); halt when the same failure repeats without new evidence.
- **FR-30 (P0):** Pause on critical failures, request user direction, or use approved escalation policy; do not silently bypass checks.
- **FR-31 (P0):** Present a human-readable summary including changed files, checks run, outcomes, unresolved findings, and integration status.
- **FR-32 (P1):** Prepare commits, pull requests, CI status, release notes, and review-response workflows.
- **FR-33 (P1):** Support browser-based E2E, visual regression, and accessibility verification.
- **FR-113 (P0):** Apply verification economy. Before compiling or running an expensive check, confirm prerequisites with cheap reads: target and filter, fixtures, environment variable names, working directory, feature flags, schema, and the running instance. Compile the relevant target once per material change using shared caches and stable flags; reuse the built artifact while its inputs are unchanged; treat a filter that selects zero tests as not a pass; do not rerun an unchanged failure, clean caches, switch profiles, or widen the suite to make a report look complete; and record the artifact path, filter, counts, last result, and open prerequisites so later turns reuse them. Stopping never turns an unrun or failed check into a pass.

### 10.6 Project bootstrap and memory

- **FR-34 (P0):** Bootstrap a new project with selected stack, baseline configuration, test scaffolding, and repository instructions.
- **FR-35 (P0):** Present detected/proposed stack choices and dependency changes before applying them.
- **FR-36 (P0):** Generate and refresh a source-linked, path-scoped Coding Standards Profile from detected stack versions, project configuration and instructions, established code/test patterns, and applicable version-matched official documentation.
- **FR-37 (P1):** Keep project, task, user, episodic, and organizational memory separate, source-linked, editable, and user-controlled.
- **FR-38 (P0):** Allow users to inspect, export, delete, or disable persisted memory; redact sensitive data before persistence.

### 10.7 Automatic engineering practices

- **FR-39 (P0):** Detect language, framework, runtime/toolchain versions, package/workspace boundaries, and configured quality commands from repository evidence; represent ambiguity and unsupported detection explicitly.
- **FR-40 (P0):** Build a path- and version-scoped standards profile that distinguishes mandatory controls, project rules, verified technical guidance, local examples, and task-specific practices.
- **FR-41 (P0):** Supply each agent only the standards and source evidence relevant to its assigned task and paths; expose the profile and provenance for user inspection.
- **FR-42 (P0):** Select a task-appropriate workflow for feature work, bug fixing, refactoring, tests, repository exploration, documentation, and delivery; require exploration and an explicit verification plan before edits.
- **FR-43 (P0):** Treat prompts as guidance only; enforce hard requirements through permission policy, deterministic checks, and completion gates, and report unverified or conflicting recommendations rather than claiming universal compliance.
- **FR-44 (P1):** Refresh standards profiles when relevant manifests, lockfiles, project instructions, quality configuration, or supported-version documentation changes; identify stale guidance before affected work begins.
- **FR-45 (P1):** Build stable, reusable prompt/context prefixes and append task-specific context separately; enable caching only where the selected provider/runtime supports it, report cache capability/metrics accurately, and never let cache optimization override freshness, privacy, or correctness.

### 10.8 Security-audit lifecycle

- **FR-49 (P0):** Provide a dedicated, defensive codebase security-audit workflow for authorized source, with separate reconnaissance, coverage planning, candidate discovery, independent validation, structured findings, independent record verification, and reporting stages.
- **FR-50 (P0):** Keep audit finding status distinct from severity: confirm only source-grounded findings with a demonstrated boundary and impact; classify unresolved external/runtime facts as needing validation without speculative severity; retain disproved candidates as rejected with rationale.
- **FR-51 (P0):** Maintain an auditable coverage ledger mapping examined security boundaries and checks to evidence and unresolved gaps; validate the ledger and findings against versioned machine-readable schemas.
- **FR-52 (P0):** Require a fresh independent reviewer to validate each candidate and final confirmed record; a discoverer cannot be the sole verifier of their own finding.
- **FR-53 (P0):** Execute target-controlled builds, tests, fuzzers, browsers, and fixtures only in a verified OS-enforced sandbox with no external network, sanitized allowlisted environment, resource limits, scoped scratch paths, and no credentials. If these controls are unavailable, do not execute target code and mark runtime-dependent conclusions as needing validation.
- **FR-54 (P0):** Never use this workflow to probe deployed endpoints, live services, shared infrastructure, production identities, or systems without authorization; audit source and isolated local fixtures only.
- **FR-55 (P1):** Support explicit audit depth and invocation budgets; reserve independent verification capacity before discovery, halt rather than silently exceed budgets, and mark incomplete coverage or validation explicitly.

### 10.9 Cross-platform support

- **FR-64 (P0):** Support Windows, macOS, and Linux in the initial release across the desktop app, CLI, repository onboarding/indexing, core coding lifecycle, and every initial-release model workflow, including catalog downloads, offline model import, and embedding retrieval. Run the same core acceptance suite on each supported OS and maintain a per-OS feature/runtime compatibility matrix. Provide equivalent security and permission guarantees; a platform-specific gap must be documented and approved before release, and must never silently reduce protections.

### 10.10 Offline model import

- **FR-65 (P0):** Allow users to import model bundles obtained out of band for air-gapped or restricted environments without making network requests. Import only when the user explicitly selects the bundle; verify its signed manifest against a trust root shipped with OneCode and verify every artifact hash before making the model available. Show provenance, revision, license, format, resource needs, and verification state; fail closed on missing or invalid trust metadata, unsupported formats, or integrity failures. Never execute model-supplied code.

### 10.11 Workspace surfaces: editor, terminal, browser, and source control

OneCode is a coding application. The user and the agents share one workspace, and every surface below is available to both: the user works in it directly, and agents observe and act on it only through the permission policy of §10.3 and §10.14. Every agent action on a surface is attributed and visible; every user action is attributed for history but is never treated as an agent action.

- **FR-66 (P0):** Provide a built-in code editor with syntax highlighting for supported languages, tabs and split views, go-to-file and go-to-line, find and replace, multi-cursor editing, bracket matching, folding, encoding and line-ending handling, and a safe mode for very large files. Agent edits appear in the same editor as reviewable hunks with distinct attribution; the user can accept, reject, or modify them before they leave the isolated worktree.
- **FR-67 (P0):** Provide a file explorer with ignore-aware filtering, Git status decorations, worktree indicators, and create, rename, move, and delete operations that follow the same permission policy as agents. Provide workspace search (literal and regular expression, include and exclude globs, replace with preview) and symbol search backed by the repository index.
- **FR-68 (P0):** Integrate language servers (Language Server Protocol) and compiler or type-checker output for supported stacks: inline and panel diagnostics, hover, go-to-definition, find references, rename, and quick-fix code actions. Agents receive diagnostics as structured evidence. When no language server or checker is available for a file, the state is reported as "diagnostics unavailable", never as "no problems".
- **FR-69 (P0):** Provide an integrated terminal backed by a real pseudo-terminal with multiple tabs and split panes, the user's configured shell (PowerShell, cmd, bash, zsh, fish, or a WSL distribution), full VT/ANSI rendering, scrollback with search, copy and paste, link detection to files and lines, working-directory tracking, and shell-integration marks for command start, end, and exit code. Each terminal tab is bound to a worktree so agent and user commands run in the right checkout.
- **FR-70 (P0):** Make terminal output usable as context and evidence. The user can send a selection, a command's full output, or a whole tab to the agent ("fix this", "explain this"). Agents may read only tabs they started or tabs the user explicitly shared; captured output is bounded in size, redacted for secrets, labeled as untrusted data, and stored as a `TerminalCapture` artifact linked to the task.
- **FR-71 (P0):** Render commands proposed in conversation with a run control that executes them in the integrated terminal under the current permission mode, never silently in the background. Long-running commands become tracked background processes with status, output access, and stop controls (FR-78).
- **FR-72 (P0):** Provide a built-in browser pane for previewing local development servers and approved URLs, with tabs, navigation, viewport and device presets, light/dark scheme emulation, console and network capture, DOM and accessibility-tree reading, screenshots, and element inspection. The browser uses an isolated profile per project and never shares cookies, sessions, saved passwords, or history with the user's system browser.
- **FR-73 (P0):** Let the user annotate the built-in browser: point at an element, draw a region on a screenshot, or drop a marker, and attach a comment or a "fix this" intent. An annotation records the URL, viewport, element selector path, accessibility name and role, bounding box, a summary of computed styles, a screenshot crop, console errors present at capture time, and, when source mapping is available, the component, file, and line it most likely renders from, with a confidence level. Annotations are first-class task inputs and evidence items.
- **FR-74 (P0):** Turn one or more annotations into a task in one action. The agent maps each annotation to source candidates with confidence, proposes a change, applies it in the isolated worktree, reloads the preview, re-captures the same element and viewport, and presents before and after screenshots with the diff for approval. Annotations that cannot be mapped are reported as unmapped, never guessed.
- **FR-75 (P0):** Treat all page content in the built-in browser as untrusted data. Agents may navigate, read, click, type, and fill forms on local development hosts and on test environments the user has named for the project; on any other host, a mutating action (submit, purchase, delete, settings change, message send) requires per-action approval. Agents never enter credentials, payment details, or government identifiers, never read cookies, local storage, or saved passwords, and never bypass CAPTCHAs. Downloads, site permission prompts, and external protocol launches require user approval.
- **FR-76 (P0):** Provide a source control panel with working-tree status, staged and unstaged changes, per-hunk stage, unstage, and discard, commit with an editable generated message, branch and worktree lists, stash, log and blame views, and three-way merge-conflict resolution. Agent Git actions use the same operations and policy; destructive actions remain action-specific approvals (FR-18), and pushes, pull requests, and other code-host interactions remain explicitly approved.
- **FR-77 (P0):** Provide a Problems panel that aggregates diagnostics, failed checks, and critic findings with navigation to source; a test explorer that discovers the project's test runners, runs focused tests, and shows results and failures; and run configurations for the project's development servers, tasks, and launch commands.
- **FR-78 (P0):** Keep a process and port registry for every process OneCode or an agent starts: command, working directory, process identifier, listening ports, owning session, worktree, start time, and logs. Before launching a development server, watcher, database, container set, or preview server, check the registry and active listeners and reuse a running instance for the same project. Never start a second instance to get around a busy port, never move to an alternate port to bypass one, never bypass a launcher's "reuse existing" refusal, and never stop a process the user or another session started without approval. Show an explicit "instance already running" state and offer to reuse it.
- **FR-79 (P0):** Define workspace awareness: within budget and policy, an agent may observe the active editor file and selection, open editors, the Problems panel, shared terminal tabs, shared browser tabs and annotations, Git status, and the process registry. Each observation is labeled with its source and trust level, counted in the Context Inspector, and redacted for secrets. Agents never observe content outside the workspace (other applications, the system clipboard, the user's system browser) unless the user explicitly shares it.
- **FR-80 (P1):** Integrate the Debug Adapter Protocol for breakpoints, stepping, variables, and call stacks for supported stacks; agents may read debugger state as evidence when the user shares the session.
- **FR-81 (P1):** On Windows, support repositories and toolchains inside the Windows Subsystem for Linux as a first-class workspace target; support development-container definitions for reproducible toolchains. Remote SSH workspaces are P2.

### 10.12 Fix workflows

"Fix" is the most frequent coding request. OneCode makes it one action from wherever the problem is visible and runs it as a disciplined root-cause workflow, not a patch over the symptom.

- **FR-82 (P0):** Offer a "Fix" action from a terminal error, a failing test, a Problems-panel diagnostic, a browser console error, a browser annotation, a failed check in the Evidence view, and a critic finding. The action creates a `FixRequest` carrying the exact evidence (output, file and line, stack trace, screenshot, selector), the reproduction command when one is known, the originating surface, and the worktree.
- **FR-83 (P0):** Run fix tasks with a fixed discipline: reproduce the failure first when a reproduction exists; localize it with repository evidence; identify the root cause; propose the smallest change that addresses the cause; add or update a regression test where feasible; re-run the originating reproduction and relevant checks; and report before and after evidence. Critics flag symptom patches such as swallowed errors, deleted or skipped tests, widened types, disabled lint rules, or loosened assertions.
- **FR-84 (P0):** In the editor, offer quick fixes for the diagnostic under the cursor from language-server code actions and from OneCode's agent, with a preview diff before applying.
- **FR-85 (P1):** Provide an optional auto-fix mode that watches a chosen source (failing CI on the task's pull request, new review comments, a test watcher) and attempts bounded fixes in the isolated worktree within the repair-loop limits of FR-29. Every auto-fix produces a reviewable diff; nothing is pushed, posted, or merged without approval.
- **FR-86 (P1):** Import review comments from the connected code host for the task's pull request, group them by thread, and create fix tasks with the diff context. Posting replies or resolving threads requires approval.

### 10.13 Sessions, conversation, and steering

- **FR-87 (P0):** Provide sessions: a persistent conversation bound to a repository, a worktree, a permission mode (FR-96), a conversation mode (FR-90), and a model configuration. Users can create, name, list, search, resume, fork, archive, and delete sessions. Several sessions can run at once, each in its own worktree, and the Sessions list shows which are running, waiting for approval, blocked, or done.
- **FR-88 (P0):** Support steering: the user can send a message while an agent is working and the agent incorporates it at the next safe point (between tool calls); the user can interrupt (stop the current tool and wait), queue a message, or cancel the turn. Interruption preserves checkpoints, logs, and partial evidence.
- **FR-89 (P0):** Support references and attachments in conversation: `@` references to files, folders, symbols, open editors, the current selection, terminal tabs or captures, browser tabs or annotations, diagnostics, Git references or diffs, and earlier sessions; image attachments (screenshots, design mocks); and pasted text. Referenced and pasted content is data, not instructions, and is shown in the Context Inspector.
- **FR-90 (P0):** Provide three conversation modes with visible state: *ask* (read and explain, never edit), *plan* (produce a plan for approval, no edits), and *build* (implement under the session's permission mode). Mode changes are recorded; agents cannot change the mode themselves.
- **FR-91 (P0):** Show context-window usage for the session. Compact long sessions into an inspectable, editable summary that keeps links to source evidence, pending approvals, unapplied changes, and open findings; compaction never drops any of those.
- **FR-92 (P0):** Make every agent turn reversible as a unit: revert all file changes from a turn, or restore any file to a checkpoint, without touching the user's own uncommitted work outside the task worktree.
- **FR-93 (P1):** Provide built-in slash commands (for example plan, review, test, fix, compact, model, permissions) and user- or project-defined commands stored in the repository. Custom commands are prompts; they are validated, shown with provenance, and never grant permissions.
- **FR-94 (P1):** Export a session as Markdown or JSON with redaction applied, and import a transcript for support or replay. Sharing is always an explicit user action.
- **FR-95 (P1):** Let a session delegate bounded subtasks to subagents with a narrower scope, context, and tool set; results return as typed artifacts. Background sessions notify the user on completion or when they need a decision (FR-106).

### 10.14 Permission modes, rules, trust, and hooks

- **FR-96 (P0):** Provide per-session permission modes: *Ask* (approve each side-effecting action class), *Auto-edit* (edits inside the task worktree and allowlisted read-only commands run without prompts; everything else asks), *Autonomous, sandboxed* (allowlisted commands and edits run without prompts inside the OS-enforced sandbox; network, destructive, and policy-designated actions still ask), and *Read-only* (no edits or side effects). The active mode is always visible. No mode disables the approvals required by FR-18 or the protected paths of FR-100.
- **FR-97 (P0):** Let users and projects define allow, deny, and ask rules for tools and command patterns, scoped to user, project, or session and stored in versionable configuration. An approval dialog can write a rule ("always allow this command in this project"). Deny rules win over allow rules; rules can only narrow, never widen, the FR-18 set. Rule evaluation is deterministic and auditable.
- **FR-98 (P0):** Ask the user whether to trust a repository when it is opened for the first time. An untrusted workspace is observe-only: no project scripts, tasks, Git hooks, OneCode hooks, repository-provided language servers or binaries, or repository instruction files run or load until the workspace is trusted. Trust is per path, revocable, visible in the status bar, and recorded.
- **FR-99 (P0):** Support deterministic lifecycle hooks configured by the user or the project: before and after a tool call, after a file edit, before a commit, on session start and stop, on approval request, and on task completion. A hook can block an action, add context, or run formatters, linters, or checks. Hooks are listed with provenance, require workspace trust, run under the same sandbox and resource limits as agent commands, and cannot grant permissions or change policy.
- **FR-100 (P0):** Protect governing files: Git hooks, OneCode configuration, policy, permission rules, hook definitions, credential stores, and the instruction files that govern agents cannot be modified by an agent without explicit per-change approval in any mode.

### 10.15 Configuration, instructions, and personalization

- **FR-101 (P0):** Provide layered settings (user, project shared in the repository, and local per machine, ignored by Git) with documented precedence, a published JSON schema, validation errors shown in the settings editor, search, and reset-to-default. Secrets never live in settings files.
- **FR-102 (P0):** Load hierarchical, path-scoped project instruction files: a OneCode-native file plus compatibility readers for `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, and `.github/copilot-instructions.md`. Apply size limits, show provenance and the resolved instruction set in the Context Inspector, report conflicts, and treat instructions as guidance for agents, never as policy (FR-43).
- **FR-103 (P0):** Make every command reachable from a searchable command palette and bindable to keys, with defaults for Windows, macOS, and Linux, a conflict detector, and keymap presets for common editors.
- **FR-104 (P0):** Provide light, dark, and high-contrast themes that can follow the system, editor and terminal color schemes, adjustable fonts and zoom, reduced motion, and full keyboard and screen-reader operation targeting WCAG 2.2 AA.
- **FR-105 (P1):** Externalize all user-facing strings, use locale-aware formatting, and support right-to-left layout. The initial release ships English with the localization infrastructure in place.
- **FR-106 (P0):** Provide operating-system notifications for "needs approval", "blocked", "completed", and "failed"; a per-session attention state; a status bar showing session, conversation mode, permission mode, model, index, sandbox, and trust status; and do-not-disturb controls. Notification text contains no source code or secrets.
- **FR-107 (P0):** On first run, detect hardware (CPU, GPU, RAM, VRAM), installed local model runtimes and shells, recommend a model profile, explain what stays on the device, offer to import existing instruction, rule, and keybinding files, and download nothing without the FR-57 approval.
- **FR-108 (P0):** Provide a diagnostics bundle action that collects redacted logs, settings without secrets, versions, the hardware and runtime matrix, and recent task events into an archive the user can inspect before sharing. Crash reporting is opt-in and redacted.

### 10.16 Inline assistance and delivery helpers

- **FR-109 (P1):** Provide optional inline completions in the editor from a local fill-in-the-middle model under a dedicated "completion" model role with a latency budget, per-language enable and disable, and no transmission off the device unless an external provider is explicitly configured for that role.
- **FR-110 (P1):** Provide inline edit: select code, describe a change, and receive an inline diff for that range with accept and reject, using the same standards profile, checks, and policy as tasks.
- **FR-111 (P0):** Generate commit messages and pull-request descriptions from the diff and task record in the repository's detected convention; the user edits before committing; trailers and attribution are configurable.
- **FR-112 (P1):** Provide a review mode that reviews a branch, commit range, or pull request without implementing: findings with severity and evidence, optional posting as review comments with approval, and "fix this finding" as a fix task (FR-82).

### 10.17 Code knowledge graph, knowledge map, and context economy

Agents spend most of their context reading code to find out where things are and what depends on what. A queryable graph of the repository answers those questions in a few hundred cited tokens, and a linked-notes map makes the same structure visible to the user. The benefit grows with repository size: on a repository small enough to fit in the model's context it is mainly structural clarity, not token savings, and OneCode reports measured results rather than assumed ones (FR-60, §12).

- **FR-114 (P0):** Maintain a code knowledge graph derived from the repository index: files, symbols, modules, routes, schemas, tests, configuration, documentation sections, ADRs, and requirement IDs as nodes, connected by typed edges (imports, calls, references, implements, tests, documents, traces-to, and others). Every edge records its provenance as *extracted* (deterministic parsing), *inferred* (heuristic or model-derived), or *ambiguous* (several candidate targets), with method, confidence, source span, and revision. Update the graph incrementally with the index, report stale state and per-language coverage, and never present missing parser coverage as "no relationships".
- **FR-115 (P0):** Give agents read-only graph operations through the tool gateway: repository map, file skeleton (signatures without bodies), ranked symbol location with inlined excerpts, exhaustive find-all, callers and callees and other neighbors to a chosen depth, change impact (affected symbols, tests, routes, and requirement IDs), path between two nodes, and graph status. Results are cited, revision-stamped, budgeted, and state how many items a budget cut omitted. Inferred and ambiguous edges are navigation hints; agents confirm them against source before editing or citing them as evidence.
- **FR-116 (P0):** Apply progressive code disclosure when building context: repository map, then file skeleton, then symbol span, then neighbors, and a whole file only when needed. Whole-file reads are listed in the Context Inspector with their reason. The capability is initial-release scope; making graph-first context the default for a repository size class requires the benchmark in §12, and keyword/symbol retrieval remains the fallback.
- **FR-117 (P0):** Apply context economy to every model call: store large tool, command, and test output by reference and show the model a bounded excerpt with a handle it can expand; drop superseded observations from active context while keeping their handles; have agents return edits as patches rather than regenerated files; and record tokens per context layer so the Privacy and cost view can show where context went. Context economy never drops pending approvals, unapplied changes, open findings, or evidence links (FR-91).
- **FR-118 (P1):** Group the graph into named communities and produce a task-personalized repository map that fits a token budget, ranked by graph centrality around the files and symbols the task mentions. The task-independent portion is a stable, cache-eligible prompt layer (FR-45).
- **FR-119 (P1):** Provide a Knowledge map view: an interactive graph of code, communities, documents, ADRs, requirements, and memory notes, filterable by kind, community, edge provenance, and "changed in this task", with a backlinks pane for the active file or note. Selecting a node opens its source or note. Generated notes are labeled derived and refresh when their source changes; notes the user writes are never overwritten.
- **FR-120 (P1):** Store project memory (FR-37) as linked notes with links and backlinks to the code, ADRs, and requirements they describe, so agents can load a note and its neighbors instead of the whole memory store. On explicit user action, export the knowledge map as Markdown files with wikilinks that open in Obsidian-compatible tools; the export is redacted, applies index exclusions, writes outside the repository unless the user chooses otherwise, and is recorded.
- **FR-121 (P1):** Use graph impact to choose which tests run first during implementation and repair: tests linked to changed symbols, then their community, then the configured regression set. Inferred edges may add tests but never remove them; a stale or incomplete graph falls back to configured selection; the required pre-delivery checks never shrink.
- **FR-122 (P1):** Request schema- or grammar-constrained output for typed artifacts when the selected model runtime supports it, and validate every artifact regardless.
- **FR-123 (P0):** Ship a default local embedding model inside the application package so semantic retrieval works on first run without a download. The bundled model has a pinned revision, a license that permits redistribution, and artifact hashes verified at build time and again before loading; it is enabled by default, shown in the Model Library as bundled, and can be disabled or replaced by a catalog or imported model (FR-56, FR-65). If it is disabled, fails verification, or the hardware cannot run it, every feature keeps working on keyword, symbol, and graph retrieval and says that semantic retrieval is off.
- **FR-124 (P0 for retrieval, P1 for the rest):** Use the default embedding model where it measurably improves results, and only as a ranking or suggestion signal: hybrid retrieval and graph symbol location (FR-05, FR-115); semantic seeds for the personalized repository map (FR-118); suggested documentation-to-code and note-to-code links, labeled inferred and confirmed by the user before they become links (FR-114, FR-119, FR-120); near-duplicate detection for memory notes and context items; tool and skill candidate ranking (FR-63); and text matching for annotation-to-source mapping (FR-73). Each use is benchmarked against the same task without embeddings and switched off by default where it does not help. Embedding similarity never counts as evidence, never removes a test from selection (FR-121), and never authorizes anything.

Concept extraction from documents and images for the graph or map uses a local model. Using an external model for it is external egress under FR-18, FR-23, and FR-24.

## 11. User experience requirements

The initial interfaces are a desktop application and a CLI. The desktop application is a coding workspace: the user keeps editing, running, and browsing while agents work, and every agent action is visible where it happens.

### 11.1 Workspace layout

- **Navigator (left):** Explorer, Search, Source control, Sessions, Knowledge map, Models, and Settings views.
- **Center:** editor tabs and splits, diff review, and the built-in browser, in tabs or side by side.
- **Panel (bottom):** Terminal, Problems, Tests, Processes, and Output.
- **Companion (right):** the conversation with Mission Control, the Context Inspector, and the Evidence view for the active session.
- Panes are dockable, resizable, hideable, and remembered per project; the layout works on a single 1366×768 display and scales to multi-monitor use. Review and browse focus modes enlarge the center while keeping the conversation reachable.

### 11.2 Views

- **Conversation and Mission Control:** messages, the current task, plan graph, status, blockers, approval requests, conversation-mode and permission-mode switches, context usage, steering input, and queued messages.
- **Editor:** FR-66 to FR-68, with agent hunks, inline quick fixes, and attribution.
- **Terminal:** FR-69 to FR-71, with agent commands marked, run controls from conversation, and "send to agent" from a selection.
- **Browser and annotations:** FR-72 to FR-75, with an annotation toolbar, an annotation list, "create task from annotations", and before/after comparison.
- **Source control:** FR-76, including worktrees per session and conflict resolution.
- **Problems, Tests, and Processes:** FR-77 and FR-78, each with a Fix action (FR-82) and navigation to source.
- **Context Inspector:** files, symbols, memories, instructions, tools, observations, and attachments selected for the task, with reasons, trust labels, budget use, the disclosure level of each code item (map, skeleton, span, or whole file), and graph results with their edge provenance (FR-114 to FR-117).
- **Knowledge map:** the interactive graph and backlinks view of FR-119, reachable from the navigator and from any file, symbol, ADR, or requirement ID; it opens on the current task's neighborhood rather than the whole repository, keeps the editor responsive, and has empty (no index yet), loading, stale, and partial-coverage states.
- **Diff review:** file-level and semantic changes with accept, reject, and edit per hunk; turn-level revert.
- **Evidence view:** check output, test results, screenshots and recordings, coverage, benchmarks, critic findings, and command status, each linked to the artifact that produced it.
- **Privacy and cost view:** local versus external usage, model, token and cost estimates, latency, and egress receipts.
- **Model Library:** model role, bundled or downloaded origin, source/revision/license, hardware and disk estimates, explicit download and offline-import controls, signature/hash verification state, progress, selected model per role, and repository-index status/rebuild/delete controls.
- **History and recovery:** task checkpoints, decision history, turn-level revert, and rollback affordances.
- **Sessions:** the list of sessions with state, worktree, and attention indicators.
- **Settings, rules, and hooks:** the layered settings editor, permission rules, hooks, workspace trust, instruction files, and keybindings.
- **Status bar and command palette:** always-visible state (FR-106) and global command access (FR-103).

### 11.3 Experience rules for a coding application

1. **Keyboard first.** Every workflow is operable without a pointer; the palette exposes every command.
2. **Never block the user.** Agent work never locks the editor, terminal, or browser; the user can type, run, and browse while the agent works, and can interrupt or take over at any point.
3. **State is always visible.** Session state, conversation mode, permission mode, model, sandbox, trust, index freshness, and running processes are visible without opening a dialog.
4. **Attribution is unambiguous.** Agent edits, commands, and browser actions are visibly distinct from the user's.
5. **Approvals are precise and batched.** An approval names the exact action, scope, and risk, offers "remember for this project" where safe, and groups the routine mechanics of one plan node into one decision; high-risk approvals are never batched away.
6. **Evidence before claims.** Status text never says "passed" or "fixed" without a linked artifact.
7. **Every surface has empty, loading, error, permission-denied, offline, and success states**, and the editor, terminal, and browser keep working when no model is available.
8. **Latency budgets** (§12) are product requirements; slow operations show progress and are cancellable.
9. **Accessible by default:** focus order, labels, contrast, reduced motion, and screen-reader announcements for status changes.
10. **Respect the project's rules and the user's time:** no second dev server, no surprise downloads, no silent network, no unrequested cleanup.

For UI-affecting tasks, requirements must include screen/navigation changes, component reuse, responsive behavior, accessibility, and empty/loading/error/permission/success states. The interactive prototype in [docs/design/onecode-experience](./design/onecode-experience/README.md) illustrates Mission Control, review, context, Model Library, and history; it predates the workspace surfaces in §10.11 and must be extended rather than treated as the complete layout. Browser-based end-to-end and visual-regression verification of the user's application (FR-33) remains P1; the built-in browser, its annotations, and the annotation-to-fix loop (FR-72 to FR-75) are initial-release scope.

## 12. Non-functional requirements and success measures

| Measure | Target or requirement |
|---|---|
| One-shot accepted implementation rate | At least 70% on a curated, representative benchmark. |
| Medium-task completion without human code edits | At least 80%; define task-size and acceptance rubric before evaluation. |
| Context efficiency | Median local context tokens at or below 25% of a documented whole-file baseline for comparable tasks. |
| Tokens and turns per accepted task | Report for whole-file, keyword/symbol, and graph-assisted context on the same versioned task set, by repository size class; graph navigation ships enabled by default only where it lowers tokens or turns without lowering acceptance or raising regressions. |
| Graph query latency | Proposed: p95 under 200 ms for map, skeleton, locate, and one-hop neighbor queries on the reference repositories, measured per OS; confirm or reset from measured reference-hardware baselines. |
| Graph freshness | Graph updates complete within the index-freshness budget; a query against a stale graph says so. |
| Existing-test regression | Zero tolerated for merge-ready output; failures must block or be explicitly classified as pre-existing. |
| Time to verified PR | Under 15 minutes for standard tasks on capable hardware; report hardware and task mix. |
| Routine cloud escalation | Configurable; target below 20% for routine tasks. |
| Secret exposure | Zero incidents; any detected exposure blocks external submission. |
| Routine approval friction | No more than one approval for routine, low-risk tasks; never remove required high-risk approvals. |
| Standards-profile coverage | 100% of implementation tasks have an applicable profile or an explicit “unknown/unverified” report before code edits. |
| Mandatory-practice compliance | Zero unresolved violations of deterministic project/security gates for merge-ready output. |
| Audit finding integrity | 100% of confirmed audit findings pass schema and independent source-evidence validation; incomplete runs are never reported as complete. |
| Local retrieval quality and cost | Compare embedding-assisted retrieval with a versioned keyword/symbol baseline; report relevance, p50/p95 query latency, indexing time, peak memory, disk use, model revision, and test hardware. Set release thresholds from measured supported-device baselines rather than claiming embeddings are always faster or better. |
| Startup to interactive | Under 2 seconds warm and 5 seconds cold on the reference hardware profile, measured per OS, excluding model-runtime start. |
| Editor responsiveness | p95 keystroke-to-render under 16 ms for files up to 10,000 lines; large-file mode above a documented threshold. |
| Terminal throughput | Sustain 10 MB/s of output without UI stalls; scrollback and capture limits documented. |
| Annotation round trip | Under 5 seconds from "create task from annotations" to a task with mapped source candidates on the reference project. |
| Index freshness | p95 incremental re-index under 1 second per changed file on the reference repositories. |
| Application memory | App shell idle under a documented ceiling per OS, reported per component and excluding model runtimes. |
| Browser isolation | Zero sharing of cookies, sessions, passwords, or history with the system browser, verified by automated test. |
| Process hygiene | Zero duplicate development-server instances started by OneCode for the same project in the acceptance suite. |
| Reliability | Persist task state and recover safely after process restart or model/tool failure. |
| Accessibility | Keyboard-operable workflows, clear focus, screen-reader labels, and accessible status/error feedback. |
| Initial-release OS support | Windows, macOS, and Linux pass the same core acceptance suite for desktop, CLI, repository indexing, coding lifecycle, and initial-release model workflows; publish per-OS runtime/capability differences, obtain approval for release exceptions, and do not weaken security controls to force parity. |

Targets are product goals, not claims about current implementation. Benchmark definitions, baselines, and hardware profiles must be versioned to make results comparable.

## 13. Release scope and roadmap

### Initial release

- Repository onboarding, incremental indexing, syntax-aware symbols, dependency relationships, and hybrid retrieval.
- Local model adapters for Ollama, vLLM, LM Studio, and llama.cpp; request classification, planning, coding, and testing loop.
- A bundled default embedding model, active on first run (FR-123), and its use in hybrid retrieval and graph symbol location (FR-124 P0 scope); user-controlled catalog downloads for compatible alternatives, plus offline import of out-of-band model bundles with signed-manifest and artifact-integrity verification; local embeddings augment hybrid retrieval, with keyword/symbol fallback and a documented retrieval benchmark.
- Isolated workspaces, checkpoint/rollback, permissions, audit log, and redaction.
- Automatic, evidence-linked stack detection, project coding standards, and task-specific agent workflows.
- Local tool/skill discovery with approval-gated invocation and progressive disclosure.
- Defensive source-code security audits with coverage ledgers, isolated execution, independently verified findings, and explicit incomplete status.
- Desktop/CLI workflow for task state, diffs, checks, and delivery summary.
- Initial-release support for Windows, macOS, and Linux, including tested desktop/CLI packages, the same core acceptance suite, and a published OS-specific model/runtime and capability matrix.
- Bounded quality loop and pause-on-critical-failure behavior.
- Workspace surfaces: editor, explorer and search, language intelligence, integrated terminal with capture and run-from-conversation, built-in browser with preview, annotations, and the annotation-to-fix loop, source control panel, Problems, Tests, and the process and port registry (FR-66 to FR-79).
- Fix-from-evidence workflow and editor quick fixes (FR-82 to FR-84).
- Sessions with steering, conversation modes, context management, and turn-level revert (FR-87 to FR-92).
- Permission modes and rules, workspace trust, lifecycle hooks, and protected paths (FR-96 to FR-100).
- Layered settings, instruction-file compatibility, command palette and keybindings, theming and accessibility, notifications, onboarding, diagnostics bundle, and commit/PR message generation (FR-101 to FR-104, FR-106 to FR-108, FR-111).
- Verification economy for every check run (FR-113).
- Code knowledge graph, agent graph operations, progressive code disclosure, and context economy (FR-114 to FR-117).

### Follow-up releases

- **v1.5:** optional local reranking, prompt/task classification and codebase summarization models, semantic tool/skill candidate discovery, browser E2E and visual checks, CI/PR integration, monorepo impact analysis, team policies, design-system ingestion, performance profiling; debugger integration, WSL and dev-container workspaces, auto-fix mode and review-comment import, slash and custom commands, transcript export, subagents and background sessions, inline completions and inline edit, review mode, and localization (FR-80, FR-81, FR-85, FR-86, FR-93 to FR-95, FR-105, FR-109, FR-110, FR-112); communities and the personalized repository map, the Knowledge map view, linked-note memory with Obsidian-compatible export, graph-assisted test selection, and constrained structured output (FR-118 to FR-122), and the remaining measured uses of the default embedding model (FR-124 P1 scope).
- **v2:** distributed agent execution, organization-wide code graph, scheduled maintenance, cross-repository refactoring, policy-as-code, offline app scaffolding, remote SSH workspaces, and, as a candidate pending its own product review, the collaborative ideation canvas and Kanban-driven delivery pipeline sketched in [old-ref-docs/ext.md](./old-ref-docs/ext.md).

The phase and sequencing proposal is detailed in the [TRD](./TRD.md).

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Inaccurate repository understanding | Show evidence and source links; retain indexing errors; use project checks and user review. |
| Unsafe or over-broad tool use | Least privilege, progressive disclosure, approval gates, sandboxing, and audit records. |
| Sensitive code leaves the device | Local-first default, external egress approval, payload minimization, redaction, and receipts. |
| Local models produce invalid patches | Validate patches, run checks, use independent critics, bound retries, and offer selective escalation. |
| The bundled embedding model inflates the installer, cannot be redistributed, or runs poorly on low-end hardware | Choose it in ADR-0006 against license, size, and hardware-floor criteria; verify it at build and load; let users disable or replace it; keep keyword, symbol, and graph retrieval complete without it. |
| Downloaded or imported models are incompatible, tampered, expensive, or degrade retrieval | Require trusted signed metadata and artifact hashes, disclose size and hardware needs, reject unsupported formats, benchmark against a non-embedding baseline, bind indexes to model revisions, and keep acquisition and model switching user-controlled. |
| OS-specific gaps delay release or weaken security parity | Validate all three OSes from the first vertical slice, maintain native CI and a capability matrix, and disable a capability with a clear explanation when an OS cannot provide its required security guarantees. |
| Agent loops waste time or repeat failures | Per-task budgets, cycle caps, repeated-failure detection, and clear stop reasons. |
| Broad initial scope delays delivery | Deliver a thin end-to-end workflow first; defer advanced retrieval, browser, team, and distributed features. |
| Metrics are gamed or incomparable | Version task sets and baselines; measure evidence-backed acceptance and regression, not agent self-report. |
| The built-in browser widens the attack surface (untrusted pages, prompt injection, credential exposure) | Isolated profile per project, page content treated as data, local-host classification, per-action approval for mutating actions off local hosts, no credential or payment entry by agents, blocked dangerous link patterns, approval for downloads and site permissions. |
| Terminal access gives agents shell power | OS sandbox per permission mode, allow/deny rules, protected paths, visible attribution, kill switch, bounded and redacted captures, no secret echo. |
| Annotation-to-source mapping is wrong | Confidence levels and multiple candidates, confirmation against source before editing, before/after re-capture, unmapped annotations reported rather than guessed. |
| Language servers and development servers compete with local models for memory | Hardware profiles, per-service resource budgets, the process registry with one instance per project, explicit "unavailable" states instead of silent degradation. |
| Agents treat inferred graph edges or generated notes as facts | Provenance on every edge and note, inferred edges shown as hints, confirmation against source before editing, and critics that reject citations to inferred edges. |
| Graph construction or the map view slows the app | Incremental, hash-keyed updates inside the re-index budget; precomputed layouts and on-demand note loading; graph features can be disabled without losing keyword/symbol retrieval. |
| OneCode rebuilds commodity UI, parsing, visualization, protocol, or telemetry components | Evaluate maintained libraries against requirements, licenses, accessibility, platform support, security, and performance before implementing equivalents; keep OneCode-specific policy and trust boundaries in owned code. |
| Token savings are claimed but not real | Benchmark tokens and turns per accepted task against the whole-file and keyword/symbol baselines by repository size class before enabling by default. |
| Repository-provided hooks, scripts, or instruction files act as a supply-chain vector | Workspace trust before anything repository-provided runs, protected paths, sandboxed hooks, instructions treated as guidance with provenance shown. |

## 15. Open product decisions

- Initial supported language/framework set.
- Whether and how platform WebView differences affect desktop UX and accessibility parity under the accepted Tauri/React architecture (ADR-0003).
- Exact default bundled embedding model (redistribution license, package size, hardware floor, and per-OS runtime), supported Hugging Face artifact formats, offline bundle format, and trusted-signing-key lifecycle.
- Ordering of optional local reranking, classification, summarization, and semantic tool-discovery capabilities after the embedding MVP.
- Minimum supported OS versions and the per-OS availability of local model runtimes and OS-enforced sandbox features.
- Licensing and commercial model.
- Team policy administration and sharing model.
- Editor engine and how the document model is shared between the user, agents, and language servers.
- Terminal emulator and pseudo-terminal implementation per OS.
- Built-in browser engine: platform WebView versus a bundled Chromium with a DevTools protocol, given annotation, console, and network-capture needs and per-OS parity.
- Language-server distribution: bundled, user-installed, or repository-provided under workspace trust.
- Hook, rule, and custom-command definition formats and their compatibility with other agent tools' formats.
- Code knowledge graph storage, community algorithm, and repository-map ranking; knowledge map rendering and the Markdown/wikilink export format.
- Whether users enable OpenTelemetry export, which destinations/data are allowed, and what retention controls apply; external telemetry remains disabled by default and approval-gated.

## 16. Definition of product readiness

The initial product is ready for a controlled release when:

- A user can onboard a supported repository and submit an end-to-end coding task.
- The task brief, plan, context selection, permissions, changes, and check results are inspectable.
- Changes are isolated, reversible, and never silently written to the user's active branch.
- Required checks and critical-failure gates cannot be bypassed by an agent.
- External egress is off by default, approval-gated, redacted, and auditable.
- Windows, macOS, and Linux meet the initial-release feature and security bar, with platform-specific limitations and minimum OS versions documented.
- Benchmark results, known limitations, supported environments, and recovery behavior are documented.
- The editor, terminal, browser, and source-control surfaces complete the core acceptance scenario on each OS, including a terminal-error-to-fix flow and an annotation-to-fix flow with before/after evidence.
- Workspace trust, protected paths, permission modes and rules, hooks, and the one-instance process rule are enforced and covered by tests.

## 17. Source references for agent practices

The following official Claude Code documentation informed reusable prompting, workflow, project-instruction, and prompt-caching requirements. These sources describe Claude Code behavior; OneCode must adapt general principles to its own model providers and must not assume provider-specific features are universal.

- [Best practices](https://code.claude.com/docs/en/best-practices): inspect what is already in the repository, give tasks concrete context and a way to verify, keep always-on project guidance concise, and distinguish probabilistic model instructions from deterministic enforcement.
- [Prompt library](https://code.claude.com/docs/en/prompt-library): outcome-focused prompts, explicit verification, relevant project references, measurable targets, provided artifacts, and requested response format.
- [Common workflows](https://code.claude.com/docs/en/common-workflows): repository exploration, bug reproduction, incremental behavior-preserving refactoring, tests based on project conventions, and verification.
- [Prompt caching](https://code.claude.com/docs/en/prompt-caching): prefix-based caching behavior, stable context ordering, cache misses on changes such as model switches, and provider-dependent cache location/behavior.

## 18. Reference repositories for reusable capabilities

These repositories are design and evaluation references, not trusted-by-default dependencies. OneCode may learn workflow and packaging patterns from them, but must independently implement, validate, and license-review any capability it adopts.

| Reference | Relevant design input | OneCode constraint |
|---|---|---|
| [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill) | Staged source reconnaissance, coverage ledger, coverage critics, independent candidate/final-record verification, schema-validated findings, explicit `confirmed` / `needs_validation` / `rejected` states, and a strict sandbox boundary. The repository README identifies its license as MIT. | Use only for authorized defensive source audits; no live target probing. Confirm the sandbox capabilities before execution; do not promote unresolved claims or silently report incomplete coverage as complete. |
| [Anthropic claude-quickstarts](https://github.com/anthropics/claude-quickstarts) | End-to-end sample applications and agent patterns. The autonomous-coding quickstart demonstrates persistent feature tracking and sessions; its README also describes an OS sandbox, filesystem restrictions, and a shell allowlist. | Treat examples as educational/reference implementations rather than production-ready code. Check the exact subdirectory license and dependencies; the autonomous-coding demo labels itself for internal Anthropic use, so do not copy or redistribute it without confirming rights. |
| [Anthropic skills](https://github.com/anthropics/skills) and the [Agent Skills specification](https://agentskills.io/specification) | Portable skill directories with metadata/instructions and optional scripts, references, and assets; progressive disclosure can keep always-on context small. The repository says licensing varies: many skills are Apache-2.0, while document skills are source-available, not open-source. | Validate the actual skill and its license individually. Skill instructions are model guidance, not enforcement. `allowed-tools` is experimental in the format and must not be treated as a cross-runtime permission guarantee. |
| [Anthropic claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Plugin marketplace metadata and package layout for manifests, MCP configuration, commands, agents, and skills; demonstrates source pinning and immutable plugin identifiers. The repository warns that plugins may include software Anthropic does not control. | Marketplace listing/curation is not a security guarantee. Inspect the source, revision, permissions, dependencies, and license before enabling any plugin; adapter support does not imply Claude Code compatibility. |
| [Graphify](https://github.com/safishamsi/graphify) | Knowledge graph built from code syntax trees and call graphs plus model-extracted concepts from documents and images; extracted, inferred, and ambiguous edge labels; communities; Obsidian vault export. Its self-reported token reduction ranges from about 1x on a six-file repository to 71.5x on a large mixed corpus. | Adopt the provenance labels, community map, and linked-note export (FR-114 to FR-120). Concept extraction stays local unless approved as egress. Claim no reduction factor without OneCode's own benchmark. |

Reference repositories and their default branches can change. OneCode's implementation should record the precise revision and license actually reviewed rather than relying on a mutable repository URL.

## 19. Related documents

- [TRD](./TRD.md): architecture and technical requirements, including the code knowledge graph and knowledge map (§5.5, §5.6), context economy (§6.7), graph-assisted check selection (§9.6), workspace services (§3.4), the session model (§4.2), workspace awareness (§6.5), the fix workflow engine (§6.6), permission modes, hooks, and trust (§8.5 to §8.7), and verification economy (§9.5).
- [Agent operating rules](./AGENT-OPERATING-RULES.md): the numbered, enforced rules every agent runs under, with enforcement points and tests.
- [Engineering standards](./ENGINEERING-STANDARDS.md): how OneCode itself is built, tested, reviewed, and released.
- [ADR index](./adr/README.md): recorded decisions, the template, and the decisions still to be made.
- [Implementation plan](../tasks/plan.md) and [task list](../tasks/todo.md).
