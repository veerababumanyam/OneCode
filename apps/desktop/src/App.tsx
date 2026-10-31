import { useEffect, useState } from "react";
import type { DesktopApi, RequestPreviewResult, WorkspaceLoadResult, WorkspaceView } from "./api/types";
import { BottomPanel } from "./components/BottomPanel";
import { ConversationCompanion, type CompanionTab } from "./components/ConversationCompanion";
import { Icon } from "./components/Icon";
import { Navigator } from "./components/Navigator";
import { WorkspaceCanvas, type CenterTab } from "./components/WorkspaceCanvas";
import { en } from "./i18n/en";

type AppProps = { api: DesktopApi };

export function App({ api }: AppProps) {
  const [view, setView] = useState<WorkspaceView>("chat");
  const [centerTab, setCenterTab] = useState<CenterTab>("editor");
  const [companionTab, setCompanionTab] = useState<CompanionTab>("conversation");
  const [workspace, setWorkspace] = useState<WorkspaceLoadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RequestPreviewResult | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(true);
  const [companionOpen, setCompanionOpen] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.loadWorkspace().then((result) => {
      if (active) {
        setWorkspace(result);
        setApiError(null);
      }
    }).catch((error: unknown) => {
      if (active) {
        setApiError(error instanceof Error ? error.message : en.app.workspaceErrorTitle);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [api]);

  useEffect(() => {
    const mobileBreakpoint = getComputedStyle(document.documentElement).getPropertyValue("--oq-bp-lg").trim();
    const query = window.matchMedia?.(`(max-width: ${mobileBreakpoint})`);
    if (!query) return;
    const updateLayout = () => {
      setIsMobile(query.matches);
      setNavigatorOpen(!query.matches);
      setCompanionOpen(!query.matches);
    };
    updateLayout();
    query.addEventListener("change", updateLayout);
    return () => query.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    function closeDrawers(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobile) {
        setNavigatorOpen(false);
        setCompanionOpen(false);
      }
    }
    window.addEventListener("keydown", closeDrawers);
    return () => window.removeEventListener("keydown", closeDrawers);
  }, [isMobile]);

  function navigate(nextView: WorkspaceView) {
    setView(nextView);
    if (nextView === "chat") setCenterTab("editor");
    if (nextView === "review") setCenterTab("diff");
    if (nextView === "context") setCompanionTab("context");
    if (isMobile) setNavigatorOpen(false);
  }

  async function previewRequest(text: string): Promise<RequestPreviewResult> {
    const result = await api.previewRequest(text);
    setPreview(result);
    return result;
  }

  const isFixture = workspace?.kind === "development-fixture";
  const offline = !loading && (apiError !== null || workspace?.kind === "unavailable");

  return (
    <div className={`app-shell${!navigatorOpen && !isMobile ? " navigator-collapsed" : ""}${!companionOpen && !isMobile ? " companion-collapsed" : ""}`}>
      <a className="skip-link" href="#workspace" onClick={() => document.getElementById("workspace")?.focus()}>
        {en.app.skipToWorkspace}
      </a>
      <Navigator
        activeView={view}
        collapsed={!navigatorOpen && !isMobile}
        hidden={isMobile && !navigatorOpen}
        isMobile={isMobile}
        onClose={() => setNavigatorOpen(false)}
        onNavigate={navigate}
      />
      <main className="main-column" id="workspace" tabIndex={-1}>
        <header className="topbar">
          <button
            aria-expanded={navigatorOpen}
            aria-controls="app-navigator"
            aria-label={en.app.toggleNavigator}
            className="icon-button"
            onClick={() => setNavigatorOpen((open) => !open)}
            type="button"
          >
            <Icon name="menu" />
          </button>
          <div className="workspace-breadcrumb">
            <span>{workspace?.kind === "development-fixture" ? workspace.projectName : en.app.noWorkspace}</span>
            <span aria-hidden="true">/</span>
            <strong>{en.screens[view]}</strong>
          </div>
          <span className={`connectivity-badge${offline ? " is-offline" : ""}`}>
            <span aria-hidden="true" className="status-dot" />
            {isFixture ? en.app.fixture : offline ? en.app.runtimeUnavailable : en.app.notConnected}
          </span>
          <button
            aria-expanded={companionOpen}
            aria-controls="conversation-companion"
            aria-label={en.app.toggleConversation}
            className="icon-button companion-toggle"
            onClick={() => setCompanionOpen((open) => !open)}
            type="button"
          >
            <Icon name="chat" />
          </button>
        </header>
        <WorkspaceCanvas
          centerTab={centerTab}
          error={apiError}
          loading={loading}
          onCenterTab={setCenterTab}
          view={view}
          workspace={workspace}
        />
        <BottomPanel />
        <RuntimeStatus isFixture={isFixture} offline={offline} />
      </main>
      <ConversationCompanion
        activeTab={companionTab}
        apiError={apiError}
        hidden={!companionOpen}
        loading={loading}
        mobile={isMobile}
        onClose={() => setCompanionOpen(false)}
        onPreview={previewRequest}
        onTabChange={setCompanionTab}
        preview={preview}
        workspace={workspace}
      />
    </div>
  );
}

function RuntimeStatus({ isFixture, offline }: { isFixture: boolean; offline: boolean }) {
  const values = [
    { label: en.app.connectivity, value: offline ? en.app.unavailable : en.app.notConnected },
    { label: en.app.conversationMode, value: en.app.notAvailable },
    { label: en.app.permissionMode, value: en.app.notAvailable },
    { label: en.app.model, value: en.app.notAvailable },
    { label: en.app.sandbox, value: en.app.notAvailable },
    { label: en.app.trust, value: en.app.unknown },
    { label: en.app.index, value: en.app.notReported },
  ];

  return (
    <footer aria-label={en.app.status} className="runtime-status">
      {isFixture && <span className="status-source">{en.app.fixture}</span>}
      {values.map(({ label, value }) => (
        <span className="status-item" key={label}><strong>{label}:</strong> {value}</span>
      ))}
    </footer>
  );
}
