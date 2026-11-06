import type { WorkspaceLoadResult } from "../api/types";
import { Icon } from "./Icon";
import "./MissionControl.css";

type MissionControlProps = {
  workspace: WorkspaceLoadResult | null;
  loading: boolean;
  error: string | null;
};

const plan = [
  "Inspect the retry policy and existing coverage",
  "Describe a bounded retry approach",
  "Identify cases to review",
];

export function MissionControl({ workspace, loading, error }: MissionControlProps) {
  const identity = workspace?.kind === "development-fixture"
    ? workspace.projectName
    : "No repository connected";

  return (
    <section aria-labelledby="mission-control-title" className="mission-control">
      <header className="mission-header">
        <div>
          <span className="overline">SAMPLE DASHBOARD</span>
          <h1 id="mission-control-title">Mission Control</h1>
          <p>Workspace overview · sample data only</p>
        </div>
        <span className="sample-badge">UI sample</span>
      </header>

      <section aria-labelledby="workspace-identity-title" className="mission-identity">
        <div className="mission-identity-mark"><Icon name="folder" /></div>
        <div>
          <span className="overline">WORKSPACE IDENTITY · SAMPLE</span>
          <h2 id="workspace-identity-title">{identity}</h2>
          {error && !loading ? (
            <p role="alert">{error}</p>
          ) : (
            <p>{loading ? "Checking runtime status…" : "Repository is not connected · no files are available"}</p>
          )}
        </div>
        <span className="mission-status">{workspace?.kind === "development-fixture" ? "Mock" : "Not connected"}</span>
      </section>

      <div className="mission-grid">
        <section aria-labelledby="current-task-title" className="mission-card mission-task">
          <header className="mission-card-heading">
            <div>
              <span className="overline">CURRENT TASK · SAMPLE</span>
              <h2 id="current-task-title">Bounded webhook retries</h2>
            </div>
            <span className="mission-status">Example only</span>
          </header>
          <p className="mission-task-summary">Example task context. No request was sent and no implementation has started.</p>
          <div className="mission-plan">
            <h3>Implementation plan <span>Mock · not executed</span></h3>
            <ol>
              {plan.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <span>{step}</span>
                  <strong>{index === 0 ? "Not started" : "Queued"}</strong>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="task-status-title" className="mission-card">
          <header className="mission-card-heading">
            <div>
              <span className="overline">TASK STATUS · SAMPLE</span>
              <h2 id="task-status-title">No work has run</h2>
            </div>
            <Icon name="history" />
          </header>
          <ul className="mission-checks">
            <li><span>Task</span><strong>Example only</strong></li>
            <li><span>Files changed</span><strong>None</strong></li>
            <li><span>Checks</span><strong>Not run</strong></li>
            <li><span>Tools</span><strong>Not invoked</strong></li>
          </ul>
        </section>

        <section aria-labelledby="guardrails-title" className="mission-card mission-guardrails">
          <header className="mission-card-heading">
            <div>
              <span className="overline">GUARDRAILS · SAMPLE STATE</span>
              <h2 id="guardrails-title">Local-first by default</h2>
            </div>
            <Icon name="lock" />
          </header>
          <ul className="mission-checks">
            <li><span>Repository access</span><strong>Not connected</strong></li>
            <li><span>Request handling</span><strong>Local preview only</strong></li>
            <li><span>Model availability</span><strong>Not reported</strong></li>
            <li><span>Execution &amp; permissions</span><strong>Unavailable</strong></li>
          </ul>
        </section>
      </div>
    </section>
  );
}
