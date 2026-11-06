import { useEffect, useRef, useState, type FormEvent } from "react";
import type { RequestPreviewResult } from "../api/types";
import { en } from "../i18n/en";
import { chatEn } from "./chat-en";
import { Icon, type IconName } from "./Icon";
import "./ChatConversation.css";

type ChatConversationProps = {
  onPreview: (text: string) => Promise<RequestPreviewResult>;
  preview: RequestPreviewResult | null;
};

type MenuOption = { id: string; label: string; icon: IconName };

const flowOptions: MenuOption[] = [
  { id: "plan", label: en.composer.flowPlan, icon: "plan" },
  { id: "fix", label: en.composer.flowFix, icon: "fix" },
  { id: "build", label: en.composer.flowBuild, icon: "build" },
];

const permissionOptions: MenuOption[] = [
  { id: "full", label: en.composer.permissionFull, icon: "shield" },
  { id: "ask", label: en.composer.permissionAsk, icon: "lock" },
];

export function ChatConversation({ onPreview, preview }: ChatConversationProps) {
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [flow, setFlow] = useState("plan");
  const [permission, setPermission] = useState("ask");
  const [previewError, setPreviewError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || running) return;
    setPreviewError(null);
    setRunning(true);
    try {
      const result = await onPreview(text);
      if (result.kind === "unavailable") setPreviewError(result.message);
      else setDraft("");
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : en.companion.previewFailure);
    } finally {
      setRunning(false);
    }
  }

  const sendTip = running ? en.composer.stop : en.composer.send;

  return (
    <section aria-label={chatEn.sampleLabel} className="chat-conversation">
      <div className="chat-transcript">
        <p className="chat-session-label">{chatEn.dateLabel}<span />{chatEn.sampleLabel}</p>
        <article className="chat-message chat-message-user">
          <div aria-hidden="true" className="chat-avatar">U</div>
          <div className="chat-message-body">
            <p className="chat-author">{chatEn.userLabel}<span className="chat-example-tag">EXAMPLE</span></p>
            <h2 className="chat-task-title">{chatEn.taskTitle}</h2>
            <p>{chatEn.userMessage}</p>
          </div>
        </article>
        <article className="chat-message chat-message-assistant">
          <div aria-hidden="true" className="chat-avatar chat-avatar-brand"><Icon name="brand" /></div>
          <div className="chat-message-body">
            <p className="chat-author">{chatEn.assistantLabel}</p>
            <p>{chatEn.assistantMessage}</p>
            <section aria-labelledby="chat-plan-title" className="chat-detail-card">
              <header className="chat-card-heading">
                <h3 id="chat-plan-title">{chatEn.planTitle}</h3>
                <span>{chatEn.planStatus}</span>
              </header>
              <ol className="chat-plan-list">
                {chatEn.planSteps.map((step, index) => (
                  <li className={index === 1 ? "is-current" : ""} key={step}>
                    <span aria-hidden="true">{index + 1}</span>{step}
                  </li>
                ))}
              </ol>
            </section>
            <section aria-labelledby="chat-verification-title" className="chat-detail-card chat-verification-card">
              <header className="chat-card-heading">
                <h3 id="chat-verification-title"><Icon name="tests" />{chatEn.verificationTitle}</h3>
                <span className="chat-not-run">{chatEn.verificationStatus}</span>
              </header>
              <ul className="chat-check-list">
                {chatEn.verificationChecks.map((check) => (
                  <li key={check.name}><span>{check.name}</span><strong>{check.status}</strong></li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="chat-diff-title" className="chat-detail-card chat-diff-card">
              <header className="chat-card-heading">
                <h3 id="chat-diff-title">{chatEn.diffTitle}</h3>
                <span className="chat-not-run">{chatEn.diffStatus}</span>
              </header>
              <p className="chat-diff-notice"><Icon name="lock" />{chatEn.diffNotice}</p>
            </section>
          </div>
        </article>
        {preview?.kind === "local-preview" && (
          <div className="request-preview chat-request-preview" role="status">
            <span className="overline">{en.companion.localPreviewLabel} · SAMPLE</span>
            <p>{preview.text}</p>
            <small>{preview.notice}</small>
          </div>
        )}
        {(previewError || preview?.kind === "unavailable") && (
          <p className="state-message" role="alert">{previewError ?? (preview?.kind === "unavailable" ? preview.message : "")}</p>
        )}
      </div>
      <form className="composer chat-composer" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="chat-draft">{en.companion.messageLabel}</label>
        <textarea
          id="chat-draft"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={en.companion.messagePlaceholder}
          rows={3}
          value={draft}
        />
        <div className="composer-toolbar">
          <div className="composer-tools">
            <button aria-label={en.composer.attach} className="icon-button" data-tip={en.composer.attach} type="button">
              <Icon name="attach" />
            </button>
            <button aria-label={en.composer.voice} className="icon-button" data-tip={en.composer.voice} type="button">
              <Icon name="mic" />
            </button>
            <ComposerMenu
              icon={flowOptions.find((option) => option.id === flow)?.icon ?? "plan"}
              label={en.composer.flow}
              onSelect={setFlow}
              options={flowOptions}
              value={flow}
            />
            <ComposerMenu icon="models" label={en.composer.model} note={en.center.noModels} onSelect={() => {}} options={[]} value="" />
            <ComposerMenu
              icon="shield"
              label={en.composer.permission}
              onSelect={setPermission}
              options={permissionOptions}
              value={permission}
            />
          </div>
          <button
            aria-label={sendTip}
            className="composer-send"
            data-tip={sendTip}
            disabled={!running && !draft.trim()}
            type={running ? "button" : "submit"}
          >
            <Icon name={running ? "stop" : "send"} />
          </button>
        </div>
      </form>
    </section>
  );
}

function ComposerMenu({
  icon,
  label,
  note,
  onSelect,
  options,
  value,
}: {
  icon: IconName;
  label: string;
  note?: string;
  onSelect: (id: string) => void;
  options: MenuOption[];
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((option) => option.id === value);
  const tip = current ? `${label}: ${current.label}` : label;

  return (
    <div className="composer-menu" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={tip}
        className="icon-button"
        data-tip={tip}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        type="button"
      >
        <Icon name={icon} />
      </button>
      {open && (
        <div className="composer-menu-pop" role="menu">
          {options.length === 0 ? (
            <p className="composer-menu-note">{note}</p>
          ) : (
            options.map((option) => (
              <button
                className={`composer-menu-item${option.id === value ? " is-active" : ""}`}
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  setOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                <Icon name={option.icon} />
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
