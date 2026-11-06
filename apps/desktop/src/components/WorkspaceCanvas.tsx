import type { KeyboardEvent } from "react";
import type { RequestPreviewResult, WorkspaceView, WorkspaceLoadResult } from "../api/types";
import { en } from "../i18n/en";
import { ChatConversation } from "./ChatConversation";
import { Icon } from "./Icon";

export type CenterTab = "editor" | "diff" | "browser";

type WorkspaceCanvasProps = {
  view: WorkspaceView;
  centerTab: CenterTab;
  workspace: WorkspaceLoadResult | null;
  loading: boolean;
  error: string | null;
  preview: RequestPreviewResult | null;
  onPreview: (text: string) => Promise<RequestPreviewResult>;
};

function EmptySurface({ title, children }: { title: string; children: string }) {
  return (
    <div className="empty-surface" role="status">
      <span className="empty-surface-icon"><Icon name="folder" /></span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

export function WorkspaceCanvas({ view, centerTab, workspace, loading, error, preview, onPreview }: WorkspaceCanvasProps) {
  const title = en.screens[view];
  const usesEditorTabs = view === "chat";
  const selectedTab = view === "review" ? "diff" : centerTab;
  let content: string = en.center.noRepository;
  let emptyTitle: string = en.app.noWorkspaceTitle;

  if (loading) {
    content = en.app.loadingWorkspace;
    emptyTitle = en.center.loadingTitle;
  } else if (error) {
    content = error;
    emptyTitle = en.app.workspaceErrorTitle;
  } else if (workspace?.kind === "unavailable") {
    content = workspace.message;
    emptyTitle = en.app.runtimeUnavailableTitle;
  } else if (workspace?.kind === "development-fixture") {
    content = workspace.notice;
  }

  if (view === "review") {
    emptyTitle = en.center.noDiffTitle;
    content = en.center.noDiff;
  } else if (view === "context") {
    emptyTitle = en.center.noContextTitle;
    content = en.center.noContext;
  } else if (view === "models") {
    emptyTitle = en.center.noModelsTitle;
    content = en.center.noModels;
  } else if (view === "history") {
    emptyTitle = en.center.noHistoryTitle;
    content = en.center.noHistory;
  } else if (view === "settings") {
    emptyTitle = en.center.noSettingsTitle;
    content = en.center.noSettings;
  } else if (view !== "chat") {
    emptyTitle = en.center.unavailable(title);
    content = en.center.unavailableSurface;
  } else if (!loading && !error && workspace?.kind === "development-fixture") {
    emptyTitle = selectedTab === "editor" ? en.center.noFilesTitle : en.center.emptySurfaceTitle;
    content = en.center.fixtureSurface;
  }

  return (
    <section aria-label={en.center.workspaceLabel} className="workspace-surface">
      <div aria-busy={loading} aria-labelledby={usesEditorTabs ? `center-tab-${selectedTab}` : undefined} className={`surface-content${view === "chat" && selectedTab === "editor" ? " surface-content-chat" : ""}`} id="center-workspace-panel" role="tabpanel">
        {loading ? (
          <div aria-label={en.app.loadingWorkspaceLabel} className="loading-state"><span className="loading-indicator" />{content}</div>
        ) : view === "chat" && selectedTab === "editor" && workspace?.kind === "development-fixture" ? (
          <ChatConversation onPreview={onPreview} preview={preview} />
        ) : view === "chat" && selectedTab === "diff" && workspace?.kind === "development-fixture" ? (
          <IllustrativeDiff />
        ) : view === "chat" && selectedTab === "browser" && workspace?.kind === "development-fixture" ? (
          <IllustrativeBrowser />
        ) : (
          <EmptySurface title={emptyTitle}>{content}</EmptySurface>
        )}
      </div>
    </section>
  );
}

function IllustrativeDiff() {
  return (
    <div className="empty-surface" role="status">
      <span className="empty-surface-icon"><Icon name="review" /></span>
      <h2>Diff preview · sample only</h2>
      <p>No repository is connected and no files have changed. No diff was generated or applied.</p>
    </div>
  );
}

function IllustrativeBrowser() {
  return (
    <div className="empty-surface" role="status">
      <span className="empty-surface-icon"><Icon name="external" /></span>
      <h2>Browser preview · sample only</h2>
      <p>The browser surface is retained for the workspace. No page was opened and no navigation was requested.</p>
    </div>
  );
}

export function handleTabKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabsInList = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
  const currentIndex = tabsInList.indexOf(event.currentTarget);
  const nextIndex = event.key === "Home"
    ? 0
    : event.key === "End"
      ? tabsInList.length - 1
      : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabsInList.length) % tabsInList.length;
  event.preventDefault();
  tabsInList[nextIndex]?.focus();
  tabsInList[nextIndex]?.click();
}
