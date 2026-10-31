import "./styles.css";

const iconPaths = {
  mark: '<path d="M12 3.5 20.5 8v8L12 20.5 3.5 16V8L12 3.5Z"/><path d="m8.5 10 3.5-2 3.5 2v4l-3.5 2-3.5-2v-4Z"/>',
  workspace: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9h17M8 9v10"/>',
  panelCollapse: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m7-6-3-3 3-3"/>',
  panelExpand: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m4-12 3 3-3 3"/>',
  review: '<path d="m5 12 4 4L19 6"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
  context: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 3.5v5M20.5 12h-5M12 20.5v-5M3.5 12h5"/>',
  models: '<path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z"/><path d="m4 8 8 4.5L20 8M12 12.5v8"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.9L3.5 8.5"/><path d="M3.5 4.5v4h4M12 7v5l3 2"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M19.5 15.5A8 8 0 0 1 8.5 4.5 8.5 8.5 0 1 0 19.5 15.5Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  file: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v5h4M9 13h6M9 16.5h6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  browserBack: '<path d="m15 18-6-6 6-6"/><path d="M9 12h11"/>',
  browserForward: '<path d="m9 18 6-6-6-6"/><path d="M15 12H4"/>',
  browserReload: '<path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 1-2-5"/>',
  send: '<path d="m21 3-7.5 18-3.8-7.7L2 9.5 21 3Z"/><path d="M9.7 13.3 14 9"/>',
  folder: '<path d="M3.5 7.5h6l2 2h9v9h-17z"/><path d="M3.5 7.5v-2h6l2 2"/>',
  terminal: '<path d="m5 7 5 5-5 5M12 17h7"/>',
  browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  branch: '<path d="M6 4v11a4 4 0 0 0 4 4h8"/><circle cx="6" cy="4" r="2"/><circle cx="18" cy="19" r="2"/><path d="M18 4v2a4 4 0 0 1-4 4h-2"/><circle cx="18" cy="4" r="2"/>',
  plan: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  pin: '<path d="m16 3 5 5-4 1-3 5-2-2-4 4-2-2 4-4-2-2 5-3 1-4Z"/><path d="m5 19-2 2"/>',
  map: '<circle cx="6" cy="6.5" r="2.5"/><circle cx="18" cy="7.5" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="m8.5 6.7 7 .6M7.2 8.7l3.6 7M16.8 9.7l-3.5 6.2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.6a7.8 7.8 0 0 1-1.7 1l-.3 1.9h-2.8l-.3-1.9a7.8 7.8 0 0 1-1.7-1l-1.8.6-1.4-2.4 1.4-1.1a7.8 7.8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.8.6a7.8 7.8 0 0 1 1.7-1l.3-1.9h2.8l.3 1.9a7.8 7.8 0 0 1 1.7 1l1.8-.6 1.4 2.4-1.4 1.1a7.8 7.8 0 0 1 0 2Z"/>',
};

const navigation = [
  { id: "workspace", label: "Chat", icon: "workspace" },
  { id: "review", label: "Review", icon: "review" },
  { id: "context", label: "Context", icon: "context" },
  { id: "map", label: "Knowledge map", shortLabel: "Map", icon: "map" },
  { id: "history", label: "History", icon: "history" },
];

const mapKinds = {
  code: { label: "Code", icon: "file" },
  test: { label: "Tests", icon: "check" },
  doc: { label: "Docs", icon: "plan" },
  decision: { label: "Decisions", icon: "pin" },
  memory: { label: "Memory", icon: "context" },
  config: { label: "Config", icon: "settings" },
};

const mapProvenance = {
  extracted: { label: "Extracted", hint: "Read from source by a parser. Usable as evidence." },
  inferred: { label: "Inferred", hint: "Heuristic or embedding match. A hint until confirmed against source." },
  ambiguous: { label: "Ambiguous", hint: "Several candidate targets. Needs a decision." },
};

const mapNodes = [
  { id: "dispatch", kind: "code", label: "dispatchEvent()", path: "src/events/dispatcher.ts:54", community: "Event pipeline", x: 13, y: 30 },
  { id: "post", kind: "code", label: "postWebhook()", path: "src/webhooks/client.ts:38", community: "Webhook delivery", changed: true, x: 40, y: 30 },
  { id: "retry", kind: "code", label: "createRetryPolicy()", path: "src/webhooks/retry-policy.ts:12", community: "Webhook delivery", x: 64, y: 17 },
  { id: "send", kind: "code", label: "transport.send()", path: "src/transport/http.ts:21", community: "Transport", x: 64, y: 43 },
  { id: "test", kind: "test", label: "client.test.ts", path: "src/webhooks/client.test.ts", community: "Webhook delivery", changed: true, x: 33, y: 52 },
  { id: "doc", kind: "doc", label: "Delivery guarantees", path: "docs/webhooks.md#delivery-guarantees", community: "Webhook delivery", x: 30, y: 8 },
  { id: "adr", kind: "decision", label: "ADR-0007", path: "docs/adr/0007-retry-budgets.md", community: "Webhook delivery", x: 85, y: 8 },
  { id: "note", kind: "memory", label: "Idempotent retries", path: "Project memory · your note", community: "Webhook delivery", x: 83, y: 30 },
  { id: "config", kind: "config", label: "retry.maxAttempts", path: "config/default.yaml:14", community: "Configuration", x: 83, y: 52 },
];

const mapEdges = [
  { from: "dispatch", to: "post", kind: "calls", provenance: "extracted", method: "Syntax tree · dispatcher.ts:61" },
  { from: "post", to: "retry", kind: "calls", provenance: "extracted", method: "Syntax tree · client.ts:39" },
  { from: "post", to: "send", kind: "calls", provenance: "extracted", method: "Syntax tree · client.ts:39" },
  { from: "test", to: "post", kind: "tests", provenance: "extracted", method: "Test import · client.test.ts:3" },
  { from: "test", to: "retry", kind: "tests", provenance: "extracted", method: "Test import · client.test.ts:4" },
  { from: "doc", to: "post", kind: "documents", provenance: "inferred", method: "Embedding similarity 0.81" },
  { from: "adr", to: "retry", kind: "decides", provenance: "inferred", method: "Name mention in ADR text" },
  { from: "note", to: "retry", kind: "mentions", provenance: "extracted", method: "Link you wrote in the note" },
  { from: "retry", to: "config", kind: "reads", provenance: "ambiguous", method: "2 candidate keys · YAML not parsed" },
  { id: "suggest-note-dispatch", from: "note", to: "dispatch", kind: "similar", provenance: "inferred", method: "Embedding similarity 0.77", suggestion: true },
];

const mapEdgeVerbs = {
  calls: ["calls", "called by"],
  tests: ["tests", "tested by"],
  documents: ["documents", "documented in"],
  decides: ["decides", "decided by"],
  mentions: ["links to", "linked from"],
  reads: ["reads", "read by"],
  similar: ["similar to", "similar to"],
};

const settingsSections = [
  { id: "general", label: "General", icon: "settings" },
  { id: "agent", label: "Agent behavior", icon: "plan" },
  { id: "permissions", label: "Tools & permissions", icon: "lock" },
  { id: "project", label: "Project defaults", icon: "folder" },
  { id: "models", label: "Models", icon: "models" },
  { id: "appearance", label: "Appearance", icon: "sun" },
  { id: "shortcuts", label: "Shortcuts", icon: "history" },
];

const mobileNavigation = [
  ...navigation,
  { id: "settings", label: "Settings", icon: "settings" },
];

const compactLayout = window.matchMedia("(max-width: 768px)");
const browserPages = {
  "/": {
    title: "Service overview",
    lede: "Your local development preview is ready.",
    status: "All systems operational",
    statusDetail: "Sample service health",
    metrics: [["Requests", "1,284", "Last 24 hours"], ["Success rate", "99.8%", "Sample data"]],
    activity: ["Webhook delivery completed", "Health check passed"],
  },
  "/health": {
    title: "Health checks",
    lede: "A sample view of service readiness and dependencies.",
    status: "All checks passing",
    statusDetail: "3 of 3 sample checks healthy",
    metrics: [["API", "Healthy", "Latency 42 ms"], ["Database", "Healthy", "Latency 8 ms"]],
    activity: ["API readiness check passed", "Database connection verified"],
  },
  "/webhooks": {
    title: "Webhook deliveries",
    lede: "Recent delivery attempts from the sample development environment.",
    status: "Delivery queue clear",
    statusDetail: "No pending sample deliveries",
    metrics: [["Delivered", "248", "Last 24 hours"], ["Retried", "3", "All recovered"]],
    activity: ["invoice.paid · delivered", "deployment.ready · delivered"],
  },
};
const state = {
  screen: "workspace",
  settingsSection: "general",
  inspector: "files",
  inspectorVisible: !compactLayout.matches,
  sidebarCollapsed: false,
  newConversation: false,
  browserHistory: ["/"],
  browserHistoryIndex: 0,
  browserNotice: "Static sample view · no server or network request",
  map: {
    selected: "post",
    kinds: new Set(Object.keys(mapKinds)),
    provenance: new Set(Object.keys(mapProvenance)),
    changedOnly: false,
    suggestions: { "suggest-note-dispatch": "pending" },
  },
}

function getBrowserPath(address) {
  let url;
  try {
    url = new URL(address, "http://localhost:3000");
  } catch {
    return null;
  }

  if (url.origin !== "http://localhost:3000" || url.username || url.password || url.search || url.hash) return null;
  const path = url.pathname.replace(/\/+$/, "") || "/";
  return Object.prototype.hasOwnProperty.call(browserPages, path) ? path : null;
}

