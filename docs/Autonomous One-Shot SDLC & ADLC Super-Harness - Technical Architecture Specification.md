# **Autonomous One-Shot SDLC & ADLC Super-Harness**

**Autonomous Software Lifecycle Execution Engine • OneCode-Aligned Reference Proposal (v2.0; non-normative)**  
---

> **Status and precedence:** This is supplemental reference material, not an approved OneCode architecture or a source of product requirements. The [PRD](./PRD.md), [TRD](./TRD.md), accepted [ADRs](./adr/README.md), and [agent operating rules](./AGENT-OPERATING-RULES.md) govern. When this proposal conflicts with them, those documents win; no permission, dependency, role, workflow, target, or autonomy level below is adopted without the owning document and required approvals. “One-shot” means one user-requested end-to-end task lifecycle, not unattended execution or a single model turn.

# **1\. Executive Summary & Architectural Philosophy**

Modern AI-assisted software development suffers from four structural bottlenecks:

* **Routine decision overhead:** Repeated prompts for ordinary in-scope choices slow work; required approvals still protect consequential actions.  
* **Context Window Pollution & Token Burn:** Agents can waste context on repeated broad reads and noisy tool outputs instead of source-linked, task-relevant retrieval.  
* **Self-Grading Drift & Hallucination:** Agents that evaluate their own code inflate quality scores and drift away from architectural constraints over multi-turn loops.  
* **Sequential Bottlenecks & Manual QA:** Bounded parallel work and automated checks can help, but synthetic tests do not replace user acceptance or required review.

This proposal explores how a governed coding workspace could take a user request through repository understanding, planning, implementation, verification, and a reviewable delivery. It does not promise zero-bottleneck operation, autonomous user acceptance, or production-ready integration. It synthesizes five workflow patterns for evaluation:

1. **Separated orchestration and worker roles:** An intake/router role can coordinate bounded task sessions and return control to the user at safe points.  
2. **Independent critique:** A critic with scoped context can evaluate artifacts and recorded verification without editing the implementation; its result is evidence, not approval.  
3. **Repository-aware context:** Symbol, graph, and retrieval services can provide concise, source-linked context while preserving whole-file reads when needed and explaining omissions.  
4. **Specialized parallel work:** Independent tasks may use isolated worktrees where policy and task dependencies permit; all changes remain attributable and reviewable.  
5. **Synthetic verification:** Browser automation and synthetic personas may supplement—not replace—user acceptance or required project-specific checks.

---

# **2\. Centralized System Diagrams (Mermaid.js Blueprints)**

To ensure both **100% machine-readability for AI agents** (explicit graph edges, node IDs, and state transitions) and **clean visual rendering for humans** (avoiding line-wrapped ASCII boxes), all seven system diagrams are consolidated below in standard **Mermaid.js** syntax.

## **Diagram 2.1: Master System Topology (4-Plane Macro Architecture)**

