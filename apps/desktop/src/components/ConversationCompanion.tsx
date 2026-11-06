import { useState, type FormEvent } from "react";
import type { RequestPreviewResult, WorkspaceLoadResult } from "../api/types";
import { en } from "../i18n/en";
import { Icon } from "./Icon";
import { handleTabKeyDown } from "./WorkspaceCanvas";

export type CompanionTab = "conversation" | "context" | "evidence";

type ConversationCompanionProps = {
  workspace: WorkspaceLoadResult | null;
  loading: boolean;
  apiError: string | null;
  preview: RequestPreviewResult | null;
  onPreview: (text: string) => Promise<RequestPreviewResult>;
  activeTab: CompanionTab;
  onTabChange: (tab: CompanionTab) => void;
  hidden: boolean;
  mobile: boolean;
  onClose: () => void;
};

const companionTabs: { id: CompanionTab; label: string; icon: "chat" | "context" | "evidence" }[] = [
  { id: "conversation", label: en.companion.tabNames.conversation, icon: "chat" },
  { id: "context", label: en.companion.tabNames.context, icon: "context" },
  { id: "evidence", label: en.companion.tabNames.evidence, icon: "evidence" },
];

export function ConversationCompanion({
  workspace,
  loading,
  apiError,
  preview,
  onPreview,
  activeTab,
  onTabChange,
  hidden,
  mobile,
  onClose,
}: ConversationCompanionProps) {
  const [draft, setDraft] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setPreviewError(null);
    try {
      const result = await onPreview(text);
      if (result.kind === "unavailable") setPreviewError(result.message);
      else setDraft("");
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : en.companion.previewFailure);
    }
  }

  return (
    <aside
      aria-label={en.companion.ariaLabel}
      className={`companion${mobile ? " is-mobile" : ""}`}
      hidden={hidden}
      id="conversation-companion"
    >
      <header className="companion-header">
        <div>
          <span className="overline">{en.companion.activeSession}</span>
          <h2>{en.companion.title}</h2>
          <small>{workspace?.kind === "development-fixture" ? workspace.activeSession : en.companion.noActiveSession}</small>
        </div>
        {workspace?.kind === "development-fixture" && <span className="sample-badge">{en.app.uiSample}</span>}
        {mobile && (
          <button aria-label={en.app.closeConversation} className="icon-button companion-close" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        )}
      </header>
      <div aria-label={en.companion.tabsLabel} className="tab-list companion-tabs" role="tablist">
        {companionTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            aria-controls="companion-panel"
            className="tab-button"
            id={`companion-tab-${tab.id}`}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={handleTabKeyDown}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
          >
            <Icon name={tab.icon} />{tab.label}
          </button>
        ))}
      </div>
      <div aria-labelledby={`companion-tab-${activeTab}`} className="companion-content" id="companion-panel" role="tabpanel">
        {loading ? (
          <div aria-busy="true" className="companion-state"><span className="loading-indicator" />{en.companion.loading}</div>
        ) : apiError ? (
          <p className="state-message" role="alert">{apiError}</p>
        ) : activeTab === "context" ? (
          <div className="state-message">
            <h3>{en.companion.noContextTitle}</h3>
            <p>{en.companion.noContext}</p>
          </div>
        ) : activeTab === "evidence" ? (
          <div className="state-message">
            <h3>{en.companion.noEvidenceTitle}</h3>
            <p>{en.companion.noEvidence}</p>
          </div>
        ) : (
          <>
            <div className="conversation-empty">
              <span className="conversation-mark"><Icon name="brand" /></span>
              <h3>{workspace?.kind === "development-fixture" ? en.app.fixture : en.companion.noConversation}</h3>
              <p>{workspace?.kind === "development-fixture"
                ? workspace.notice
                : workspace?.kind === "unavailable"
                  ? workspace.message
                  : en.companion.noConversationData}</p>
            </div>
            {preview?.kind === "local-preview" && (
              <div className="request-preview" role="status">
                <span className="overline">{en.companion.localPreviewLabel}</span>
                <p>{preview.text}</p>
                <small>{preview.notice}</small>
              </div>
            )}
            {(previewError || preview?.kind === "unavailable") && (
              <p className="state-message" role="alert">{previewError ?? (preview?.kind === "unavailable" ? preview.message : "")}</p>
            )}
          </>
        )}
      </div>
      <form className="composer" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="companion-draft">{en.companion.messageLabel}</label>
        <textarea
          id="companion-draft"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={en.companion.messagePlaceholder}
          rows={3}
          value={draft}
        />
        <div className="composer-footer">
          <span className="status-chip" data-tip={en.app.model}>
            <Icon name="models" />
            <span className="visually-hidden">{en.app.model}: </span>
            <span className="status-chip-value">{en.app.notReported}</span>
          </span>
          <p>{en.companion.composerHint}</p>
          <button aria-label={en.companion.previewRequest} className="primary-button" disabled={!draft.trim()} type="submit">
            {en.companion.preview} <Icon name="arrow" />
          </button>
        </div>
      </form>
    </aside>
  );
}