function renderBrowserState(focusSelector) {
  const chatScrollTop = screenContent.querySelector(".oc-chat-scroll")?.scrollTop;
  renderScreen();
  const chatScroll = screenContent.querySelector(".oc-chat-scroll");
  if (chatScroll && chatScrollTop !== undefined) chatScroll.scrollTop = chatScrollTop;
  if (focusSelector) screenContent.querySelector(focusSelector)?.focus();
}

function showBrowserPath(path, { addHistory = true } = {}) {
  if (addHistory && path !== state.browserHistory[state.browserHistoryIndex]) {
    state.browserHistory = state.browserHistory.slice(0, state.browserHistoryIndex + 1);
    state.browserHistory.push(path);
    state.browserHistoryIndex += 1;
  }
  state.browserNotice = `Showing ${path} · sample content only; no network request made`;
  renderBrowserState(".oc-browser-page h2");
}

function moveBrowserHistory(offset) {
  const nextIndex = state.browserHistoryIndex + offset;
  if (nextIndex < 0 || nextIndex >= state.browserHistory.length) return;
  state.browserHistoryIndex = nextIndex;
  showBrowserPath(state.browserHistory[nextIndex], { addHistory: false });
}

const app = document.querySelector("#app");

function icon(name, extraClass = "") {
  return `<svg class="oq-i ${extraClass}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${iconPaths[name]}</svg>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function renderBrowserPreview() {
  const path = state.browserHistory[state.browserHistoryIndex];
  const page = browserPages[path] ?? browserPages["/"];
  const historyCanGoBack = state.browserHistoryIndex > 0;
  const historyCanGoForward = state.browserHistoryIndex < state.browserHistory.length - 1;
  const address = `http://localhost:3000${path === "/" ? "" : path}`;

  return `
    <section class="oc-project-panel__content oc-browser-panel" role="tabpanel" aria-label="In-app browser preview">
      <div class="oc-browser-toolbar">
        <div class="oc-browser-controls">
          <button class="oc-browser-control" type="button" data-action="browser-back" aria-label="Back" title="Back" ${historyCanGoBack ? "" : "disabled"}>${icon("browserBack")}</button>
          <button class="oc-browser-control" type="button" data-action="browser-forward" aria-label="Forward" title="Forward" ${historyCanGoForward ? "" : "disabled"}>${icon("browserForward")}</button>
          <button class="oc-browser-control" type="button" data-action="browser-reload" aria-label="Reload sample preview" title="Reload">${icon("browserReload")}</button>
        </div>
        <form class="oc-browser-address" id="browser-nav-form">
          ${icon("lock")}<label class="oc-visually-hidden" for="browser-address-input">Preview address</label>
          <input id="browser-address-input" type="text" name="address" aria-label="Preview address" value="${escapeHtml(address)}" autocomplete="off" spellcheck="false">
        </form>
      </div>
      <div class="oc-browser-viewport">
        <article class="oc-browser-page" aria-label="Sample local application">
          <header class="oc-browser-page__header"><span><span class="oc-browser-page__mark">N</span><strong>northstar</strong></span><span class="oc-browser-page__env">LOCAL</span></header>
          <nav class="oc-browser-page__nav" aria-label="Sample app pages">
            ${Object.entries({ "/": "Overview", "/health": "Health", "/webhooks": "Webhooks" }).map(([route, label]) => `<a href="${route}" data-browser-route="${route}"${path === route ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          </nav>
          <div class="oc-browser-page__body">
            <p class="oc-overline">PROJECT / NORTHSTAR API</p>
            <h2 tabindex="-1">${escapeHtml(page.title)}</h2>
            <p class="oc-browser-page__lede">${escapeHtml(page.lede)}</p>
            <section class="oc-browser-health"><span class="oc-browser-health__dot"></span><span><strong>${escapeHtml(page.status)}</strong><small>${escapeHtml(page.statusDetail)} · sample</small></span></section>
            <div class="oc-browser-metrics">${page.metrics.map(([label, value, detail]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail)}</small></div>`).join("")}</div>
            <section class="oc-browser-activity"><strong>Recent activity</strong>${page.activity.map((item, index) => `<p><span></span>${escapeHtml(item)}<small>${index === 0 ? "2 min ago" : "8 min ago"}</small></p>`).join("")}</section>
          </div>
        </article>
      </div>
      <div class="oc-browser-footnote" role="status" aria-live="polite">${icon("lock")} ${escapeHtml(state.browserNotice)}</div>
    </section>`;
}

const pages = {
  workspace: () => `
    <div class="oc-workbench">
      <div class="oc-workbench-body${state.inspectorVisible ? "" : " oc-workbench-body--panel-hidden"}">
        <section class="oc-chat-pane" aria-label="Conversation">
          <div class="oc-chat-scroll">
            ${state.newConversation && !state.promptPreview ? `
              <div class="oc-welcome">
                <span class="oc-welcome-mark">${icon("mark")}</span>
                <h1 tabindex="-1">What are we building?</h1>
                <p>Start with a question, a bug, or a feature. OneCode will understand the project and show its plan before it edits.</p>
                <div class="oc-prompt-suggestions">
                  <button type="button" data-prompt="Explain how authentication is implemented">Explain this codebase <span>${icon("arrow")}</span></button>
                  <button type="button" data-prompt="Find and fix a bug in the current project">Find and fix a bug <span>${icon("arrow")}</span></button>
                  <button type="button" data-prompt="Plan a feature and its acceptance criteria">Plan a feature <span>${icon("arrow")}</span></button>
                </div>
              </div>` : state.newConversation ? `
              <article class="oc-chat-message oc-chat-message--user">
                <div class="oc-chat-avatar oc-chat-avatar--user">V</div>
                <div class="oc-chat-message__body"><p class="oc-chat-author">You <span class="oc-preview-tag">REQUEST PREVIEW</span></p><p>${escapeHtml(state.promptPreview)}</p></div>
              </article>
              <div class="oc-preview-notice">${icon("lock")} Request preview only. No model was called and no tools were run.</div>` : `
              <div class="oc-chat-date">TODAY <span></span> SAMPLE SESSION</div>
              <article class="oc-chat-message oc-chat-message--user oc-searchable">
                <div class="oc-chat-avatar oc-chat-avatar--user">V</div>
                <div class="oc-chat-message__body"><p class="oc-chat-author">You</p><p>Add bounded retry handling to the webhook client. Keep the existing backoff behavior and add tests for exhausted retries.</p></div>
              </article>
              <article class="oc-chat-message oc-chat-message--assistant oc-searchable">
                <div class="oc-chat-avatar">${icon("mark")}</div>
                <div class="oc-chat-message__body">
                  <p class="oc-chat-author">OneCode</p>
                  <p>I traced the current client and retry policy. I’ll preserve the existing backoff defaults, cap attempts, and cover both successful retry and exhausted-retry behavior.</p>
                  <div class="oc-inline-plan oc-searchable">
                    <div class="oc-inline-plan__head"><strong>Plan <span>2 of 3 complete</span></strong><button class="oc-text-button" type="button" data-action="toggle-plan">Show plan ${icon("chevron")}</button></div>
                    <ol>
                      <li class="is-done"><span>${icon("check")}</span>Inspect current retry policy and tests</li>
                      <li class="is-done"><span>${icon("check")}</span>Implement bounded retry handling</li>
                      <li class="is-current"><span>3</span>Run focused tests and prepare review</li>
                    </ol>
                  </div>
                  <div class="oc-chat-result oc-searchable">
                    <div class="oc-chat-result__head"><span class="oc-evidence-icon">${icon("check")}</span><strong>Verification complete</strong><span class="oc-status oc-status--success">3 passed</span></div>
                    <div class="oc-result-checks"><span>Unit tests <strong>18 passed</strong></span><span>Type check <strong>Passed</strong></span><span>Lint <strong>Passed</strong></span></div>
                  </div>
                  <div class="oc-change-summary oc-searchable">
                    <div><strong>2 files changed</strong><span><span class="oc-good">+24</span> <span class="oc-danger">−6</span> <span aria-hidden="true">·</span> sample diff</span></div>
                    <button class="oc-button oc-button--secondary" type="button" data-screen="review">Review changes ${icon("arrow")}</button>
                  </div>
                  <p class="oc-agent-footnote">${icon("lock")} Paused before applying changes. Your working branch is untouched.</p>
                </div>
              </article>
              <div class="oc-followup-preview" id="followup-preview" hidden></div>`}
          </div>
          <div class="oc-composer-wrap">
            <form class="oc-composer oc-composer--workbench" id="prompt-form">
              <label class="oc-visually-hidden" for="task-prompt">Message OneCode</label>
              <textarea id="task-prompt" name="prompt" rows="2" placeholder="Ask a question or describe what to build…" required></textarea>
              <div class="oc-composer-tools">
                <div class="oc-composer-toolbar">
                  <button class="oc-icon-button" type="button" data-action="demo-action" aria-label="Attach context" title="Attach context">${icon("plus")}</button>
                  <button class="oc-composer-chip oc-composer-context" type="button" data-screen="context" aria-label="Project context: northstar-api" title="Project context">${icon("folder")}</button>
                  <button class="oc-composer-chip oc-composer-model" type="button" data-action="demo-action" aria-label="Model: local code model" title="Model: local code model">${icon("models")}</button>
                  <button class="oc-composer-chip oc-composer-mode" type="button" data-action="demo-action" aria-label="Mode: plan first" title="Mode: plan first">${icon("plan")}</button>
                </div>
                <button class="oc-send-button" type="submit" aria-label="Preview message">${icon("send")}</button>
              </div>
            </form>
          </div>
        </section>
        <button class="oc-project-panel-backdrop" type="button" data-action="toggle-inspector" aria-label="Close project panel" tabindex="-1" ${state.inspectorVisible ? "" : "hidden"}></button>
        <aside class="oc-project-panel" id="project-panel" aria-label="Project tools" ${state.inspectorVisible ? "" : "hidden"}>
          <div class="oc-project-panel__header">
            <div class="oc-project-panel__tabs" role="tablist" aria-label="Project panel">
              <button role="tab" type="button" data-inspector="files" aria-selected="${state.inspector === "files"}">${icon("folder")} Files</button>
              <button role="tab" type="button" data-inspector="changes" aria-selected="${state.inspector === "changes"}">${icon("review")} Changes <span class="oc-panel-count">2</span></button>
              <button role="tab" type="button" data-inspector="preview" aria-selected="${state.inspector === "preview"}">${icon("browser")} Browser</button>
              <button role="tab" type="button" data-inspector="terminal" aria-selected="${state.inspector === "terminal"}" aria-label="Terminal" title="Terminal">${icon("terminal")}</button>
            </div>
            <button class="oc-panel-close" type="button" data-action="toggle-inspector" aria-label="Close project panel" title="Close panel">${icon("close")}</button>
          </div>
          ${state.inspector === "files" ? `
            <div class="oc-project-panel__content">
              <div class="oc-panel-filter">${icon("search")}<input type="search" aria-label="Filter project files" placeholder="Filter files"></div>
              <p class="oc-tree-root oc-searchable">${icon("folder")} <strong>northstar-api</strong><span class="oc-muted">SAMPLE</span></p>
              <ul class="oc-file-tree">
                <li>${icon("chevron")} ${icon("folder")} src</li>
                <li class="oc-tree-nested">${icon("chevron")} ${icon("folder")} webhooks</li>
                <li class="oc-tree-file is-selected">${icon("file")} <span>client.ts</span><i></i></li>
                <li class="oc-tree-file">${icon("file")} <span>retry-policy.ts</span></li>
                <li class="oc-tree-file">${icon("file")} <span>client.test.ts</span></li>
                <li>${icon("chevron")} ${icon("folder")} tests</li>
                <li>${icon("chevron")} ${icon("folder")} docs</li>
                <li>${icon("file")} package.json</li>
                <li>${icon("file")} CONTRIBUTING.md</li>
              </ul>
              <div class="oc-panel-bottom-note">${icon("lock")} Sample project tree. No local files are open.</div>
            </div>` : state.inspector === "changes" ? `
            <div class="oc-project-panel__content">
              <div class="oc-inspector-heading"><strong>Working changes</strong><span class="oc-status oc-status--warning">Needs review</span></div>
              <button class="oc-change-file" type="button" data-screen="review"><span class="oc-change-file__icon">${icon("file")}</span><span><strong>client.ts</strong><small>src/webhooks</small></span><span><i class="oc-good">+18</i> <i class="oc-danger">−4</i></span></button>
              <button class="oc-change-file" type="button" data-screen="review"><span class="oc-change-file__icon">${icon("file")}</span><span><strong>client.test.ts</strong><small>src/webhooks</small></span><span><i class="oc-good">+6</i> <i class="oc-danger">−2</i></span></button>
              <div class="oc-panel-bottom-note">${icon("lock")} Isolated sample diff · branch unchanged</div>
            </div>` : state.inspector === "preview" ? renderBrowserPreview() : ""}
          ${state.inspector === "terminal" ? `
            <section class="oc-project-panel__content oc-terminal-panel" role="tabpanel" aria-label="Sample terminal output">
              <div class="oc-terminal-head"><span class="oc-terminal-tab">Test output</span><span class="oc-terminal-sample">SAMPLE</span></div>
              <div class="oc-terminal-output" role="log" aria-label="Sample terminal output"><p><span>$</span> pnpm test -- src/webhooks/client.test.ts</p><p class="oc-terminal-muted">PASS src/webhooks/client.test.ts</p><p class="oc-terminal-success">Tests: 18 passed, 18 total</p><p class="oc-terminal-muted">Sample output only · no process was launched</p></div>
            </section>` : ""}
        </aside>
      </div>
    </div>`,

  review: () => `
    <div class="oc-page-intro">
      <div>
        <p class="oc-kicker">TASK / WEBHOOK RETRIES</p>
        <h1 tabindex="-1">Review changes</h1>
        <p class="oc-lede">Inspect the diff and verification evidence before deciding what happens next.</p>
      </div>
      <span class="oc-status oc-status--warning">${icon("lock")} Approval required</span>
    </div>
    <section class="oc-review-summary oc-searchable">
      <div class="oc-review-summary__item"><span>Changed files</span><strong>2</strong></div>
      <div class="oc-review-summary__item"><span>Lines</span><strong><span class="oc-good">+24</span> / <span class="oc-danger">−6</span></strong></div>
      <div class="oc-review-summary__item"><span>Verification</span><strong class="oc-good">${icon("check")} 3 passed</strong></div>
      <div class="oc-review-summary__item"><span>Workspace</span><strong>Isolated sample</strong></div>
    </section>
    <div class="oc-review-grid">
      <section class="oc-panel oc-diff-panel" aria-labelledby="diff-heading">
        <div class="oc-panel-heading oc-diff-toolbar">
          <div><p class="oc-overline">DIFF PREVIEW</p><h2 id="diff-heading">src/webhooks/client.ts</h2></div>
          <span class="oc-file-count">1 of 2 files</span>
        </div>
        <div class="oc-diff-meta"><span>${icon("file")} src/webhooks/client.ts</span><span><span class="oc-good">+18</span> <span class="oc-danger">−4</span></span></div>
        <div class="oc-code-block" role="region" aria-label="Sample diff for webhook client" tabindex="0">
          <div class="oc-code-line oc-code-line--context"><span>38</span><code>export async function postWebhook(event: Event) {</code></div>
          <div class="oc-code-line oc-code-line--remove"><span>39</span><code>  return transport.send(event);</code></div>
          <div class="oc-code-line oc-code-line--add"><span>39</span><code>  return retryPolicy.run(() =&gt; transport.send(event));</code></div>
          <div class="oc-code-line oc-code-line--context"><span>40</span><code>}</code></div>
          <div class="oc-code-line oc-code-line--blank"><span>41</span><code></code></div>
          <div class="oc-code-line oc-code-line--context"><span>42</span><code>export function createClient(config: ClientConfig) {</code></div>
          <div class="oc-code-line oc-code-line--add"><span>43</span><code>  const retryPolicy = createRetryPolicy(config.retry);</code></div>
          <div class="oc-code-line oc-code-line--context"><span>44</span><code>  return { post: postWebhook };</code></div>
        </div>
        <div class="oc-diff-note">${icon("lock")} Sample diff for illustration. No working tree is connected.</div>
      </section>
      <aside class="oc-review-evidence">
        <section class="oc-panel" aria-labelledby="evidence-heading">
          <div class="oc-panel-heading"><div><p class="oc-overline">VERIFICATION</p><h2 id="evidence-heading">Evidence</h2></div><span class="oc-status oc-status--success">3 passed</span></div>
          <ul class="oc-evidence-list">
            <li><span class="oc-evidence-icon">${icon("check")}</span><span><strong>Unit tests</strong><small>18 passed · 1.4s</small></span><span class="oc-status oc-status--success">Passed</span></li>
            <li><span class="oc-evidence-icon">${icon("check")}</span><span><strong>Type check</strong><small>0 errors · sample output</small></span><span class="oc-status oc-status--success">Passed</span></li>
            <li><span class="oc-evidence-icon">${icon("check")}</span><span><strong>Lint</strong><small>0 warnings · sample output</small></span><span class="oc-status oc-status--success">Passed</span></li>
          </ul>
        </section>
        <section class="oc-panel oc-decision-panel" aria-labelledby="decision-heading">
          <p class="oc-overline">YOUR DECISION</p>
          <h2 id="decision-heading">Ready to proceed?</h2>
          <p class="oc-body-copy">Approving or requesting changes is shown as a mock interaction. No code will be applied.</p>
          <button class="oc-button oc-button--primary oc-button--full" type="button" data-action="review-approve">${icon("check")} Approve sample</button>
          <button class="oc-button oc-button--secondary oc-button--full" type="button" data-action="review-changes">Request changes</button>
        </section>
      </aside>
    </div>`,

  context: () => `
    <div class="oc-page-intro">
      <div><p class="oc-kicker">TASK / WEBHOOK RETRIES</p><h1 tabindex="-1">Context Inspector</h1><p class="oc-lede">See what the agent considered, what it selected, and why.</p></div>
      <span class="oc-local-badge">${icon("lock")} Local context · sample</span>
    </div>
    <section class="oc-context-banner oc-searchable">
      <div class="oc-context-banner__icon">${icon("context")}</div>
      <div><p class="oc-overline">CONTEXT BUDGET</p><h2>12 items selected <span>of 38 candidates</span></h2><p>Selection uses task relevance and dependency links. No external content is included.</p></div>
      <progress class="oc-context-meter" value="62" max="100" aria-label="Context budget: 62 percent used">62%</progress>
      <strong class="oc-context-percent">62%</strong>
    </section>
    <div class="oc-context-grid">
      <section class="oc-panel" aria-labelledby="files-heading">
        <div class="oc-panel-heading"><div><p class="oc-overline">REPOSITORY CONTEXT</p><h2 id="files-heading">Selected files</h2></div><span class="oc-muted">4 of 11</span></div>
        <ul class="oc-context-list">
          <li class="oc-searchable"><span class="oc-context-file-icon">${icon("file")}</span><span><strong>src/webhooks/client.ts</strong><small>Direct task match · edited in this task</small></span><span class="oc-context-tag">Primary</span></li>
          <li class="oc-searchable"><span class="oc-context-file-icon">${icon("file")}</span><span><strong>src/webhooks/retry-policy.ts</strong><small>Imported by client · retry contract</small></span><span class="oc-context-tag">Dependency</span></li>
          <li class="oc-searchable"><span class="oc-context-file-icon">${icon("file")}</span><span><strong>src/webhooks/client.test.ts</strong><small>Focused test coverage for retries</small></span><span class="oc-context-tag">Tests</span></li>
          <li class="oc-searchable"><span class="oc-context-file-icon">${icon("file")}</span><span><strong>CONTRIBUTING.md</strong><small>Project test and style instructions</small></span><span class="oc-context-tag">Standards</span></li>
        </ul>
      </section>
      <section class="oc-panel" aria-labelledby="tools-heading">
        <div class="oc-panel-heading"><div><p class="oc-overline">AVAILABLE CAPABILITIES</p><h2 id="tools-heading">Tools considered</h2></div><span class="oc-status oc-status--info">Approval gated</span></div>
        <ul class="oc-context-list oc-tool-list">
          <li class="oc-searchable"><span class="oc-tool-icon">${icon("file")}</span><span><strong>Read repository files</strong><small>Needed to trace retry behavior</small></span><span class="oc-status oc-status--success">Allowed</span></li>
          <li class="oc-searchable"><span class="oc-tool-icon">${icon("check")}</span><span><strong>Run focused tests</strong><small>Limited to webhook test suite</small></span><span class="oc-status oc-status--warning">Ask first</span></li>
          <li class="oc-searchable"><span class="oc-tool-icon">${icon("arrow")}</span><span><strong>Network access</strong><small>Not needed for this task</small></span><span class="oc-status oc-status--muted">Blocked</span></li>
          <li class="oc-searchable"><span class="oc-tool-icon">${icon("lock")}</span><span><strong>Write working tree</strong><small>Requires your review approval</small></span><span class="oc-status oc-status--warning">Ask first</span></li>
        </ul>
      </section>
    </div>
    <section class="oc-panel oc-context-rationale"><p class="oc-overline">SELECTION RATIONALE</p><p>OneCode prioritized the task’s primary file, its retry-policy dependency, the focused test, and the repository’s contribution rules. Unrelated files and network tools were excluded.</p></section>`,

  models: () => `
    <div class="oc-page-intro">
      <div><p class="oc-kicker">LOCAL INFERENCE / ON-DEVICE</p><h1 tabindex="-1">Model Library</h1><p class="oc-lede">Review model roles, provenance, and local resource needs before choosing.</p></div>
      <span class="oc-local-badge">${icon("lock")} No network actions in this mock</span>
    </div>
    <section class="oc-model-callout oc-searchable"><div class="oc-model-callout__icon">${icon("models")}</div><div><p class="oc-overline">INCLUDED WITH ONECODE</p><h2>Default embedding model <span class="oc-model-pill">Bundled</span></h2><p>Ships with the app and runs on this device, so semantic search, link suggestions in the Knowledge map, and context de-duplication work without a download. It ranks and suggests; it never grants permissions or counts as evidence.</p></div><div class="oc-model-callout__actions"><button class="oc-button oc-button--secondary" type="button" data-action="model-download">Browse alternatives</button><button class="oc-button oc-button--secondary" type="button" data-action="open-import">${icon("plus")} Import local model</button></div></section>
    <div class="oc-model-grid">
      <section class="oc-panel oc-model-card oc-searchable" aria-labelledby="embedding-card-title">
        <div class="oc-panel-heading"><div><p class="oc-overline">ROLE / EMBEDDINGS</p><h2 id="embedding-card-title">Code retrieval</h2></div><span class="oc-status oc-status--success">Active</span></div>
        <p class="oc-body-copy">Used for hybrid search, repository-map seeds, and suggested links. Turn it off and keyword, symbol, and graph search keep working.</p>
        <dl class="oc-model-facts"><div><dt>Source</dt><dd>Bundled with OneCode · sample</dd></div><div><dt>Revision</dt><dd><code>org/model@a1b2c3d</code></dd></div><div><dt>Integrity</dt><dd>Verified at load · sample</dd></div><div><dt>Disk</dt><dd>~120 MB · sample</dd></div><div><dt>Hardware</dt><dd>CPU compatible · sample</dd></div></dl>
        <div class="oc-model-card__footer"><span>${icon("lock")} Runs on-device only</span><button class="oc-text-button" type="button" data-action="demo-action">Turn off ${icon("chevron")}</button></div>
      </section>
      <section class="oc-panel oc-model-card oc-searchable" aria-labelledby="index-card-title">
        <div class="oc-panel-heading"><div><p class="oc-overline">REPOSITORY INDEX</p><h2 id="index-card-title">northstar-api</h2></div><span class="oc-status oc-status--success">Sample ready</span></div>
        <p class="oc-body-copy">Indexing stays on-device. The keyword, symbol, and graph index works on its own; embeddings add semantic ranking on top.</p>
        <div class="oc-index-status"><div><span>Indexed files</span><strong>128 <small>sample</small></strong></div><div><span>Last indexed</span><strong>Today, 09:40</strong></div><div><span>Embedding status</span><strong>Default model · current</strong></div></div>
        <div class="oc-model-card__footer"><span>${icon("lock")} Index actions are disabled in this demo</span><button class="oc-button oc-button--secondary" type="button" data-action="demo-action">Index settings</button></div>
      </section>
    </div>
    <section class="oc-offline-note"><span>${icon("lock")}</span><p><strong>For restricted environments</strong><br />Local model import is presented as a design concept only. This prototype does not inspect files, verify model integrity, download weights, or send network requests.</p></section>`,

  map: () => renderKnowledgeMap(),

  history: () => `
    <div class="oc-page-intro">
      <div><p class="oc-kicker">TASK / WEBHOOK RETRIES</p><h1 tabindex="-1">History &amp; recovery</h1><p class="oc-lede">A traceable record of checkpoints, decisions, and verification.</p></div>
      <span class="oc-local-badge">${icon("lock")} Local history · sample</span>
    </div>
    <section class="oc-history-summary oc-searchable">
      <div><span class="oc-history-summary__icon">${icon("history")}</span><p class="oc-overline">TASK TIMELINE</p><h2>4 recorded events</h2><p>Sample records only. No project history is loaded.</p></div>
      <div class="oc-history-summary__metric"><span>Last checkpoint</span><strong>09:42</strong><small>Before review</small></div>
      <div class="oc-history-summary__metric"><span>Rollback points</span><strong>2</strong><small>Sample workspace</small></div>
    </section>
    <section class="oc-panel oc-history-panel" aria-labelledby="history-heading">
      <div class="oc-panel-heading"><div><p class="oc-overline">RECENT ACTIVITY</p><h2 id="history-heading">Task checkpoints</h2></div><span class="oc-muted">Newest first</span></div>
      <ol class="oc-timeline">
        <li class="oc-searchable"><span class="oc-timeline-marker oc-timeline-marker--current">${icon("lock")}</span><div class="oc-timeline-content"><div class="oc-timeline-title"><h3>Paused for your review</h3><time datetime="2026-04-15T09:42">Today · 09:42</time></div><p>Diff prepared; no changes have been applied to a working tree.</p><span class="oc-timeline-label oc-timeline-label--warning">Approval checkpoint</span></div><button class="oc-text-button" type="button" data-screen="review">View diff ${icon("chevron")}</button></li>
        <li class="oc-searchable"><span class="oc-timeline-marker">${icon("check")}</span><div class="oc-timeline-content"><div class="oc-timeline-title"><h3>Verification complete</h3><time datetime="2026-04-15T09:42">Today · 09:42</time></div><p>Focused tests, type check, and lint passed in sample output.</p><span class="oc-timeline-label">3 checks passed</span></div><button class="oc-text-button" type="button" data-action="history-evidence">View evidence ${icon("chevron")}</button></li>
        <li class="oc-searchable"><span class="oc-timeline-marker">${icon("file")}</span><div class="oc-timeline-content"><div class="oc-timeline-title"><h3>Implementation checkpoint</h3><time datetime="2026-04-15T09:38">Today · 09:38</time></div><p>Bounded retry wrapper added to the isolated sample workspace.</p><span class="oc-timeline-label">Checkpoint 02</span></div><button class="oc-text-button" type="button" data-action="history-restore">Restore preview ${icon("chevron")}</button></li>
        <li class="oc-searchable"><span class="oc-timeline-marker">${icon("context")}</span><div class="oc-timeline-content"><div class="oc-timeline-title"><h3>Plan approved</h3><time datetime="2026-04-15T09:31">Today · 09:31</time></div><p>Task scope and selected repository context confirmed.</p><span class="oc-timeline-label">Checkpoint 01</span></div><button class="oc-text-button" type="button" data-screen="context">View context ${icon("chevron")}</button></li>
      </ol>
    </section>
    <p class="oc-history-footnote">${icon("lock")} Recovery controls in this mock never change or delete files.</p>`,

  settings: () => `
    <div class="oc-settings-page">
      <div class="oc-page-intro">
        <div><p class="oc-kicker">ONECODE PREFERENCES</p><h1 tabindex="-1">Settings</h1><p class="oc-lede">Configure agent defaults, permissions, and your local development environment.</p></div>
        <span class="oc-local-badge">${icon("lock")} Local preferences · sample</span>
      </div>
      <div class="oc-settings-layout">
        <nav class="oc-settings-nav" aria-label="Settings categories">
          <p class="oc-overline">PREFERENCES</p>
          ${settingsSections.map((section) => `
            <button class="oc-settings-nav-item" type="button" data-settings-section="${section.id}" aria-current="${state.settingsSection === section.id ? "page" : "false"}">
              ${icon(section.icon)}<span>${section.label}</span>
            </button>`).join("")}
        </nav>
        <div class="oc-settings-content" id="settings-section-content">${renderSettingsContent()}</div>
      </div>
      <p class="oc-settings-note">${icon("lock")} Settings shown here are illustrative and are not saved by this prototype.</p>
    </div>`,
};

function renderSettingsContent() {
  if (state.settingsSection === "models") return pages.models();

  const sections = {
    general: `
      <section class="oc-settings-group">
        <h2>General</h2><p>Set safe defaults for new coding sessions.</p>
        <div class="oc-settings-card">
          <label class="oc-setting-row"><span><strong>Permission preset</strong><small>Controls which actions need your approval.</small></span><select aria-label="Permission preset"><option>Ask before changes</option><option>Restricted</option><option>Custom</option></select></label>
          <label class="oc-setting-row"><span><strong>Plan review</strong><small>Ask before implementation begins.</small></span><select aria-label="Plan review"><option>Always ask</option><option>Ask for complex tasks</option><option>Never ask</option></select></label>
          <label class="oc-setting-row"><span><strong>Integrated terminal</strong><small>Default shell for approved commands.</small></span><select aria-label="Integrated terminal shell"><option>System default</option><option>PowerShell</option><option>Command Prompt</option><option>zsh</option><option>bash</option></select></label>
        </div>
      </section>`,
    agent: `
      <section class="oc-settings-group">
        <h2>Agent behavior</h2><p>OneCode adapts its workflow to the repository and its documented conventions.</p>
        <div class="oc-settings-card">
          <div class="oc-setting-row"><span><strong>Detect project stack</strong><small>Use manifests and repository structure to select relevant practices.</small></span><span class="oc-setting-state">${icon("check")} On</span></div>
          <div class="oc-setting-row"><span><strong>Follow repository guidance</strong><small>Read and respect CONTRIBUTING, agent instructions, and formatter configuration.</small></span><span class="oc-setting-state">${icon("check")} On</span></div>
          <div class="oc-setting-row"><span><strong>Verify before review</strong><small>Run focused tests and applicable checks before presenting changes.</small></span><span class="oc-setting-state">${icon("check")} On</span></div>
        </div>
      </section>`,
    permissions: `
      <section class="oc-settings-group">
        <h2>Tools &amp; permissions</h2><p>Choose the default approval behavior for agent capabilities.</p>
        <div class="oc-settings-card">
          <label class="oc-setting-row"><span><strong>Read project files</strong><small>Inspect files in the active project.</small></span><select aria-label="Read project files permission"><option>Allowed</option><option>Ask first</option><option>Blocked</option></select></label>
          <label class="oc-setting-row"><span><strong>Edit project files</strong><small>Apply reviewed changes to the working tree.</small></span><select aria-label="Edit project files permission"><option>Ask first</option><option>Allowed</option><option>Blocked</option></select></label>
          <label class="oc-setting-row"><span><strong>Run terminal commands</strong><small>Execute commands in the selected workspace.</small></span><select aria-label="Terminal commands permission"><option>Ask first</option><option>Allowed</option><option>Blocked</option></select></label>
          <label class="oc-setting-row"><span><strong>Network access</strong><small>Access external resources from tools.</small></span><select aria-label="Network access permission"><option>Blocked</option><option>Ask first</option><option>Allowed</option></select></label>
        </div>
      </section>`,
    project: `
      <section class="oc-settings-group">
        <h2>Project defaults</h2><p>Defaults apply when starting work in a project and can be overridden per task.</p>
        <div class="oc-settings-card">
          <div class="oc-setting-row"><span><strong>Active project</strong><small>northstar-api</small></span><span class="oc-muted">Sample</span></div>
          <label class="oc-setting-row"><span><strong>Default workflow</strong><small>How OneCode starts a new task.</small></span><select aria-label="Default workflow"><option>Plan first</option><option>Ask me each time</option><option>Work directly</option></select></label>
          <div class="oc-setting-row"><span><strong>Project instructions</strong><small>Detected from repository guidance files.</small></span><span class="oc-setting-state">${icon("check")} Available</span></div>
        </div>
      </section>`,
    appearance: `
      <section class="oc-settings-group">
        <h2>Appearance</h2><p>Adjust how the OneCode workspace is presented.</p>
        <div class="oc-settings-card">
          <div class="oc-setting-row"><span><strong>Color theme</strong><small>Choose the appearance used across the app.</small></span><button class="oc-button oc-button--secondary" type="button" data-action="theme">Switch theme</button></div>
          <label class="oc-setting-row"><span><strong>Interface density</strong><small>Spacing for project and review panels.</small></span><select aria-label="Interface density"><option>Comfortable</option><option>Compact</option></select></label>
        </div>
      </section>`,
    shortcuts: `
      <section class="oc-settings-group">
        <h2>Keyboard shortcuts</h2><p>Quick actions for common workspace tasks.</p>
        <div class="oc-settings-card">
          <div class="oc-setting-row"><span><strong>Search current view</strong><small>Find messages and visible records.</small></span><kbd>Ctrl / ⌘ K</kbd></div>
          <div class="oc-setting-row"><span><strong>New conversation</strong><small>Start a new coding task.</small></span><kbd>Ctrl / ⌘ N</kbd></div>
          <div class="oc-setting-row"><span><strong>Toggle terminal</strong><small>Open the terminal side panel.</small></span><kbd>Ctrl / ⌘ + Backtick</kbd></div>
        </div>
      </section>`,
  };

  return sections[state.settingsSection] ?? sections.general;
}

function mapEdgeState(edge) {
  if (!edge.suggestion) return { ...edge, status: "linked" };
  const status = state.map.suggestions[edge.id];
  if (status === "confirmed") return { ...edge, provenance: "extracted", method: "Confirmed by you", status };
  return { ...edge, status };
}

function visibleMapGraph() {
  const { kinds, provenance, changedOnly } = state.map;
  const edges = mapEdges.map(mapEdgeState).filter((edge) => edge.status !== "dismissed");
  let nodeIds = new Set(mapNodes.filter((node) => kinds.has(node.kind)).map((node) => node.id));
  if (changedOnly) {
    const changed = new Set(mapNodes.filter((node) => node.changed).map((node) => node.id));
    const near = new Set(changed);
    edges.forEach((edge) => {
      if (changed.has(edge.from)) near.add(edge.to);
      if (changed.has(edge.to)) near.add(edge.from);
    });
    nodeIds = new Set([...nodeIds].filter((id) => near.has(id)));
  }
  return {
    nodes: mapNodes.filter((node) => nodeIds.has(node.id)),
    edges: edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to) && provenance.has(edge.provenance)),
  };
}

