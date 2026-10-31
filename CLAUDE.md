# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Claude Code specifics

- **Harness rules** (`.claude/settings.json`): the Read tool (and common read commands) is denied on `.env`, key, and secrets files; the Edit tools are denied on `graft/` caches, `dist/`, `node_modules/`, and lockfiles; `git push`, publishing, and edits to `.claude/settings.json` or hooks ask first, in Bash and PowerShell. A script can still open a denied file, so these are not an OS sandbox. A PreToolUse hook (`.claude/hooks/guard-dev-server.mjs`) blocks starting a dev or preview server whose port is already in use, and any alternate-port flag. If it blocks you, use the running instance.
- **Path-scoped rules** load from `.claude/rules/` only when you work in the matching files: desktop UI, prototype, docs and ADRs, security-sensitive paths, dependency manifests, and tests.
- **Subagents** in `.claude/agents/`: `spec-reviewer` (diff against FR/R IDs and acceptance criteria), `security-reviewer` (against the secure coding standard), `a11y-design-reviewer` (WCAG 2.2 AA and design guidelines), `docs-consistency-reviewer` (cross-document IDs and links). All are read-only. Use one for independent review before declaring a change done; give it the files and requirements, not your conclusions.
- **Skills** in `.claude/skills/`: `new-adr` (draft a decision record), `add-dependency` (admit a dependency under the policy), `doc-change` (update PRD/TRD/rules/ADRs together).
- Personal preferences go in `CLAUDE.local.md` (gitignored), not here.
- `docs/old-ref-docs/` is historical; the current PRD and TRD supersede it. The link checker skips it.
