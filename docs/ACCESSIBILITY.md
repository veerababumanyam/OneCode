# OneCode Accessibility Standard

**Status:** Draft  
**Target:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA for every OneCode surface (desktop app, CLI output, documentation site), on Windows, macOS, and Linux  
**Related:** PRD FR-104 and [§11.3](./PRD.md#113-experience-rules-for-a-coding-application), [engineering standards §3.2](./ENGINEERING-STANDARDS.md#32-desktop-ui), [design guidelines](./DESIGN-GUIDELINES.md), OneQuill `ACCESSIBILITY.md` (measured token contrast and component checks)

Accessibility is a merge requirement, not a polish step. A UI change that fails an AA criterion does not merge unless it carries a recorded exception with an owner, rationale, scope, and expiry ([engineering standards §11](./ENGINEERING-STANDARDS.md#11-release)), and no exception may remove keyboard access or screen-reader access to approvals, evidence, or destructive actions.

## 1. What OneQuill already gives us, and what it does not

OneQuill measures its token contrast pairs, focus ring, reflow, text resize, and axe-core WCAG 2.2 AA results for its own components (see its `ACCESSIBILITY.md`). OneCode inherits those **only while it uses the tokens and components unchanged**. Everything OneCode composes on top must be verified here: workspace layout, editor, terminal, diff, knowledge map, approvals, and evidence views. Third-party engines (editor, terminal renderer, graph renderer) are verified as integrated, not on the vendor's word.

## 2. WCAG 2.2 criteria that shape this product

All Level A and AA criteria apply. These are the ones a coding workspace most often breaks, including the AA-relevant criteria new in 2.2 (4.1.1 Parsing is obsolete in 2.2 and is not tested):

| Criterion | Level | What it means in OneCode |
|---|---|---|
| 1.3.1 Info and relationships | A | Panels, trees, tabs, tables, and diff hunks use native semantics or the matching ARIA pattern; headings structure every view. |
| 1.4.3 / 1.4.11 Contrast | AA | 4.5:1 for text (including code, syntax highlighting, terminal colors, diff backgrounds), 3:1 for UI components, focus indicators, and graph edges/nodes that convey meaning. |
| 1.4.4 / 1.4.10 / 1.4.12 Resize, reflow, text spacing | AA | 200% zoom without loss; supporting screens reflow at 320 CSS px; user text-spacing overrides do not clip. Code editors may scroll horizontally (an allowed exception for two-dimensional content), but surrounding chrome may not. |
| 1.4.13 Content on hover or focus | AA | Tooltips (including icon-button names) are dismissible with Escape, hoverable, and persistent until dismissed. |
| 2.1.1 / 2.1.2 Keyboard, no trap | A | Every action is keyboard operable. The editor and terminal capture Tab by design, so each documents and supports an escape key sequence (for example Ctrl+M / Esc then Tab) shown in the UI. |
| 2.1.4 Character key shortcuts | A | Single-key shortcuts can be turned off or remapped. |
| 2.4.3 / 2.4.7 Focus order and visible | A / AA | Focus moves in reading order; the OneQuill focus ring is always visible. |
| **2.4.11 Focus Not Obscured (Minimum)** | AA, new | Docked panels, toasts, sticky headers, and the status bar never fully cover the focused element; scroll it into view. |
| **2.5.7 Dragging Movements** | AA, new | Panel resizing, tab reordering, graph panning, and annotation drawing all have a single-pointer or keyboard alternative. |
| **2.5.8 Target Size (Minimum)** | AA, new | Pointer targets are at least 24×24 CSS px, or meet the spacing exception. Applies to icon buttons, tree twisties, tab close buttons, and gutter controls. |
| 3.2.1 / 3.2.2 On focus, on input | A | Focusing or typing never starts an agent action, navigation, or approval. |
| **3.2.6 Consistent Help** | A, new | Help and "report a problem" sit in the same place on every view. |
| 3.3.1 / 3.3.3 Error identification and suggestion | A / AA | Errors name the field and the fix, in text, linked to the field. |
| **3.3.7 Redundant Entry** | A, new | Do not ask the user to re-enter what they already provided in the same flow (for example, repeating a model path or rule during import). |
| **3.3.8 Accessible Authentication (Minimum)** | AA, new | Provider sign-in and credential entry allow paste and password managers; no cognitive test or transcription of codes without an alternative. |
| 4.1.2 Name, role, value | A | Custom widgets expose correct roles and states (`aria-expanded`, `aria-selected`, `aria-pressed`). |
| 4.1.3 Status messages | AA | Agent progress, check results, approvals required, and errors are announced through polite or assertive live regions without moving focus. Batch rapid updates (for example, streaming output) so screen readers are not flooded. |

## 3. Product-specific rules

- **Streaming output** (conversation, terminal, logs) is not announced character by character. Announce state changes ("Turn completed, 3 files changed, tests passed") and let the user read the stream on demand.
- **Diffs** convey added/removed lines with a text marker or accessible name, not color alone, and are navigable hunk by hunk.
- **Knowledge map and charts** always have a non-canvas equivalent: a keyboard-navigable list or table with the same nodes, edges, provenance, and values ([TRD §5.6](./TRD.md#56-knowledge-map)).
- **Approvals** are dialogs that take focus, state the action in text, default focus to the safe choice, and return focus to the trigger.
- **Terminal** supports a screen-reader mode exposed by the selected renderer (ADR-0012) and a plain-text transcript view.
- **Timeouts:** approvals and sessions never expire without warning and an option to extend (WCAG 2.2.1).
- **Motion and flashing** follow [design guidelines §8](./DESIGN-GUIDELINES.md#8-motion).
- **Language:** each view sets `lang`; mixed-direction text (paths in Arabic UI) uses `dir="auto"` or isolation.

## 4. How it is verified

| Layer | Tool or method | When |
|---|---|---|
| Component tests | Testing Library queries by role and accessible name; assertions on `aria-*` state | Every UI PR |
| Automated rules | axe-core with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` tags, in component tests and in end-to-end runs of each view in light, dark, and right-to-left | Every UI PR once the axe integration is configured (not set up yet; a CI gate once CI exists) |
| Contrast and tokens | OneQuill `token-lint.mjs` (`npm run check:tokens`, in place today); rendered-pixel contrast checks for code and terminal color themes (not set up yet) | Every UI PR |
| Keyboard walkthrough | Complete each changed flow with keyboard only; record the path in the PR | Every UI PR |
| Screen readers | NVDA with Firefox or Chrome WebView on Windows, VoiceOver on macOS, Orca on Linux, run against each OS's WebView | Before each release; for any change to approvals, evidence, editor, or terminal |
| Zoom, reflow, text spacing | 200% zoom, 320 CSS px width, WCAG text-spacing bookmarklet | Before each release |
| Platform settings | High contrast / forced colors (Windows), Increase contrast and Reduce motion (macOS), reduced transparency | Before each release |

Automated tools catch only part of WCAG; a clean axe run is necessary, not sufficient. Report results as evidence (R-16): the tool, version, views and states covered, and anything not checked. Never write "accessible" or "WCAG compliant" without that evidence; the release notes state the conformance level actually verified and known exceptions.

axe-core is vendored by OneQuill; adding an axe test integration for Vitest or end-to-end tests goes through the [dependency policy](./DEPENDENCY-POLICY.md).