function mapNode(id) {
  return mapNodes.find((node) => node.id === id);
}

function renderMapLink(edge, direction) {
  const otherId = direction === "out" ? edge.to : edge.from;
  const other = mapNode(otherId);
  const verb = mapEdgeVerbs[edge.kind][direction === "out" ? 0 : 1];
  const pending = edge.status === "pending";
  return `
    <li class="oc-map-link oc-map-link--${edge.provenance}${pending ? " oc-map-link--suggested" : ""}">
      <button class="oc-map-link__target" type="button" data-map-node="${other.id}">
        <span class="oc-map-link__verb">${verb}</span>
        <strong>${escapeHtml(other.label)}</strong>
      </button>
      <span class="oc-map-prov oc-map-prov--${edge.provenance}" title="${mapProvenance[edge.provenance].hint}">${pending ? "Suggested" : mapProvenance[edge.provenance].label}</span>
      <small>${escapeHtml(edge.method)}</small>
      ${pending ? `<span class="oc-map-link__actions"><button class="oc-text-button" type="button" data-map-suggestion="${edge.id}" data-decision="confirmed">${icon("check")} Confirm</button><button class="oc-text-button oc-text-button--quiet" type="button" data-map-suggestion="${edge.id}" data-decision="dismissed">Dismiss</button></span>` : ""}
    </li>`;
}

