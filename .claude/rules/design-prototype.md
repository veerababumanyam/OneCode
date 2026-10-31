---
paths:
  - "docs/design/**"
---
# Design prototype (docs/design/onecode-experience)

- Sample data only. Controls must not read files, run tools, persist settings, start servers, or make network requests (see the prototype README, "Prototype boundaries").
- Vanilla JS in `src/main.js`: views are HTML template strings with `data-action` attributes handled by delegated listeners. Pass every interpolated value through `escapeHtml`.
- CSS classes use the `oc-` prefix with BEM (`oc-block__element--modifier`); values come from `--oq-*` tokens; use logical properties for right-to-left support.
- Icons go through the `icon()` helper (Lucide paths, `aria-hidden`, `currentColor`).
- Sketch the same simple, calm direction as production (docs/DESIGN-GUIDELINES.md §1–§3): one primary action per view, progressive disclosure, icon-derived illustration for empty states.
- Verification: `npm run build` (token lint + bundle). There is no test suite.
- Dev server: port 5173 with `strictPort`; reuse a running instance.
- Production UI lives in `apps/desktop`; do not grow the prototype into a second app.
