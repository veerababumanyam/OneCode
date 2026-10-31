---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/tests/**"
  - "fixtures/**"
---
# Tests

- One behavior per test; the name states the behavior and, when it verifies a requirement or rule, the ID (`it("refuses a second dev server [R-10]")`, `fn r10_refuses_second_dev_server()`).
- Deterministic only: inject clocks, randomness, file systems, and network fakes; no sleeps for synchronization; no real network or model runtime in unit and component tests.
- Bug fixes start with a test that fails for the reported reason.
- Never delete, skip, or loosen a test to make a change pass (R-22). A tagged-skipped test is reported as skipped, never as passed; zero selected tests is a failure.
- UI tests query by role and accessible name; they double as accessibility checks.
- Fixtures contain no real secrets or user data; test credentials are generated or come from fixture files.
- Policy: docs/ENGINEERING-STANDARDS.md §5; practice: docs/CODING-STANDARDS.md §7.
