# OneCode desktop frontend

The first production frontend slice is a Vite + React + TypeScript shell for the planned Tauri v2 desktop app. It implements the navigator, center editor/diff/browser surface, bottom tool panel, and right-side conversation companion. The navigator routes Chat, Review, Context, Models, History, Settings, Explorer, Search, Source control, Sessions, and Knowledge map; destinations without a runtime show explicit unavailable or empty states.

The layout follows PRD §11.1: navigator left, work surface center, Terminal/Problems/Tests/Processes/Output below, and the conversation companion right. On narrow screens the navigator and companion become toggled drawers; the companion remains reachable from the top bar. OneQuill design-system tokens provide color, typography, spacing, focus, and breakpoints. Visible English strings live in `src/i18n/en.ts`; development-fixture copy is isolated in `src/i18n/dev-en.ts`.

## Requirements

- Node.js compatible with Vite 8
- The sibling design-system directory at `..\..\..\OneQuill\docs\design\onequill-design-system`

Dependencies are pinned to React/react-dom 19.3.1, Vite 8.3.5, TypeScript 7.0.2, and OneQuill Design System 4.2.0.

## Run and verify

From `apps\desktop`:

```powershell
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

`npm run build` checks design-token usage, TypeScript, tests, and the Vite production bundle.

## Runtime boundary

`src/api/types.ts` defines the typed frontend contract. `src/api/runtime.ts` selects the fixture adapter only in Vite development mode. `src/dev/fixture-adapter.ts` is isolated development-only UI data; production builds use an unavailable-runtime adapter until a Tauri command bridge is implemented.

The fixture has no repository, files, model, session, terminal process, test results, or evidence. The composer can render a local request preview only: it does not send prompts, run tools, access a workspace, modify files, or make network requests. Status values such as conversation mode, permission mode, model, sandbox, workspace trust, and index freshness stay explicitly unavailable, unknown, or unreported until supplied by the runtime. No Rust/Tauri shell or backend is included in this slice.