```
flowchart TB
    subgraph Control_Plane ["1. CONTROL, INTAKE & MEMORY PLANE"]
        User(["User Request and Decisions"]) --> Orchestrator["Orchestrator (Plans, Coordinates, Reports)"]
        Orchestrator --> Router["Routing Agent (DAG Task Dispatcher)"]
        Router <-->|"In-scope choices; escalate material questions"| Advisor["Advisor (Routine Decisions; No Permission Authority)"]
        MemorySteward[("Repository intelligence + managed task state")] <-->|"Source-linked context"| Router
        MemorySteward <-->|"Prior decisions for context"| Advisor
    end

    Router -->|"Arch DAG"| PMAgent["PM Agent (Spec & Contract Manager)"]
    Router -->|"Code DAG"| CoderAgent["Coder Agent (Worktree Swarm Manager)"]
    PMAgent -.->|"Decision support; ask user when needed"| Advisor
    CoderAgent -.->|"Trade-off options; preserve approval gates"| Advisor
    PMAgent ==>|"Draft typed artifacts for review"| CoderAgent

    subgraph Arch_Pod ["2. ARCHITECTURE SWARM POD (Left Brain)"]
        PMAgent --> SolArch["Sol Architect Agent"]
        PMAgent --> FEArch["Frontend Architect Agent"]
        PMAgent --> BEArch["Backend Architect Agent"]
        PMAgent --> InfraArch["Infrastructure Architect Agent"]
        PMAgent --> Day2Arch["Day2 Ops Architect Agent"]
        PMAgent --> SecArch["Security Architect Agent"]
        
        SolArch & FEArch & BEArch & InfraArch & Day2Arch & SecArch --> ArchCritic{{"Arch Gauntlet Blind Critic (Fresh Context Schema Gate)"}}
    end

    subgraph Coder_Pod ["3. IMPLEMENTATION SWARM POD (Right Brain - Git Worktrees)"]
        CoderAgent --> UIUX["UI/UX Agent"]
        CoderAgent --> CodingPool["Coding Agent Team (xN)"]
        CoderAgent --> APIPool["API Agent Team (xN)"]
        CoderAgent --> DBAgent["Database Agent"]
        CoderAgent --> SecAgent["Security Agent"]
        CoderAgent --> AIAgent["AI Agent"]
        
        UIUX & CodingPool & APIPool & DBAgent & SecAgent & AIAgent --> CodeQuality["Code Quality Agent (LSP, SAST, Mutation Tests)"]
        CodeQuality --> CodeCritic{{"Code Gauntlet Blind Critic (Fresh Context A/B Gate)"}}
    end

    subgraph UAT_Pod ["4. AUTONOMOUS TESTING & SYNTHETIC UAT POD"]
        CodeCritic -->|"Staging Merge"| MockAndStage["Ephemeral Staging + Contract Mock Server"]
        MockAndStage --> PersonaNovice["Novice User Persona (Playwright + Vision)"]
        MockAndStage --> PersonaAdmin["Power Admin Persona (RBAC & Bulk Flows)"]
        MockAndStage --> PersonaChaos["Monkey / Chaos Persona (Fuzzing & Network Jitter)"]
        
        PersonaNovice & PersonaAdmin & PersonaChaos --> UATCritic{{"UAT Gauntlet Blind Critic (Visual & Journey Sign-Off)"}}
        UATCritic -->|"Verification result + evidence"| Orchestrator
        UATCritic -.->|"FAIL + Root-Cause Trace"| CoderAgent
    end
```

## **Diagram 2.2: Decision Support and User Escalation Flow**

```
flowchart LR
    Worker["Agent session"] -->|"Routine, reversible choice"| Advisor["Advisor resolves within scope"]
    Worker -->|"Material unresolved blocker"| LocalArchitect["Local Architect: up to 3 distinct attempts"]
    LocalArchitect -->|"Resolved with evidence"| Continue["Continue within approved scope"]
    LocalArchitect -->|"3 unresolved strikes + evidence packet"| Advisor
    Advisor --> ProjectDocs["Consult project instructions, PRD/TRD/ADRs, source/tests"]
    Advisor --> Research["Assess comparable projects and authoritative sources"]
    Research --> Egress{"External research authorized?"}
    Egress -->|"Yes, relevant"| Cite["Research and record URL, revision/date, applicability"]
    Egress -->|"No or unavailable"| NoteLimit["Record research limitation; do not make network call"]
    ProjectDocs & Cite & NoteLimit --> AdvisorAttempts["Advisor: up to 3 distinct evidence-backed attempts"]
    AdvisorAttempts -->|"Resolved within scope"| Continue
    AdvisorAttempts -->|"3 unresolved strikes"| Pause["Pause with evidence, attempts, options, recommendation, and a clear user question"]
    Continue --> Log["Record rationale, assumptions, evidence and outcome"]
    Pause -->|"User decides or changes scope"| Log
```

## **Diagram 2.3: 3-Tier Shared Memory & Incremental Worktree AST Sync**

```
flowchart TD
    subgraph Memory_Steward ["MEMORY STEWARD AGENT (Resident Daemon)"]
        Tier1["TIER 1: Repository intelligence • maintained parsers / LSP • source-linked symbols and graph"]
        Tier2["TIER 2: Incremental index updates • isolated worktrees • revision and conflict checks"]
        Tier3["TIER 3: Managed task state • SQLite relational state • user-reviewed project artifacts"]
    end

    Tier1 -->|"Cited context within task budget"| Swarm["Scoped agent sessions (whole-file reads when justified)"]
    Tier2 -->|"Revision-aware updates and staleness"| Swarm
    Tier3 -->|"Relevant state and evidence references"| Swarm
```

