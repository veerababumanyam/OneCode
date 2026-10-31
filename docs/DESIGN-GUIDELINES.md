# OneCode Design Guidelines

**Status:** Draft  
**Scope:** Visual and interaction design for the desktop app (`apps/desktop`) and the design prototype (`docs/design/onecode-experience`)  
**Related:** [PRD §11](./PRD.md#11-user-experience-requirements) (workspace layout, views, experience rules), [Accessibility standard](./ACCESSIBILITY.md), [Coding standards §4](./CODING-STANDARDS.md#4-typescript-and-react), [ADR-0003](./adr/0003-desktop-ui-and-bridge.md)

OneCode's visual language comes from the shared **OneQuill design system** (sibling workspace `../OneQuill/docs/design/onequill-design-system`; its `DESIGN.md` and `README.md` are the visual source of truth for tokens, components, glass, and icons). This document does not restate OneQuill. It sets how OneCode applies it: **simple first, icon-led, and humane**, plus the trust-specific patterns OneQuill does not cover.

## 1. Direction: calm, simple, capable

A developer spends hours in OneCode while agents act on their code. The interface should feel like a quiet, trustworthy instrument: the work is loud, the chrome is silent. Power comes from what the product does, not from how much it shows.

- **Content forward, chrome back.** Code, diffs, terminal output, and evidence get the space and contrast; navigation and controls recede until needed.
- **One clear next step.** Every view answers three questions at a glance: *Where am I? What is happening? What can I do next?*
- **Calm under load.** Many agents, checks, and processes can run at once; the UI summarizes and lets the user drill in, never floods.
- **OneQuill's showcase stays in OneQuill.** The field guide's vitrine hall, case numerals, exploded planes, and leader lines demonstrate the system; they are not workspace UI. OneCode uses OneQuill's tokens, components, and icon set in their quietest form.

## 2. Simplicity rules

These are review criteria, not aspirations. A UI change that breaks one needs a reason in the PR.

1. **Subtract before you add.** A new element must replace something, or the PR states what job no existing element can do. Prefer extending an existing pattern to inventing one.
2. **One primary action per view.** At most one filled, high-emphasis control is visible in any view or dialog; everything else is secondary or quiet.
3. **Progressive disclosure.** Show the 80% path; put advanced options behind a single "More" or a details disclosure. Defaults are chosen so most users never open settings.
4. **Few levels of hierarchy.** At most three text levels per view (title, body, meta) and two type sizes per component. Use spacing and weight before borders, boxes, and dividers.
5. **No decoration without function.** No gradients, textures, shadows, or animation unless OneQuill assigns them a meaning (elevation, focus, progress, state). Whitespace is the default separator.
6. **Short navigation.** Primary navigation stays at seven destinations or fewer ([PRD §11.1](./PRD.md#111-workspace-layout)); deeper features are reached through the command palette, context menus, or the relevant panel.
7. **Familiar over novel.** Use conventions developers already know (tabs, trees, gutters, split panes, the palette) unless a new pattern is measurably clearer.
8. **Consistent everywhere.** One component per job, one glyph per meaning, one wording per action across the product.
9. **Glass only where OneQuill allows it.** Floating chrome (palette, menus, toasts) may use Liquid Glass with its solid fallback. Editors, terminals, diffs, tables, evidence, and dialogs are always opaque for legibility.
10. **Every pixel earns its place at 1366×768.** If it does not fit on the smallest supported layout without crowding the editor, it belongs behind disclosure.

## 3. Emotional design

Users hand OneCode their code and their trust. Design for how each moment feels, using the three levels of emotional design: **visceral** (first impression), **behavioral** (use), and **reflective** (what the user thinks of the product and themselves afterwards).

| Level | OneCode goal | How |
|---|---|---|
| Visceral | Calm confidence | OneQuill's warm ink neutrals, generous spacing, one warm signal, crisp line icons; nothing shouts |
| Behavioral | Effortless control | Fast feedback within the latency budgets, keyboard-first flows, predictable undo and revert, no surprises |
| Reflective | "I stayed in command, and the result is proven" | Evidence and attribution visible, honest status, credit to the user's decisions |

Map product moments to the feeling the design must create:

| Moment | Risk to feeling | Design response |
|---|---|---|
| Approval request | Anxiety, approval fatigue | State the action, scope, and risk in one sentence; safe choice focused; batch routine steps, never high-risk ones |
| Agent working | Uncertainty, loss of control | Show the current step and progress in place; interrupt and take over always one action away |
| Waiting on checks | Impatience | Show what is running and an honest estimate; let the user keep working |
| Failure or blocked | Frustration, blame | Blameless, specific copy with the next action; keep the user's work intact; offer revert |
| Verified completion | Relief, pride | A quiet, earned moment: a check icon, a short summary, and the evidence link. No confetti, no sound by default |
| First run and empty states | Confusion | One spot illustration, one sentence, one action that starts the real workflow |
| Destructive action | Fear of loss | Distinct shape, icon, and words; consequence restated; revert offered where possible |

Guardrails:

- **Never manipulate.** No dark patterns, fake urgency, nagging, guilt-tripping copy, or pre-selected risky options.
- **Agents are tools, not people.** Agents get OneQuill's principal marks, never faces or personalities; status reads "Planning", not "Thinking…". Warmth comes from clarity and respect, not from a character.
- **Delight is earned and rare.** Small, purposeful motion or a crisp icon state change at moments of real progress; never on routine actions, and never when it delays the user.
- **Honesty is the emotion that matters most.** Unverified work looks unverified. Optimistic UI is allowed only for local, reversible actions.

## 4. Foundations

- **Tokens only.** Every color, length, radius, shadow, duration, easing, z-layer, and font comes from `--oq-*` tokens. App-local custom properties (`--oc-*`) may only compose `--oq-*` tokens. `npm run check:tokens` (OneQuill `token-lint.mjs`) enforces this in both UI projects and runs inside `npm run build`.
- **Themes.** Light and dark come from OneQuill's semantic roles; never branch on theme in component code. Support `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more`, and `forced-colors: active` through OneQuill's fallbacks.
- **Color restraint.** Neutrals carry the interface; OneQuill's single warm signal marks selection, focus, and progress; status colors appear only with an icon and text. The primary decision stays ink/paper, never berry or red (OneQuill rule).
- **Typography.** Body text uses `--oq-font-body`; code, paths, commands, hashes, and terminal output use the monospace token. Never set text below 12 px; support 200% text zoom without loss of content.
- **Layout.** Use logical properties (`inline-size`, `margin-inline-start`, `inset-inline-end`) everywhere so right-to-left locales mirror without per-locale CSS. The workspace layout follows [PRD §11.1](./PRD.md#111-workspace-layout), works at 1366×768, and supporting screens reflow at 320 CSS px.
- **Density.** A coding tool is dense by nature; keep density through spacing tokens, not by shrinking targets below 24×24 CSS px ([accessibility §2](./ACCESSIBILITY.md#2-wcag-22-criteria-that-shape-this-product)).

## 5. SVG icons and illustration

OneCode is icon-led: navigation, panel tabs, toolbars, and row actions are icons; **decisions keep their words** (approve, deny, apply, revert, push, delete, send). This applies OneQuill's Icon-First and Icon Well rules to the workspace. Icons are the main visual vocabulary, so the same line language also drives illustration.

### 5.1 Source and format

- **One icon family:** the Lucide set vendored by OneQuill (`assets/icons/lucide/`, drawn at the 1.75 stroke). Do not add another icon library, icon font, emoji, Unicode symbol, PNG, or remote icon URL.
- **Inline SVG only:** `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, round caps and joins, stroke width from `--oq-icon-stroke` (1.75). Color comes from the surrounding text through `currentColor`, so icons follow theme, state, and forced-colors mode automatically.
- **One registry per app.** The desktop app renders icons only through `components/Icon.tsx` (`<Icon name="…" />`, with a typed `IconName`); the prototype through its `icon()` helper. Add a new glyph by copying its Lucide path data into the registry under a semantic name (`review`, not `check-square`). A custom glyph is allowed only when Lucide has no suitable icon, must match the 24-unit grid and stroke, and needs a reviewer's sign-off in the PR.
- **No runtime fetching or `innerHTML`** of SVG markup. Paths are static source code; SVG from repositories, pages, or tools is untrusted content and is never rendered as markup ([secure coding §5](./SECURE-CODING.md#5-desktop-ui-webview-and-tauri)).
- **Sizes** come from tokens: 16 px inline with small text, 20 px default in controls, 24 px for prominent navigation. Never scale an icon with `transform` to change its size.

### 5.2 Meaning and accessibility

- **Decorative icons** (next to a visible label) carry `aria-hidden="true"` and `focusable="false"`. `Icon.tsx` sets both by default.
- **Icon-only controls** are real `<button>` or `<a>` elements with an accessible name from `aria-label` (or visually hidden text) taken from `i18n/`, and a visible tooltip on hover **and** keyboard focus that shows the same name. Name the action, not the glyph: "Revert turn", not "Undo arrow".
- **Target size:** icon buttons are at least 24×24 CSS px (WCAG 2.5.8); prefer OneQuill's control height (44 px) for primary navigation and toolbars.
- **Never icon-only:** destructive, irreversible, external, or approval actions; state that changes risk (sandbox off, external model in use); anything whose icon has no common meaning. When in doubt, add the word.
- **Color is never the only signal.** Status pairs an icon **and** text: passed, failed, skipped, stale, blocked. Agent-authored versus user-authored content uses a label or icon plus color.
- **One glyph, one meaning** across the product. Keep a short glossary in `Icon.tsx` comments when a glyph could be read two ways.

### 5.3 Icon-derived illustration and state

- **Spot illustrations** for empty, first-run, offline, and success states are composed from the same line language: 24-unit-grid icon geometry scaled up, the 1.75 stroke ratio, `currentColor` plus at most one accent token. No photographs, 3D renders, mascots, or stock art.
- Each illustration is a static SVG component in the app's source, decorative (`aria-hidden`), and never the only carrier of meaning: the sentence beside it says what it means.
- **State through the icon itself** where it helps: a check that draws in on verified completion, a spinner replaced by the final status glyph, a subtle pulse on a running process. Each change has a text equivalent announced to assistive technology and is removed under reduced motion.
- Agents and services use OneQuill's principal marks; people use initials or the user's own avatar, never generated faces.

## 6. Workspace interaction patterns

These implement [PRD §11.3](./PRD.md#113-experience-rules-for-a-coding-application).

- **Keyboard first.** Every command is in the command palette and reachable by keyboard; toolbars are one tab stop with arrow-key movement inside. Shortcuts are listed in Settings and can be remapped; no single-character shortcut without a modifier unless it can be turned off (WCAG 2.1.4).
- **Never block the user.** Agent work never takes focus from the editor, terminal, or browser. Long operations show progress and a cancel control.
- **State is always visible, compactly.** Session state, conversation mode, permission mode, model, sandbox, workspace trust, index freshness, and running processes live as icon-plus-label items in the status bar or Mission Control, each opening details on demand.
- **Every surface has every state:** empty, loading, error, permission-denied, offline/no-model, stale/partial, and success. Design the empty and error states before the happy path.
- **Panels** are dockable, resizable, and hideable; sizes are remembered per project; resizing has a keyboard alternative (WCAG 2.5.7).

## 7. Trust and evidence patterns

These patterns are specific to OneCode's governed agency and carry security weight. Change them only with a security review.

- **Approval requests** name the exact action, target, scope, risk, and expiry, with the approve control labelled by its action ("Run `npm test` in worktree") rather than "OK". High-risk approvals are never batched or pre-selected, and the safe choice is the default focus.
- **Untrusted content** (repository text, terminal output, web pages, tool and model output) is visually framed and labelled with its source and trust level. Instructions found inside it are shown as quoted data with a warning, never as product UI (R-01, R-02).
- **Attribution:** agent edits, commands, and browser actions are visually distinct from the user's, in the editor gutter, terminal, diff, and history (R-36).
- **Evidence before claims:** a "passed", "fixed", or "done" label always links to the artifact that proves it; without one, the label reads "unverified" (R-16).
- **Egress and cost:** any external model or network use shows the destination and data classes before approval and a receipt afterwards.
- **Destructive actions** are distinct in shape, icon, and words as well as color; they require confirmation that restates the consequence, and offer revert where possible.

## 8. Motion

Motion explains change (a panel opening, a hunk applied, a status settling); it never decorates. Use OneQuill duration and easing tokens, keep transitions short, never animate layout while the user types, and remove non-essential motion under `prefers-reduced-motion`. Nothing flashes more than three times per second (WCAG 2.3.1).

## 9. Content and copy

- Plain, specific, sentence-case, and short: one sentence for status, a verb on every button. Say what happened and what the user can do next: "Tests didn't run: the sandbox is unavailable on this OS. Run them yourself, or enable WSL." Not "An error occurred."
- Warm through respect, not personality: no jokes in errors, no exclamation marks, no blame ("You entered an invalid path" → "That path is outside the worktree").
- Name agents and models as tools; describe their status as activities ("Planning", "Running tests").
- Use the PRD's vocabulary for product nouns (session, turn, worktree, approval, evidence).
- All strings live in `i18n/` with room for 40% text expansion and right-to-left scripts. Never build sentences by concatenation.

## 10. Simplicity review and process

Every UI PR answers these in its description (the [PR template](../.github/pull_request_template.md) asks for them):

- [ ] What did this change remove or reuse? If it only adds, why can no existing element do the job?
- [ ] Is there exactly one primary action in each affected view?
- [ ] Are advanced options behind disclosure, and do defaults serve most users?
- [ ] Do icons come from the registry, with words kept on decisions and accessible names on icon-only controls?
- [ ] Are empty, loading, error, permission-denied, offline, and success states designed, each with one sentence and one next action?
- [ ] Does each emotional moment it touches (section 3) feel calm and honest?
- [ ] Screenshots in light, dark, and right-to-left, and a keyboard walkthrough, are attached ([accessibility §4](./ACCESSIBILITY.md#4-how-it-is-verified)).

Reuse OneQuill components and patterns before creating new ones; propose a new shared pattern to OneQuill instead of forking it locally. The prototype in `docs/design/onecode-experience` is a sample-data sketch; production UI lives in `apps/desktop` and must not import from the prototype.
