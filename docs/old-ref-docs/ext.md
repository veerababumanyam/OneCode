Adding an upstream **Collaborative Ideation & Spec-Sign-Off Plane** and a downstream **Kanban-Driven Full-SDLC Agent Pipeline** elevates OneCode from an implementation engine into an end-to-end **Agentic Software Delivery Lifecycle (SDLC) Operating System**.

To integrate this into OneCode’s Rust-native, local-first architecture without introducing cloud lock-in or context bloat, the platform can be expanded into four governed macro-stages using established Rust crates and agentic frameworks (`Loro`/`Iroh`, `BMAD`, `OpenSpec`, `vibe-kanban`, and `gstack`).

---

### Project Creation: Two Distinct Discovery Paths

When creating a project, users choose the process that fits the material they have. These are separate workflows, not steps that every project must combine. Either path produces reviewed project context that can enter PRD/TRD synthesis and the same downstream SDLC gates.

* **Team discussion and ideation:** Teams develop an idea collaboratively through discussion, whiteboarding, sticky notes, architecture diagrams, and discovery activities. They can start with an early-stage idea and use specialist agents to identify gaps, explore options, and shape it into requirements. Prepared documents are not required for this path.

* **Artifact-led project intake:** Users upload prepared requirements and supporting artifacts. OneCode analyzes those materials as the primary source, preserves source provenance, distinguishes confirmed requirements from assumptions and open questions, and flags conflicts for resolution. Chat is available to explain context or answer questions about the artifacts; it is supplementary, not a required team-discussion process.

* **Separate review and handoff:** Each path has its own discovery experience and produces a project brief and requirements for user review. Once reviewed, either can proceed to PRD/TRD synthesis. Teams may choose to use both paths for a project, but the system should not require them to be combined.

* **Shared SDLC approval gate:** Regardless of discovery path, the existing stakeholder sign-off remains mandatory before task decomposition or coding begins.

---

### 1. Stage 1: Multi-Team Whiteboarding & Ideation Plane (Local-First Canvas)

To provide a Miro-like infinite canvas, sticky-note brainstorming, and architecture diagramming experience that remains local-first and privacy-preserving, OneCode can embed a collaborative canvas directly into its `Tauri v2` Desktop and Web UI:

* **Conflict-Free State Synchronization (`Loro` or `Yrs` CRDTs):** Instead of relying on a centralized cloud database, board state (sticky notes, freehand sketches, flowcharts, comment threads, and voting tallies) is backed in Rust by **`Loro`** (a high-performance Rust CRDT library built on the Fugue algorithm supporting JSON, rich text, and movable tree hierarchies) or **`Yrs`** (the Rust port of Yjs). Every brainstorm edit is version-controlled locally with time-travel history.


* **Serverless Multi-Team Sync (`Iroh` QUIC P2P):** When multiple teams (Product, Engineering, Design, Security, Legal) collaborate across workstations, `Loro` state deltas sync directly peer-to-peer over **`Iroh`**, a Rust QUIC-native networking library with end-to-end encryption and relay fallback.


* **Ideation & Discovery Agents (`BMAD` + `gstack /office-hours`):** Teams can summon specialized non-coding agents directly onto the canvas:
* **Brainstorming & Analyst Agents (`BMAD` pattern):** Cluster sticky notes, perform competitive/market validation, identify missing edge cases, and challenge vague assumptions.


* **UX Sketch & Office-Hours Agent (`gstack` pattern):** Runs in a dedicated ideation mode that produces wireframes, user flows, and structured design briefs while strictly prohibiting premature code generation.





---

### 2. Stage 2: Automated PRD / TRD Synthesis & Multi-Stakeholder Sign-Off Gate

Once either discovery path has produced reviewed project requirements, OneCode transitions to **Spec-Driven Development (SDD)**, combining the **BMAD Method** (Breakthrough Method for Agile AI-Driven Development) with **OpenSpec** custom schemas. The synthesis uses the team's discussion outcomes or uploaded artifacts as appropriate, preserving source context so reviewers can trace requirements to their origin:

* **Document Synthesis Pipeline:**
1. **Product Brief & PRD (`PM Agent`):** Converts the reviewed requirements from the selected discovery path—team discussion outcomes, uploaded artifacts, or both when the team chooses—into a formal **Product Requirements Document (PRD)** containing functional/non-functional requirements, user stories, acceptance criteria, and measurable success metrics.


2. **TRD & ADRs (`Architect Agent`):** Combines the PRD with OneCode’s `Repo Intelligence Service` (`tree-sitter` + `Tantivy` + `sqlite-vec`) to produce a **Technical Requirements Document (TRD)** and **Architecture Decision Records (ADRs)** detailing data models, API contracts, component blast radius, and technology trade-offs.


3. **Compliance, Security & Ops Annexes (`Specialist Reviewers`):** Security, Legal, and Day-2 Ops agents attach threat models, data-privacy/license constraints, and SLO/observability requirements to the TRD.


