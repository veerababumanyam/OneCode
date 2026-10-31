# OneCode intent

**Status:** Draft · **Owner:** OneCode product owner · **Last reviewed:** 2026-10-31

This page is the one-screen answer to "why does this exist, and what wins when rules collide?" Product detail lives in the [PRD](./docs/PRD.md), architecture in the [TRD](./docs/TRD.md), and enforced agent behavior in the [agent operating rules](./docs/AGENT-OPERATING-RULES.md). If this page and one of those disagree, the owning document wins and this page gets fixed.

## Why OneCode exists

Developers can already get code generated. What they cannot easily get is a change they can **trust**: one made with the repository's real context, isolated from their work, checked by evidence, reviewed independently, and done without leaking source or secrets. OneCode is a local-first desktop coding workspace where a developer and governed agents share an editor, terminal, built-in browser, and source control, and every agent action is visible, permissioned, reversible, and backed by evidence ([PRD §1–§3](./docs/PRD.md#1-product-summary)).

## Who it serves

Solo developers, small teams, enterprise developers who must keep code local, and builders who extend it with models, tools, and policies ([PRD §5](./docs/PRD.md#5-users-and-needs)).

## Outcomes we commit to

1. A request becomes testable acceptance criteria and a plan before code is written.
2. Changes happen in an isolated, reversible workspace; the user's own edits are never overwritten.
3. "Done" is a linked artifact (test output, check result, screenshot), never a model's claim.
4. Source, secrets, and prompts stay on the machine unless the user approves a specific egress, and every egress is receipted.
5. The user can see, interrupt, steer, and take over at any moment, and the editor, terminal, and browser keep working without a model.
6. Windows, macOS, and Linux get the same guarantees; where an OS cannot provide one, the feature fails closed and says so.

## Non-negotiables

These are enforced in code, not left to prompts ([PRD principle 10](./docs/PRD.md#4-product-principles)):

- Instructions come only from the user; everything an agent observes is data (R-01 to R-04).
- Hard-policy actions always ask: external network and model calls, destructive Git, protected paths, paid tools (R-11).
- Secrets never enter model context, logs, embeddings, memory, or exports (R-14, R-30).
- No claim of success without evidence; zero selected tests is not a pass (R-16, R-18).
- One live instance per project; never stop a process you did not start (R-10).

## Non-goals

OneCode is not a cloud IDE, not an autonomous agent that merges without a human, not a model host for others, and not a telemetry product: telemetry export is off by default. Initial-release scope and exclusions are listed in [PRD §6.2](./docs/PRD.md#62-non-goals-for-the-initial-release) and [§13](./docs/PRD.md#13-release-scope-and-roadmap).

## When rules conflict

Resolve in this order and record the trade-off in the PR or ADR:

1. **Safety and security:** user data, secrets, sandbox, and permission boundaries.
2. **Correctness and evidence:** behavior matches the requirement and is proven.
3. **User control:** the user stays in command; nothing surprising, silent, or irreversible.
4. **Accessibility and cross-platform parity:** WCAG 2.2 AA and equal guarantees per OS.
5. **Performance budgets** ([PRD §12](./docs/PRD.md#12-non-functional-requirements-and-success-measures)).
6. **Simplicity and maintainability:** YAGNI, reuse before rebuilding.
7. **Feature breadth.**

A lower item never justifies weakening a higher one. When documents are silent, choose the option that is reversible, local, observable, and smallest, then write the decision down.

## How work is held to this

| Concern | Where it lives |
|---|---|
| Code, naming, structure, YAGNI/KISS/DRY | [Coding standards](./docs/CODING-STANDARDS.md) |
| Simple, icon-led, emotionally aware UI; SVG icons and illustration; copy | [Design guidelines](./docs/DESIGN-GUIDELINES.md) |
| WCAG 2.2 AA | [Accessibility standard](./docs/ACCESSIBILITY.md) |
| Secure coding | [Secure coding standard](./docs/SECURE-CODING.md) |
| Open-source reuse and dependencies | [Dependency policy](./docs/DEPENDENCY-POLICY.md) |
| SOC 2 baseline controls | [SOC 2 control baseline](./docs/SOC2-CONTROLS.md) |
| Tooling gates, tests, release | [Engineering standards](./docs/ENGINEERING-STANDARDS.md) |
| Working in this repository as an agent | [AGENTS.md](./AGENTS.md) |