## **Diagram 2.4: The Dual Gauntlet-Loop State Machine**

```
stateDiagram-v2
    [*] --> Criteria: User request + acceptance criteria + required approvals
    Criteria --> SpawnWorker: Create scoped task contract
    SpawnWorker --> DeterministicGate: Worker Executes in Fresh Context Worktree
    
    state DeterministicGate {
        [*] --> LSP_Typecheck
        LSP_Typecheck --> SAST_And_Lint
        SAST_And_Lint --> Unit_And_Mutation_Tests
    }

    DeterministicGate --> CodeRepair: FAIL (Compiler / Test / Surviving Mutants)
    DeterministicGate --> BlindCriticAudit: PASS (All Machine Checks Green)

    state BlindCriticAudit {
        [*] --> StripLabels: Compare against acceptance criteria
        StripLabels --> AuditReceipts: Verify Execution Logs & Traces
        AuditReceipts --> BinaryVerdict: PASS or FAIL Only (No 1-10 Scores)
    }

    BlindCriticAudit --> PromoteArtifact: PASS (Beats or Ties Bar)
    BlindCriticAudit --> CodeRepair: FAIL (Line-Specific Defect Evidence)
    
    CodeRepair --> RepairBudget: Preserve diff, evidence, and FR-29 repair count
    RepairBudget --> SpawnWorker: New evidence and below configured repair limit (default 5)
    RepairBudget --> Blocked: Repair limit reached or same failure repeats

    Criteria --> ArchitectAttempts: Material architectural or implementation blocker
    ArchitectAttempts --> ArchitectAttempts: Distinct evidence-backed attempt; fewer than 3 unresolved strikes
    ArchitectAttempts --> AdvisorAttempts: 3 unresolved Architect strikes; hand off evidence
    AdvisorAttempts --> AdvisorAttempts: Consult project docs and relevant authorized research; fewer than 3 unresolved strikes
    AdvisorAttempts --> AskUser: 3 unresolved Advisor strikes; present decision brief
    AskUser --> ArchitectAttempts: User changes scope or supplies a new decision basis
    PromoteArtifact --> [*]
```

## **Diagram 2.5: Parallel Git Worktree Swarm & Contract Mock Server Pipeline**

```
flowchart TB
    ApprovedSpecs["Task-approved contracts (project-appropriate formats)"] --> CoderAgent["Coder Agent"]
    ApprovedSpecs -->|"Only when authorized and available"| MockServer["Optional local contract mock"]

    CoderAgent --> WT1["Isolated worktree • scoped data task"]
    CoderAgent --> WT2["Isolated worktree • scoped service task"]
    CoderAgent --> WT3["Isolated worktree • scoped UI task"]

    MockServer <-->|"Optional UI integration check"| WT3
    MockServer <-->|"Optional contract check"| WT2

    WT1 & WT2 & WT3 --> QualityGate["Code Quality & Mutation Testing Gate"]
    QualityGate --> CodeCritic{{"Code Gauntlet Blind Critic"}}
    CodeCritic --> Review["Prepare attributable patch for review"]
    Review --> User["User reviews and decides whether to integrate"]
```

## **Diagram 2.6: Optional Automated Checks and Synthetic Journey Flow**

```
flowchart TD
    BDD["User-approved acceptance criteria where needed"] --> Layer1["LAYER 1: Configured local checks in isolated worktree"]
    Layer1 --> Layer2["LAYER 2: Authorized integration and security tests"]
    Layer2 --> Layer3["LAYER 3: Optional synthetic browser journeys in an approved test environment"]
    
    subgraph Persona_Swarm ["Multi-Persona UAT Execution"]
        Layer3 --> P1["Journey agent (labels, roles, visible flow)"]
        Layer3 --> P2["Permission and keyboard scenarios where applicable"]
        Layer3 --> P3["Bounded edge cases using safe test data"]
    end

    P1 & P2 & P3 --> TelemetryCheck{"Evaluate configured checks and thresholds"}
    TelemetryCheck -->|"PASS"| UATBlindCritic{{"LAYER 4: Optional synthetic verification review"}}
    TelemetryCheck -->|"FAIL"| AutoTriage["Advisor triages within approved scope"]
    UATBlindCritic -->|"FAIL"| AutoTriage
    UATBlindCritic -->|"PASS"| DeliveryResult(["Report check results and evidence; user controls PR / merge"])

    AutoTriage -->|"CSS / Layout Defect"| RespawnUI["Respawn UI/UX Agent Worktree"]
    AutoTriage -->|"HTTP / Schema Defect"| RespawnAPI["Respawn API Agent Worktree"]
    AutoTriage -->|"Performance finding"| RespawnDB["Inspect with approved test data"]
```

