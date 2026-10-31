# Contributing to OneCode

Thank you for helping. Read [INTENT.md](./INTENT.md) first; it explains what OneCode is for and which rule wins when rules conflict.

## Before you start

| You are changing | Read |
|---|---|
| Any code | [Coding standards](./docs/CODING-STANDARDS.md), [engineering standards](./docs/ENGINEERING-STANDARDS.md) |
| UI | [Design guidelines](./docs/DESIGN-GUIDELINES.md), [accessibility standard](./docs/ACCESSIBILITY.md) |
| Anything touching input, files, processes, network, secrets, policy, or the Tauri bridge | [Secure coding standard](./docs/SECURE-CODING.md) |
| Dependencies | [Dependency policy](./docs/DEPENDENCY-POLICY.md) |
| Product behavior, architecture, or agent rules | [docs/README.md](./docs/README.md) says which document owns what |
| As an AI agent | [AGENTS.md](./AGENTS.md) |

## Setup

The UI projects consume the shared OneQuill design system from a sibling checkout, so clone both side by side:

```text
Desktop/
├── OneCode/
└── OneQuill/
```

Then, in `apps/desktop` (production UI) or `docs/design/onecode-experience` (prototype):

```bash
npm ci
```

Use the Node.js LTS version recorded in [TECH-STACK](./docs/TECH-STACK.md). The Rust workspace does not exist yet.

## Making a change

1. Pick or open a task that links to `FR-nn` requirement IDs ([task list](./tasks/todo.md)). An unrecorded architecture or dependency choice needs an ADR first ([ADR index](./docs/adr/README.md)).
2. Branch as `<type>/<scope>-<summary>` and write Conventional Commits ([engineering standards §8](./docs/ENGINEERING-STANDARDS.md#8-git-workflow)).
3. Keep the change small and in scope. Put refactors and cleanup in separate changes.
4. Add or update tests in the same change; a bug fix starts with a failing test.
5. Run the checks for what you touched (see [AGENTS.md](./AGENTS.md#commands)) and paste the commands and results into the PR.
6. Update the documents your change affects (PRD, TRD, rules, ADRs, `CHANGELOG.md`) in the same PR.
7. Open the PR from the [template](./.github/pull_request_template.md). A change is done when it meets the [definition of done](./docs/ENGINEERING-STANDARDS.md#9-definition-of-done).

## Development servers

Each project has **one** live development instance. Before starting a dev server, check whether one is already running and reuse it; never start a second one or move to another port. The desktop UI runs on `127.0.0.1:5174` with a strict port, so a busy port means an instance is already running. See [engineering standards §7](./docs/ENGINEERING-STANDARDS.md#7-working-in-this-repository-verification-economy-and-live-instances).

## Reporting security issues

Never in a public issue. Follow [SECURITY.md](./SECURITY.md).
