import { useState, type FormEvent } from "react";
import type { RequestPreviewResult } from "../api/types";
import { en } from "../i18n/en";
import { chatEn } from "./chat-en";
import { Icon } from "./Icon";
import "./ChatConversation.css";

type ChatConversationProps = {
  onPreview: (text: string) => Promise<RequestPreviewResult>;
  preview: RequestPreviewResult | null;
};

export function ChatConversation({ onPreview, preview }: ChatConversationProps) {
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
    <section aria-label={chatEn.sampleLabel} className="chat-conversation">
      <div className="chat-sample-banner">
        <span className="chat-sample-dot" aria-hidden="true" />
        <span>{chatEn.sampleLabel} · nothing here is live</span>
      </div>
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
        <label className="visually-hidden" htmlFor="conversation-draft">{en.companion.messageLabel}</label>
        <textarea
          id="conversation-draft"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={en.companion.messagePlaceholder}
          rows={3}
          value={draft}
        />
        <div className="composer-footer">
          <p>{en.companion.composerHint}</p>
          <button aria-label={en.companion.previewRequest} className="primary-button" disabled={!draft.trim()} type="submit">
            {en.companion.preview} <Icon name="arrow" />
          </button>
        </div>
      </form>
    </section>
  );
}
