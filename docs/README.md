# OneCode documentation

OneCode is a local-first AI coding application: a desktop workspace where a developer and governed agents share an editor, an integrated terminal, a built-in browser for preview and annotation, source control, diagnostics, tests, and running processes, with every agent action isolated, approved where it matters, and backed by evidence.

## Documents

| Document | Owns | Read it when |
|---|---|---|
| [PRD.md](./PRD.md) | User-facing behavior, functional requirements `FR-01` to `FR-124`, UX requirements, non-functional targets, roadmap, open product decisions | You need to know what the product must do and for whom |
| [TRD.md](./TRD.md) | Architecture, component boundaries, workspace services, session model, typed artifacts, policy and permission engine, verification, data, testing, milestones, open technical decisions | You are designing or implementing a component |
| [TECH-STACK.md](./TECH-STACK.md) | Verified prototype dependencies and versions, plus proposed production technologies and unresolved stack decisions | You need the current stack inventory or are evaluating a dependency |
| [AGENT-OPERATING-RULES.md](./AGENT-OPERATING-RULES.md) | The numbered rules `R-01` to `R-40` every agent runs under, each with its enforcement point and verification | You write policy, prompts, or tests for agent behavior |
| [ENGINEERING-STANDARDS.md](./ENGINEERING-STANDARDS.md) | How the OneCode codebase is laid out, written, tested, reviewed, documented, and released; the verification-economy and single-instance rules for anyone working in the repository | You contribute code or review a change |
| [CODING-STANDARDS.md](./CODING-STANDARDS.md) | Design principles (YAGNI, KISS, DRY), naming conventions, folder structure, TypeScript/React and Rust practice, errors, comments, testing practice | You write or review code |
| [SECURE-CODING.md](./SECURE-CODING.md) | Secure coding practices mapped to OWASP ASVS, CWE, and the OWASP LLM Top 10, plus the security review checklist | You touch input, files, processes, network, secrets, policy, or the Tauri bridge |
| [DEPENDENCY-POLICY.md](./DEPENDENCY-POLICY.md) | Open-source reuse procedure, evaluation criteria, license classes, "latest safe" versions, pinning, updates | You add, update, vendor, or copy third-party code |
| [DESIGN-GUIDELINES.md](./DESIGN-GUIDELINES.md) | Applying OneQuill to the workspace, the SVG icon system, interaction, trust and evidence patterns, motion, copy | You design or build UI |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | The WCAG 2.2 AA standard for OneCode and how it is verified | You build or review UI |
| [SOC2-CONTROLS.md](./SOC2-CONTROLS.md) | Data classification and the engineering control baseline mapped to the SOC 2 Trust Services Criteria (not an attestation) | You change process, access, release, logging, or data handling |
| [TECH-STACK.md](./TECH-STACK.md) | Current prototype dependencies and production technology decisions, with version and evidence status | You add or update a dependency or implement a production component |
| [adr/](./adr/README.md) | Architecture decision records, the template, and the reserved list of decisions still to make | You are about to lock in a dependency, boundary, or platform choice |
| [design/onecode-experience](./design/onecode-experience/README.md) | Interactive, sample-data prototype of Mission Control, review, context, Knowledge map, Model Library, and history; it predates the workspace surfaces in PRD §10.11 | You are designing UI |
| [old-ref-docs/](./old-ref-docs/) | Earlier reference material: the original product reference, the architecture stress-test, and the ideation-canvas extension sketch | You want the reasoning behind a requirement |

Planning lives outside `docs/`: the [implementation plan](../tasks/plan.md) and the [task list](../tasks/todo.md). The repository root holds [INTENT.md](../INTENT.md) (purpose and conflict order), [CONTRIBUTING.md](../CONTRIBUTING.md), [SECURITY.md](../SECURITY.md), [CHANGELOG.md](../CHANGELOG.md), and [AGENTS.md](../AGENTS.md) for AI agents working on the repository.

## Identifiers

- `FR-nn`: a PRD functional requirement. Stable; never renumbered.
- `R-nn`: an agent operating rule. Stable; retired rules keep their row.
- `ADR-nnnn`: a decision record. Numbers are reserved in the ADR index before files exist.
- TRD sections are cited as `TRD §n.n`; new material is added as subsections so existing citations stay valid.

## Changing the documents

A change in product behavior updates the PRD; a change in architecture or controls updates the TRD; a change in what agents may do updates the operating rules; a locked-in choice gets an ADR. A pull request that affects more than one updates all of them together, and tests reference the IDs they verify.