## **Diagram 2.7: End-to-End Governed Task Sequence**

```
sequenceDiagram
    autonumber
    actor User
    participant Orch as Orchestrator
    participant Mem as Memory Steward
    participant Router as Routing Agent
    participant Adv as Decision Support
    participant PM as PM & Arch Pod
    participant Coder as Coder Swarm Pod
    participant Critic as Blind Critics
    participant UAT as Synthetic UAT Pod

    User->>Orch: Submit request and choose scope
    Orch->>Mem: Read permitted repository and task context
    Mem-->>Orch: Return cited context with revision and coverage
    Orch->>Router: Build plan and acceptance criteria
    Router->>Adv: Request evidence and options for uncertain points
    Adv-->>Router: Resolve routine choices; flag material ambiguity
    Router->>User: Ask only for material ambiguity or required approval
    User-->>Router: Clarify or approve when needed
    Router->>PM: Draft only the architecture artifacts needed
    PM->>Critic: Request independent review
    Critic-->>PM: Return findings and evidence
    Router->>Coder: Start scoped work in an isolated worktree
    Coder->>Mem: Request source-linked context and revision status
    Mem-->>Coder: Return relevant excerpts and graph results
    Coder->>Critic: Submit patch and check evidence for review
    Critic-->>Coder: Return findings or verification result
    Coder->>UAT: Run optional, authorized synthetic checks
    UAT->>Critic: Submit traces and test evidence
    Critic-->>UAT: Report results; does not grant user acceptance
    UAT->>Mem: Store permitted task evidence references
    UAT-->>Orch: Return verified patch status and evidence
    Orch-->>User: Report results; user controls push, PR, merge, and deployment
```

---

# **3\. Control Plane & Governed Task Coordination**

## **3.1 Orchestrator Agent**

* **Responsibility:** Coordinates a user-requested task, maintains task/session state, and reports a verified result with linked evidence. It may prepare a patch and, when explicitly authorized, prepare a pull request.
* **Constraint:** The orchestrator cannot bypass policy or perform privileged side effects directly. It surfaces approval requests and unresolved decisions at safe points; the user can steer, interrupt, or take over. A verification pass is not approval to push, create a PR, merge, or deploy.

## **3.2 Task Router (Optional Implementation Pattern)**

* **Responsibility:** Translates approved scope into a dependency-aware task plan. A DAG is an implementation option, not a required product contract.  
* **Routing Classification Matrix:**  
  * **Type A (Fix):** Selects a proportionate plan, regression checks, implementation, and independent verification.
  * **Type B (Feature or refactor):** Selects the relevant specification, implementation, and review steps.
  * **Type C (New project):** Uses an appropriately scoped architecture and implementation plan. Do not require a fixed number of agents or stages.

## **3.3 Advisor Agent and Bounded Decision Authority**

The advisor agent handles routine, reversible choices within the user's requested scope using repository guidance and the active permission mode. For a material blocker that remains unresolved after three distinct local Architect attempts, it receives the evidence packet and gets up to three distinct attempts before human escalation. Each attempt must state a proposed resolution, criteria, evidence, and outcome; a failed check or the same unresolved blocker counts once, while repeated tool calls or restatements do not. The core assigns durable blocker/root IDs and cannot reset them across turns, sessions, or model changes; only a user-confirmed material scope/criteria change or a distinct acceptance criterion/diagnostic fingerprint with separate affected scope opens a linked episode. It is not a product owner or permission approver, and it must not interrupt the user for every action:

