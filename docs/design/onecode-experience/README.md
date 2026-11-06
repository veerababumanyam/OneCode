# OneCode experience mock

An interactive, sample-data-only prototype for OneCode's chat-first coding workspace. The main screen combines project and session navigation, a task conversation and composer, project files, changes, an in-app browser preview, and a terminal tab in the right-side project panel. The desktop sidebar can collapse to an icon rail and keeps its expand control available; its width is consistent across workspace and supporting screens. Workspace actions live in the main header as compact, icon-led controls rather than a separate toolbar. Review, Context, Knowledge map, and History remain workspace destinations; app and project defaults, permissions, and model management are grouped under Settings. The mobile project panel opens as a dismissible drawer, and the composer keeps project, model, and mode options icon-led. Supporting screens demonstrate review and evidence, context selection, the knowledge map, model management, settings, and task history/recovery.

The Knowledge map (PRD FR-114 to FR-120 and FR-124; TRD §§5.5 to 5.7) opens on the current task's neighborhood. It shows a keyboard-navigable graph built on OneQuill's `.oq-graph` component, filters by node kind, link provenance (extracted, inferred, ambiguous) and "changed in task", and a detail pane with links and backlinks. It also shows one embedding-suggested link you can confirm or dismiss, a text list of every link, partial-coverage and empty states, linked memory notes, and a mock Markdown-vault export. The Model Library shows the bundled default embedding model as active. This prototype does not yet demonstrate the full second-brain capture, review, maintenance, recall-feedback, or backup/restore lifecycle in FR-126 to FR-130.

## Run locally

This prototype intentionally consumes OneQuill's shared design system from its sibling workspace:

```text
Desktop/
├── OneCode/
└── OneQuill/
    └── docs/design/onequill-design-system/
```

See the central [tech-stack inventory](../../TECH-STACK.md) for verified dependency versions and the distinction between this prototype and the planned production stack.

From this directory:

```powershell
npm install
npm run dev
```

Open the localhost URL printed by Vite. Verify the shared design tokens and production build with:

```powershell
npm run check:tokens
npm run build
```

The local package reference in `package.json` assumes the sibling folder layout above. The prototype uses Vite and vanilla JavaScript so it does not prescribe OneCode's eventual production UI framework.

## Prototype boundaries

All repository, task, model, diff, browser, and test information is illustrative. Search only filters sample records. Prompt submission adds a local preview to the page; review, restore, download, and import controls do not access files, execute tools, change a workspace, or make network requests. Settings controls are illustrative and are not persisted. The in-app browser provides interactive sample routes (`/`, `/health`, and `/webhooks`) with local navigation history, Back/Forward, Reload, and address-bar submission. It accepts only the allowlisted routes on `http://localhost:3000`; other hosts, paths, query strings, and fragments are rejected without making a network request. No server is started. The terminal panel displays static sample output only. No model file is read or downloaded.

Knowledge map nodes, links, similarity scores, and notes are invented sample records; confirming a suggestion changes only in-page state, and export writes nothing. The Model Library includes a mock local-import concept to communicate the future offline workflow; it does not implement model validation or installation.

## Design references

The chat-and-work hierarchy and interaction ideas were informed by the user's references to Claude Code, Codex, Google Antigravity, Cursor, and OpenCode, plus:

- [Claude landing page directory](https://github.com/ananthmenon10/claude-landingpage-directory)
- [UI UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [Impeccable](https://github.com/pbakaus/impeccable)

These are references only. This prototype does not reproduce their branding, copy, proprietary layouts, prompts, code, or assets. Visual values and fonts come from OneQuill's local design-system package; no runtime CDN or external service is used.
