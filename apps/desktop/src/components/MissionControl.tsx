import type { WorkspaceLoadResult } from "../api/types";
import { en } from "../i18n/en";
import { Icon, type IconName } from "./Icon";
import "./MissionControl.css";

type MissionControlProps = {
  workspace: WorkspaceLoadResult | null;
  loading: boolean;
  error: string | null;
  onStart: () => void;
};

export function MissionControl({ workspace, loading, error, onStart }: MissionControlProps) {
  const identity = workspace?.kind === "development-fixture"
    ? workspace.projectName
    : en.mission.noRepository;

  const tiles: { icon: IconName; label: string; value: string }[] = [
    { icon: "folder", label: en.app.workspace, value: identity },
    { icon: "history", label: en.mission.labelWork, value: en.mission.noWork },
    { icon: "lock", label: en.mission.labelGuardrails, value: en.mission.localOnly },
    { icon: "models", label: en.app.model, value: en.app.notReported },
  ];

  return (
    <section aria-labelledby="mission-control-title" className="mission-control">
      <header className="mission-header">
        <h1 id="mission-control-title">{en.screens.home}</h1>
        <span className="sample-badge">{en.app.uiSample}</span>
      </header>

      <div className="mission-hero">
        {error && !loading ? (
          <p role="alert">{error}</p>
        ) : (
          <p>{loading ? "Checking runtime status…" : en.mission.hero}</p>
        )}
        {!loading && !error && (
          <button className="mission-start" onClick={onStart} type="button">
            <Icon name="chat" />
            <span>{en.mission.begin}</span>
            <Icon name="arrow" />
          </button>
        )}
      </div>

      <ul className="mission-tiles">
        {tiles.map(({ icon, label, value }) => (
          <li className="mission-tile" data-tip={label} key={label}>
            <Icon name={icon} />
            <span className="visually-hidden">{label}: </span>
            <span className="mission-tile-value">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
