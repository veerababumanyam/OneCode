# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, and others) working **on** this repository. The rules that OneCode's own runtime agents follow are a different document: [docs/AGENT-OPERATING-RULES.md](./docs/AGENT-OPERATING-RULES.md). Its §1 says a change to it "requires a PRD or TRD change or an ADR, a security review, and updated tests"; do not edit it as a side effect of other work.

Start with [INTENT.md](./INTENT.md); it says what wins when rules conflict.

## Repository state

- `docs/` holds the PRD, TRD, ADRs, and standards; it is most of the repository. [docs/README.md](./docs/README.md) says which document owns what.
- `apps/desktop/` is the production desktop UI: Tauri 2 + React/TypeScript per [ADR-0003](./docs/adr/0003-desktop-ui-and-bridge.md). It currently runs on a development fixture adapter; the Tauri shell and Rust core do not exist yet.
- `docs/design/onecode-experience/` is a sample-data prototype (Vite + vanilla JS). Production code must not import from it.
- There is no Cargo workspace yet. Do not scaffold crates, CI, or toolchain files unless the task asks; the layout is pending ADR-0002.
- The root [VERSION](./VERSION) file is the single source of truth for the application version ([ADR-0022](./docs/adr/0022-central-version-source.md)). Manifests mirror it; see the version rule below.

## Commands

Both UI projects need the sibling checkout `../OneQuill/docs/design/onequill-design-system` (a `file:` dependency); without it, installs and token checks fail.

| Task | `apps/desktop` | `docs/design/onecode-experience` |
|---|---|---|
| Install | `npm ci` | `npm ci` |
| Typecheck | `npm run typecheck` | n/a |
| All tests | `npm test` (Vitest, jsdom) | none |
| One test file | `npx vitest run src/App.test.tsx` | n/a |
| Design-token lint | `npm run check:tokens` | `npm run check:tokens` |
| Version check | `npm run check:version` | `npm run check:version` |
| Full check | `npm run build` (version, tokens, typecheck, tests, bundle) | `npm run build` (version, tokens, bundle) |
| Dev server | `npm run dev`, port **5174** | `npm run dev`, port **5173** |

Docs: `node scripts/check-doc-links.mjs` verifies every relative link and anchor.

Version: `node scripts/sync-version.mjs --check` verifies every manifest mirrors the root `VERSION`. Run it without `--check` — or `npm run sync:version` inside a package — to rewrite the mirrors after editing `VERSION`, then refresh the lockfiles with `npm install --package-lock-only`.

## Rules that are easy to get wrong here

- **One live dev instance per project.** Both dev servers use a fixed, strict port (the prototype's preview server too; `apps/desktop` does not pin `preview.port` yet). If the port is busy, an instance is already running: use it. Never start a second one, pass another port, or stop a server another session started. A hook in `.claude/settings.json` blocks this for Claude Code; other agents must follow it by hand.
- **Peer sessions edit this repository concurrently.** Re-read a shared file right before editing it, make targeted edits rather than rewrites, and never revert changes you did not make.
- **Verification economy.** Check prerequisites before compiling, run each relevant check once per material change, and report the command and its result. Zero tests selected is not a pass ([engineering standards §7](./docs/ENGINEERING-STANDARDS.md#7-working-in-this-repository-verification-economy-and-live-instances)).
- **Stable IDs.** Never renumber `FR-nn`, `R-nn`, or `ADR-nnnn`; add new TRD material as new subsections. ADR numbers are reserved in [docs/adr/README.md](./docs/adr/README.md); take the next unused number after the highest one listed there.
- **The version has one source.** The root `VERSION` file is authoritative and the `version` in each `package.json` is a generated mirror. To bump it: edit `VERSION`, run `node scripts/sync-version.mjs`, refresh the lockfiles with `npm install --package-lock-only`, and record the release in `CHANGELOG.md`. Never hand-edit a mirror — `check:version` runs first in every `npm run build` and fails on drift ([ADR-0022](./docs/adr/0022-central-version-source.md)).
- **Cross-document changes land together.** A behavior change updates the PRD, an architecture change the TRD, a locked-in choice gets an ADR, and a new dependency updates [TECH-STACK](./docs/TECH-STACK.md).
- **UI uses tokens and the icon registry only.** No literal colors or sizes (`check:tokens` fails); icons go through `components/Icon.tsx`; strings through `src/i18n/`.
- **The UI never decides policy.** It renders API state and sends commands through `src/api/`; permission and task-state logic belongs to the core.
- **Generated and vendored files are read-only:** `graft/`, `dist/`, `node_modules/`, lockfiles (change them only through the package manager), and the `version` field in each `package.json` (change it only through `scripts/sync-version.mjs`).
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
