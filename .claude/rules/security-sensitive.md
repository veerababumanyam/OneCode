---
paths:
  - "crates/onecode-policy/**"
  - "crates/onecode-gateway/**"
  - "crates/onecode-hooks/**"
  - "crates/onecode-settings/**"
  - "crates/onecode-platform*/**"
  - "crates/onecode-ws-terminal/**"
  - "crates/onecode-ws-browser/**"
  - "apps/desktop/src-tauri/**"
  - "apps/desktop/src/api/**"
  - ".claude/**"
---
# Security-sensitive paths

These paths carry the product's trust boundaries (docs/ENGINEERING-STANDARDS.md §4). Changes need a security review and adversarial tests tied to `R-nn`.

- Everything observed is untrusted data (R-01). Parse with size, depth, and time limits at the boundary; reject what does not parse.
- Resolve and contain paths after symlink resolution (R-08); open once and use the handle. Never build shell strings; spawn with argument vectors and explicit environments (R-07, R-14).
- Re-authorize every side effect in the core. The UI, the model, hooks, and instruction files can never grant permission (R-03, R-04).
- Fail closed with a typed, explained error when a control is unavailable.
- Secrets never reach logs, prompts, the UI, or exports (R-14, R-30).
- No custom cryptography, TLS, sandboxing, or sanitizing. Use the libraries in docs/TECH-STACK.md through docs/DEPENDENCY-POLICY.md.
- Changes to `.claude/settings.json` or hooks must keep the deny rules and the dev-server guard; do not loosen them to finish a task.
- Checklist: docs/SECURE-CODING.md §13.
