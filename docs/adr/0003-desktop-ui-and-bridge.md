# ADR-0003: Use Tauri with a typed React frontend

**Status:** Accepted  
**Date:** 2026-10-31  
**Deciders:** OneCode product owner and engineering  
**Affects:** PRD FR-64, FR-66, FR-87, FR-96, FR-104; TRD §§3.1, 3.3, 3.4, 11; agent rules R-23, R-24  
**Revisit trigger:** Reopen if native WebView differences prevent the required Windows, macOS, and Linux UX or accessibility parity, or if the command/channel bridge cannot meet measured responsiveness and streaming requirements.

## Context

OneCode needs a cross-platform desktop workspace that hosts a rich, accessible UI and shares typed application state with the Rust core. The UI must remain a presentation layer: task transitions, policy, approvals, workspace access, and tool execution belong to the core and its services. The shared OneQuill design system is framework-neutral and already consumed by the OneCode experience mock.

The existing mock uses Vite and vanilla JavaScript, but engineering standards explicitly keep it sample-only until this decision is made. The repository has no production desktop UI or API implementation yet. Tauri's WebView-and-Rust architecture fits the proposed Rust core and avoids shipping a separate browser runtime; the sibling OneQuill web app provides a compatible React/Vite baseline.

## Decision

Build the desktop shell with Tauri 2 and its platform WebView, with a React 19.3.1 and TypeScript 7 frontend built by Vite 8.3.5. Keep UI code dependent on versioned API contracts, not core internals. Use Tauri commands for request/response operations and Tauri channels for typed, higher-volume task/session streams; reserve Tauri events for small, low-frequency notifications. Generate TypeScript bindings from Rust API types and validate data at the process boundary.

Expose only narrowly scoped commands through explicit Tauri capabilities. Every operation with side effects must be re-authorized by the Rust policy/core services; the frontend cannot grant permissions, read arbitrary files, or invoke shell commands directly.

## Alternatives considered

| Option | Summary | Why not (or why not yet) |
|---|---|---|
| Electron with React | Bundled Chromium and a mature web ecosystem. | A separate browser runtime increases package and idle-memory cost; the target product already uses a local Rust core. |
| Native Rust UI | Render the desktop UI with a Rust-native toolkit. | Would require a separate component and design-system integration effort; the framework-neutral shared CSS and current web UI work would not transfer as directly. |
| Local HTTP/WebSocket API from the WebView | Expose a loopback service for UI requests and events. | Adds a listening port and origin/authentication surface for a single desktop client. Keep a separate service transport decision in ADR-0002 for other local clients. |

## Consequences

- **Positive:** Reuses the Rust core and OneQuill design tokens while enabling a component-based, typed UI; Tauri commands and channels provide a narrow local bridge.
- **Negative and mitigations:** System WebViews can differ in rendering and capabilities. Test the same UI acceptance and accessibility checks on each supported OS; keep built-in project preview/browser isolation in its separate engine decision (ADR-0013).
- **Platform differences and documented exceptions:** Tauri uses each platform's WebView. Do not silently substitute weaker behavior; report unsupported capabilities and fail closed where policy or isolation guarantees depend on them.
- **Migration or rollback path:** Keep UI-to-core calls behind the versioned API client. A future host or transport can replace the Tauri adapter without changing presentation components.

## Threat model

| Asset | Entry point | Trust level of input | Abuse case | Mitigation | Test |
|---|---|---|---|---|---|
| Repository contents, task state, and user data | WebView-rendered API results | Untrusted repository/tool content; validated core artifacts | Malicious text is interpreted as markup or instructions | Render untrusted content as text; validate API payloads; keep policy decisions in the core | XSS fixtures and invalid-payload tests |
| Workspace and host capabilities | Tauri command bridge | User actions and untrusted model/tool proposals | Compromised UI invokes arbitrary file, shell, or approval actions | Explicit capability allowlist; no generic shell/filesystem command; authorize side effects in core | Capability tests and denied-action integration tests |
| Session event stream | Tauri channels/events | Core-produced, schema-versioned events | Forged, stale, oversized, or misrouted events corrupt visible state | Typed generated contracts, version checks, bounded payloads, and session scoping | Schema compatibility, size-limit, and session-isolation tests |
| Local application API | Bundled frontend assets and dependencies | Build-time code; runtime repository data remains untrusted | Remote script or dependency compromises the privileged WebView | Strict CSP, pinned dependencies, no remote runtime code, and reviewed Tauri capabilities | CSP/build checks and dependency audit |

## Verification

- Build and test the frontend against the shared OneQuill design tokens.
- Test that frontend operations use only declared API methods and that policy-sensitive state is supplied by the core.
- Verify capability restrictions, malformed/version-mismatched payload handling, event cleanup, and accessible keyboard operation.
- Run the common UI acceptance, browser, and accessibility checks on Windows, macOS, and Linux before release.

## Sources

- Version basis: [TECH-STACK.md](../TECH-STACK.md), checked 2026-10-31.
- [Tauri architecture](https://v2.tauri.app/concept/architecture/)
- [Tauri commands](https://v2.tauri.app/develop/calling-rust/)
- [Tauri frontend communication and channels](https://v2.tauri.app/develop/calling-frontend/)
- [Tauri capabilities](https://v2.tauri.app/security/capabilities/)
- [React Quick Start](https://react.dev/learn)
- [Vite Getting Started](https://vite.dev/guide/)