6. **Acceptance criteria:** Derive testable criteria from the user's request. The advisor should resolve routine, reversible ambiguity from repository guidance and record its assumption; ask the user only when ambiguity materially changes behavior, scope, risk, or cost, or policy requires approval.
7. **Evidence and research:** On every staged Advisor attempt, consult applicable project instructions, PRD/TRD/ADRs, local source/tests, and other relevant project documents. Identify and research comparable projects and authoritative technical sources when relevant and permitted. Citations and research-derived claims must resolve to gateway-produced evidence artifacts; external research artifacts include the canonical source, retrieval time, source revision/date when available, content hash, cited span, and egress approval receipt. A model-supplied URL or failed fetch is not evidence. If external research is unavailable or unauthorized, state that limitation without implying it was done.
8. **Trade-off analysis:** Identify risks and options, distinguish evidence from recommendation, and carry the Architect's evidence and failed approaches forward rather than restarting with generic advice.
9. **Decision authority:** The advisor may choose routine implementation details within the approved scope and record why; the orchestrator performs ordinary actions only when allowed by the active permission mode. Only the user can grant permissions or approve actions reserved by policy. Model output cannot change policy, override an Ask-mode prompt, approve gated actions, or mark checks passed. After three unresolved Advisor strikes, pause with a decision brief and wait for the user. An agent may draft an ADR or decision record but cannot make it binding.

---

# **4\. Repository Context & Task Memory**

Repository intelligence, managed task state, and user-controlled project knowledge can be organized into tiers. The services and formats below are illustrative; OneCode's architecture and dependency choices are defined by the [PRD](./PRD.md), [TRD](./TRD.md), [TECH-STACK](./TECH-STACK.md), and applicable ADRs. The second brain is the knowledge lifecycle; GraphRAG is only an indexing and retrieval mechanism. Retrieval supplements, and does not replace, direct source inspection or accepted project knowledge.

| Memory Tier | Underlying Technology | How Agents Use It Without Token Waste |
| :---- | :---- | :---- |
| **Tier 1: Repository index** | OneCode repository-intelligence services and selected parsers | Return source-linked symbols and relationships with revision, coverage, and staleness. Use excerpts or whole files as the task requires; there is no universal token-reduction guarantee. |
| **Tier 2: Incremental updates** | Repository watcher and index pipeline | Refresh changed content within measured budgets. Worktree isolation and conflict checks are required; symbol-level locking is only an option if proven correct. |
| **Tier 3: Task and session state** | SQLite state under [ADR-0005](./adr/0005-storage-engine.md), with graph records in proposed LadybugDB under [ADR-0017](./adr/0017-code-knowledge-graph-store.md) | Store durable state and evidence references in managed application data, outside the target repository by default. Keep user-authored files and notes under user control; do not silently rewrite project rules or invariants. |
| **Tier 4: Second-brain knowledge lifecycle** | User-controlled capture and accepted-note records in local application storage; graph and vector indexes only reference/search eligible records | Capture enters review before acceptance. Preserve provenance, revisions, relations, scope, and freshness; source changes trigger review rather than silent mutation. Retrieval explains why an item surfaced and treats memory as context, never proof or authorization. Native backups are passphrase-encrypted; restored/imported records stay pending review until re-accepted. User-initiated export/import/restore is validated and offline; plaintext Markdown export requires disclosure and confirmation. No automatic cloud sync. |

---

# **5\. Independent Critique and Evidence Review**

Independent critique is one optional way to reduce self-review bias. External Gauntlet projects and their protocols are inspirations only; they are not adopted dependencies or required OneCode formats (see **Diagram 2.4**).

## **5.1 Review principles**

9. **Role separation:** Prefer a reviewer that did not author the change for independent critique; scope its context and permissions.
10. **Clear outcomes:** Report pass/fail for individual checks where meaningful, alongside the scope, limitations, and evidence. A binary verdict alone is not a quality guarantee.
11. **Evidence:** Claims about completed checks must cite their actual results. Missing, skipped, or zero-selected checks are not passes.
12. **Bounded repair:** Code repair follows the separate FR-29 configurable budget (default five) and repeated-failure stop. Decision-escalation counters under FR-125 are separate: three Architect attempts, then three Advisor attempts, then a human decision brief. Preserve the diff and evidence; hard-policy approvals and required user decisions remain immediate.

---

