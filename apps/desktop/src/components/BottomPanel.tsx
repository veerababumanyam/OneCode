import { useState } from "react";
import { en } from "../i18n/en";
import { Icon } from "./Icon";
import { handleTabKeyDown } from "./WorkspaceCanvas";

const panels = [
  { id: "terminal", label: en.bottom.terminal, icon: "terminal" },
  { id: "problems", label: en.bottom.problems, icon: "problems" },
  { id: "tests", label: en.bottom.tests, icon: "tests" },
  { id: "processes", label: en.bottom.processes, icon: "processes" },
  { id: "output", label: en.bottom.output, icon: "output" },
] as const;

export function BottomPanel() {
  const [activePanel, setActivePanel] = useState<(typeof panels)[number]["id"]>("terminal");
  const selected = panels.find((panel) => panel.id === activePanel)!;

  return (
    <section aria-label={en.bottom.ariaLabel} className="bottom-panel">
      <div aria-label={en.bottom.tabsLabel} className="tab-list bottom-tabs" role="tablist">
        {panels.map((panel) => (
          <button
            aria-selected={activePanel === panel.id}
            aria-controls="bottom-panel-content"
            className="tab-button"
            id={`bottom-tab-${panel.id}`}
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            onKeyDown={handleTabKeyDown}
            role="tab"
            tabIndex={activePanel === panel.id ? 0 : -1}
            type="button"
          >
            <Icon name={panel.icon} />{panel.label}
          </button>
        ))}
      </div>
      <div aria-labelledby={`bottom-tab-${selected.id}`} className="bottom-panel-content" id="bottom-panel-content" role="tabpanel">
        <p>{en.bottom.unavailable(selected.label)}</p>
        <span className="sample-badge">{en.bottom.noProcess}</span>
      </div>
    </section>
  );
}
