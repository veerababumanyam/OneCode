# OneCode tech stack

**Last checked:** 2026-10-31  
**Scope:** This repository contains product and architecture documentation plus a runnable design prototype. It does not yet contain the planned production application.

This file is the central inventory of technology choices. It distinguishes dependencies that are actually used by the prototype from the proposed production architecture. For exact JavaScript dependency resolution, `docs/design/onecode-experience/package-lock.json` is authoritative.

## Runnable prototype

The prototype is a sample-data-only web app. It is not the production desktop application.

| Layer | Technology | Version/status | Notes |
|---|---|---|---|
| UI | HTML, CSS, vanilla JavaScript modules | No framework | The prototype README explicitly says it uses Vite and vanilla JavaScript. No React, Vue, or other UI framework is declared or used. |
| Build and development server | [Vite](https://vite.dev/) | **8.3.5**, exact version pinned; also the npm `latest` version checked on 2026-10-31 | MIT-licensed development dependency. Its package metadata requires Node `^20.19.0` or `>=22.12.0`. |
| Shared design tokens and styles | `onequill-design-system` | **4.2.0**, local file dependency | Resolved from the sibling OneQuill workspace, not the public npm registry. It is marked private and has no runtime dependencies; there is no public npm `latest` version to report. |
| Node.js | Node.js | **26.8.2 observed** in the development environment; not pinned by this project | Node.js **26.13.0** was the newest Active LTS listed on the official release schedule when checked. Use an Active or Maintenance LTS release for production; confirm the local version against the version required by the Vite package. |
| npm | npm | **11.19.1 observed** in the development environment; not pinned by this project | `package-lock.json` uses lockfile version 3. |

The project’s only direct dependencies are Vite and the local OneQuill design-system package. The lockfile records their resolved dependency graph; update it together with `package.json` when changing dependencies. No dependency upgrades were needed for this inventory: the pinned Vite release already matches the registry’s current `latest` tag.

### Reproduce the prototype

From `docs/design/onecode-experience`:

```powershell
npm ci
npm run dev
```

The local design-system reference expects the sibling `OneQuill` workspace described in the prototype README.

## Planned production architecture

The production architecture below is a design baseline from the [TRD](./TRD.md), not an implemented or fully selected stack.

| Area | Documented direction | Version status |
|---|---|---|
| Core orchestration and system services | Rust; stable toolchain pinned, edition 2024 or later as supported by that toolchain | No toolchain version selected or pinned yet |
| Async runtime | Tokio | Named by the engineering standards; recommended release is listed below, but no production dependency is selected |
| Error handling | `thiserror` at crate boundaries; `anyhow` or an equivalent for internal context | Named direction; recommended releases are listed below, but no production dependencies are selected |
| Structured logging | `tracing` | Named direction; recommended release is listed below, but no production dependency is selected |
| Desktop UI and UI-to-core protocol | Tauri 2.12.5 + React 19.3.1/TypeScript 7.0.2; Vite 8.3.5; versioned Rust API contracts over Tauri commands and channels | Accepted in [ADR-0003](./adr/0003-desktop-ui-and-bridge.md) |
| Editor engine and document-model bridge | To be decided through ADR-0011 | Open |
| Task/index database, vector index, and migrations | To be decided through ADR-0005 and ADR-0006 | Open |
| Terminal, browser, source control, language servers, sandbox, and graph storage/rendering | Candidates and evaluation criteria are described in the TRD; choices are tracked by ADR-0004 and ADR-0012 through ADR-0018 | Open |

### Desktop UI, editor, and visualization candidates

ADR-0003 accepts Tauri 2 with React/TypeScript for the production desktop UI. The versions below were checked against the shared OneQuill app and current package metadata on 2026-10-31; pin compatible dependencies in the production app manifest. The existing vanilla-JavaScript experience remains a separate sample-only prototype.

#### Graphs, diagrams, and charts

| Need | Candidate and latest version | Recommendation |
|---|---|---|
| Interactive coding/task flows | [React Flow (`@xyflow/react`)](https://reactflow.dev/learn) **12.12.0** | Use for node/edge editors where users connect, select, and manipulate a relatively small workflow or task DAG. It is not the first choice for the code knowledge map: that is a large graph-navigation surface with precomputed layouts, not an editable workflow canvas. MIT; peer dependencies support React 17+. |
| Knowledge-map graph rendering | [Sigma.js (`sigma`)](https://www.sigmajs.org/docs/) **4.0.4** | Strong candidate for the FR-119 graph viewer: WebGL rendering, pan/zoom, and large network exploration. Framework-agnostic. Pair with Graphology and a React adapter only if React is selected. |
| Graph data model and algorithms | [Graphology](https://graphology.github.io/) (`graphology`) **0.26.0** | Graph data model, traversal and algorithms for client-side graph interaction; keep the authoritative graph and queries in the Rust service. |
| Sigma React bindings | [`@react-sigma/core`](https://www.sigmajs.org/docs/) **6.0.0** | Optional React bindings; peer requirements match Sigma 4, Graphology 0.26, and React 18/19. The React app is selected; use bindings only if they simplify integration. |
| Force-directed layout | [`graphology-layout`](https://graphology.github.io/) **0.6.1**, [`graphology-layout-forceatlas2`](https://graphology.github.io/) **0.10.1** | Candidate for offline/background layout generation, not a per-render simulation on the UI thread. Persist layout by graph revision/scope as required by TRD §5.6. |
| Alternative graph analysis/viewer | [Cytoscape.js](https://js.cytoscape.org/) **3.34.4** | Evaluate instead of Sigma if graph analysis/layout extensions and its interaction model fit better. Do not ship two graph engines without a demonstrated separate use case. |
| Product and engineering charts | [Apache ECharts](https://echarts.apache.org/en/feature.html) **6.1.0** | Recommended charting candidate for task throughput, latency, cost, test outcomes, and resource metrics. Enable its accessibility component and descriptions; also provide an accessible data/table alternative. Use selective imports to limit bundle size. |
| ECharts React adapter | [`echarts-for-react`](https://github.com/hustcc/echarts-for-react) **3.0.6** | Optional React wrapper. Its current peer metadata accepts ECharts 6 and React 15+; adopt only if it provides value over direct integration. |

Use the visualization engines for distinct jobs: **React Flow** for editable process/workflow diagrams, **Sigma + Graphology** for exploring the knowledge network, and **ECharts** for quantitative dashboards. ECharts has a graph series, but that alone does not make it the knowledge-map renderer. For all graph/chart surfaces, retain keyboard-accessible filters, selection details, and a non-canvas representation; visualizations are navigation aids, not the sole source of information.

#### Coding workspace components

| Need | Candidate and latest version | Recommendation |
|---|---|---|
| UI framework | [React](https://react.dev/learn) and `react-dom` **19.3.1** | Selected by ADR-0003; components render API state and do not own policy or durable task state. |
| Type system | [TypeScript](https://www.typescriptlang.org/docs/) **7.0.2** | Selected for typed API/event contracts and UI state. Runtime validation is still required at trust boundaries. |
| Full IDE editor | [Monaco Editor](https://microsoft.github.io/monaco-editor/) **0.57.0**, [`@monaco-editor/react`](https://github.com/suren-atoyan/monaco-react) **4.7.0** | Candidate closest to VS Code editing; measure worker setup, memory, startup, large-file responsiveness, accessibility, and the Rust document-model bridge before choosing. Use the wrapper only with Monaco. |
| Lightweight/editor-framework alternative | [CodeMirror view](https://codemirror.net/docs/) **6.43.15**, state **6.7.6**, language **6.13.1** | Alternative editor engine with composable packages. Do not install Monaco and CodeMirror as competing primary editors; resolve ADR-0011 using keystroke, large-file, accessibility, extension, and bridge benchmarks. |
| Terminal rendering | [xterm.js (`@xterm/xterm`)](https://xtermjs.org/docs/) **6.0.0** | Candidate terminal emulator; it renders terminal I/O but does not provide a PTY, process lifecycle, or sandbox. Add only needed addons: fit **0.11.0**, WebGL **0.19.0**, web links **0.12.0**, search **0.16.0**. Treat terminal output and all browser-side code as security-sensitive. |
| Patch/diff review | [`@git-diff-view/react`](https://github.com/MrWangJustToDo/git-diff-view) **0.1.8** and `@git-diff-view/core` **0.1.8** | Candidate rendering library for reviewable hunks and before/after changes. Verify large-diff performance, accessibility, virtualization, and stable line anchors against OneCode’s typed diff model. |
| Large lists/trees | [`@tanstack/react-virtual`](https://tanstack.com/virtual/latest/docs/introduction) **3.14.24** | Use where profiling shows file, diagnostic, event, or graph-adjacent lists need virtualization; do not virtualize small panels by default. |
| Server/API state | [`@tanstack/react-query`](https://tanstack.com/query/latest/docs/framework/react/overview) **5.105.0** | Candidate for API query caching, invalidation, and synchronization; it is not the authoritative task/session state store. |
| Local UI state | [Zustand](https://zustand.docs.pmnd.rs/) **5.0.16** | Optional small client-state store (panels, transient selections). Keep policy, task state, and durable records in the Rust service. |
| Client routing | [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview) **1.170.46** | Candidate if the chosen desktop shell needs deep-linkable views; avoid adding a second router. |
| Accessible UI primitives | [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction), e.g. Dialog **1.3.1**, Tooltip **1.4.1** | Candidate accessible, unstyled primitives to implement OneQuill design tokens. Adopt components as needed rather than a second full visual design system. |
| Icons | [Lucide React](https://lucide.dev/guide/packages/lucide-react) **1.66.0** | Optional consistent icon set; keep names/labels accessible and do not use icons as the only control labels. |
| Localization | [i18next](https://www.i18next.com/), **26.5.12**, with [react-i18next](https://react.i18next.com/) **17.1.9** | Candidate localization stack for FR-105; externalize user-facing strings and test RTL layouts. |

#### Untrusted content, source display, and test quality

| Need | Candidate and latest version | Recommendation |
|---|---|---|
| Markdown messages/reports | [react-markdown](https://github.com/remarkjs/react-markdown) **10.1.0**, [remark-gfm](https://github.com/remarkjs/remark-gfm) **4.0.1**, [rehype-sanitize](https://github.com/rehypejs/rehype-sanitize) **6.0.0** | Candidate for agent output and documentation rendering. Keep raw HTML disabled unless a reviewed requirement demands it; sanitize any HTML-capable plugin pipeline because model, repository, and tool content is untrusted. |
| Static syntax highlighting | [Shiki](https://shiki.style/guide/) **4.5.0** | Candidate for code snippets in messages and evidence. It is not an editor, language server, or replacement for Monaco/CodeMirror. Load grammars/themes lazily to control bundle size. |
| Unit/component tests | [Vitest](https://vitest.dev/guide/) **5.0.5**, [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/) **16.3.3**, user-event **14.6.8** | Candidate fast UI test stack; test behavior and keyboard interactions rather than implementation details. |
| API contract mocks | [Mock Service Worker](https://mswjs.io/docs/) **3.0.3** | Candidate for deterministic local HTTP/event-stream fixtures without coupling UI tests to a live backend. |
| End-to-end tests | [Playwright](https://playwright.dev/docs/intro) **1.64.1** | Recommended browser automation candidate for UI workflows and accessibility/visual checks. The browser engine for OneCode’s embedded preview remains a separate ADR; Playwright is a test tool, not that product browser. |
| Accessibility automation | [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm) **4.14.0** | Candidate automated checks; does not replace keyboard, screen-reader, contrast, or manual accessibility testing. |

These are not all production dependencies. If React is chosen, a plausible starting point is React + TypeScript + OneQuill tokens + Radix primitives, React Query for API state, and only the editor, terminal, graph, and chart packages required by the accepted ADRs. Keep framework alternatives out of the shipped bundle; use focused prototypes and measurable acceptance criteria to choose. The exact npm versions above are a dated registry snapshot, not an assertion that the current prototype uses them.

### Rust library recommendations

There is no production `Cargo.toml` or Rust workspace in this repository yet. The versions below are the newest non-yanked stable releases reported by crates.io on 2026-10-31; they are recommendations for the planned application, not dependencies already installed or approved. Prerelease releases are excluded (for example, `notify` has a newer `9.0.0-rc.7`, so the listed stable version is `8.2.1`).

#### Proposed application baseline

| Area | Crate and latest stable version | OneCode use |
|---|---|---|
| Async runtime | [tokio](https://crates.io/crates/tokio) **1.54.1** | Shared async runtime for orchestration and services. |
| Cancellation and async utilities | [tokio-util](https://crates.io/crates/tokio-util) **0.7.20** | Cancellation tokens and utilities for long-running tasks. |
| Serialization | [serde](https://crates.io/crates/serde) **1.0.229**, [serde_json](https://crates.io/crates/serde_json) **1.0.154** | Typed contracts, persisted state, and JSON API payloads. |
| JSON Schema generation | [schemars](https://crates.io/crates/schemars) **1.2.3** | Generate versioned schemas for public and persisted contracts. |
| Errors | [thiserror](https://crates.io/crates/thiserror) **2.0.21**, [anyhow](https://crates.io/crates/anyhow) **1.0.104** | Typed crate-boundary errors and contextual internal errors, respectively. |
| Structured diagnostics | [tracing](https://crates.io/crates/tracing) **0.1.44**, [tracing-subscriber](https://crates.io/crates/tracing-subscriber) **0.3.23** | Structured, filterable local diagnostics. OpenTelemetry integration is cataloged below; telemetry export must follow explicit privacy and egress policy. |
| IDs and time | [uuid](https://crates.io/crates/uuid) **1.29.0**, [time](https://crates.io/crates/time) **0.3.55** | Stable identifiers and timestamp handling. Use one time library consistently. |
| CLI | [clap](https://crates.io/crates/clap) **4.6.7** | Command-line interface and argument parsing. |
| Outbound HTTP | [reqwest](https://crates.io/crates/reqwest) **0.13.5** | Approved model-provider and other outbound HTTP integrations. Enforce the gateway’s network and privacy policy above the HTTP client. |
| MCP | [rmcp](https://crates.io/crates/rmcp) **3.8.0** | Rust SDK candidate for MCP client/server integration; keep tool authorization in OneCode’s gateway. |
| Repository traversal | [ignore](https://crates.io/crates/ignore) **0.4.34** | Ignore-aware repository walking and file selection. Prefer its walker over adding a second general-purpose walker. |
| File watching | [notify](https://crates.io/crates/notify) **8.2.1** | Detect workspace changes for indexing and diagnostics. Validate behavior on each supported OS. |
| Syntax parsing | [tree-sitter](https://crates.io/crates/tree-sitter) **0.27.1** | Incremental syntax trees for repository intelligence. Add only the grammar crates approved for the supported language matrix. |
| OS credential storage | [keyring](https://crates.io/crates/keyring) **4.2.0** | Candidate for delegating provider credentials to OS credential stores; verify platform backends and threat model before adoption. |
| User data directories | [directories](https://crates.io/crates/directories) **6.0.0** | Locate platform-appropriate application data and configuration directories. |
| Cross-process file locks | [fs4](https://crates.io/crates/fs4) **1.1.0** | Candidate for cross-platform file locks around singleton ownership, index migration, and shared local state; test locking semantics per OS and do not use as a substitute for database transactions. |
| Secret handling | [secrecy](https://crates.io/crates/secrecy) **0.10.3**, [zeroize](https://crates.io/crates/zeroize) **1.9.1** | Reduce accidental secret exposure and clear sensitive buffers where supported; neither replaces OS isolation or secure storage. |
| Contract validation | [jsonschema](https://crates.io/crates/jsonschema) **0.60.2** | Candidate for validating untrusted JSON against versioned schemas at boundaries. Keep validation errors actionable and bounded. |

#### Add only when the corresponding architecture decision selects them

| Feature / decision | Candidate crate and latest stable version | Adoption condition |
|---|---|---|
| Local HTTP application API | [axum](https://crates.io/crates/axum) **0.8.9**, [tower](https://crates.io/crates/tower) **0.5.3**, [tower-http](https://crates.io/crates/tower-http) **0.7.1** | Use if the local API is implemented over HTTP; the TRD still allows in-process boundaries. |
| Metadata and task database | [sqlx](https://crates.io/crates/sqlx) **0.9.0** | Candidate SQLite-capable Rust database layer only; ADR-0005 must select the database, encryption, and migration strategy first. This release reports Rust 1.94.0 as its MSRV. |
| Language-server protocol types | [lsp-types](https://crates.io/crates/lsp-types) **0.97.0** | Add if the selected editor/LSP integration needs these protocol types; select and review the client/transport implementation separately. |
| Tree-sitter grammar interface | [tree-sitter-language](https://crates.io/crates/tree-sitter-language) **0.1.9** | Add when required by the selected grammar crates and supported-language matrix. |
| Terminal pseudo-terminal | [portable-pty](https://crates.io/crates/portable-pty) **0.9.0** | Candidate only; ADR-0012 must select the PTY implementation and verify parity, isolation, and WSL behavior. |
| File-based log rotation | [tracing-appender](https://crates.io/crates/tracing-appender) **0.2.5** | Add only if the logging design selects rolling file output and has a verified redaction layer. |

#### Development and dependency controls

| Purpose | Crate/tool and latest stable version | Use |
|---|---|---|
| Temporary files and directories in tests | [tempfile](https://crates.io/crates/tempfile) **3.27.0** | Isolated filesystem fixtures; development dependency only. |
| Property-based tests | [proptest](https://crates.io/crates/proptest) **1.12.0** | Exercise parsers, schemas, and state-machine invariants; development dependency only. |
| Dependency policy | [cargo-deny](https://crates.io/crates/cargo-deny) **0.20.2** | Enforce the license allowlist, vulnerability policy, and duplicate-major-version checks required by engineering standards. Install as a development/CI tool, not an application dependency. |

#### Observability and OpenTelemetry

| Purpose | Crate and latest stable version | Architect recommendation |
|---|---|---|
| Telemetry API | [opentelemetry](https://crates.io/crates/opentelemetry) **0.33.1** | Instrument through OpenTelemetry APIs where vendor-neutral context and metrics are useful. |
| Telemetry SDK | [opentelemetry_sdk](https://crates.io/crates/opentelemetry_sdk) **0.33.1** | Add only to application binaries that own telemetry providers, sampling, resources, and shutdown. |
| Rust tracing bridge | [tracing-opentelemetry](https://crates.io/crates/tracing-opentelemetry) **0.34.0** | Recommended bridge from the existing `tracing` instrumentation to OpenTelemetry spans. Its published dependencies target OpenTelemetry 0.33.x; keep the OTel crates on compatible versions. |
| OTLP exporter | [opentelemetry-otlp](https://crates.io/crates/opentelemetry-otlp) **0.33.1** | Optional exporter to a user-configured local Collector/backend. Gate behind an explicit setting and the network-egress approval policy; never send repository content, prompts, secrets, or raw tool output. |
| Semantic conventions | [opentelemetry-semantic-conventions](https://crates.io/crates/opentelemetry-semantic-conventions) **0.33.1** | Use standard attribute names where applicable; define and review OneCode-specific attributes separately. |
| OTel logs from `tracing` | [opentelemetry-appender-tracing](https://crates.io/crates/opentelemetry-appender-tracing) **0.33.1** | Optional only if a separately reviewed product requirement needs logs exported through OTel. Keep redacted local logs as the default. |
| Local stdout exporter | [opentelemetry-stdout](https://crates.io/crates/opentelemetry-stdout) **0.33.1** | Useful for development/test inspection; do not enable as a production telemetry sink by default. |

**Policy:** Instrumentation may create local spans and measurements, but telemetry export is **off by default** for this local-first desktop product, consistent with [TRD §7.3](./TRD.md#73-escalation-controls) and [TRD §15.1](./TRD.md#151-engineering-delivery-lifecycle). If an operator enables export, show the destination and data classes, apply redaction before serialization, require the applicable network approval, and record an egress receipt. Set bounded retention, sampling, and queue limits; shut providers down cleanly. The OpenTelemetry Rust implementation documentation currently marks traces **Beta** while metrics and logs are **Stable**; the language-independent tracing API specification is Stable. Treat this as an implementation maturity caveat, and pin a mutually compatible crate set.

#### Configuration, API, and transport

| Capability | Crate and latest stable version | Architect recommendation |
|---|---|---|
| TOML settings | [toml](https://crates.io/crates/toml) **1.1.8+spec-1.1.0** | Serde-compatible TOML parser/serializer for human-edited settings; use schema validation and preserve configuration provenance. This release reports Rust 1.85 as its MSRV. |
| Layered settings | [config](https://crates.io/crates/config) **0.15.27** | Optional helper for layered user/project settings. Adopt only if it preserves OneCode’s precedence, provenance, redaction, and validation rules; otherwise keep a small explicit resolver. |
| Local HTTP API | [axum](https://crates.io/crates/axum) **0.8.9**, [tower](https://crates.io/crates/tower) **0.5.3**, [tower-http](https://crates.io/crates/tower-http) **0.7.1** | Candidate stack if ADR-0002/0003 select HTTP. Tower middleware should not replace server-side policy checks. |
| Event streaming | [tokio-stream](https://crates.io/crates/tokio-stream) **0.1.19**, [tokio-tungstenite](https://crates.io/crates/tokio-tungstenite) **0.30.0** | Use only the transport needed by the selected event/API protocol (for example, WebSocket); do not add multiple streaming stacks without a requirement. |
| Local IPC | [interprocess](https://crates.io/crates/interprocess) **2.4.7** | Candidate for named pipes/Unix sockets if the process-boundary ADR selects local IPC. Evaluate Windows, macOS, Linux, and WSL parity before adoption. |
| HTTP primitives | [http](https://crates.io/crates/http) **1.5.0**, [url](https://crates.io/crates/url) **2.5.8** | Shared request/response and URL types for HTTP-facing boundaries; usually arrive transitively with the chosen server/client. Add direct dependencies only when application code uses them. |

#### Security, integrity, and transport

| Capability | Crate and latest stable version | Architect recommendation |
|---|---|---|
| TLS | [rustls](https://crates.io/crates/rustls) **0.23.46**, [webpki-roots](https://crates.io/crates/webpki-roots) **1.0.11** | Prefer a maintained Rust TLS implementation and an explicitly chosen trust-root strategy for outbound HTTPS. Do not silently disable certificate validation. |
| Platform certificate verification | [rustls-platform-verifier](https://crates.io/crates/rustls-platform-verifier) **0.7.1** | Evaluate if using OS trust stores is required; confirm behavior on every supported OS and in enterprise-managed environments. |
| Authenticated encryption | [chacha20poly1305](https://crates.io/crates/chacha20poly1305) **0.11.0** | Cryptographic primitive candidate, not an application-level encryption design. ADR-0005 must select the at-rest encryption/key lifecycle and threat model before use. |
| Password-based key derivation | [argon2](https://crates.io/crates/argon2) **0.6.0** | Only if a reviewed user-passphrase-derived key flow is actually required; do not invent password storage or key management around the crate. |
| Hashes | [sha2](https://crates.io/crates/sha2) **0.11.1** | Content/integrity hashes and artifact references; not a password hash or encryption scheme. |
| Encrypted portable files | [age](https://crates.io/crates/age) **0.12.1** | Candidate for user-requested encrypted exports/imports; do not conflate file encryption with the local database encryption decision. |
| Platform APIs | [windows](https://crates.io/crates/windows) **0.62.2**, [security-framework](https://crates.io/crates/security-framework) **3.7.0**, [nix](https://crates.io/crates/nix) **0.31.3** | Platform-specific adapters only for APIs the product needs. Keep unsafe and privileged code isolated in platform crates and verify equivalent security guarantees. |
| Linux sandbox primitives | [landlock](https://crates.io/crates/landlock) **0.4.7** | Linux-only candidate, not a cross-platform sandbox. ADR-0004 must define native isolation per OS and fail closed when mandatory controls are unavailable. |

Do not roll custom cryptography, TLS verification, authentication, or sandboxing. These crates do not by themselves establish a secure design; require a threat model, platform tests, safe defaults, and security review.

#### Persistence, repository intelligence, and integrations

| Capability | Crate and latest stable version | Architect recommendation |
|---|---|---|
| SQLite through async SQL | [sqlx](https://crates.io/crates/sqlx) **0.9.0** | Alternative to `rusqlite`, not an additional default. It reports Rust 1.94.0 as its MSRV; validate against the chosen toolchain and SQLite/encryption needs. |
| SQLite through synchronous API | [rusqlite](https://crates.io/crates/rusqlite) **0.41.1** | Alternative to `sqlx`; isolate blocking operations appropriately. ADR-0005 must choose one access strategy and review SQLite build/encryption distribution. |
| SQL migrations | [refinery](https://crates.io/crates/refinery) **0.10.0** | Candidate only if migrations are not handled by the selected database layer. Do not run two migration systems against the same schema. |
| In-memory graph algorithms | [petgraph](https://crates.io/crates/petgraph) **0.8.3** | Candidate for graph traversal/layout inputs; it is not the graph persistence engine. |
| Vector search | [usearch](https://crates.io/crates/usearch) **2.26.6**, [lancedb](https://crates.io/crates/lancedb) **0.41.0** | Alternatives for ADR-0006, not a recommendation to ship both. Compare local footprint, native payloads, Windows/macOS/Linux support, filtering, migration, and offline behavior. LanceDB reports Rust 1.94.0 as its MSRV. |
| Embedded Git | [git2](https://crates.io/crates/git2) **0.21.0** | Alternative only if ADR-0014 selects a library over the Git CLI; evaluate libgit2 packaging and credential-helper parity. |
| LSP client | [async-lsp](https://crates.io/crates/async-lsp) **0.2.4**, [lsp-types](https://crates.io/crates/lsp-types) **0.97.0** | Candidate LSP client and protocol types; select with ADR-0015 and keep language-server processes behind the manager. |
| Browser DevTools Protocol | [chromiumoxide](https://crates.io/crates/chromiumoxide) **0.9.1** | Candidate only if ADR-0013 selects Chromium/CDP; validate browser version lifecycle, isolation, downloads, and cross-platform packaging. |
| Desktop webview shell | [tauri](https://crates.io/crates/tauri) **2.12.5** (uses Wry **0.57.1**) | Selected by ADR-0003; assess platform WebView security and parity on every supported OS. |
| Terminal PTY | [portable-pty](https://crates.io/crates/portable-pty) **0.9.0** | Candidate for ADR-0012; pair with explicit process ownership, cancellation, output limits, and OS-level sandboxing. |

#### Local models, embeddings, and artifact trust

| Capability | Crate and latest stable version | Architect recommendation |
|---|---|---|
| llama.cpp runtime binding | [llama-cpp-2](https://crates.io/crates/llama-cpp-2) **0.1.160** | Candidate local inference backend; evaluate native build/runtime payloads, supported hardware, model formats, licensing, and platform parity before adopting. |
| Candle inference | [candle-core](https://crates.io/crates/candle-core) **0.11.1**, [candle-transformers](https://crates.io/crates/candle-transformers) **0.11.1** | Alternative Rust-native inference stack; select only after runtime/embedding benchmarks and hardware support tests. |
| Embedding pipeline | [fastembed](https://crates.io/crates/fastembed) **7.5.0** | Candidate embedding interface/backend; audit model acquisition, artifact provenance, runtime binaries, offline operation, and model licenses. |
| Hugging Face model access | [hf-hub](https://crates.io/crates/hf-hub) **1.0.0** | Optional acquisition client only; downloads must be user-approved, revision-pinned, integrity-checked, and covered by egress receipts. |
| Tokenization | [tokenizers](https://crates.io/crates/tokenizers) **0.23.2** | Add when the chosen model runtime requires it; do not assume all model families share one tokenizer. A newer `1.0.0-rc.3` is prerelease and excluded. |
| Safe-tensors artifacts | [safetensors](https://crates.io/crates/safetensors) **0.8.0** | Parse/inspect tensor artifacts only if the selected model format needs it; validate size limits and provenance. |
| Ed25519 signatures | [ed25519-dalek](https://crates.io/crates/ed25519-dalek) **3.0.0** | Candidate verifier only if the offline bundle ADR selects a compatible signature format and key lifecycle. |
| Minisign signatures | [minisign-verify](https://crates.io/crates/minisign-verify) **0.3.0** | Alternative for verifying bundles already using Minisign; choose one reviewed format rather than accepting arbitrary signature schemes. |
| Sigstore verification | [sigstore](https://crates.io/crates/sigstore) **0.14.0** | Optional if the supply-chain design adopts Sigstore identities/provenance; not a substitute for offline trust-anchor and revocation policy. |

Model runtime, embedding, tokenizer, and signature crates are alternatives selected by ADR-0006/0007, not a bundle to install together. The crates.io `ort` package had only yanked stable releases and 2.0 release candidates on the research date, so it is intentionally not recommended as a stable dependency.

#### Offline bundle containers

| Capability | Crate and latest stable version | Architect recommendation |
|---|---|---|
| ZIP archive | [zip](https://crates.io/crates/zip) **9.2.0** | Candidate container implementation if ADR-0007 selects ZIP; extraction must reject path traversal, duplicate/ambiguous entries, oversized files, and decompression bombs. |
| TAR archive | [tar](https://crates.io/crates/tar) **0.4.46** | Alternative archive format for ADR-0007; enforce the same path, size, and resource limits. |
| Zstandard compression | [zstd](https://crates.io/crates/zstd) **0.14.3** | Optional compression only if the selected bundle format needs it; cap decompressed bytes and processing time. |

Select one bundle/container and signature policy rather than accepting formats opportunistically. Verify signatures and artifact hashes before making imported model files available to a runtime.

#### Additional development and QA tools

| Purpose | Crate/tool and latest stable version | Use |
|---|---|---|
| Snapshot tests | [insta](https://crates.io/crates/insta) **1.49.0** | Review stable serialized artifacts, diagnostics, and rendered reports. |
| CLI integration tests | [assert_cmd](https://crates.io/crates/assert_cmd) **2.2.2**, [predicates](https://crates.io/crates/predicates) **3.1.4** | Exercise the CLI as a process and assert output/exit behavior. |
| HTTP integration mocks | [wiremock](https://crates.io/crates/wiremock) **0.6.5**, [mockito](https://crates.io/crates/mockito) **1.7.2** | Choose one HTTP mock library if provider/API integration tests need deterministic local fixtures. |
| Mocking | [mockall](https://crates.io/crates/mockall) **0.15.0** | Use selectively at narrow interfaces; prefer real in-process components for policy and state-machine tests. |
| Benchmarks | [criterion](https://crates.io/crates/criterion) **0.8.2** | Reproducible microbenchmarks for measured hot paths; product latency budgets still need end-to-end tests. |
| Async runtime diagnostics | [console-subscriber](https://crates.io/crates/console-subscriber) **0.5.0** | Developer-only Tokio task diagnostics behind an explicit dev feature; never enable a diagnostic server in production by default. |
| Test runner | [cargo-nextest](https://crates.io/crates/cargo-nextest) **0.9.150** | Optional CI runner; retain Cargo’s standard test commands as the project baseline unless CI adopts nextest. |
| Advisory scan | [cargo-audit](https://crates.io/crates/cargo-audit) **0.22.2** | Optional CI audit against RustSec advisories; can complement `cargo-deny`, not replace license and duplicate-version policy. |

Do not add an embedded Git library, vector database, browser engine, or OS sandbox crate from this list while its ADR remains open. Tauri/React are selected by ADR-0003; pin the application dependencies to the compatible versions above. In particular, do not add `git2` while the CLI-versus-library decision is open.

This is a capability-based shortlist for the product defined in the current TRD—not every crate in the Rust ecosystem, nor an instruction to install every row. It covers the major production, platform, integration, and verification surfaces currently specified. Add a crate only when a requirement needs it; prefer the Rust standard library or an existing dependency when sufficient. Recheck maintenance, transitive dependency/license posture, security advisories, feature flags, platform support, binary payloads, and MSRV during implementation. Pin the Rust toolchain, choose compatible Cargo requirements, commit `Cargo.lock` for the application, and build/test the actual feature and target matrix.

## Architect recommendations and next steps

The highest-value next step is to resolve OneCode's existing architecture decisions—not add more libraries to this catalog.

1. **Keep a decision ledger, not a shopping list.** For every candidate, record its state (`prototype`, `recommended`, `alternative`, `accepted`, or `rejected`), owning ADR, evaluation evidence, license, supported targets, and review date. Only accepted dependencies belong in production manifests. Keep this inventory as research; `Cargo.toml`/`Cargo.lock` and `package.json`/lockfile become the source of truth once production code exists.
2. **Resolve high-coupling ADRs first.** Prioritize the UI/process boundary (ADR-0002/0003), editor/document model (ADR-0011), sandbox (ADR-0004), persistence/encryption (ADR-0005), embeddings/vector index (ADR-0006), and browser (ADR-0013). Their decisions constrain transitive dependencies, binary size, platform support, and minimum compiler versions.
3. **Choose and test an MSRV before choosing “latest.”** Several catalog candidates report Rust 1.94 as their minimum supported compiler; adopting one could raise the minimum for the entire workspace. Set `package.rust-version`, test that exact toolchain in CI, and select compatible crate versions rather than upgrading the application's MSRV accidentally. Rust's [Cargo `rust-version` reference](https://doc.rust-lang.org/cargo/reference/rust-version.html) documents this contract.
4. **Automate updates, but make updates reviewable.** After manifests exist, use a bot such as [Renovate](https://docs.renovatebot.com/rust/) to propose Cargo manifests and lockfile updates on a schedule. Group low-risk patch/minor updates; keep major updates separate; require CI, license/advisory checks, and explicit review for platform, runtime, cryptography, and model-runtime changes. Do not auto-merge dependency updates before the project's gates are established.
5. **Add supply-chain evidence to release gates.** Run the already-listed `cargo-deny` and `cargo-audit`; consider [`cargo vet`](https://mozilla.github.io/cargo-vet/) if the team wants recorded human audits of third-party Rust crates (its own docs note it is under active development). Generate a machine-readable [CycloneDX or SPDX SBOM](https://cyclonedx.org/capabilities/sbom/) for each release, covering Rust, npm, native runtimes, and separately tracked model artifacts/licenses. A scanner result is evidence, not proof that a dependency is safe.
6. **Make privacy a telemetry acceptance criterion.** Keep local diagnostics useful with no network. Define a reviewed allowlist of telemetry fields, redaction tests, retention and sampling limits, opt-in/export controls, and a visible destination before enabling OTLP. Never use traces as a back door for prompt, source, terminal, browser, or credential data.
7. **Benchmark alternatives with the real workload.** Measure startup/RSS, editor keystroke latency, large-file behavior, graph sizes, accessibility, package size, and native build/update burden on Windows, macOS, and Linux (including WSL where applicable). Use small prototypes to compare Monaco vs CodeMirror, Sigma vs Cytoscape, and the selected desktop/webview choices; don't ship alternatives together just to defer a decision.
8. **Set UI quality gates before the production UI.** Require keyboard-only completion of critical flows, screen-reader review, RTL coverage, automated accessibility checks, and Playwright smoke tests across the supported OS/browser matrix. Canvas visualizations must have an equivalent navigable list/detail view, and charts need accessible descriptions plus tabular values.
9. **Track model artifacts separately from code dependencies.** Record model ID and immutable revision, hash, format, license, provenance/signature status, runtime compatibility, and size; downloads stay explicit and approval-gated. Updating a crate must never silently update a model artifact.

“Latest stable” is a research snapshot, not an upgrade policy. For every adopted dependency, prefer the newest stable release that passes compatibility, security, license, performance, and platform gates without silently raising the supported runtime/toolchain floor.

## Version sources

Versions above were checked on 2026-10-31. Registry and release data changes over time.

- [Vite getting started and supported setup](https://vite.dev/guide/)
- [Vite package metadata on the npm registry](https://registry.npmjs.org/vite/latest) — latest tag, Node engine range, and license
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases) — current release and LTS status
- [crates.io crate registry](https://crates.io/) — stable crate releases and package metadata; each crate link above identifies its registry record
- [Cargo dependency specification](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html) and [Cargo lockfiles](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html) — dependency requirements versus reproducible resolution
- [Cargo `rust-version` reference](https://doc.rust-lang.org/cargo/reference/rust-version.html) — declaring and enforcing MSRV
- [cargo-deny documentation](https://embarkstudios.github.io/cargo-deny/) and [cargo-vet documentation](https://mozilla.github.io/cargo-vet/) — dependency policy checks and recorded crate audits
- [Renovate Rust update manager](https://docs.renovatebot.com/rust/) — automated Cargo manifest and lockfile update proposals
- [CycloneDX SBOM overview](https://cyclonedx.org/capabilities/sbom/) — machine-readable component inventory and supply-chain visibility
- [OpenTelemetry Rust documentation](https://opentelemetry.io/docs/languages/rust/) and [exporters](https://opentelemetry.io/docs/languages/rust/exporters/) — crate roles, current component maturity, and OTLP export guidance
- [OpenTelemetry tracing API specification](https://opentelemetry.io/docs/specs/otel/trace/api/) — language-independent API maturity status
- [`tracing-opentelemetry` documentation](https://docs.rs/tracing-opentelemetry/latest/tracing_opentelemetry/) — tracing bridge behavior and compatibility
- [React Flow guide](https://reactflow.dev/learn) — node/edge workflow canvas
- [Apache ECharts features](https://echarts.apache.org/en/feature.html) and [accessibility guide](https://echarts.apache.org/handbook/en/best-practices/aria/) — chart types, rendering, and accessible chart descriptions
- [Sigma.js documentation](https://www.sigmajs.org/docs/) and [Graphology documentation](https://graphology.github.io/) — interactive graph rendering and graph model/algorithms
- [React documentation](https://react.dev/learn), [Monaco Editor](https://microsoft.github.io/monaco-editor/), and [CodeMirror](https://codemirror.net/docs/) — UI and editor candidates
- [xterm.js security guide](https://xtermjs.org/docs/guides/security/) — terminal embedding security considerations
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview), [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction), and [Shiki](https://shiki.style/guide/) — UI state, accessible primitives, and static syntax highlighting
- [Playwright introduction](https://playwright.dev/docs/intro) and [Vitest guide](https://vitest.dev/guide/) — frontend validation candidates
- [RustSec Advisory Database](https://rustsec.org/) — security advisory source for dependency review
- [Tauri documentation](https://v2.tauri.app/) and [Tree-sitter documentation](https://tree-sitter.github.io/tree-sitter/) — framework and parser references
- Local project manifests: [`package.json`](./design/onecode-experience/package.json), [`package-lock.json`](./design/onecode-experience/package-lock.json), and the installed local OneQuill package metadata
- Production direction and open decisions: [TRD](./TRD.md), [engineering standards](./ENGINEERING-STANDARDS.md), and [ADR index](./adr/README.md)