# **6\. Optional Planning and Architecture Roles**

Planning roles are conceptual, not a required agent count or a prescribed use of any third-party skill. Produce only the task artifacts the repository and user need; record architectural choices through the repository's ADR process.

| Agent Name | Core Responsibility | Mandatory Output Artifact (Written to Blackboard) | Automated Verification Gate |
| :---- | :---- | :---- | :---- |
| **Architecture** | Boundaries, domain model, service and event responsibilities. | TRD material or design notes when needed; ADR for a locked decision. | Check requirement coverage and dependency direction. |
| **UI and accessibility** | Component reuse, interaction states, responsive and accessible behavior. | Repository-appropriate design artifacts and tests. | Verify against the product's design and accessibility standards. |
| **Contracts and services** | Interfaces, invariants, concurrency, and idempotency. | The formats already used by the target project. | Run its schema, type, and contract checks when configured. |
| **Infrastructure and operations** | Only when the task includes deployment or operations work. | Project's existing IaC, observability, and runbook formats. | Run the configured validation; never create cloud resources without approval. |
| **Security** | Trust boundaries, threat analysis, and permission expectations. | Threat model and tests appropriate to the repository. | Verify security controls; do not broaden access or weaken policy. |

---

# **7\. Deep-Dive: Pod 2 (Coder & Implementation Swarm)**

After required decisions and approvals, implementation may use parallel agents and isolated worktrees when task dependencies, resource budgets, and repository safeguards permit (see **Diagram 2.5**). Starting a mock server, container, network service, or other process follows the user's permission mode and applicable policy.

## **7.1 Example implementation responsibilities**

* **Data and service responsibilities:** Update schemas, migrations, queries, and contracts using the target repository's selected technologies; verify relevant plans against measured budgets.
* **Interface responsibilities:** Implement the project's established API and validation contracts; do not introduce a protocol or framework just because an example uses it.
* **UI responsibilities:** Follow the repository's design system, accessibility standard, and required empty/loading/error/permission/success states.
* **Implementation responsibilities:** Work on scoped business logic and integration tasks, using the project's tools and conventions.
* **AI responsibilities:** When relevant, maintain prompts, output schemas, eval fixtures, and controls under the same policy and security boundaries.
* **Security responsibilities:** Add task-relevant adversarial tests, review trust boundaries, and preserve secret-handling requirements.
* **Verification responsibilities:** Run configured checks and report exact results. Mutation testing, static analysis, and independent critique are selected by task and project policy, not mandatory for every change.

## **7.2 Preventing Merge Conflicts Across Parallel Agent Teams**

Parallel work can reduce elapsed time, but does not guarantee conflict-free changes. Use isolated worktrees, task dependencies, explicit write scopes, and normal version-control conflict checks:

13. Each delegated task should name its expected write scope and relevant shared files.
14. Agents may read the context permitted by policy and should use current source revisions; an index or symbol map is not a substitute for checking edit targets.
15. If tasks overlap or depend on shared state, serialize or coordinate them. No symbol-locking guarantee is assumed; conflicts are surfaced for review and resolved without overwriting user changes.

---

# **8\. Optional Automated Verification and Synthetic UX Checks**

Automation can supplement project-appropriate verification and provide user-journey evidence. Synthetic checks do not constitute user acceptance testing, replace human review, or waive required approvals (see **Diagram 2.6**).

## **8.1 The 4 Verification Layers**

16. **Layer 1 — Local checks:** Run the configured formatter, type checker, static analysis, and selected tests in the isolated worktree. Fuzzing or mutation tests are optional targeted checks, not guarantees against weak tests.  
17. **Layer 2 — Integration checks:** Run configured integration and contract tests in the local or approved test environment. Fault injection is limited to authorized, isolated test systems; no production or third-party targets.  
18. **Layer 3 — Optional synthetic journeys:** When useful and approved, browser automation may exercise the target app through accessible user-facing interfaces. Use the project's supported browser/testing tools; do not send repository or user data to an external model without required egress approval.  
    * **Novice User Persona:** Follows visible labels, ARIA roles, and visual hierarchy to complete core business journeys.  
    * **Power Admin Persona:** Tests RBAC permissions, bulk operations, keyboard shortcuts, pagination, and data exports.  
    * **Edge-case persona:** If appropriate, tests navigation, localization/RTL, responsive sizes, and interruption or refresh behavior using safe test data.