function renderMapDetail(graph) {
  const node = graph.nodes.find((item) => item.id === state.map.selected);
  if (!node) {
    return `
      <div class="oc-map-detail__empty">
        <p class="oc-overline">SELECTION</p>
        <h2 id="map-detail-heading">Nothing selected</h2>
        <p>The selected item is hidden by the current filters. Choose a node on the map or reset filters.</p>
        <button class="oc-button oc-button--secondary" type="button" data-action="map-reset">Reset filters</button>
      </div>`;
  }
  const outgoing = graph.edges.filter((edge) => edge.from === node.id);
  const incoming = graph.edges.filter((edge) => edge.to === node.id);
  const hasHints = [...outgoing, ...incoming].some((edge) => edge.provenance !== "extracted");
  return `
    <div class="oc-map-detail__head">
      <span class="oc-map-kind oc-map-kind--${node.kind}">${icon(mapKinds[node.kind].icon)}</span>
      <div>
        <p class="oc-overline">${mapKinds[node.kind].label.toUpperCase()}${node.changed ? ' <span class="oc-map-changed-tag">CHANGED IN TASK</span>' : ""}</p>
        <h2 id="map-detail-heading">${escapeHtml(node.label)}</h2>
        <code class="oc-map-path">${escapeHtml(node.path)}</code>
      </div>
    </div>
    <dl class="oc-map-facts">
      <div><dt>Community</dt><dd>${escapeHtml(node.community)}</dd></div>
      <div><dt>Revision</dt><dd><code>a1b2c3d</code> · current</dd></div>
    </dl>
    <section class="oc-map-links" aria-label="Links from ${escapeHtml(node.label)}">
      <h3>Links <span>${outgoing.length}</span></h3>
      ${outgoing.length ? `<ul>${outgoing.map((edge) => renderMapLink(edge, "out")).join("")}</ul>` : '<p class="oc-map-none">No outgoing links with the current filters.</p>'}
    </section>
    <section class="oc-map-links" aria-label="Backlinks to ${escapeHtml(node.label)}">
      <h3>Backlinks <span>${incoming.length}</span></h3>
      ${incoming.length ? `<ul>${incoming.map((edge) => renderMapLink(edge, "in")).join("")}</ul>` : '<p class="oc-map-none">No backlinks with the current filters.</p>'}
    </section>
    ${hasHints ? `<p class="oc-map-hint">${icon("lock")} Inferred and ambiguous links are hints. OneCode confirms them against source before editing or citing them.</p>` : ""}
    <div class="oc-map-detail__actions">
      <button class="oc-button oc-button--secondary" type="button" data-action="map-open-source">${icon("file")} Open source</button>
      <button class="oc-button oc-button--secondary" type="button" data-action="map-add-context">${icon("plus")} Add to task context</button>
    </div>`;
}

