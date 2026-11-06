import type { RequestPreviewResult } from "../api/types";
import { en } from "../i18n/en";
import { chatEn } from "./chat-en";
import { Icon, type IconName } from "./Icon";
import { handleTabKeyDown } from "./WorkspaceCanvas";

export type InspectorTab =
  | "files"
  | "changes"
  | "preview"
  | "terminal"
  | "problems"
  | "tests"
  | "processes"
  | "output";

type WorkspaceInspectorProps = {
  activeTab: InspectorTab;
  hidden: boolean;
  mobile: boolean;
  preview: RequestPreviewResult | null;
  onTabChange: (tab: InspectorTab) => void;
  onClose: () => void;
};

type InspectorTabDef = { id: InspectorTab; label: string; icon: IconName };

const workspaceTabs: InspectorTabDef[] = [
  { id: "files", label: en.inspector.files, icon: "folder" },
  { id: "changes", label: en.inspector.changes, icon: "review" },
  { id: "preview", label: en.inspector.preview, icon: "external" },
];

const runtimeTabs: InspectorTabDef[] = [
  { id: "terminal", label: en.bottom.terminal, icon: "terminal" },
  { id: "problems", label: en.bottom.problems, icon: "problems" },
  { id: "tests", label: en.bottom.tests, icon: "tests" },
  { id: "processes", label: en.bottom.processes, icon: "processes" },
  { id: "output", label: en.bottom.output, icon: "output" },
];

const allTabs: InspectorTabDef[] = [...workspaceTabs, ...runtimeTabs];

export function WorkspaceInspector({ activeTab, hidden, mobile, preview, onTabChange, onClose }: WorkspaceInspectorProps) {
  const activeLabel = allTabs.find((tab) => tab.id === activeTab)?.label ?? en.inspector.files;

  return (
    <aside aria-label={en.inspector.ariaLabel} className={`workspace-inspector${mobile ? " is-mobile" : ""}`} hidden={hidden} id="workspace-inspector">
      <header className="inspector-header">
        <span className="inspector-mark"><Icon name="folder" /></span>
        <div className="inspector-title">
          <h2>{en.inspector.title}</h2>
          <small>{en.inspector.noRepository}</small>
        </div>
        <span className="sample-badge">{en.inspector.sampleBadge}</span>
        {mobile && (
          <button aria-label={en.app.closeConversation} className="icon-button inspector-close" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        )}
      </header>
      <div aria-label={en.inspector.tabsLabel} className="tab-list inspector-tabs" role="tablist">
        {workspaceTabs.map((tab) => (
          <InspectorTabButton active={activeTab === tab.id} key={tab.id} onTabChange={onTabChange} tab={tab} />
        ))}
        <span aria-hidden="true" className="tab-separator" />
        {runtimeTabs.map((tab) => (
          <InspectorTabButton active={activeTab === tab.id} key={tab.id} onTabChange={onTabChange} tab={tab} />
        ))}
      </div>
      <div aria-labelledby={`inspector-tab-${activeTab}`} className="inspector-content" id="workspace-inspector-panel" role="tabpanel">
        {activeTab === "files" ? (
          <SampleFiles />
        ) : activeTab === "changes" ? (
          <SampleChanges />
        ) : activeTab === "preview" ? (
          <RequestPreview preview={preview} />
        ) : (
          <RuntimeOutput label={activeLabel} />
        )}
      </div>
    </aside>
  );
}

function InspectorTabButton({
  active,
  onTabChange,
  tab,
}: {
  active: boolean;
  onTabChange: (tab: InspectorTab) => void;
  tab: InspectorTabDef;
}) {
  return (
    <button
      aria-controls="workspace-inspector-panel"
      aria-selected={active}
      className="tab-button tab-button--icon"
      data-tip={tab.label}
      id={`inspector-tab-${tab.id}`}
      onClick={() => onTabChange(tab.id)}
      onKeyDown={handleTabKeyDown}
      role="tab"
      tabIndex={active ? 0 : -1}
      type="button"
    >
      <Icon name={tab.icon} />
      <span className="visually-hidden">{tab.label}</span>
    </button>
  );
}

function SampleFiles() {
  return (
    <section aria-label={en.inspector.regionFiles} className="inspector-section">
      <p className="inspector-note">{en.inspector.filesNote}</p>
      <ul className="sample-file-tree">
        {chatEn.fileEntries.map((file) => (
          <li key={file.path}>
            <Icon name="file" />
            <span><strong>{file.path}</strong><small>{file.detail}</small></span>
            <span className="chat-example-tag">{en.inspector.sampleTag}</span>
          </li>
        ))}
      </ul>
      <p className="inspector-note">{en.inspector.filesFootnote}</p>
    </section>
  );
}

function SampleChanges() {
  return (
    <section aria-label={en.inspector.regionChanges} className="inspector-section">
      <span className="inspector-status">{en.inspector.noChanges}</span>
      <p className="inspector-note">{en.inspector.noChangesNote}</p>
    </section>
  );
}

function RequestPreview({ preview }: { preview: RequestPreviewResult | null }) {
  return (
    <section aria-label={en.inspector.regionPreview} className="inspector-section">
      <span className="inspector-status">{en.inspector.previewStatus}</span>
      {preview?.kind === "local-preview" ? (
        <div className="request-preview" role="status">
          <span className="overline">{en.inspector.previewOverline}</span>
          <p>{preview.text}</p>
          <small>{preview.notice}</small>
        </div>
      ) : (
        <p className="inspector-note">{preview?.kind === "unavailable" ? preview.message : en.inspector.previewEmpty}</p>
      )}
    </section>
  );
}

function RuntimeOutput({ label }: { label: string }) {
  return (
    <section aria-label={label} className="inspector-section">
      <div className="inspector-output" role="status">
        <p>{en.bottom.unavailable(label)}</p>
        <span className="sample-badge">{en.bottom.noProcess}</span>
      </div>
    </section>
  );
}