19. **Layer 4 — Evidence review:** A critic may compare test results and visual artifacts against user-approved criteria. Report console/network errors and layout metrics according to the test's configured thresholds; do not treat a universal “zero errors” rule as proof of acceptance.

## **8.2 Bounded verification follow-up**

| Verification finding | Possible follow-up | Guardrail |
| :---- | :---- | :---- |
| **Visual or responsive finding** | Inspect the supplied screenshot, DOM evidence, and project styles. | Agent may propose a patch in scope; user reviews the diff. |
| **User-flow or state finding** | Inspect the failing trace and source-linked implementation. | Reproduce in an authorized test environment; retain evidence. |
| **Interface or status mismatch** | Compare captured results with the repository's contract and tests. | Do not replay requests against production or third-party services without approval. |
| **Performance finding** | Profile the relevant operation using approved test data and hardware. | Report measurement method; do not assume a generic latency threshold. |
| **Acceptance ambiguity** | Present evidence and options. | Ask the user when intent or scope is unclear; synthetic personas cannot decide for the user. |

---

# **9\. Wire Protocols & Data Schemas**

## **9.1 Illustrative Delegation Artifact**

This example is not OneCode's wire protocol. OneCode uses the typed, versioned artifacts defined by the [TRD](./TRD.md#61-typed-artifact-contracts). Names below are illustrative and must be replaced with repository-appropriate paths, IDs, formats, and checks. The advisor may resolve routine in-scope choices, but cannot approve gated actions:

```xml
<gauntlet_delegation_contract version="2.0">
  <metadata>
    <task_id>IMPL-API-004</task_id>
    <pod>CODER_SWARM</pod>
    <specialist_role>API_Agent</specialist_role>
    <worktree_ref>managed-task-worktree</worktree_ref>
    <decision_context_ref>existing-approved-project-guidance</decision_context_ref>
    <budget max_tokens="task-configured" ttl_seconds="task-configured" />
  </metadata>

  <objective>
    Example only: implement the requested feature using the repository's existing service, storage, and validation conventions.
  </objective>

  <memory_pointers>
    <source_context_ref>source-linked-repository-context</source_context_ref>
    <acceptance_criteria_ref>task-acceptance-criteria</acceptance_criteria_ref>
    <write_scope>task-assigned-paths</write_scope>
  </memory_pointers>

  <invariants>
    <invariant id="INV-1">Follow applicable repository and product security requirements.</invariant>
    <invariant id="INV-2">Do not widen the user-approved task scope or permission set.</invariant>
  </invariants>

  <verification>
    <command>Use the repository's documented verification command for the changed component.</command>
    <result>Record the actual command, selected tests, result, and unverified items.</result>
  </verification>
</gauntlet_delegation_contract>
```

## **9.2 Illustrative Verification Report (Not User Acceptance)**

```xml
<verification_report task_id="TASK-EXAMPLE" status="PASSED">
  <test_pyramid_summary>
    <unit_and_property_tests passed="142" failed="0" mutation_score="94.2%" />
    <contract_and_security_tests passed="38" failed="0" idor_leaks="0" />
    <synthetic_uat_journeys passed="12" failed="0" personas_tested="3" />
  </test_pyramid_summary>

  <uat_journey_evidence>
    <journey id="UAT-01" persona="Novice_User" scenario="Complete SSO onboarding &amp; invite team member">
      <verdict>PASS</verdict>
      <duration_ms>4120</duration_ms>
      <console_errors>0</console_errors>
      <visual_result>Record only if a configured comparison was actually run.</visual_result>
      <artifacts>
        <playwright_trace>managed-artifact-reference</playwright_trace>
        <video_recording>managed-artifact-reference</video_recording>
        <screenshots>managed-artifact-reference</screenshots>
      </artifacts>
    </journey>
  </uat_journey_evidence>
</verification_report>
```

Counts and artifact references above are examples, not evidence. Synthetic checks and critic verdicts do not constitute user acceptance, PR approval, or permission to integrate.

---

# **10\. Failure Modes, Circuit Breakers & Self-Healing Matrix**

