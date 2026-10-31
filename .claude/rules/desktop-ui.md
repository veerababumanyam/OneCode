---
paths:
  - "apps/desktop/**"
---
# Desktop UI (Tauri + React/TypeScript)

- Design simple first (docs/DESIGN-GUIDELINES.md §2): subtract before adding, one primary action per view, advanced options behind disclosure, whitespace over borders, no decoration without meaning. Editors, terminals, diffs, and evidence are opaque; glass only on floating chrome.
- Emotional design (§3): calm, honest, blameless. Agents are tools with principal marks, never faces or personalities. Delight is rare and earned (verified completion), never on routine actions.
- Empty, first-run, offline, and success states use one icon-derived SVG spot illustration, one sentence, and one action (§5.3).

- Reach the core only through `src/api/` (the `api` prop / runtime adapter). `src/dev/` fixtures are for development and tests; production code paths never import them.
- Model results as discriminated unions with a `kind` field and handle them with an exhaustive `switch`; validate data that crosses the bridge instead of casting it.
- Strings come from `src/i18n/en.ts`; icons from `components/Icon.tsx` (Lucide paths at the 1.75 stroke); colors, sizes, and motion from `--oq-*` tokens. `npm run check:tokens` fails on literals.
- Icon-only buttons need an `aria-label` from i18n, a visible tooltip on hover and focus, and a target of at least 24×24 CSS px. Decisions (approve, apply, revert, push, delete) keep visible words.
- No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or string-built URLs from untrusted data. Untrusted content renders as text.
- Policy, permissions, and task state are decided by the core; the UI renders them and sends commands.
- Tests: Testing Library queries by role and accessible name. Run one file with `npx vitest run <path>`; the full gate is `npm run build`.
- The dev server owns port 5174 with `strictPort`. If it is busy, use the running instance.
- Tauri capability and configuration files (once `src-tauri/` exists) are security-reviewed: least-privilege capabilities, strict CSP, no generic shell/fs/http plugins. See docs/SECURE-CODING.md §5.
- Full guidance: docs/CODING-STANDARDS.md §4, docs/DESIGN-GUIDELINES.md, docs/ACCESSIBILITY.md.
