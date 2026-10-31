# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, and others) working **on** this repository. The rules that OneCode's own runtime agents follow are a different document: [docs/AGENT-OPERATING-RULES.md](./docs/AGENT-OPERATING-RULES.md). Its §1 says a change to it "requires a PRD or TRD change or an ADR, a security review, and updated tests"; do not edit it as a side effect of other work.

Start with [INTENT.md](./INTENT.md); it says what wins when rules conflict.

## Repository state

- `docs/` holds the PRD, TRD, ADRs, and standards; it is most of the repository. [docs/README.md](./docs/README.md) says which document owns what.
- `apps/desktop/` is the production desktop UI: Tauri 2 + React/TypeScript per [ADR-0003](./docs/adr/0003-desktop-ui-and-bridge.md). It currently runs on a development fixture adapter; the Tauri shell and Rust core do not exist yet.
- `docs/design/onecode-experience/` is a sample-data prototype (Vite + vanilla JS). Production code must not import from it.
- There is no Cargo workspace yet. Do not scaffold crates, CI, or toolchain files unless the task asks; the layout is pending ADR-0002.
- This folder is not a Git repository yet.

## Commands

Both UI projects need the sibling checkout `../OneQuill/docs/design/onequill-design-system` (a `file:` dependency); without it, installs and token checks fail.

| Task | `apps/desktop` | `docs/design/onecode-experience` |
|---|---|---|
| Install | `npm ci` | `npm ci` |
| Typecheck | `npm run typecheck` | n/a |
| All tests | `npm test` (Vitest, jsdom) | none |
| One test file | `npx vitest run src/App.test.tsx` | n/a |
| Design-token lint | `npm run check:tokens` | `npm run check:tokens` |
| Full check | `npm run build` (tokens, typecheck, tests, bundle) | `npm run build` (tokens, bundle) |
| Dev server | `npm run dev`, port **5174** | `npm run dev`, port **5173** |

Docs: `node scripts/check-doc-links.mjs` verifies every relative link and anchor.

## Rules that are easy to get wrong here

- **One live dev instance per project.** Both dev servers use a fixed, strict port (the prototype's preview server too; `apps/desktop` does not pin `preview.port` yet). If the port is busy, an instance is already running: use it. Never start a second one, pass another port, or stop a server another session started. A hook in `.claude/settings.json` blocks this for Claude Code; other agents must follow it by hand.
- **Peer sessions edit this repository concurrently.** Re-read a shared file right before editing it, make targeted edits rather than rewrites, and never revert changes you did not make.
- **Verification economy.** Check prerequisites before compiling, run each relevant check once per material change, and report the command and its result. Zero tests selected is not a pass ([engineering standards §7](./docs/ENGINEERING-STANDARDS.md#7-working-in-this-repository-verification-economy-and-live-instances)).
- **Stable IDs.** Never renumber `FR-nn`, `R-nn`, or `ADR-nnnn`; add new TRD material as new subsections. ADR numbers 0001–0019 are reserved in [docs/adr/README.md](./docs/adr/README.md).
- **Cross-document changes land together.** A behavior change updates the PRD, an architecture change the TRD, a locked-in choice gets an ADR, and a new dependency updates [TECH-STACK](./docs/TECH-STACK.md).
- **UI uses tokens and the icon registry only.** No literal colors or sizes (`check:tokens` fails); icons go through `components/Icon.tsx`; strings through `src/i18n/`.
- **The UI never decides policy.** It renders API state and sends commands through `src/api/`; permission and task-state logic belongs to the core.
- **Generated and vendored files are read-only:** `graft/`, `dist/`, `node_modules/`, lockfiles (change them only through the package manager).
- **No secrets anywhere.** Never read or create `.env` files with real values; tests use fixtures or generated values.

## Standards

| Topic | Document |
|---|---|
| Design principles (YAGNI, KISS, DRY), naming, folder structure, TypeScript/React, Rust idioms | [docs/CODING-STANDARDS.md](./docs/CODING-STANDARDS.md) |
| Tooling gates, testing policy, Git workflow, definition of done, budgets | [docs/ENGINEERING-STANDARDS.md](./docs/ENGINEERING-STANDARDS.md) |
| Secure coding (OWASP ASVS, CWE, OWASP LLM Top 10) | [docs/SECURE-CODING.md](./docs/SECURE-CODING.md) |
| Open-source reuse, licenses, versions | [docs/DEPENDENCY-POLICY.md](./docs/DEPENDENCY-POLICY.md) |
| UI simplicity rules, emotional design, SVG icons and illustration, interaction, copy | [docs/DESIGN-GUIDELINES.md](./docs/DESIGN-GUIDELINES.md) |
| WCAG 2.2 AA | [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md) |
| SOC 2 control baseline | [docs/SOC2-CONTROLS.md](./docs/SOC2-CONTROLS.md) |
| Contribution workflow and PRs | [CONTRIBUTING.md](./CONTRIBUTING.md) |

## Finishing a task

Report what changed, the exact checks you ran with their results, what you did not verify, and any rulings you made where the documents were silent. Do not claim "done", "fixed", or "passing" without that evidence. Commit, push, or publish only when the user asks.