* **Hard Sign-Off Gate (`gstack` Decision Brief Protocol):** No task decomposition or coding can begin until required human stakeholders sign off. Using `gstack`’s decision-brief format, unresolved trade-offs are surfaced with stable identifiers (`D.1`, `D.2`), dual effort estimates (`human-team time` vs. `AI agent execution time`, such as `human: ~2 days / AI: ~15 min`), and explicit pros/cons. Because approving a PRD/TRD is a "one-way door" that triggers multi-agent compute, the gate requires explicit typed confirmation (cryptographically logged in SQLite) from designated Product, Architecture, and Security/Legal leads.



---

### 3. Stage 3: Automated Kanban Generation & Git-Worktree Task Orchestration

Immediately upon final PRD/TRD sign-off, OneCode automatically generates the execution board and assigns role-specific agent pipelines, modeling its workflow on **`BloopAI/vibe-kanban`**, **`Batty`**, and **`Beads`**:

* **Context-Embedded Story Decomposition (`Scrum Master Agent`):** Following the `BMAD` Scrum Master pattern, an agent decomposes the signed-off PRD/TRD into a dependency-ordered Directed Acyclic Graph (DAG) of epics and Kanban story cards. Each card embeds its exact slice of the PRD/TRD, target symbol byte offsets, and Gauntlet quality bars so downstream coding agents never lose architectural context.


* **Dependency-Aware Kanban State Machine (`To Do -> In Progress -> Review -> UAT/Compliance -> Done`):** Using a dependency graph tracker (similar to `Beads`), OneCode automatically identifies unblocked stories and dispatches them to available agent workers.


* **Zero-Conflict Git Worktree Isolation (`vibe-kanban` Strategy):** Moving a Kanban card to `In Progress` automatically triggers `forge-sandbox` in Rust to create a dedicated branch (e.g., `forge/card-104-invite-api`) and an isolated **Git worktree** with its own sandboxed terminal and local dev server. Five or ten specialist agents can build frontend, backend, and database features in parallel with zero file-locking or merge collisions.



---

### 4. Stage 4: Coordinated Multi-Agent Coding, UAT, Legal & Day-2 Ops Pipeline

Inside the execution phase, the Rust `Orchestrator` coordinates specialized role pipelines across two tiers—**Domain Builders** and **End-to-End Governance Critics**:

| SDLC Phase | Specialist Agent Role | Model & Tool Routing in OneCode | Produced Artifacts & Gate Criteria |
| --- | --- | --- | --- |
| **1. Architecture & Advisory** | **Orchestrator, PM, Tool Advisor & Architect Agents** | `DeepSeek-R1-Distill-14B` (reasoning) + `Repo Intelligence` (`get_blast_radius`) + `MCP Gateway` (`tool_plan`)

 | Per-card execution sub-DAG, minimum viable MCP tool allowlist, and cross-card API/schema contract locks.

 |
| **2. Parallel Domain Implementation** | **Database, Backend/API & Frontend/UI Agents** | `Qwen3-Coder-30B-A3B` (via `vLLM` continuous batching at `c8`) + `Qwen3-VL` (vision) in isolated Git worktrees

 | SQL migrations, OpenAPI/GraphQL handlers, UI components matching design tokens, and unit/integration tests.

 |
| **3. Quality, Evals & Browser UAT** | **Test Architect, Eval & Browser UAT Agents** | Stage A CI runner + Stage B fresh-context `Gauntlet Critic` + sandboxed Chromium/Aside browser

 | Automated test reports, LLM prompt/eval benchmarks, live browser E2E walkthrough screenshots, and visual diffs.

 |
| **4. Security, Standards & Legal** | **Security Auditor, Standards & Legal/IP Agents** | `kingfisher-scanner` (SIMD secrets) + AST anti-pattern sweeps (`search_ast`) + license/SBOM policy engine

 | SARIF security report, SQL/trust-boundary diff sign-off, dependency license clearance (e.g., blocking non-commercial `CC BY-NC` assets), and `egress.jsonl` receipts.

 |
| **5. Day-2 Ops & Release** | **Release Manager & Day-2 Ops (SRE) Agents** | Local coding/reasoning model + `gstack` ship-deploy-canary workflow templates

 | OpenTelemetry metrics/tracing hooks, migration rollback scripts, on-call runbooks, changelog, and merge-ready PR.

 |

### Architectural Impact on OneCode's Rust Workspace

To support this end-to-end flow, the `forge-rs` Cargo workspace would add two new crates alongside the existing seven:

1. **`forge-canvas`:** Embeds `loro` (CRDT state) and `iroh` (encrypted P2P sync) to persist whiteboard nodes, comments, and PRD/TRD sign-off state machines locally.


2. **`forge-kanban`:** Manages the DAG story board, maps Kanban column transitions to `forge-sandbox` Git worktree creation/cleanup (`git worktree add/prune`), and coordinates multi-agent handoffs between Domain Builders and UAT/Security/Legal/Ops gates.



Would you like me to do a more in-depth research instead and propose a research plan?