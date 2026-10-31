Below is an enhanced, implementation-ready PRD for **OneCode** (working name): a privacy-first, local-first AI coding platform that turns a short user request into a fully planned, implemented, tested, reviewed, and integrated change. It combines symbol-level repository intelligence, Rust-native agents, progressive MCP/tool disclosure, local model routing, and a Gauntlet-style build–critique–repair loop.

The design draws on jCodeMunch’s symbol-level retrieval (tree-sitter ASTs, exact function/class retrieval rather than whole-file reads), gstack’s code-intelligence provider abstraction and consent/egress controls, Cloudflare’s MCP Code Mode pattern of on-demand tool discovery through `search` and `execute` rather than exposing every tool upfront, and Gauntlet Loop’s builder/critic pattern with explicit quality bars and blind comparison. [github](https://github.com/jgravelle/jcodemunch-mcp)

## Product vision

**OneCode** is an AI engineering teammate that can bootstrap a new application or deeply understand an existing repository, then execute user intents—design, plan, implement, fix, audit, review, refactor, document, or test—through a governed multi-agent pipeline.

Its differentiator is **context-efficient autonomy**: it indexes code once, retrieves only the precise symbols and evidence needed, discovers only the tools/MCPs relevant to the task, runs most work on local models, and escalates selectively to frontier models only when local quality gates fail or the task justifies it.

## Goals and non-goals

### Goals

- Deliver working, integrated changes from short natural-language prompts.
- Operate fully offline for code understanding, planning, implementation, testing, and review where models and tools permit.
- Minimize token consumption through symbol retrieval, context bundles, and progressive tool disclosure.
- Support local runtimes: Ollama, vLLM, LM Studio, llama.cpp, and OpenAI-compatible endpoints.
- Support frontier-model escalation without making cloud access mandatory.
- Produce durable project assets: architecture docs, `AGENTS.md`, coding rules, tests, memory, indexes, runbooks, and audit trails.
- Make every agent action observable, reversible, permissioned, and reproducible.

### Non-goals for v1

- Fully autonomous production deployment without human approval.
- Training or fine-tuning foundation models.
- Replacing CI/CD, issue trackers, cloud IDEs, or design systems.
- Guaranteeing frontier-model-quality output from small local models in every case; the system instead uses routing, verification, and escalation to maximize success probability.

## Primary users

| User | Core need |
|---|---|
| Solo developer | Turn an idea or bug report into a working change with minimal prompt engineering |
| Small team | Maintain consistent architecture, tests, review standards, and documentation |
| Enterprise developer | Keep source and secrets local while using approved external tools/models |
| Platform/agent builder | Extend the system with local skills, MCP servers, model providers, and custom agents |

## Core workflow

The user may type something as simple as:

> “Add team invitations to my SaaS app.”

OneCode expands this into a governed pipeline:

1. **Ingest and classify intent** — determine whether the request is design, planning, implementation, bug fixing, audit, review, refactor, migration, documentation, or a hybrid.
2. **Repository onboarding** — if new, scaffold the project; if existing, index it and generate/refresh project intelligence.
3. **Context assembly** — retrieve relevant symbols, dependencies, tests, docs, conventions, prior decisions, and UI patterns.
4. **Requirement enhancement** — clarify ambiguity, infer acceptance criteria, propose UX/mock direction, identify risks, and generate a structured implementation brief.
5. **Plan and decompose** — create a task graph with dependencies, affected files, test strategy, rollout plan, and rollback plan.
6. **Implement** — Rust-native coding agents edit code in sandboxed worktrees using local coding models.
7. **Verify** — run static analysis, type checks, unit/integration/E2E tests, builds, linters, security scans, and optionally browser-based validation.
8. **Critique and repair** — independent critic agents compare output against explicit quality bars and acceptance evidence; the loop continues until the work passes or a human intervenes.
9. **Escalate selectively** — if local models cannot satisfy the bar, send a tightly scoped, redacted context package to a frontier model.
10. **Integrate and deliver** — create a clean branch, commit, PR description, changelog, docs, migration notes, and a human-readable change report.

Gauntlet Loop’s central idea—builder and separate critic pairs, concrete quality bars, blind comparison, and looping until the work wins—is used as the platform’s default quality engine. [github](https://github.com/robonuggets/gauntlet-loop)

## System architecture

### High-level components

| Layer | Component | Responsibility |
|---|---|---|
| Interface | Desktop app, IDE extension, CLI, web UI | Chat, task approval, diffs, agent timelines, test results |
| Orchestration | Rust orchestrator | Intent routing, DAG execution, retries, budgets, approvals |
| Intelligence | Repo Intelligence Service | Parsing, indexing, embeddings, graph, retrieval, impact analysis |
| Agent runtime | Rust agent kernel | Sandboxed agents, tool calls, MCP, worktrees, checkpoints |
| Model router | Local/Cloud Model Router | Selects models by task, cost, privacy, latency, and quality |
| Tool fabric | MCP Gateway + Skills Registry | Progressive tool/skill/MCP discovery and invocation |
| Quality | Gauntlet Engine | Quality bars, critics, tests, evidence, repair loops |
| Memory | Project Memory Service | Decisions, preferences, failures, patterns, run history |
| Delivery | Git/PR/CI integration | Branches, commits, PRs, CI status, release notes |

### Why Rust

Rust is the preferred implementation language for the agent kernel, indexer, sandbox, file watcher, MCP gateway, and model-router control plane because it provides strong concurrency, memory safety, low startup overhead, and easy distribution as a single native binary. The agent runtime should expose a stable plugin ABI or IPC protocol so Python/TypeScript skills and MCP servers can still be used without making the core dependent on them.

## Repository Intelligence

### Indexing pipeline

On repository load, OneCode performs:

1. **Repo scan** — detect languages, frameworks, package managers, monorepos, build systems, test frameworks, CI configuration, and generated-code paths.
2. **Ignore resolution** — honor `.gitignore`, `.ignore`, custom policies, lockfiles, vendored dependencies, binaries, and secrets.
3. **AST extraction** — use tree-sitter to extract files, modules, functions, classes, methods, constants, imports, routes, components, schemas, and tests.
4. **Symbol store** — retain signatures, qualified names, summaries, byte offsets, documentation, call relationships, and source snippets.
5. **Dependency graph** — build import, call, type, data-flow, route, API, database, and component graphs.
6. **Embeddings** — generate local embeddings for code, docs, issues, ADRs, tests, and UI flows.
7. **Hybrid retrieval index** — combine BM25/keyword search, vector search, symbol search, graph traversal, and recency signals.
8. **Project profile** — infer architecture, conventions, test patterns, naming rules, error-handling style, state management, API patterns, and design tokens.

jCodeMunch demonstrates the value of this approach: symbol-level retrieval can dramatically reduce tokens compared with grep-and-read workflows by returning exact functions, classes, and scoped context bundles. [github](https://github.com/jgravelle/jcodemunch-mcp)

### Retrieval modes

| Mode | Use case | Output |
|---|---|---|
| Symbol lookup | “Where is invoice tax calculated?” | Exact function/class plus minimal callers/callees |
| Impact analysis | “What breaks if I change this schema?” | Transitive callers, tests, migrations, API contracts |
| Feature context | “Add SSO to the app” | Relevant auth, session, user, route, UI, config, and test symbols |
| Bug context | “Login intermittently fails” | Error paths, logs, related tests, recent changes, suspicious diffs |
| Design context | “Redesign settings page” | Components, design tokens, layout patterns, accessibility rules |
| Audit context | “Find unsafe SQL usage” | Query construction sites, ORM usage, validation, test coverage |

### Incremental updates

- File watcher triggers incremental reindexing.
- Git events update commit, branch, blame, and change-history metadata.
- Symbol-level diffs update only affected AST nodes and graph edges.
- Full reindex is available after major dependency, language, or structural changes.
- Index artifacts are content-addressed and cache-friendly.

## Agent architecture

### Agent roster

| Agent | Local/default model class | Responsibility |
|---|---|---|
| Orchestrator | Small local reasoning model | Understands intent, routes tasks, controls budgets and approvals |
| Repo Cartographer | Embedding + small LLM | Builds/updates project profile and retrieval plans |
| Prompt Architect | Small/mid local LLM | Rewrites user intent into a high-quality coding brief |
| Product/UX Designer | Vision-capable local model or external design model | Produces UX flows, wireframes, accessibility requirements, mock specs |
| Planner | Mid local reasoning model | Creates implementation DAG, acceptance criteria, and test plan |
| Coder | Local coding model, e.g. Qwen3-Coder | Produces patches, new files, migrations, and tests |
| Test Engineer | Local coding model | Writes and repairs tests, fixtures, mocks, and E2E scenarios |
| Static Reviewer | Rule engine + small LLM | Checks style, architecture, security, performance, and conventions |
| Runtime Critic | Local reasoning model + execution results | Reviews failures, logs, screenshots, coverage, and diffs |
| Security Auditor | Local model + scanners | Finds injection, authz, secrets, dependency, and supply-chain risks |
| Escalation Curator | Small local model | Builds minimal, privacy-safe frontier-model request |
| Integrator | Local coding model | Resolves conflicts, updates docs/changelog, prepares PR |

Qwen3-Coder-30B-A3B is a suitable local coding default: it is a 30B-total/3.3B-active MoE model with long-context support and an agentic-coding/tool-calling orientation; quantized variants are available through Ollama, while vLLM/SGLang can serve it through OpenAI-compatible APIs. [ollama](https://ollama.com/library/qwen3-coder:30b-a3b-q8_0)

### Agent execution model

- Each agent runs in an isolated Rust task with its own context budget, tool allowlist, timeout, retry policy, and audit log.
- Agents communicate through typed artifacts, not free-form chat: `Intent`, `ContextBundle`, `Plan`, `PatchSet`, `TestReport`, `Critique`, `EscalationRequest`, and `DeliveryPackage`.
- All code changes occur in a git worktree or ephemeral sandbox.
- The orchestrator owns merge authority; no agent writes directly to the user’s working branch without approval.
- Every agent invocation records model, prompt hash, retrieved context IDs, tool calls, outputs, cost, latency, and decision rationale.

## Prompt enhancement pipeline

The platform should never send a raw user sentence directly to a coding model.

### Intent normalization

The Orchestrator classifies:

- **Goal type:** create, modify, fix, refactor, audit, review, test, document, migrate, deploy-prep.
- **Scope:** file, module, feature, cross-cutting concern, whole app.
- **Constraints:** deadline, compatibility, performance, accessibility, security, platform, browser support.
- **Ambiguities:** missing data model, unknown auth model, unclear UI behavior, undefined success criteria.
- **Risk level:** low, medium, high, critical.

### Clarification policy

OneCode asks questions only when the answer materially changes implementation. Otherwise it makes explicit assumptions and labels them.

Example:

> “I assume invitations are email-based, expire after 7 days, and require an existing workspace admin. I will use your existing `users`, `workspaces`, and `audit_logs` tables. Confirm or edit these assumptions.”

### Enhanced coding brief

The Prompt Architect produces a structured brief containing:

- User goal and success definition
- Product/UX requirements and acceptance criteria
- Architecture constraints and affected subsystems
- Exact code context: symbols, interfaces, schemas, tests, and snippets
- Repository conventions and anti-patterns to avoid
- Test matrix and definition of done
- Security, privacy, accessibility, performance, and observability requirements
- Rollback and migration plan
- Explicit quality bars

## UX, design, and mock generation

For UI-facing work, the UX agent produces:

- User stories and jobs-to-be-done
- Screen inventory and navigation changes
- Low/high-fidelity wireframes or structured UI specs
- Component reuse plan based on the existing design system
- Responsive behavior and breakpoints
- Accessibility requirements: keyboard navigation, ARIA, contrast, focus order, screen-reader labels
- Empty, loading, error, permission-denied, and success states
- Visual regression baselines
- Design-token and theming changes

The design output is attached to the coding brief as structured JSON plus rendered previews, not merely prose.

## Local skills and MCP gateway

### Skills

A **skill** is a versioned, local capability package containing:

- Manifest: name, version, inputs, outputs, permissions, required models, required tools
- Prompt/playbook: reusable procedure for an agent
- Scripts or binaries: optional deterministic helpers
- Tests and examples
- Metadata: cost, risk, supported languages, compatibility

Examples:

- `rails-api-feature`
- `react-form-with-validation`
- `postgres-migration`
- `accessibility-audit`
- `security-review`
- `performance-profile`
- `release-notes`
- `browser-e2e`
- `monorepo-impact-analysis`

### MCP gateway

The MCP Gateway is a local control plane in front of MCP servers, local tools, cloud tools, and skills. It follows Cloudflare’s progressive-disclosure idea: rather than injecting every tool definition into the model context, it exposes a small discovery interface and lets the agent retrieve or invoke only relevant capabilities. [blog.cloudflare](https://blog.cloudflare.com/enterprise-mcp/)

Core gateway tools:

- `tool_search(query, task_context)` — returns ranked relevant tools, skills, and MCP operations
- `tool_describe(tool_id)` — returns schema, examples, permissions, side effects, and cost
- `tool_invoke(tool_id, arguments)` — executes an approved call
- `tool_plan(task)` — recommends a minimal toolset for a task
- `tool_audit()` — returns invocation and egress history

### Advisor / Tool Selector

A local **Tool Advisor** model decides what the coding agent needs:

- Analyzes the enhanced brief and plan.
- Searches the tool catalog using embeddings, keywords, past success, and project history.
- Selects the minimum viable toolset.
- Explains why each tool was selected.
- Requests approval for risky, paid, external, or write-capable tools.
- Keeps unused tools out of the model context.

Example: for “add Stripe checkout,” it may select `stripe-docs-search`, `stripe-test-mode`, `http-fetch`, `postgres-migrate`, and `browser-e2e`, but not GitHub, Slack, Figma, or cloud-deploy tools.

### Permission model

| Permission | Examples | Default |
|---|---|---|
| Read repo | Read files, index, search | Allowed |
| Write repo | Edit, create, delete files | Sandbox by default |
| Execute local | Run tests, builds, linters | Policy-based |
| Network local | localhost model APIs | Allowed with policy |
| Network external | Package registries, APIs, cloud LLMs | Explicit approval |
| Secrets access | Env vars, credentials, cloud tokens | Never exposed to models by default |
| Destructive | Delete branches, force push, drop data | Explicit confirmation |

## Model strategy

### Local-first routing

The Model Router chooses models by:

- Task type: embedding, planning, coding, review, vision, summarization
- Context size
- Privacy classification
- Latency and hardware constraints
- Historical quality for similar tasks
- Token/cost budget
- User preference and policy

### Model tiers

| Tier | Examples | Used for |
|---|---|---|
| Embedding | Local Gemma/Qwen/BGE-style embedding models | Semantic retrieval, clustering, duplicate detection |
| Fast local | 3B–8B instruct models | Classification, summarization, tool selection, lightweight edits |
| Coding local | Qwen3-Coder, DeepSeek-Coder variants, CodeLlama-family | Patch generation, tests, refactors |
| Reasoning local | Qwen, Llama, Mistral, Gemma variants | Planning, critique, architecture analysis |
| Vision local | Qwen-VL-class or similar | Screenshots, mockups, UI comparison |
| Frontier | Claude, GPT, Gemini, or other approved APIs | Hard architecture, ambiguous requirements, final one-shot rescue |

Qwen3-Coder supports long-context repository-scale workflows and is available through common local runtimes including Ollama, LM Studio, llama.cpp, vLLM, and SGLang. [ollama](https://ollama.com/dengcao/Qwen3-30B-A3B-Instruct-2507)

### Escalation policy

Frontier escalation is triggered when:

- Local implementation fails the quality bar after a configured number of repair cycles.
- The task involves high architectural ambiguity.
- The local model repeatedly produces invalid tool calls or broken patches.
- The user explicitly requests maximum quality.
- A critical security, migration, or concurrency issue requires stronger reasoning.

The escalation payload is minimized:

- Task brief
- Relevant symbols and snippets
- Failing test output
- Prior patch diffs
- Critic findings
- Explicit constraints
- No secrets, credentials, unrelated source, or unapproved telemetry

## Quality engine: Gauntlet-style loop

### Quality bars

For every task, OneCode proposes 2–3 concrete, verifiable quality bars. Following the Gauntlet Loop pattern, these are named references or measurable checks rather than vague goals such as “high quality.” [github](https://github.com/robonuggets/gauntlet-loop)

Examples:

- “Match the interaction pattern of the existing `SettingsProfile` page.”
- “All new endpoints have request validation, authorization tests, and integration tests.”
- “Lighthouse accessibility score does not regress below 95.”
- “No new TypeScript errors; test coverage for changed lines is at least 85%.”
- “The feature works in the browser E2E flow from invitation to acceptance.”

### Builder/critic separation

- **Builder agents** produce the implementation.
- **Critic agents** never edit code directly.
- Critics receive the quality bar, acceptance criteria, evidence, and output—but not the builder’s self-assessment.
- Critics return structured findings: blocker, major, minor, advisory.
- The orchestrator converts blockers into repair tasks.

### Verification matrix

| Check | Examples |
|---|---|
| Static | Formatting, linting, type checking, dead code, complexity |
| Unit | New/changed logic, edge cases, error paths |
| Integration | API, database, queue, cache, auth flows |
| E2E | Browser flows, CLI workflows, mobile flows where relevant |
| Visual | Screenshot comparison, responsive checks |
| Accessibility | Axe-style scans, keyboard navigation, ARIA validation |
| Security | SAST, secret scanning, dependency audit, injection checks |
| Performance | Benchmark, bundle size, query count, latency regression |
| Contract | OpenAPI/GraphQL/schema compatibility |
| Documentation | README, ADR, API docs, changelog |

### Loop policy

- Default maximum: 5 local repair cycles.
- Each cycle must produce new evidence; identical failures halt the loop.
- After repeated local failure, the system either escalates or asks the user.
- Critical failures—security, data loss, broken build, failing existing tests—pause autonomous progress.
- The loop exits only when acceptance evidence passes or the user stops it.

## Project bootstrap

When a user starts a new app or loads an existing repository, OneCode runs **Project Genesis**:

1. Detect or choose stack, package manager, language version, and target platforms.
2. Create repository structure and baseline configuration.
3. Install approved dependencies.
4. Configure formatting, linting, type checking, testing, CI, and Git hooks.
5. Generate `AGENTS.md` with agent-specific operating rules.
6. Generate coding standards and architecture rules.
7. Create initial ADRs for major decisions.
8. Build initial test scaffolding and CI workflow.
9. Generate project memory: goals, constraints, naming conventions, preferred libraries, forbidden patterns.
10. Index the repository and create the vector/graph/symbol stores.
11. Register local skills and MCP servers.
12. Produce a “repo readiness report” before coding begins.

For an existing repo, Genesis runs in **observe-only mode** first: it profiles the codebase, identifies conventions, detects risks, and proposes rules without modifying files.

## Memory system

### Memory types

| Type | Contents | Lifetime |
|---|---|---|
| Project memory | Architecture, conventions, domain glossary, constraints | Repository lifetime |
| Task memory | Plan, decisions, failed attempts, test evidence | Task lifetime |
| User memory | Preferred stack, review style, approval preferences | User-controlled |
| Episodic memory | Past successful/failed implementations and lessons | Searchable history |
| Organizational memory | Shared standards, approved libraries, security policies | Team/workspace |

### Memory safeguards

- Memories are source-linked and editable.
- Contradictions trigger review rather than silent overwrite.
- Sensitive data is redacted before persistence.
- Users can inspect, export, delete, or disable memory.
- Memory retrieval is retrieval-based, not indiscriminate context stuffing.

## Security and privacy

- **Local-first default:** code, embeddings, indexes, logs, and memory remain on-device unless the user enables external services.
- **Secret vault:** secrets are injected at tool-execution time and never placed in prompts or model context.
- **Redaction:** emails, tokens, API keys, PII, and customer data are detected and masked before external escalation.
- **Egress receipts:** every external request records destination, purpose, data classes, model, timestamp, and approval.
- **Sandboxing:** agents run with filesystem, network, process, and Git permissions scoped to the task.
- **Supply-chain controls:** dependency additions require policy checks, license review, vulnerability scanning, and user approval.
- **MCP governance:** only approved MCP servers are reachable; gateway logs every discovery and invocation. Cloudflare similarly emphasizes centralized portals, audit controls, progressive disclosure, and gateway-based visibility for MCP traffic. [blog.cloudflare](https://blog.cloudflare.com/enterprise-mcp/)
- **Prompt-injection defense:** untrusted web, issue, documentation, and MCP content is labeled untrusted and cannot silently alter permissions or execute tools.

## Developer experience

### Interfaces

- **Desktop app:** full dashboard, agent timeline, diffs, tests, browser preview, model manager.
- **IDE extension:** VS Code/JetBrains/Neovim integration for inline tasks and review.
- **CLI:** scriptable commands for CI and automation.
- **Local web UI:** browser-based control center for remote workstations or homelab deployments.

### Example CLI

```bash
forge init .
forge index --watch
forge ask "Add team invitations with email verification"
forge plan --show-dag
forge implement --auto-test --max-cycles 5
forge review --security --a11y --performance
forge pr --draft
```

### Task views

- **Mission Control:** current goal, plan DAG, agent status, blockers.
- **Context Inspector:** exactly which files, symbols, memories, and tools were selected.
- **Diff Theater:** file-by-file and semantic diffs.
- **Evidence Board:** tests, screenshots, logs, coverage, benchmarks, critic verdicts.
- **Cost/Privacy Panel:** local vs cloud usage, tokens, latency, egress events.
- **Time Machine:** every checkpoint, prompt, patch, and rollback point.

## Feature backlog

### v1 must-have

- Repo onboarding and incremental indexing
- Symbol/graph/vector hybrid retrieval
- Rust orchestrator and sandboxed agent runtime
- Local model adapters for Ollama, vLLM, LM Studio, llama.cpp
- Prompt Architect and Planner agents
- Coder, Test Engineer, and Critic agents
- Git worktree isolation and checkpoint/rollback
- Local MCP gateway with progressive tool disclosure
- Skill registry and Tool Advisor
- Static checks, unit/integration tests, build validation
- Gauntlet-style quality loop
- Basic UI/UX mock and accessibility generation
- `AGENTS.md`, coding rules, memory, and project profile generation
- Desktop app and CLI
- Audit log, approval prompts, secret redaction

### v1.5

- Browser automation and visual regression
- PR creation, CI integration, and review-response workflows
- Monorepo-aware impact analysis
- Multi-model ensemble generation and best-patch selection
- Local fine-tuning/LoRA workflow for project-specific conventions
- Team-shared policies and skill marketplace
- Design-system ingestion from Figma or local design files
- Performance profiling and benchmark regression detection

### v2

- Distributed agent execution across multiple machines
- Org-wide code knowledge graph
- Autonomous issue triage and scheduled maintenance agents
- Policy-as-code governance for enterprise deployments
- Agent-generated ADRs and architecture simulations
- Cross-repo refactoring
- Offline mobile/desktop app scaffolding
- Self-improving skill library based on verified successful runs

## Success metrics

| Metric | Target |
|---|---|
| One-shot accepted implementation rate | ≥70% on curated benchmark tasks |
| Task completion without human code edits | ≥80% for medium-complexity features |
| Median local context tokens per coding task | ≤25% of naive whole-file context approach |
| Existing-test regression rate | 0 tolerated on merge-ready output |
| Time from prompt to verified PR | Under 15 minutes for standard features on capable hardware |
| Cloud escalation rate | Configurable; target below 20% for routine tasks |
| Secret exposure incidents | Zero |
| User approval friction | No more than one approval for routine low-risk tasks |

## Technical design principles

1. **Retrieve, don’t dump.** Give agents the smallest sufficient, evidence-linked context.
2. **Plan before code.** No implementation begins without a task graph and acceptance criteria.
3. **Verify before claiming done.** “Done” means tests, build, review, and quality bars pass.
4. **Separate creation from judgment.** Builders build; critics judge.
5. **Escalate narrowly.** Send the minimum necessary context to the strongest model only when justified.
6. **Make autonomy observable.** Every decision, tool call, and patch is inspectable.
7. **Prefer reversible actions.** Worktrees, checkpoints, migrations, and dry-runs precede destructive operations.
8. **Treat tools as privileged capabilities.** Discovery is cheap; invocation is governed.
9. **Design for local hardware variability.** Provide model profiles for low-VRAM, workstation, and multi-GPU setups.
10. **Human remains in command.** Autonomy is bounded by policy, risk class, and explicit approvals.

## MVP build plan

### Phase 1 — Foundation, weeks 1–4

- Rust workspace: CLI, orchestrator, config, logging, telemetry
- Git worktree and checkpoint service
- Ollama/OpenAI-compatible model client
- Basic file indexing and keyword search
- Simple Planner → Coder → Tester loop
- Terminal/desktop UI prototype

### Phase 2 — Intelligence, weeks 5–8

- tree-sitter AST extraction
- Symbol store and dependency graph
- Local embedding pipeline
- Hybrid retrieval and context bundles
- Incremental indexing and file watching
- Project profile and `AGENTS.md` generation

### Phase 3 — Agency, weeks 9–12

- Rust agent kernel with typed artifacts
- MCP Gateway, skill registry, Tool Advisor
- Permission engine and sandbox policies
- Prompt Architect, UX Designer, Security Auditor, Runtime Critic
- Gauntlet quality loop and repair cycles

### Phase 4 — Productization, weeks 13–16

- Desktop app polish, diff review, evidence board
- Browser E2E and visual validation
- PR/CI integrations
- Model router policies and cost controls
- Benchmark suite and evaluation dashboard
- Packaging for macOS, Windows, and Linux

## Open decisions

- Default embedding model and vector store: local SQLite + `usearch`/`qdrant` embedded versus a standalone local vector service.
- Agent communication: in-process Rust actors versus local gRPC/JSON-RPC services.
- UI stack: Tauri + React/Svelte versus native Rust UI.
- First supported stacks: TypeScript/React/Node, Python/FastAPI, Go, Rust, Ruby on Rails, or Java/Spring.
- Frontier-provider abstraction: direct APIs versus an OpenAI-compatible local proxy.
- License and commercial model: open-core, source-available, or proprietary.

This PRD positions the product not as “another coding agent,” but as a **local-first software engineering operating system**: it understands the repository, assembles the right context and tools, plans rigorously, builds with local models, proves the result with evidence, and escalates only when necessary.