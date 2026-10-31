# OneCode Coding Standards

**Status:** Draft  
**Scope:** How code in this repository is designed, named, organized, and written: Rust, TypeScript/React, CSS, scripts, and tests  
**Related:** [Engineering standards](./ENGINEERING-STANDARDS.md) (tooling gates, testing policy, Git, release), [Secure coding](./SECURE-CODING.md), [Design guidelines](./DESIGN-GUIDELINES.md), [Dependency policy](./DEPENDENCY-POLICY.md), [Intent](../INTENT.md)

The [engineering standards](./ENGINEERING-STANDARDS.md) say what must pass before merge; this document says how to write code that passes for the right reasons. Where the two overlap, the engineering standards own the gate and this document owns the practice.

## 1. Design principles

### 1.1 YAGNI: build only what a requirement needs now

- Every type, option, flag, parameter, and abstraction traces to an `FR-nn`, a TRD section, or an ADR. "We might need it" is not a requirement.
- No interface, trait, or generic with a single implementation, **except** at a boundary the TRD or an ADR already mandates: platform adapters (TRD §3.3), the UI-to-core API client (ADR-0003), provider adapters (TRD §7.1), and the gateway (TRD §8). Those boundaries exist for isolation and testing, not speculation.
- No configuration setting without a user-facing requirement; no feature flag without an owner, tracking issue, and expiry ([engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust)).
- Delete dead code, unused exports, and commented-out blocks; version control remembers them.
- Do not add a dependency for something the standard library or an existing dependency already does ([dependency policy](./DEPENDENCY-POLICY.md)).

### 1.2 KISS: the simplest design that meets the requirement

- Prefer plain functions and data over classes, inheritance, and frameworks of your own.
- Prefer one obvious code path. Early returns over nested conditionals; `match` or exhaustive `switch` over chains of flags.
- Replace a boolean parameter that changes behavior with an enum or two functions.
- Clever code needs a reason in a comment and a test that would fail without the cleverness.

### 1.3 DRY: one source of truth for each piece of knowledge

- DRY is about **knowledge**, not similar-looking lines. Duplicate a few lines rather than couple two concepts that merely look alike.
- **Rule of three:** extract shared code at the third real occurrence, not the second.
- Single sources of truth already chosen: schemas generated from Rust types (TS bindings are generated, never hand-mirrored); design values from OneQuill tokens; user-facing strings from `i18n/`; requirement and rule IDs from the PRD and operating rules; dependency versions from manifests and lockfiles.

### 1.4 Structural rules

