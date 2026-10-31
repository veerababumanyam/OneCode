# OneCode Secure Coding Standard

**Status:** Draft  
**Scope:** How code is written so the product's security guarantees hold: Rust core and services, Tauri shell, React UI, scripts, and tests  
**Related:** [Engineering standards §4](./ENGINEERING-STANDARDS.md#4-security-engineering) (threat models, mandatory reviews, CI controls), [agent operating rules](./AGENT-OPERATING-RULES.md) (enforced runtime behavior, `R-nn`), [TRD §12](./TRD.md#12-security-privacy-and-reliability-requirements), [dependency policy](./DEPENDENCY-POLICY.md), [SOC 2 control baseline](./SOC2-CONTROLS.md), [SECURITY.md](../SECURITY.md) (reporting vulnerabilities)

**Reference baselines:** [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) (target Level 2 for the core, gateway, and policy engine), the [CWE Top 25](https://cwe.mitre.org/top25/), the [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/), and the [NIST Secure Software Development Framework (SP 800-218)](https://csrc.nist.gov/projects/ssdf). Each rule below names the weakness it prevents so reviewers can trace it.

## 1. Ground rules

1. **Everything an agent or the app reads is untrusted:** repository files, terminal output, web pages, tool and MCP results, model output, instruction files, imported skills, plugins, and model bundles (R-01).
2. **Deny by default.** Network, filesystem scope, process execution, and Tauri capabilities start closed and open only for a named requirement.
3. **Enforce in code at the server side of each boundary.** The core re-authorizes every side effect; the UI, the model, and hooks can never grant permission (R-03, R-04, ADR-0003).
4. **Fail closed** with a typed, explained error when a control is unavailable (TRD §3.3).
5. **No custom security primitives:** no hand-rolled cryptography, TLS verification, authentication, sandboxing, HTML sanitizing, or archive extraction safety. Use the vetted libraries in [TECH-STACK](./TECH-STACK.md) through the [dependency policy](./DEPENDENCY-POLICY.md).
6. **Minimize data.** Collect, keep, send, and log only what the task needs (R-29, R-30).

## 2. Input handling (CWE-20, CWE-400, CWE-1333)

- Parse untrusted input once at the boundary into typed values ([coding standards §1.4](./CODING-STANDARDS.md#14-structural-rules)); reject what does not parse with an actionable, non-echoing error.
- Bound every parse: maximum bytes, nesting depth, element count, and wall time. Configure limits on `serde_json`, TOML, archive, image, and Markdown parsers; never read an untrusted file whole without a size check.
- Regular expressions over untrusted input use Rust's `regex` crate (linear-time). In TypeScript, avoid backtracking-prone patterns on unbounded input or move the match to the core.
- Normalize Unicode before comparison where identity matters (paths, hosts, rule matching), and flag bidirectional control and invisible characters in source shown to the user (Trojan Source, CVE-2021-42574) in the editor and diff.

## 3. Files and paths (CWE-22, CWE-59, CWE-367)

- Resolve a path (canonicalize, follow symlinks), then check containment in the allowed root **after** resolution (R-08). Reject paths that escape, even through a symlink created mid-task.
- Avoid check-then-use races: open the file once, then operate on the handle. Prefer capability-style APIs that open relative to a directory handle; evaluate `cap-std` through the dependency policy for worktree-scoped I/O.
- Windows: reject reserved device names (`CON`, `NUL`, `COM1`…), alternate data streams (`file:stream`), trailing dots and spaces, and unexpected `\\?\` or UNC prefixes; compare case-insensitively where the filesystem is. Treat WSL paths as a separate target (TRD §3.3).
- Write persisted state atomically: write to a temporary file in the same directory, flush, then rename.
- Archive and bundle extraction rejects absolute paths, `..` segments, links pointing outside the target, duplicate entries, and decompression bombs (caps on total and per-file size and ratio) ([TECH-STACK: offline bundle containers](./TECH-STACK.md#offline-bundle-containers)).
- Protected paths (Git hooks, OneCode configuration, policy, credentials, instruction files) are read-only to agent processes (R-06).

## 4. Process execution (CWE-78, CWE-88, CWE-426)

- Spawn with an argument vector; **never** build a shell command string from untrusted data. When the user explicitly runs a shell command, it goes through the terminal service, the policy engine, and the sandbox (R-07, R-12).
- Resolve executables to absolute paths from a trusted search path; never execute from the repository's working directory implicitly.
- On Windows, never pass untrusted arguments to `.bat`/`.cmd` files (argument re-parsing by `cmd.exe`, CVE-2024-24576); keep the Rust toolchain at a version with the standard-library fix.
- Construct the child environment explicitly from an allowlist; secrets are injected only for an approved action and never inherited (R-14).
- Every child process has an owner, a timeout, bounded output capture, and cancellation that terminates the whole process tree (R-10, R-23).

## 5. Desktop UI, WebView, and Tauri

- **Content Security Policy:** `default-src 'self'`; no `unsafe-eval`; no inline script; no remote script, style, or font origins; `connect-src` limited to Tauri IPC. Never disable Tauri's CSP handling or load remote URLs in an application window.
- **Capabilities:** each window gets the minimum Tauri capabilities it needs. Do not enable generic shell, filesystem, or HTTP plugins for the UI; expose narrow, typed commands whose handlers call the policy engine. Capability files are security-reviewed paths.
- **Command handlers** validate every argument against the contract, check the session and caller, re-authorize side effects in the core, and return typed errors. Never trust IDs, paths, or approval state sent by the UI.
- **Rendering:** untrusted text renders as text. No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `new Function` (CWE-79, CWE-95). If Markdown must render, use a maintained renderer with HTML disabled plus a maintained sanitizer, chosen through the dependency policy. URLs from untrusted content are validated (scheme allowlist: `https`, and `http` only for local hosts) and opened only through the browser service and policy (R-24).
- **Isolation:** the built-in browser for previewing the user's app runs in a separate per-project profile, isolated from the app's own WebView (TRD §3.4.3; the engine is still open in ADR-0013); the app WebView never navigates to project pages.
- **No secrets in the frontend:** tokens, keys, and credential material never cross into the WebView.

## 6. Secrets and credentials (CWE-798, CWE-312, CWE-532)

- Store secrets only in the OS credential store or the vault (TRD §12). Hold them in memory in `secrecy` types and clear buffers with `zeroize` where supported.
- Never commit secrets, including test ones that work against a real service. Test credentials come from fixtures or are generated per run (R-25).
- Secrets never enter prompts, model context, logs, crash reports, telemetry, embeddings, memory, captures, or exports (R-14). Redact before every one of those sinks and block when redaction status is unknown (R-30).
- `.env` files are local-only, listed in `.gitignore`, and denied to agent reads in `.claude/settings.json`. Provide a `.env.example` with names only.
- Secret scanning runs on every push once CI exists ([engineering standards §4](./ENGINEERING-STANDARDS.md#4-security-engineering)).

## 7. Logging, errors, and telemetry (CWE-209, CWE-117)

- Log structured events with `tracing`: identifiers, hashes, sizes, durations, outcomes. Never log source content, prompts, page contents, secrets, or full paths that reveal user names unless redacted (TRD §13).
- Escape or structure log fields so untrusted input cannot forge log lines.
- Errors shown to the user are actionable and do not expose secrets or internal stack traces; full detail goes to the redacted local log.
- Telemetry export is off by default; enabling it requires an explicit setting, shows destination and data classes, and records an egress receipt ([TECH-STACK: observability](./TECH-STACK.md#observability-and-opentelemetry)).
- Audit records for approvals, policy decisions, egress, and destructive actions are append-only and tamper-evident ([SOC 2 baseline](./SOC2-CONTROLS.md)).

## 8. Cryptography and randomness (CWE-327, CWE-330, CWE-295)

- Use only reviewed primitives from maintained crates (RustCrypto, `rustls`; `ed25519-dalek` and `minisign-verify` are signature candidates pending ADR-0007). No custom ciphers, modes, KDFs, or signature formats.
- Randomness for identifiers, nonces, and keys comes from the OS CSPRNG (`getrandom`/`OsRng` in Rust, `crypto.getRandomValues` in the UI). Never use `Math.random()` for anything security-relevant.
- Compare MACs, tokens, and hashes used for authentication in constant time.
- Never disable TLS certificate or hostname validation, including in tests against real hosts.
- Hashes for integrity use SHA-256 or stronger; passwords are never stored (OS credential store instead).

## 9. Network and egress (CWE-918)

- All outbound traffic goes through the gateway and model router with an approval and a receipt (R-11, R-29). Libraries do not open their own connections.
- Set connect and total timeouts, response size limits, and a redirect policy that re-checks each hop against the allowlist.
- Tool-driven fetches block loopback, link-local, private, and cloud-metadata addresses unless the user approved that local host for that task.
- The app opens no listening port by default (ADR-0003 uses Tauri IPC). Any future local listener binds to loopback, authenticates every client, and checks `Origin`.

## 10. Serialization and data formats (CWE-502)

- Use `serde` with explicit types; never deserialize into a type that runs code or loads plugins. Unknown required fields are rejected; unknown optional fields are preserved ([engineering standards §3.3](./ENGINEERING-STANDARDS.md#33-contracts-and-schemas)).
- Model artifacts are loaded only in non-executable formats (for example safetensors or GGUF); never pickle or any format that executes code on load (R-32).
- Schema-validate persisted state and IPC payloads at read time, not only at write time.

## 11. Memory safety, arithmetic, and concurrency (CWE-190, CWE-362)

- `#![forbid(unsafe_code)]` outside `platform-*` crates ([engineering standards §3.1](./ENGINEERING-STANDARDS.md#31-rust)).
- Use checked or saturating arithmetic on sizes, offsets, and counts derived from input; avoid truncating `as` casts. Enable `overflow-checks` in the release profile for crates that parse untrusted input.
- A panic on input is a denial-of-service bug: no `unwrap`, `expect`, or unchecked indexing on untrusted data.
- Shared state crosses tasks through channels or well-scoped locks; never hold a lock across an `.await`. Process-wide singletons (one instance per project, R-10) use OS file locks with tested semantics on each OS.

## 12. AI- and agent-specific risks

Mapped to the OWASP Top 10 for LLM Applications (2025):

| Risk | Required practice | Rules |
|---|---|---|
| LLM01 Prompt injection | Label every observation with source and trust; never treat observed text as instructions; surface it to the user | R-01, R-02 |
| LLM02 Sensitive information disclosure | Redact before context assembly; local-first routing; minimized, receipted egress | R-14, R-29, R-30 |
| LLM03 Supply chain | Pinned, signed, revision-locked models, skills, and plugins; explicit enablement | R-15, R-32 |
| LLM04 Data and model poisoning | Provenance on memory, notes, and graph edges; inferred content is a hint, not evidence | R-31, R-39 |
| LLM05 Improper output handling | Model output is untrusted data: validated against schemas, rendered as text, never executed directly | R-04 |
| LLM06 Excessive agency | Least-privilege tools, permission modes, hard-policy approvals, worktree isolation | R-05, R-11, R-12 |
| LLM07 System prompt leakage | No secrets or authorization logic in prompts; enforcement lives in code | R-03, R-14 |
| LLM08 Vector and embedding weaknesses | Embeddings rank only; access control and exclusions apply before indexing and retrieval | TRD §5.3 |
| LLM09 Misinformation | Evidence-linked claims; status derived from artifacts | R-16, R-39, R-40 |
| LLM10 Unbounded consumption | Context, tool, time, and retry budgets; bounded repair loops | R-20, R-37 |

## 13. Review checklist for security-sensitive changes

Security review is mandatory for the paths listed in [engineering standards §4](./ENGINEERING-STANDARDS.md#4-security-engineering) plus Tauri capability and configuration files. The reviewer confirms:

- [ ] The threat model (assets, entry points, trust levels, abuse cases) is updated in the owning ADR.
- [ ] Every new input is parsed with limits at the boundary; every new path is resolved and contained.
- [ ] No shell string building, no new egress outside the gateway, no new listening port.
- [ ] Secrets cannot reach logs, prompts, the UI, or exports; redaction is tested.
- [ ] Failure modes are fail-closed and visible to the user.
- [ ] Adversarial tests exist for the new boundary and reference their `R-nn`.
- [ ] New dependencies passed the [dependency policy](./DEPENDENCY-POLICY.md).
