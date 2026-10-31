---
name: new-adr
description: Draft a OneCode architecture decision record (ADR) for a dependency with system reach, a new trust boundary, a schema major version, a permission-semantics change, a platform exception, or an open choice in TRD §17. Use when a decision is about to become hard to reverse.
---
# Draft an ADR

1. **Find the number.** Open `docs/adr/README.md`. If the decision is in the "Decisions to record" table, use its reserved number and title. Otherwise take the next unused number after the highest reserved one and add a row to that table.
2. **Check for an existing file** with that number in `docs/adr/`. If it exists and is Accepted, write a new ADR that supersedes it instead of editing it.
3. **Copy the template** `docs/adr/0000-template.md` to `docs/adr/NNNN-kebab-title.md` and fill every section:
   - Status `Proposed` (only the product owner or the deciders listed make it `Accepted`), date, deciders, affected `FR-nn`, TRD sections, and `R-nn`, and a revisit trigger.
   - Context from the TRD section and PRD requirements; cite them by link.
   - Decision in a few sentences, with the selected library and version when relevant (check `docs/TECH-STACK.md` and the dependency policy's "latest safe" rule).
   - At least two alternatives, including "build it ourselves" for commodity capabilities, each with why not.
   - Consequences: positive, negative with mitigations, platform differences, migration or rollback path.
   - Threat model table whenever the decision adds a trust boundary or a dependency with system reach.
   - Verification: the tests or evidence that will prove the decision works on each OS.
4. **Update the owners together:** mark the item resolved in TRD §17 with a link, update `docs/TECH-STACK.md` if versions or selections change, and update `docs/ENGINEERING-STANDARDS.md` or the coding standards only if the decision changes a standard.
5. **Run** `node scripts/check-doc-links.mjs` and fix any broken link.
6. **Ask** the `docs-consistency-reviewer` subagent to check the ADR and the documents you touched.
