# OneCode frontend gauntlet

Visual references: the user's actual mock pages at `http://127.0.0.1:4173/` (three-pane Chat workspace) and `http://127.0.0.1:4174/` (Mission Control). The generic shell at `4179` is not the primary design target; `4175` is an error state, not a mock to reproduce.

| Slice | Status | Evidence / next gap |
|---|---|---|
| Desktop UI architecture | Done | [ADR-0003](../docs/adr/0003-desktop-ui-and-bridge.md) selects Tauri 2, React/TypeScript, versioned API contracts, commands, and channels. |
| Mission Control and Chat screens | In progress | Rebuild against the actual 4174 Mission Control and 4173 Chat mock pages as distinct navigable screens. Demo data and actions must remain explicitly sample-only. |
| Independent visual critique | Rebase required | The first critic judged the generic 4179 shell; that was the wrong visual bar. Request a fresh blind comparison against 4173 and 4174 after the rebuild. |
| Browser, accessibility, and build verification | In progress | Latest full build passes token lint, typecheck, 12 tests, and Vite build. The 640px short-screen clipping is fixed; mobile in-drawer close controls and skip-link focus are implemented. Recheck responsive layout, scrolling, console, keyboard behavior, and both actual mock screens after the rebuild. |

Exit condition: fresh critics prefer both matching production screens in blind side-by-side comparisons; the rest of the shell conforms to PRD §11.1–11.3 and focused checks pass. Keep unresolved backend and editor-engine decisions visible rather than simulating production behavior.
