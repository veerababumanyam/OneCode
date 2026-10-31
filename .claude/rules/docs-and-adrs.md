---
paths:
  - "docs/**/*.md"
  - "*.md"
  - "tasks/**/*.md"
---
# Documentation, requirements, and ADRs

- Ownership: PRD = user-facing behavior (`FR-nn`); TRD = architecture and controls (`TRD §n.n`); AGENT-OPERATING-RULES = enforced runtime agent rules (`R-nn`); ADRs = locked-in decisions; TECH-STACK = dated candidate versions. A change that affects several updates them in the same change.
- IDs are permanent: never renumber or reuse `FR-nn`, `R-nn`, or `ADR-nnnn`. Retire a row by marking it superseded. Add new TRD material as new subsections so existing citations stay valid.
- ADRs: use the reserved number from docs/adr/README.md when one exists; follow 0000-template.md; include a threat model for any trust boundary or dependency with system reach. An accepted ADR changes only through a superseding ADR. Use the `new-adr` skill.
- `docs/AGENT-OPERATING-RULES.md` needs a PRD or TRD change or an ADR, a security review, and updated tests to change (its §1). Do not edit it as a side effect.
- Policy docs (CODING-STANDARDS, SECURE-CODING, DEPENDENCY-POLICY, DESIGN-GUIDELINES, ACCESSIBILITY, SOC2-CONTROLS) link to the owning document instead of restating it. Do not duplicate a rule in two places.
- Links are relative with GitHub-style heading anchors. After editing headings or links, run `node scripts/check-doc-links.mjs`.
- Do not claim compliance or certification (WCAG, SOC 2) without linked evidence; say what was verified.
- `docs/old-ref-docs/` is historical. Do not update it to match current docs.