- **Functional core, imperative shell.** Keep decisions (policy evaluation, state transitions, ranking, parsing) in pure functions over data; keep I/O, processes, clocks, and randomness at the edges and pass them in. Pure cores are what make the security and state-machine tests in [engineering standards §5](./ENGINEERING-STANDARDS.md#5-testing-standards) cheap.
- **Make illegal states unrepresentable.** Use enums and discriminated unions instead of optional fields that are only valid together; newtypes instead of raw `String`/`PathBuf`/`number` for IDs, paths inside a worktree, and redacted text.
- **Parse, don't validate.** Convert untrusted input into a typed value once, at the boundary; downstream code accepts only the typed value.
- **Dependency direction.** Dependencies point toward `core`; UI and CLI depend only on the API ([engineering standards §2](./ENGINEERING-STANDARDS.md#2-repository-layout-proposed-pending-adr-0002)). No cycles between crates or between frontend folders.
- **Composition over inheritance; small surfaces.** A module exports the minimum its callers need. Prefer passing a narrow capability (a function, a trait object with one method) over a whole service.
- **Fail closed, fail loud.** A missing capability is a typed error the caller must handle, never a silent fallback (TRD §3.3).
- **Stay in scope.** No drive-by refactors in a feature change; put cleanup in its own change (R-37).

### 1.5 Size heuristics

These are review prompts, not hard limits: a function over ~50 lines, more than four parameters, more than three levels of nesting, a file over ~400 lines, or a PR over ~400 changed lines (excluding generated files and lockfiles) should be split unless the reviewer agrees it reads better whole.

## 2. Naming conventions

Names say what a thing **is** or **does** in the domain's own words (PRD/TRD vocabulary: session, turn, worktree, artifact, observation, approval). No abbreviations except established ones (`id`, `url`, `api`, `ui`, `io`, `pty`, `lsp`, `mcp`).

### 2.1 By language

| Item | Rust | TypeScript / React |
|---|---|---|
| Packages | crates `onecode-<component>` (kebab-case) | `onecode-<surface>` in `package.json` |
| Files and modules | `snake_case.rs` | components `PascalCase.tsx` (one exported component per file); other modules `kebab-case.ts` |
| Types, traits, components | `UpperCamelCase`; no `I`/`T` prefixes | `PascalCase` types, interfaces, components; no `I` prefix |
| Functions, methods, variables | `snake_case` | `camelCase` |
| Constants | `SCREAMING_SNAKE_CASE` for `const`/`static` | `camelCase` by default; `SCREAMING_SNAKE_CASE` only for primitive constants shared across modules |
| Enum variants / union tags | `UpperCamelCase` variants | discriminated unions use a `kind` field with kebab-case string literals (`"development-fixture"`) |
| Booleans | `is_`, `has_`, `can_`, `should_` | `is`, `has`, `can`, `should` prefixes |
| Errors | `<Area>Error` enums; `thiserror` at crate boundaries | errors returned as `{ kind: "…" }` results across the API boundary |
| Conversions and getters | follow the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/naming.html): `as_`/`to_`/`into_`, no `get_` prefix | `toX`/`fromX`; no `get` prefix for plain property reads |
| Hooks and handlers | n/a | hooks `useThing` in `use-thing.ts`; props `onThing`; implementations `handleThing` |
| Tests | `fn <behavior>()`; prefix with the rule or requirement ID when it verifies one: `r10_refuses_second_dev_server` | `*.test.ts(x)` beside the source; `it("refuses a second dev server [R-10]")` |

### 2.2 Cross-cutting names

| Item | Convention | Example |
|---|---|---|
| CSS classes, desktop app | kebab-case block names; component state as `is-*` classes on the component (the app shell's layout states such as `navigator-collapsed` predate this; new states use `is-*`) | `navigator`, `brand-mark`, `is-collapsed` |
| CSS classes, design prototype | `oc-` prefix, BEM (`block__element--modifier`) | `oc-model-callout__icon`, `oc-button--primary` |
| Design tokens | OneQuill tokens only: `--oq-*`; if an app-local derived property is ever needed, name it `--oc-*` and compose it only from `--oq-*` (none exist yet) | `--oq-text` |
| i18n keys | nested camelCase objects per surface in `src/i18n/<locale>.ts` | `en.app.skipToWorkspace` |
| Tauri commands | `snake_case` Rust functions named `verb_noun` | `load_workspace`, `submit_turn` |
| Tauri events and channels | `domain:event-name`, past tense for facts | `session:turn-completed` |
| Error codes | stable, lowercase, dotted `area.reason`; never reused | `gateway.path_escape`, `policy.hard_denied` |
| Environment variables | `ONECODE_` prefix, `SCREAMING_SNAKE_CASE` | `ONECODE_DATA_DIR` |
| Feature flags | `snake_case`, area first | `ws_browser_annotations` |
| Top-level docs | `SCREAMING-KEBAB.md` | `SECURE-CODING.md` |
| ADRs | `NNNN-kebab-title.md` | `0003-desktop-ui-and-bridge.md` |
| Scripts | `kebab-case.mjs` / `.sh` / `.ps1` | `check-doc-links.mjs` |
| Branches and commits | see [engineering standards §8](./ENGINEERING-STANDARDS.md#8-git-workflow) | `feat/ws-terminal-capture` |

**Open decision:** the JSON field casing on the UI-to-core bridge. Rust contracts carry `schema_version` (snake_case, [engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust)) while the current TypeScript client types use camelCase. Settle it once with a `serde(rename_all = …)` choice on the API crate and generated TypeScript bindings, recorded in the API contract or an ADR-0003 follow-up. Until then, do not hand-write a second mirror of a Rust type.

## 3. Folder structure

### 3.1 Current repository

```text
OneCode/
├── INTENT.md, AGENTS.md, CLAUDE.md, CONTRIBUTING.md, SECURITY.md, CHANGELOG.md
├── apps/
│   └── desktop/                 Tauri + React/TypeScript desktop UI (ADR-0003)
│       └── src/
│           ├── api/             typed API client and contract types (the only way to reach the core)
│           ├── components/      presentational React components, one per PascalCase file
│           ├── i18n/            user-facing strings per locale
│           ├── dev/             development fixtures; never imported by production code paths
│           └── *.test.tsx       tests co-located with the code they verify
├── docs/                        PRD, TRD, standards, ADRs, design prototype
│   ├── adr/                     decision records (numbers reserved in adr/README.md)
│   └── design/onecode-experience/  sample-data prototype (Vite + vanilla JS)
├── tasks/                       implementation plan and task list
├── graft/                       generated code-index cards (do not edit)
└── .claude/, .github/           agent configuration and PR template
```

### 3.2 Target layout (proposed, pending ADR-0002)

```text
OneCode/
├── Cargo.toml                   Cargo workspace; rust-toolchain.toml pins the toolchain
├── crates/onecode-<component>/  one crate per TRD component (engineering standards §2)
│   ├── src/
│   ├── tests/
│   └── README.md                responsibility, boundary, owners
├── apps/desktop/
│   ├── src/                     React UI
│   └── src-tauri/               Tauri shell crate (onecode-desktop), capabilities/, tauri.conf.json
├── schemas/                     generated JSON Schemas with golden tests
├── fixtures/                    sample repositories, adversarial corpora, fixture web apps
└── scripts/                     repository maintenance scripts (no build-time downloads)
```

[Engineering standards §2](./ENGINEERING-STANDARDS.md#2-repository-layout-proposed-pending-adr-0002) names a `desktop` crate; with Tauri that crate is `apps/desktop/src-tauri`. ADR-0002 records the final split.

### 3.3 Placement rules

- Code lives with the feature that owns it. Promote to a shared module only under the rule of three, and name it for what it does (`path-scope.ts`), never `utils`, `helpers`, `common`, or `misc`.
- Frontend folders by role today (`api/`, `components/`, `i18n/`); when a surface grows past about ten components, group by feature (`components/terminal/`, `components/review/`) rather than by technical type.
- Tests sit beside the code (TypeScript) or in the module and `tests/` (Rust). Fixtures that more than one crate uses go in `fixtures/`.
- Generated output (bindings, schemas, `dist/`, `target/`) is never edited by hand; regenerate it from its source.
- Platform-specific code lives only in `platform-*` crates (or behind the Tauri adapter in the UI).

## 4. TypeScript and React

- `strict` stays on, along with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` (`apps/desktop/tsconfig.json`). Do not weaken compiler options to make code compile (R-22).
- No `any`. Use `unknown` and narrow. No non-null assertions (`!`) or type assertions (`as`) on data that crossed a boundary; validate it instead.
- Model outcomes as discriminated unions (`kind`) and handle them with an exhaustive `switch` whose default assigns to `never`.
- Data from the core is untrusted until validated at the API client boundary ([secure coding §5](./SECURE-CODING.md#5-desktop-ui-webview-and-tauri)).
- Components are function components; props are typed with a named `Props` type. Keep state minimal: derive values during render instead of synchronizing copies; use effects only to synchronize with something outside React.
- Components render state and send commands. Policy, permission, and task-state decisions never live in the UI (TRD §11).
- Never use `dangerouslySetInnerHTML`, `eval`, `new Function`, or string-built `href`/`src` from untrusted data.
- All user-facing text comes from `i18n/`; never concatenate translated fragments. Use logical CSS properties for right-to-left support.
- Memoize (`useMemo`, `useCallback`, `memo`) only for a measured problem, with the measurement in the PR.
- Tests use Testing Library queries by role and accessible name (`getByRole("button", { name: … })`), which double as accessibility checks. Avoid test IDs unless no accessible query exists.

## 5. Rust

The gates are in [engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust): rustfmt, `clippy -D warnings`, `forbid(unsafe_code)` outside `platform-*`, no panics on input, typed errors, `tracing`, `tokio`. In addition:

- Follow the [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/) for public items.
- Newtypes for identifiers and validated values (`SessionId`, `WorktreePath`, `RedactedText`), constructed only through a validating function.
- Mark public enums and structs that cross a versioned boundary `#[non_exhaustive]`; mark results that must not be ignored `#[must_use]`.
- Accept borrowed inputs (`&str`, `&Path`, `&[T]`); return owned values. Do not `clone` to silence the borrow checker on a hot path; restructure instead.
- Prefer iterators and `?` over index loops and nested `match` on `Result`.
- Every long-running async function takes a cancellation token and is cancellation-safe; blocking work goes through `spawn_blocking`.
- Bound every collection that grows from external input (queues, captures, caches) and document the bound.

## 6. Errors, logging, and comments

- **Errors** carry a stable code (section 2.2), a user-actionable message, and the context needed to act. Never swallow an error; either handle it, add context and propagate it, or convert it into a typed result the UI renders.
- **Logging** follows [engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust) and [secure coding §7](./SECURE-CODING.md#7-logging-errors-and-telemetry-cwe-209-cwe-117): structured fields, hashes and sizes instead of content, no secrets.
- **Comments** explain *why*: constraints, invariants, links to `FR-nn`/`R-nn`/ADRs. Do not narrate what the code says. Public items have doc comments with an example when usage is not obvious.
- **TODOs** take the form `TODO(<owner>, <issue>): <what and why>`. A TODO without an owner and an issue is not mergeable.

## 7. Testing practice

Policy is in [engineering standards §5](./ENGINEERING-STANDARDS.md#5-testing-standards). In practice:

- Write the failing test first for a bug fix; for a feature, write the test for each acceptance criterion alongside the code.
- Arrange, act, assert; one behavior per test; the test name states the behavior.
- Tests are deterministic: inject clocks, randomness, file systems (`tempfile`), and network fakes; no sleeps for synchronization.
- Use property tests (`proptest`) for parsers, path handling, and state machines; snapshot tests (`insta`) only for stable serialized output that a reviewer reads.
- Prefer real in-process components over mocks for policy and state-machine tests; mock only at narrow external boundaries.
- Every new trust boundary gets an adversarial test tied to its `R-nn` ([secure coding](./SECURE-CODING.md)).

## 8. Performance

Measure before optimizing, against the budgets in [engineering standards §12](./ENGINEERING-STANDARDS.md#12-performance-and-resource-budgets). Keep the editor, terminal, and browser responsive: no unbounded work on the UI thread, stream large outputs, and paginate or virtualize long lists.
