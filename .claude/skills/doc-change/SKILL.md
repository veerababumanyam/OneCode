---
name: doc-change
description: Change OneCode product requirements, architecture, agent rules, or standards consistently across the PRD, TRD, agent operating rules, ADRs, TECH-STACK, tasks, and indexes. Use when adding or changing an FR-nn, a TRD section, an R-nn rule, or a policy document.
---
# Change the documents together

1. **Locate the owner** with docs/README.md: behavior → PRD, architecture or controls → TRD, enforced agent behavior → AGENT-OPERATING-RULES, decision → ADR, versions → TECH-STACK, practice → the matching standards document.
2. **Edit the owner first**, then every document that cites it. Re-read each file right before editing; other sessions may be changing it.
3. **IDs:**
   - New requirement: the next unused `FR-nn` after the highest in docs/PRD.md; never reuse a retired number.
   - New agent rule: the next unused `R-nn`; changing docs/AGENT-OPERATING-RULES.md also needs a PRD/TRD change or ADR, a security review, and updated tests (its §1). Stop and ask before editing it.
   - New TRD content: a new subsection, so existing `§` citations keep working.
   - Update ranges quoted elsewhere (for example the FR range in docs/README.md).
4. **Traceability:** update the traceability tables (AGENT-OPERATING-RULES §10, TRD §18) and the tasks in tasks/plan.md that implement the change.
5. **Do not duplicate.** In secondary documents, link to the owner rather than copying the rule.
6. **Check:** run `node scripts/check-doc-links.mjs`, then ask the `docs-consistency-reviewer` subagent to review the changed files. Fix what it confirms.
7. **Record** a `CHANGELOG.md` entry when the change is user-visible.