| Failure scenario | Detection | Advisor-led response within scope |
| :---- | :---- | :---- |
| **Repeated code-check failure** | The same check fails without new evidence or the FR-29 code-repair budget is exhausted. | Stop code repair and report the evidence. Do not spend or extend the separate FR-125 decision budget unless a material blocker requires an architectural/implementation decision. |
| **Unresolved material blocker** | Three distinct, evidence-backed local Architect attempts fail to meet criteria or leave the same blocker unresolved. | Hand the evidence and attempted approaches to the Advisor for up to three distinct attempts. Each attempt consults project docs and assesses relevant comparable projects/authoritative sources within egress policy. After three unresolved Advisor strikes, pause with a decision brief for the user. |
| **Worktree conflict** | A rebase, patch, or integration check conflicts. | Preserve all work and user edits; the advisor may resolve unambiguous in-scope conflicts, otherwise present the conflict for user review. Never silently revert or overwrite. |
| **Context pressure** | A session approaches its configured context or resource budget. | Summarize evidence and pending work in managed task state, then continue with a bounded session if safe. Do not promise a fixed token count or discard approvals and checkpoints. |
| **Stale index result** | Source revision no longer matches the indexed result or edit target. | Refresh or reread source, validate the edit against current content, then continue if unambiguous; otherwise ask before applying a potentially incorrect patch. |

---

# **11\. Recommended Technology & Model Routing Stack**

Role and model selection are implementation choices. Use the user's configured providers and approved model profile; do not make a cloud provider the default or send repository data externally without the required approval:

| Agent Layer | Recommended Model Profile | Key Operational Characteristics |
| :---- | :---- | :---- |
| **Advisor and planning roles** | Configured model with appropriate reasoning capability | May recommend and make routine in-scope choices; cannot grant permissions or approve gated actions. |
| **Routing and task coordination** | Model or deterministic orchestration selected by implementation | Produces a bounded task plan and typed artifacts; obeys the permission engine. |
| **Implementation roles** | User-selected local model by default; external model only when configured and approved | Work in isolated, attributable task worktrees; use the detected repository stack and tools. |
| **Synthetic browser checks** | Local browser automation; external vision model only if approved | Inspect the user-facing interface and return test evidence; do not claim user acceptance. |
| **Independent critics** | Separate role/model where practical | Read-only review of scoped artifacts and actual verification evidence. |
| **Repository and task state** | OneCode repository-index and persistence services | SQLite for relational state, proposed LadybugDB for graph data; see the TRD, TECH-STACK, and ADRs. |

---

# **12\. Phase 2 Advanced Enhancements & Self-Evolution Matrix**

| Optional pattern to evaluate | Possible mechanism | Hypothesis to measure | Cost, risk, and approval boundary |
| :---- | :---- | :---- | :---- |
| **12.1 Local contract mock** | Start a project-appropriate mock only when allowed by policy. | Whether it shortens integration feedback. | Process/container/network permissions still apply. |
| **12.2 Parallel alternatives** | Run bounded alternatives in isolated worktrees when explicitly suitable. | Quality improvement versus single-path baseline. | Additional model/tool cost; user decides material scope changes. |
| **12.3 Mutation or property testing** | Add focused checks when the repository and task justify them. | Defects caught beyond existing tests. | Runtime and maintenance cost; not a universal gate. |
| **12.4 Graph-assisted context** | Use source-linked graph traversal and symbol context. | Retrieval quality, token use, latency, and regressions versus baselines. | No fixed savings claim; honor index freshness and coverage. |
| **12.5 Resource and retry limits** | Bound time, tokens, parallelism, retries, and session resources. | Whether limits prevent runaway cost without lowering acceptance. | Exceeding or changing budget requires configured policy or user decision. |
| **12.6 Checkpointing** | Retain attributable, recoverable task checkpoints in managed state. | Recovery and reviewability. | Keep user data, approvals, and retention controls intact. |
| **12.7 Load or canary testing** | Run against isolated, authorized staging only. | Performance and reliability under a defined workload. | Never target production or third parties without explicit authorization. |
| **12.8 Reusable project learnings** | Draft learnings from verified outcomes for review. | Whether approved learnings reduce repeated failures. | Never write rules, skills, or permissions automatically; require user review and control. |
