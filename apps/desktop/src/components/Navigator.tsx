import type { WorkspaceView } from "../api/types";
import { en } from "../i18n/en";
import { Icon, type IconName } from "./Icon";

type NavigatorProps = {
  activeView: WorkspaceView;
  collapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
  onNavigate: (view: WorkspaceView) => void;
  hidden: boolean;
};

export const navGroups: { label: string; items: { view: WorkspaceView; label: string; icon: IconName }[] }[] = [
  {
    label: en.navigation.groups.workspace,
    items: [
      { view: "home", label: en.navigation.items.missionControl, icon: "brand" },
      { view: "chat", label: en.navigation.items.chat, icon: "chat" },
    ],
  },
  {
    label: en.navigation.groups.navigate,
    items: [
      { view: "review", label: en.navigation.items.review, icon: "review" },
      { view: "context", label: en.navigation.items.context, icon: "context" },
      { view: "explorer", label: en.navigation.items.explorer, icon: "explorer" },
      { view: "search", label: en.navigation.items.search, icon: "search" },
      { view: "source-control", label: en.navigation.items.sourceControl, icon: "source" },
      { view: "sessions", label: en.navigation.items.sessions, icon: "sessions" },
      { view: "knowledge-map", label: en.navigation.items.knowledgeMap, icon: "map" },
    ],
  },
  {
    label: en.navigation.groups.manage,
    items: [
      { view: "models", label: en.navigation.items.models, icon: "models" },
      { view: "history", label: en.navigation.items.history, icon: "history" },
      { view: "settings", label: en.navigation.items.settings, icon: "settings" },
    ],
  },
];

export function Navigator({ activeView, collapsed, isMobile, onClose, onNavigate, hidden }: NavigatorProps) {
  return (
    <aside
      aria-label={en.navigation.applicationNavigator}
      className={`navigator${collapsed ? " is-collapsed" : ""}${isMobile ? " is-mobile" : ""}`}
      hidden={hidden}
      id="app-navigator"
    >
      <header className="navigator-header">
        <a aria-label={`${en.app.title} home`} className="brand" href="#workspace" onClick={(event) => {
          event.preventDefault();
          onNavigate("home");
        }}>
          <span className="brand-mark"><Icon name="brand" /></span>
          <span className="brand-name"><strong>{en.app.title}</strong><small>{en.app.subtitle}</small></span>
        </a>
        {isMobile && (
          <button aria-label={en.app.closeNavigator} className="icon-button navigator-close" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        )}
      </header>
      <nav aria-label={en.navigation.ariaLabel} className="navigator-links">
        {navGroups.map((group) => (
          <section aria-label={group.label} className="nav-group" key={group.label}>
            <h2 className="nav-group-title">{group.label}</h2>
            {group.items.map((item) => (
              <button
                aria-current={activeView === item.view ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className="nav-item"
                data-tip={collapsed ? item.label : undefined}
                key={item.view}
                onClick={() => onNavigate(item.view)}
                type="button"
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </section>
        ))}
      </nav>
    </aside>
  );
}
