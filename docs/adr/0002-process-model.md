# ADR-0002: Host the core in one process per data directory, with out-of-process workers for untrusted and native code

**Status:** Accepted  
**Date:** 2026-10-31  
**Deciders:** Architect, by delegation from the product owner  
**Affects:** PRD FR-64, FR-78, FR-87, FR-96; TRD §3.1, §3.2, §3.3, §3.4.5, §4.2, §8, §11; agent rules R-07, R-10, R-23, R-35; [engineering standards §2](../ENGINEERING-STANDARDS.md#2-repository-layout-proposed-pending-adr-0002)  
**Revisit trigger:** a measured need for a second long-lived client attached to one core beyond the CLI (for example an IDE extension), a crash class in an in-process module that isolation would have contained, or a profile showing the single process exceeds the idle-memory budget because of a component that could run on demand.

## Context

TRD §3.2 proposed a single local process with internal Rust modules and IPC only for MCP servers and model runtimes, and left open whether to introduce local service boundaries. ADR-0003 fixed the desktop shell (Tauri) and its command/channel bridge and deferred any transport for other local clients to this decision. The engineering standards need a crate layout before any Rust code is written, and the single-instance rule (R-10, FR-78) needs one owner for each set of on-disk state.

Two forces pull against each other. Fewer processes are simpler to build, debug, package, and secure on three operating systems. But OneCode runs code it does not trust (repository commands, hooks, MCP servers, language servers, the built-in browser) and native code that can crash (model runtimes), and a crash or compromise there must not take down the editor or the policy engine.

## Decision

**One core process per OneCode data directory.** The core (orchestrator, policy engine, session service, gateway, repository intelligence, quality engine, workspace services) is a set of Rust library crates hosted by exactly one process: the desktop app (Tauri) when it is running, otherwise a headless CLI host. The host takes an exclusive OS file lock on the data directory at startup; a second host refuses to start and tells the user where the running one is.

Commitments:

1. **Inside the process:** modules talk through typed async interfaces. Stateful services (sessions, process registry, index writer, model registry) are Tokio tasks that own their state and receive commands over **bounded** channels; nothing shares mutable state across modules except through those owners. One Tokio runtime per process (engineering standards §3.1).
2. **Out of process, always:** every command, test, hook, and repository-provided tool (sandboxed per ADR-0004), MCP servers (stdio or local transport), language servers and debug adapters (ADR-0015), the built-in browser engine (ADR-0013), and the **model runtime**, which runs in a supervised `onecode-model-worker` child process so a native crash or out-of-memory kill cannot take down the core. Each child is registered in the process registry (TRD §3.4.5) with owner, ports, and lifetime, and is killed as a tree on cancellation.
3. **Second local client (CLI while the desktop app runs):** attaches to the running core over a **local IPC channel** (named pipe on Windows, Unix domain socket on macOS and Linux) that is created with an access-control list limited to the current OS user, carries the same versioned API as the Tauri commands (ADR-0020), and authenticates each connection with a per-session token written to a user-only file in the data directory. No TCP listener is opened (ADR-0003). This channel is built when the CLI milestone needs it, not before.
4. **Crate layout:** one Cargo workspace at the repository root, crates under `crates/onecode-<component>` per [engineering standards §2](../ENGINEERING-STANDARDS.md#2-repository-layout-proposed-pending-adr-0002); the Tauri shell crate is `apps/desktop/src-tauri` (package name `onecode-desktop`) and is a workspace member; the CLI is `crates/onecode-cli`; the model worker is `crates/onecode-model-worker`. `desktop` and `cli` depend only on `onecode-api`.
5. **Fail closed:** if a worker cannot start in its required sandbox, the dependent feature is unavailable with an explanation (TRD §3.3); the core never pulls that work in-process to compensate.

## Alternatives considered

| Option | Summary | Why not (or why not yet) |
|---|---|---|
| Everything in one process, including the model runtime | Simplest packaging and lowest latency | A native inference crash or OOM would kill the editor, terminal, and unsaved work; R-35 recovery would depend on luck |
| Microservices over local gRPC/HTTP | Each component its own process with a network API | Many listening sockets, origin/auth surface on every port, three-OS packaging and supervision cost, and no requirement that needs it |
| Separate daemon always, UI as a thin client | Core runs as a background service; desktop and CLI both attach | Adds service installation per OS, an always-on process, and a mandatory IPC hop for the desktop's hot paths with no current benefit; reconsider if an IDE extension or remote client becomes a requirement |
| Model runtime in-process via FFI with panic catching | Avoids a worker process | Native aborts and OOM kills cannot be caught; GPU drivers can hang the process |

## Consequences

- **Positive:** one owner per data directory makes single-instance behavior (R-10) and transactional state (ADR-0005) straightforward; the hot paths between the UI and the core stay in-process through Tauri; untrusted and crash-prone code is isolated.
- **Negative and mitigations:** the model worker adds a stdio/IPC hop (measured against the latency budgets in engineering standards §12; batching and streaming keep it small); worker supervision needs restart and backoff logic, owned by the process registry.
- **Platform differences:** named pipes versus Unix sockets differ in ACL semantics; both are created user-only and tested per OS. WSL workspaces get their own worker processes inside the WSL target (TRD §3.3, FR-81).
- **Migration or rollback path:** components talk through traits, so moving one behind IPC later (for example an IDE-facing daemon) replaces its in-process adapter without changing callers.

## Threat model

| Asset | Entry point | Trust level of input | Abuse case | Mitigation | Test |
|---|---|---|---|---|---|
| Core state and policy decisions | Local IPC channel | Local processes of the same user; other users | Another local user or a malicious local process drives the core | User-only ACL on the pipe/socket, per-session token, same server-side policy as Tauri commands | IPC connection from another user and without a token is refused |
| Core availability and unsaved work | Model worker, language servers, browser engine | Native code and repository-controlled code | Crash, hang, or memory exhaustion | Separate supervised processes with memory and time limits; core survives and reports | Kill and OOM fixtures keep the core responsive |
| Data directory integrity | A second OneCode host | Same user | Two hosts write the same databases | Exclusive OS file lock; second host refuses | Duplicate-start fixture (R-10) |
| Child process control | Process registry | Core-issued commands | Orphaned or foreign processes are stopped | Owner-scoped stop; tree kill only of owned children | Foreign-stop fixture (R-10) |

## Verification

- Duplicate-host test: a second desktop or CLI host on the same data directory exits with the documented message, on each OS.
- Worker crash tests: killing the model worker, a language server, and the browser engine leaves the editor and policy engine responsive and surfaces an actionable error.
- IPC tests (when the CLI attach lands): a connection from a different OS user and a connection without the session token are rejected on Windows, macOS, and Linux.
- Workspace layout check: `cargo metadata` shows `desktop` and `cli` depend only on `onecode-api` among OneCode crates.