function renderKnowledgeMap() {
  const graph = visibleMapGraph();
  const { kinds, provenance, changedOnly } = state.map;
  const selectedVisible = graph.nodes.some((node) => node.id === state.map.selected);
  const focusId = selectedVisible ? state.map.selected : graph.nodes[0]?.id;
  const counts = graph.edges.reduce((total, edge) => ({ ...total, [edge.provenance]: (total[edge.provenance] ?? 0) + 1 }), {});
  const isOn = (edge) => selectedVisible && (edge.from === state.map.selected || edge.to === state.map.selected);
  const near = new Set(graph.edges.filter(isOn).flatMap((edge) => [edge.from, edge.to]));

  return `
    <div class="oc-page-intro">
      <div><p class="oc-kicker">PROJECT / NORTHSTAR-API</p><h1 tabindex="-1">Knowledge map</h1><p class="oc-lede">How code, tests, docs, decisions, and memory connect, with every link’s source shown.</p></div>
      <span class="oc-local-badge">${icon("lock")} On-device graph · sample</span>
    </div>
    <section class="oc-map-summary oc-searchable" aria-label="Graph status">
      <div class="oc-map-summary__lead"><span class="oc-history-summary__icon">${icon("map")}</span><p class="oc-overline">TASK NEIGHBORHOOD</p><h2>Webhook retries, depth 2</h2><p>Opened around the files this task changed. 412 nodes in the full repository.</p></div>
      <div class="oc-history-summary__metric"><span>Revision</span><strong>a1b2c3d</strong><small>Current · updated 09:40</small></div>
      <div class="oc-history-summary__metric"><span>Links shown</span><strong>${graph.edges.length}</strong><small>${counts.extracted ?? 0} extracted · ${counts.inferred ?? 0} inferred · ${counts.ambiguous ?? 0} ambiguous</small></div>
      <div class="oc-history-summary__metric"><span>Embeddings</span><strong>On</strong><small>Default model · on-device</small></div>
    </section>
    <p class="oc-map-coverage oc-searchable">${icon("lock")} <span><strong>Partial coverage:</strong> YAML files are indexed as files only, so configuration links are marked ambiguous rather than reported as missing.</span></p>
    <div class="oc-map-toolbar" role="group" aria-label="Map filters">
      <div class="oc-map-filter-group">
        <span class="oc-overline">SHOW</span>
        ${Object.entries(mapKinds).map(([id, kind]) => `<button class="oc-map-chip oc-map-chip--${id}" type="button" data-map-kind="${id}" aria-pressed="${kinds.has(id)}"><i aria-hidden="true"></i>${kind.label}</button>`).join("")}
      </div>
      <div class="oc-map-filter-group">
        <span class="oc-overline">LINKS</span>
        ${Object.entries(mapProvenance).map(([id, item]) => `<button class="oc-map-chip oc-map-chip--prov-${id}" type="button" data-map-prov="${id}" aria-pressed="${provenance.has(id)}" title="${item.hint}"><i aria-hidden="true"></i>${item.label}</button>`).join("")}
        <button class="oc-map-chip" type="button" data-action="map-changed" aria-pressed="${changedOnly}">${icon("review")} Changed in task</button>
      </div>
    </div>
    <div class="oc-map-grid">
      <section class="oc-panel oc-map-canvas-panel" aria-labelledby="map-canvas-heading">
        <div class="oc-panel-heading"><div><p class="oc-overline">GRAPH</p><h2 id="map-canvas-heading">Relationships</h2></div><span class="oc-muted">${graph.nodes.length} of ${mapNodes.length} nodes</span></div>
        ${graph.nodes.length ? `
        <div class="oc-map-scroll">
          <div class="oq-graph oc-map-graph"${selectedVisible ? ` data-selected="${state.map.selected}"` : ""}>
            <div class="oq-graph__canvas">
              <svg class="oq-graph__edges" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
                ${graph.edges.map((edge) => {
                  const from = mapNode(edge.from);
                  const to = mapNode(edge.to);
                  return `<line class="oc-map-edge oc-map-edge--${edge.provenance}${edge.status === "pending" ? " oc-map-edge--suggested" : ""}${isOn(edge) ? " is-on" : ""}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
                }).join("")}
              </svg>
              <div class="oq-graph__nodes" role="listbox" aria-label="Map nodes. Arrow keys move, Enter selects." id="map-nodes">
                ${graph.nodes.map((node) => `
                  <button type="button" role="option" class="oq-node oc-map-node oc-map-node--${node.kind}${node.changed ? " oc-map-node--changed" : ""}${near.has(node.id) ? " is-near" : ""}" data-map-node="${node.id}" aria-selected="${node.id === state.map.selected}" tabindex="${node.id === focusId ? "0" : "-1"}" style="--x: ${node.x}; --y: ${node.y}">${icon(mapKinds[node.kind].icon)}<span>${escapeHtml(node.label)}</span></button>`).join("")}
              </div>
            </div>
          </div>
        </div>
        <ul class="oc-map-legend" aria-label="Line styles">
          <li><i class="oc-map-legend__line oc-map-legend__line--extracted"></i>Extracted</li>
          <li><i class="oc-map-legend__line oc-map-legend__line--inferred"></i>Inferred</li>
          <li><i class="oc-map-legend__line oc-map-legend__line--ambiguous"></i>Ambiguous</li>
          <li><i class="oc-map-legend__ring"></i>Changed in task</li>
        </ul>
        <details class="oc-map-text-list">
          <summary>All links as a list (${graph.edges.length})</summary>
          <ul>${graph.edges.map((edge) => `<li class="oc-searchable"><strong>${escapeHtml(mapNode(edge.from).label)}</strong> ${mapEdgeVerbs[edge.kind][0]} <strong>${escapeHtml(mapNode(edge.to).label)}</strong> <span class="oc-map-prov oc-map-prov--${edge.provenance}">${edge.status === "pending" ? "Suggested" : mapProvenance[edge.provenance].label}</span></li>`).join("")}</ul>
        </details>` : `
        <div class="oc-map-empty">
          <span class="oc-history-summary__icon">${icon("map")}</span>
          <h3>No nodes match these filters</h3>
          <p>Turn a category back on or reset the filters to see the task neighborhood.</p>
          <button class="oc-button oc-button--secondary" type="button" data-action="map-reset">Reset filters</button>
        </div>`}
      </section>
      <aside class="oc-panel oc-map-detail" aria-labelledby="map-detail-heading">${renderMapDetail(graph)}</aside>
    </div>
    <div class="oc-map-lower">
      <section class="oc-panel" aria-labelledby="map-notes-heading">
        <div class="oc-panel-heading"><div><p class="oc-overline">LINKED NOTES</p><h2 id="map-notes-heading">Project memory</h2></div><span class="oc-muted">3 notes</span></div>
        <ul class="oc-context-list">
          <li class="oc-searchable"><span class="oc-context-file-icon">${icon("context")}</span><span><strong>Idempotent retries</strong><small>Retries must reuse the delivery ID · links to createRetryPolicy()</small></span><span class="oc-context-tag">Your note</span></li>
          <li class="oc-searchable"><span class="oc-context-file-icon">${icon("map")}</span><span><strong>Webhook delivery</strong><small>Community summary · 38 nodes · refreshed at a1b2c3d</small></span><span class="oc-context-tag">Derived</span></li>
          <li class="oc-searchable"><span class="oc-context-file-icon">${icon("pin")}</span><span><strong>ADR-0007 Retry budgets</strong><small>Decision · 2 backlinks</small></span><span class="oc-context-tag">Decision</span></li>
        </ul>
        <p class="oc-map-footnote">Agents load a note and its linked neighbors, not the whole memory store. Derived notes refresh when their source changes; your notes are never overwritten.</p>
      </section>
      <section class="oc-panel oc-map-export oc-searchable" aria-labelledby="map-export-heading">
        <p class="oc-overline">EXPORT</p>
        <h2 id="map-export-heading">Markdown vault</h2>
        <p class="oc-body-copy">Writes one Markdown file per note with wikilinks, readable in Obsidian-compatible tools. Secrets are redacted, excluded files stay excluded, and the folder is outside the repository unless you choose one.</p>
        <button class="oc-button oc-button--secondary oc-button--full" type="button" data-action="map-export">${icon("arrow")} Export map</button>
      </section>
    </div>
    <p class="oc-history-footnote">${icon("lock")} Sample graph. No repository is indexed, no model runs, and no files are read or written.</p>`;
}

app.innerHTML = `
  <div class="oc-shell">
    <aside class="oc-sidebar" id="primary-sidebar">
      <div class="oc-sidebar-heading">
        <a class="oc-brand" href="#workspace" data-screen="workspace" aria-label="OneCode home">
          <span class="oc-brand-mark">${icon("mark")}</span>
          <span><strong>OneCode</strong></span>
        </a>
        <button class="oc-icon-button oc-sidebar-toggle" type="button" data-action="toggle-sidebar" aria-controls="primary-sidebar" aria-expanded="true" aria-label="Collapse sidebar" title="Collapse sidebar">${icon("panelCollapse")}</button>
      </div>
      <button class="oc-new-conversation" type="button" data-action="new-conversation">${icon("plus")} New conversation <kbd>⌘ K</kbd></button>
      <button class="oc-side-search" type="button" data-action="focus-search">${icon("search")} Search <kbd>⌘ F</kbd></button>
      <section class="oc-sidebar-section" aria-labelledby="projects-label">
        <div class="oc-sidebar-section__heading"><p id="projects-label" class="oc-nav-label">PROJECTS</p><button class="oc-icon-button" type="button" data-action="demo-action" aria-label="Add project">${icon("plus")}</button></div>
        <button class="oc-project-link is-active" type="button" data-action="demo-action"><span class="oc-project-letter">N</span><span>northstar-api</span><span class="oc-project-indicator"></span></button>
        <button class="oc-project-link" type="button" data-action="demo-action"><span class="oc-project-letter oc-project-letter--blue">W</span><span>website-refresh</span></button>
        <button class="oc-project-link" type="button" data-action="demo-action"><span class="oc-project-letter oc-project-letter--green">D</span><span>data-pipeline</span></button>
      </section>
      <section class="oc-sidebar-section oc-sessions-section" aria-labelledby="sessions-label">
        <div class="oc-sidebar-section__heading"><p id="sessions-label" class="oc-nav-label">RECENT SESSIONS</p><button class="oc-icon-button" type="button" data-action="demo-action" aria-label="Session options">···</button></div>
        <button class="oc-session-link is-current" type="button" data-screen="workspace"><span class="oc-session-link__status"></span><span>Add retry handling to webhook client</span></button>
        <button class="oc-session-link" type="button" data-action="demo-action"><span class="oc-session-link__status oc-session-link__status--quiet"></span><span>Trace auth middleware flow</span></button>
        <button class="oc-session-link" type="button" data-action="demo-action"><span class="oc-session-link__status oc-session-link__status--quiet"></span><span>Document local setup</span></button>
        <button class="oc-session-link" type="button" data-action="demo-action"><span class="oc-session-link__status oc-session-link__status--quiet"></span><span>Fix flaky webhook test</span></button>
      </section>
      <section class="oc-sidebar-section oc-tools-section" aria-labelledby="tools-label">
        <p id="tools-label" class="oc-nav-label">WORKSPACE TOOLS</p>
        <nav class="oc-navigation" aria-label="Workspace tools">
          ${navigation.filter((item) => item.id !== "workspace").map((item) => `
            <button class="oc-nav-item" type="button" data-screen="${item.id}" aria-current="${item.id === state.screen ? "page" : "false"}" aria-label="${item.label}" title="${item.label}">
              ${icon(item.icon)}<span>${item.label}</span>${item.id === "review" ? '<span class="oc-nav-count" aria-label="1 item needs review">1</span>' : ""}
            </button>`).join("")}
        </nav>
      </section>
      <div class="oc-sidebar-bottom">
        <button class="oc-nav-item oc-settings-link" type="button" data-screen="settings" aria-current="${state.screen === "settings" ? "page" : "false"}">
            ${icon("settings")}<span>Settings</span>
        </button>
        <div class="oc-sidebar-local">${icon("lock")}<span>Local workspace</span><span class="oc-status__dot"></span></div>
        <button class="oc-profile-button" type="button" data-action="demo-action" aria-label="Open demo profile menu">
          <span class="oc-profile-avatar">V</span><span><strong>Developer</strong><small>Personal workspace</small></span><span class="oc-profile-menu">···</span>
        </button>
      </div>
    </aside>

    <div class="oc-main-column">
      <header class="oc-topbar">
        <div class="oc-breadcrumb"><span>northstar-api</span>${icon("chevron")}<span id="current-section">Workspace</span></div>
        <div class="oc-topbar-actions">
          <label class="oc-search-box">${icon("search")}<input id="global-search" type="search" placeholder="Search this view" aria-label="Search current view"><kbd>⌘ K</kbd></label>
          <span id="search-results" class="oc-visually-hidden" role="status" aria-live="polite"></span>
          <button class="oc-icon-button oc-mobile-search" type="button" data-action="focus-search" aria-label="Search conversation" title="Search">${icon("search")}</button>
          <button class="oc-icon-button oc-mobile-new" type="button" data-action="new-conversation" aria-label="New conversation" title="New conversation">${icon("plus")}</button>
          <div class="oc-workbench-header-tools" aria-label="Active workspace tools">
            <button class="oc-icon-button" type="button" data-action="toggle-terminal" aria-pressed="${state.inspectorVisible && state.inspector === "terminal"}" aria-label="${state.inspectorVisible && state.inspector === "terminal" ? "Close" : "Open"} terminal" title="${state.inspectorVisible && state.inspector === "terminal" ? "Close terminal" : "Open terminal"}">${icon("terminal")}</button>
            <button class="oc-icon-button" type="button" data-action="demo-action" aria-label="Open worktree options" title="Worktree">${icon("branch")}</button>
            <button class="oc-icon-button oc-inspector-toggle" type="button" data-action="toggle-inspector" aria-pressed="${state.inspectorVisible}" aria-label="${state.inspectorVisible ? "Hide" : "Show"} project panel" title="Project panel">${icon("folder")}</button>
          </div>
          <button class="oc-icon-button oc-theme-toggle" type="button" data-action="theme" aria-pressed="true" aria-label="Switch to light theme">${icon("sun")}</button>
          <span class="oc-demo-pill"><span></span> MOCK DATA</span>
        </div>
      </header>
      <main class="oc-main" id="main-content">
        <div class="oc-search-empty" id="search-empty" hidden>No matching sample records. Try another search.</div>
        <div id="screen-content"></div>
        <footer class="oc-footer">
          <span>OneCode experience prototype</span>
          <span><span class="oc-footer-separator">•</span> Sample data only <span class="oc-footer-separator">•</span> No repository access, downloads, or tool execution</span>
        </footer>
      </main>
      <nav class="oc-mobile-tool-nav" aria-label="Main navigation">
        ${mobileNavigation.map((item) => `
          <button class="oc-mobile-tool" type="button" data-screen="${item.id}" aria-current="${item.id === state.screen ? "page" : "false"}" aria-label="${item.label}">
            ${icon(item.icon)}<span>${item.shortLabel ?? item.label}</span>
          </button>`).join("")}
      </nav>
    </div>
  </div>
  <div class="oc-toast" id="toast" role="status" aria-live="polite" hidden></div>
  <dialog class="oc-dialog" id="import-dialog" aria-labelledby="import-dialog-title">
    <form method="dialog">
      <div class="oc-dialog-heading"><span class="oc-dialog-icon">${icon("models")}</span><button class="oc-icon-button" type="submit" aria-label="Close dialog">${icon("close")}</button></div>
      <p class="oc-overline">LOCAL MODEL IMPORT</p>
      <h2 id="import-dialog-title">Bring your own model</h2>
      <p>This is a non-functional mock. A production import flow would verify the model format, provenance, license, and integrity before activation.</p>
      <div class="oc-dialog-note">${icon("lock")} No file is selected or read. Nothing leaves this device.</div>
      <button class="oc-button oc-button--primary oc-button--full" type="submit">Got it</button>
    </form>
  </dialog>
`;

const screenContent = document.querySelector("#screen-content");
const searchInput = document.querySelector("#global-search");
const searchStatus = document.querySelector("#search-results");
const emptySearch = document.querySelector("#search-empty");
const toast = document.querySelector("#toast");
const importDialog = document.querySelector("#import-dialog");
let toastTimer;

function renderScreen() {
  screenContent.innerHTML = pages[state.screen]();
  document.querySelectorAll("[data-screen]").forEach((button) => {
    const active = button.dataset.screen === state.screen;
    if (button.classList.contains("oc-nav-item") || button.classList.contains("oc-mobile-tool")) {
      button.setAttribute("aria-current", active ? "page" : "false");
    }
  });
  document.querySelector("#current-section").textContent =
    mobileNavigation.find((item) => item.id === state.screen)?.label ?? "Workspace";
  const shell = document.querySelector(".oc-shell");
  shell.classList.toggle("oc-shell--workbench", state.screen === "workspace");
  shell.classList.toggle("oc-shell--sidebar-collapsed", state.sidebarCollapsed);
  const sidebarToggle = document.querySelector(".oc-sidebar-toggle");
  sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
  sidebarToggle.setAttribute("aria-label", `${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar`);
  sidebarToggle.setAttribute("title", `${state.sidebarCollapsed ? "Expand" : "Collapse"} sidebar`);
  sidebarToggle.innerHTML = icon(state.sidebarCollapsed ? "panelExpand" : "panelCollapse");
  const inspectorToggle = document.querySelector(".oc-inspector-toggle");
  inspectorToggle.setAttribute("aria-pressed", String(state.inspectorVisible));
  inspectorToggle.setAttribute("aria-label", `${state.inspectorVisible ? "Hide" : "Show"} project panel`);
  const terminalToggle = document.querySelector(".oc-workbench-header-tools [data-action='toggle-terminal']");
  const terminalVisible = state.screen === "workspace" && state.inspectorVisible && state.inspector === "terminal";
  terminalToggle.setAttribute("aria-pressed", String(terminalVisible));
  terminalToggle.setAttribute("aria-label", `${terminalVisible ? "Close" : "Open"} terminal`);
  terminalToggle.setAttribute("title", terminalVisible ? "Close terminal" : "Open terminal");
  searchInput.placeholder = state.screen === "workspace" ? "Search conversation" : "Search this view";
  searchInput.setAttribute("aria-label", state.screen === "workspace" ? "Search conversation" : "Search current view");
  applySearch();
}

function applySearch() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const records = [...screenContent.querySelectorAll(".oc-searchable")];
  let visible = 0;
  records.forEach((record) => {
    const matches = !query || record.textContent.toLocaleLowerCase().includes(query);
    record.hidden = !matches;
    if (matches) visible += 1;
  });
  emptySearch.hidden = !query || visible > 0;
  searchStatus.textContent = query ? `${visible} sample record${visible === 1 ? "" : "s"} found` : "";
}

function notify(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button, a");
  if (!button) return;

  if (button.dataset.browserRoute) {
    event.preventDefault();
    const path = getBrowserPath(button.dataset.browserRoute);
    if (path) showBrowserPath(path);
    return;
  }

  if (button.dataset.prompt) {
    const prompt = document.querySelector("#task-prompt");
    prompt.value = button.dataset.prompt;
    prompt.focus();
    return;
  }

  if (button.dataset.inspector) {
    state.inspector = button.dataset.inspector;
    renderScreen();
    return;
  }

  if (button.dataset.mapNode) {
    state.map.selected = button.dataset.mapNode;
    renderScreen();
    screenContent.querySelector(`.oc-map-node[data-map-node="${state.map.selected}"]`)?.focus();
    return;
  }

  if (button.dataset.mapKind || button.dataset.mapProv) {
    const set = button.dataset.mapKind ? state.map.kinds : state.map.provenance;
    const value = button.dataset.mapKind ?? button.dataset.mapProv;
    if (set.has(value)) set.delete(value); else set.add(value);
    renderScreen();
    screenContent.querySelector(`[data-map-${button.dataset.mapKind ? "kind" : "prov"}="${value}"]`)?.focus();
    return;
  }

  if (button.dataset.mapSuggestion) {
    state.map.suggestions[button.dataset.mapSuggestion] = button.dataset.decision;
    renderScreen();
    screenContent.querySelector("#map-detail-heading")?.focus();
    notify(button.dataset.decision === "confirmed"
      ? "Suggested link confirmed in this sample. In OneCode it becomes your link in the note."
      : "Suggestion dismissed in this sample. Nothing was written.");
    return;
  }

  if (button.dataset.settingsSection) {
    state.settingsSection = button.dataset.settingsSection;
    renderScreen();
    screenContent.querySelector(".oc-settings-nav-item[aria-current='page']")?.focus();
    return;
  }

  if (button.dataset.screen) {
    event.preventDefault();
    state.screen = button.dataset.screen;
    renderScreen();
    screenContent.querySelector("h1")?.focus();
    return;
  }

  switch (button.dataset.action) {
    case "toggle-sidebar":
      state.sidebarCollapsed = !state.sidebarCollapsed;
      renderScreen();
      document.querySelector(".oc-sidebar-toggle").focus();
      break;
    case "new-conversation":
      state.screen = "workspace";
      state.newConversation = true;
      state.promptPreview = "";
      state.inspector = "files";
      searchInput.value = "";
      renderScreen();
      screenContent.querySelector("h1")?.focus();
      break;
    case "focus-search":
      if (window.matchMedia("(max-width: 480px)").matches) {
        document.querySelector(".oc-search-box").classList.add("oc-search-box--mobile-open");
      }
      searchInput.focus();
      break;
    case "toggle-inspector": {
      if (!state.inspectorVisible) state.inspector = "files";
      state.inspectorVisible = !state.inspectorVisible;
      renderScreen();
      document.querySelector(".oc-inspector-toggle").focus();
      break;
    }
    case "toggle-terminal":
      if (state.inspectorVisible && state.inspector === "terminal") {
        state.inspectorVisible = false;
      } else {
        state.inspector = "terminal";
        state.inspectorVisible = true;
      }
      renderScreen();
      break;
    case "toggle-plan": {
      const plan = button.closest(".oc-inline-plan").querySelector("ol");
      plan.hidden = !plan.hidden;
      button.firstChild.textContent = plan.hidden ? "Show plan " : "Hide plan ";
      break;
    }
    case "browser-back":
      moveBrowserHistory(-1);
      break;
    case "browser-forward":
      moveBrowserHistory(1);
      break;
    case "browser-reload":
      state.browserNotice = "Preview reloaded · static sample; no server or network request";
      renderBrowserState('[data-action="browser-reload"]');
      break;
    case "theme": {
      const isDark = document.documentElement.dataset.theme === "dark";
      document.documentElement.dataset.theme = isDark ? "light" : "dark";
      button.setAttribute("aria-pressed", String(!isDark));
      button.setAttribute("aria-label", isDark ? "Switch to dark theme" : "Switch to light theme");
      button.innerHTML = icon(isDark ? "moon" : "sun");
      break;
    }
    case "open-import":
      importDialog.showModal();
      break;
    case "model-download":
      notify("Demo only — no download, network request, or model change occurred.");
      break;
    case "review-approve":
      notify("Mock approval recorded. No files were changed.");
      break;
    case "review-changes":
      notify("Mock feedback saved. No task or file was modified.");
      break;
    case "history-restore":
      notify("Restore preview only — no files were changed or deleted.");
      break;
    case "history-evidence":
      notify("Sample verification evidence: 18 tests, type check, and lint passed.");
      break;
    case "map-changed":
      state.map.changedOnly = !state.map.changedOnly;
      renderScreen();
      screenContent.querySelector("[data-action='map-changed']")?.focus();
      break;
    case "map-reset":
      state.map.kinds = new Set(Object.keys(mapKinds));
      state.map.provenance = new Set(Object.keys(mapProvenance));
      state.map.changedOnly = false;
      renderScreen();
      screenContent.querySelector(".oc-map-node[aria-selected='true']")?.focus();
      break;
    case "map-open-source":
      notify("Demo only: in OneCode this opens the source at the cited line.");
      break;
    case "map-add-context":
      notify("Demo only: the item would be added to the task’s Context Inspector with its reason.");
      break;
    case "map-export":
      notify("Demo only: no files were written. Export is redacted and saved outside the repository.");
      break;
    case "demo-action":
      notify("This control is illustrative. No project action was performed.");
      break;
    default:
      break;
  }
});

app.addEventListener("submit", (event) => {
  if (event.target.id === "browser-nav-form") {
    event.preventDefault();
    const address = new FormData(event.target).get("address");
    const path = typeof address === "string" ? getBrowserPath(address.trim()) : null;
    if (!path) {
      renderBrowserState("#browser-address-input");
      notify("That address is not in this local preview. Use /, /health, or /webhooks.");
      return;
    }
    showBrowserPath(path);
    return;
  }

  if (event.target.id !== "prompt-form") return;
  event.preventDefault();
  const prompt = new FormData(event.target).get("prompt").trim();
  if (!prompt) return;
  state.newConversation = true;
  state.promptPreview = prompt;
  renderScreen();
  notify("Request preview added. Nothing was sent or executed.");
});

searchInput.addEventListener("input", applySearch);

compactLayout.addEventListener("change", ({ matches }) => {
  if (matches && state.inspectorVisible && state.screen === "workspace") {
    state.inspectorVisible = false;
    renderScreen();
  }
});

document.addEventListener("keydown", (event) => {
  const mapOption = event.target.closest?.(".oc-map-node");
  if (mapOption) {
    const options = [...document.querySelectorAll(".oc-map-node")];
    const index = options.indexOf(mapOption);
    const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next;
    if (event.key in moves) next = options[(index + moves[event.key] + options.length) % options.length];
    if (event.key === "Home") next = options[0];
    if (event.key === "End") next = options.at(-1);
    if (next) {
      event.preventDefault();
      mapOption.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
      return;
    }
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.target.id === "task-prompt" && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    event.target.form.requestSubmit();
  }
  if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    applySearch();
    searchInput.blur();
    document.querySelector(".oc-search-box").classList.remove("oc-search-box--mobile-open");
  }
  if (event.key === "Escape" && state.screen === "workspace" && state.inspectorVisible &&
      window.matchMedia("(max-width: 768px)").matches) {
    state.inspectorVisible = false;
    renderScreen();
    document.querySelector(".oc-inspector-toggle").focus();
  }
});

renderScreen();
