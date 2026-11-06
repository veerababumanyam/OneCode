import { useEffect, useState } from "react";
import type { DesktopApi, RequestPreviewResult, WorkspaceLoadResult, WorkspaceView } from "./api/types";
import { CommandPalette } from "./components/CommandPalette";
import { Icon, type IconName } from "./components/Icon";
import { MissionControl } from "./components/MissionControl";
import { Navigator } from "./components/Navigator";
import { WorkspaceInspector, type InspectorTab } from "./components/WorkspaceInspector";
import { WorkspaceCanvas, handleTabKeyDown, type CenterTab } from "./components/WorkspaceCanvas";
import { en } from "./i18n/en";

type AppProps = { api: DesktopApi };

const centerTabs: { id: CenterTab; label: string; icon: IconName }[] = [
  { id: "editor", label: en.center.editor, icon: "file" },
  { id: "diff", label: en.center.diff, icon: "review" },
  { id: "browser", label: en.center.browser, icon: "external" },
];

function initialViewFromLocation(): WorkspaceView {
  const requested = new URLSearchParams(window.location.search).get("view");
  return requested !== null && requested in en.screens ? (requested as WorkspaceView) : "home";
}

function initialPaletteOpen(): boolean {
  return new URLSearchParams(window.location.search).get("palette") === "1";
}

export function App({ api }: AppProps) {
  const [view, setView] = useState<WorkspaceView>(initialViewFromLocation);
  const [centerTab, setCenterTab] = useState<CenterTab>("editor");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("files");
  const [workspace, setWorkspace] = useState<WorkspaceLoadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RequestPreviewResult | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(initialPaletteOpen);

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
      setInspectorOpen(!query.matches);
    };
    updateLayout();
    query.addEventListener("change", updateLayout);
    return () => query.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    function closeDrawers(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobile) {
        setNavigatorOpen(false);
        setInspectorOpen(false);
      }
    }
    window.addEventListener("keydown", closeDrawers);
    return () => window.removeEventListener("keydown", closeDrawers);
  }, [isMobile]);

  useEffect(() => {
    function togglePalette(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", togglePalette);
    return () => window.removeEventListener("keydown", togglePalette);
  }, []);

  function navigate(nextView: WorkspaceView) {
    setView(nextView);
    if (nextView === "chat") setCenterTab("editor");
    if (nextView === "review") setCenterTab("diff");
    if (nextView === "home") setInspectorOpen(false);
    else setInspectorOpen(true);
    if (isMobile) setNavigatorOpen(false);
  }

  function startTask() {
    navigate("chat");
    requestAnimationFrame(() => {
      document.querySelector<HTMLTextAreaElement>(".composer textarea")?.focus();
    });
  }

  async function previewRequest(text: string): Promise<RequestPreviewResult> {
    const result = await api.previewRequest(text);
    setPreview(result);
    return result;
  }

  const isFixture = workspace?.kind === "development-fixture";
  const offline = !loading && (apiError !== null || workspace?.kind === "unavailable");
  const connectivityLabel = isFixture ? en.app.fixture : offline ? en.app.runtimeUnavailable : en.app.notConnected;

  return (
    <div className={`app-shell${!navigatorOpen && !isMobile ? " navigator-collapsed" : ""}${(!inspectorOpen || view === "home") && !isMobile ? " companion-collapsed" : ""}`}>
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
            {view !== "home" && (
              <>
                <span aria-hidden="true">/</span>
                <h1 className="breadcrumb-view">{en.screens[view]}</h1>
              </>
            )}
          </div>
          {view === "chat" && (
            <div aria-label={en.center.tabsLabel} className="tab-list topbar-tabs" role="tablist">
              {centerTabs.map((tab) => (
                <button
                  aria-controls="center-workspace-panel"
                  aria-selected={centerTab === tab.id}
                  className="tab-button tab-button--icon"
                  data-tip={tab.label}
                  id={`center-tab-${tab.id}`}
                  key={tab.id}
                  onClick={() => setCenterTab(tab.id)}
                  onKeyDown={handleTabKeyDown}
                  role="tab"
                  tabIndex={centerTab === tab.id ? 0 : -1}
                  type="button"
                >
                  <Icon name={tab.icon} />
                  <span className="visually-hidden">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            aria-label={en.palette.title}
            className="icon-button"
            data-tip={en.palette.title}
            onClick={() => setPaletteOpen(true)}
            type="button"
          >
            <Icon name="search" />
          </button>
          <span className={`status-chip connectivity-chip${offline ? " is-offline" : ""}`} data-tip={connectivityLabel}>
            <Icon name="signal" />
            <span className="visually-hidden">{connectivityLabel}</span>
          </span>
          <button
            aria-expanded={inspectorOpen && view !== "home"}
            aria-controls="workspace-inspector"
            aria-label={en.app.toggleConversation}
            className="icon-button inspector-toggle"
            hidden={view === "home"}
            onClick={() => setInspectorOpen((open) => !open)}
            type="button"
          >
            <Icon name="folder" />
          </button>
        </header>
        {view === "home" ? (
          <MissionControl error={apiError} loading={loading} onStart={startTask} workspace={workspace} />
        ) : (
          <WorkspaceCanvas
            centerTab={centerTab}
            error={apiError}
            loading={loading}
            onPreview={previewRequest}
            preview={preview}
            view={view}
            workspace={workspace}
          />
        )}
        <RuntimeStatus isFixture={isFixture} offline={offline} />
      </main>
      <WorkspaceInspector
        activeTab={inspectorTab}
        hidden={!inspectorOpen || view === "home"}
        mobile={isMobile}
        onClose={() => setInspectorOpen(false)}
        onTabChange={setInspectorTab}
        preview={preview}
      />
      <CommandPalette
        onClose={() => setPaletteOpen(false)}
        onNavigate={navigate}
        open={paletteOpen}
      />
    </div>
  );
}

function RuntimeStatus({ isFixture, offline }: { isFixture: boolean; offline: boolean }) {
  const chips: { icon: IconName; label: string; value: string }[] = [
    { icon: "signal", label: en.app.connectivity, value: offline ? en.app.unavailable : en.app.notConnected },
    { icon: "chat", label: en.app.conversationMode, value: en.app.notAvailable },
    { icon: "shield", label: en.app.permissionMode, value: en.app.notAvailable },
    { icon: "models", label: en.app.model, value: en.app.notAvailable },
    { icon: "lock", label: en.app.sandbox, value: en.app.notAvailable },
    { icon: "review", label: en.app.trust, value: en.app.unknown },
    { icon: "search", label: en.app.index, value: en.app.notReported },
  ];

  return (
    <footer aria-label={en.app.status} className="runtime-status">
      {isFixture && (
        <span className="status-chip status-chip--fixture" data-tip={en.app.fixture}>
          <Icon name="brand" />
          <span className="visually-hidden">{en.app.fixture}</span>
        </span>
      )}
      {chips.map(({ icon, label, value }) => (
        <span className="status-chip" data-tip={`${label}: ${value}`} key={label}>
          <Icon name={icon} />
          <span className="visually-hidden">{label}: {value}</span>
        </span>
      ))}
    </footer>
  );
}
