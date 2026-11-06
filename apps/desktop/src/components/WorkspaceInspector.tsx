import type { RequestPreviewResult } from "../api/types";
import { en } from "../i18n/en";
import { chatEn } from "./chat-en";
import { Icon } from "./Icon";
import { handleTabKeyDown } from "./WorkspaceCanvas";

export type InspectorTab = "files" | "changes" | "preview";

type WorkspaceInspectorProps = {
  activeTab: InspectorTab;
  hidden: boolean;
  mobile: boolean;
  preview: RequestPreviewResult | null;
  onTabChange: (tab: InspectorTab) => void;
  onClose: () => void;
};

const tabs: { id: InspectorTab; label: string; icon: "folder" | "review" | "external" }[] = [
  { id: "files", label: "Files", icon: "folder" },
  { id: "changes", label: "Changes", icon: "review" },
  { id: "preview", label: "Preview", icon: "external" },
];

export function WorkspaceInspector({ activeTab, hidden, mobile, preview, onTabChange, onClose }: WorkspaceInspectorProps) {
  return (
    <aside aria-label="Workspace inspector" className={`workspace-inspector${mobile ? " is-mobile" : ""}`} hidden={hidden} id="workspace-inspector">
      <header className="inspector-header">
        <div>
          <span className="overline">SAMPLE SESSION</span>
          <h2>Workspace</h2>
          <small>No repository connected</small>
        </div>
        <span className="sample-badge">UI sample</span>
        {mobile && <button aria-label={en.app.closeConversation} className="icon-button inspector-close" onClick={onClose} type="button"><Icon name="close" /></button>}
      </header>
      <div aria-label="Workspace details" className="tab-list inspector-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            aria-controls="workspace-inspector-panel"
            className="tab-button"
            id={`inspector-tab-${tab.id}`}
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
      <div aria-labelledby={`inspector-tab-${activeTab}`} className="inspector-content" id="workspace-inspector-panel" role="tabpanel">
        {activeTab === "files" ? <SampleFiles /> : activeTab === "changes" ? <SampleChanges /> : <RequestPreview preview={preview} />}
      </div>
    </aside>
  );
}

function SampleFiles() {
  return (
    <section aria-label="Sample file tree" className="inspector-section">
      <p className="inspector-note">Example paths only · not loaded from a repository</p>
      <ul className="sample-file-tree">
        {chatEn.fileEntries.map((file) => (
          <li key={file.path}>
            <Icon name="file" />
            <span><strong>{file.path}</strong><small>{file.detail}</small></span>
            <span className="chat-example-tag">SAMPLE</span>
          </li>
        ))}
      </ul>
      <p className="inspector-note">Files are illustrative; none were opened or changed.</p>
    </section>
  );
}

function SampleChanges() {
  return (
    <section aria-label="Sample changes" className="inspector-section">
      <span className="inspector-status">No files changed</span>
      <p className="inspector-note">There is no repository or diff data. This sample does not represent an applied change.</p>
    </section>
  );
}

function RequestPreview({ preview }: { preview: RequestPreviewResult | null }) {
  return (
    <section aria-label="Local request preview" className="inspector-section">
      <span className="inspector-status">Local preview only</span>
      {preview?.kind === "local-preview" ? (
        <div className="request-preview" role="status">
          <span className="overline">SAMPLE REQUEST · NOT SENT</span>
          <p>{preview.text}</p>
          <small>{preview.notice}</small>
        </div>
      ) : (
        <p className="inspector-note">{preview?.kind === "unavailable" ? preview.message : "No preview prepared. No request or tool was sent."}</p>
      )}
    </section>
  );
}
