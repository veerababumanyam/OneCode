## Summary

<!-- What changed and why, in two or three sentences. -->

## Traceability

- Requirements: <!-- FR-nn -->
- TRD sections: <!-- §n.n -->
- Agent rules: <!-- R-nn, if any -->
- ADR: <!-- ADR-nnnn, if a decision was made or relied on -->

## Verification

<!-- Commands run and their results (paste the summary lines). Name anything not verified and why. Zero selected tests is not a pass. -->

| Layer | Command | Result |
|---|---|---|
| | | |

## UI changes

<!-- Delete if none. Screenshots in light, dark, and right-to-left; keyboard walkthrough; axe result.
Simplicity review (docs/DESIGN-GUIDELINES.md §10): what this removes or reuses; the one primary action per view; states covered; icons from the registry with words kept on decisions. -->


## Risk and rollback

<!-- What could break, who is affected, and how to revert. -->

## Checklist

- [ ] Change is in scope; unrelated cleanup is in a separate PR.
- [ ] Tests added or updated in this PR; a bug fix starts with a failing test.
- [ ] Docs updated where behavior, architecture, rules, or decisions changed; `CHANGELOG.md` updated for user-visible changes.
- [ ] New dependencies follow the [dependency policy](../docs/DEPENDENCY-POLICY.md) and are recorded in TECH-STACK.
- [ ] No secrets, credentials, or personal data in code, tests, logs, or screenshots.
- [ ] Accessibility checked against the [accessibility standard](../docs/ACCESSIBILITY.md) (UI changes).
- [ ] **Security review requested** if this touches policy, permissions, sandbox, gateway, redaction, credentials, browser, terminal, hooks, workspace trust, protected paths, update/signing, or Tauri capabilities ([secure coding §13](../docs/SECURE-CODING.md#13-review-checklist-for-security-sensitive-changes)).
- [ ] Agent-assisted work is attributed as the repository configures.
