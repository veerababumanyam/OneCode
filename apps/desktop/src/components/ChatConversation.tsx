import { chatEn } from "./chat-en";
import { Icon } from "./Icon";
import "./ChatConversation.css";

export function ChatConversation() {
  return (
    <section aria-label={chatEn.sampleLabel} className="chat-conversation">
      <div className="chat-sample-banner">
        <span className="chat-sample-dot" />
        <span>{chatEn.sampleLabel}</span>
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
            <section aria-labelledby="chat-files-title" className="chat-detail-card chat-files-card">
              <header className="chat-card-heading chat-files-heading">
                <div>
                  <h3 id="chat-files-title">{chatEn.filesTitle}</h3>
                  <span>{chatEn.filesNotice}</span>
                </div>
                <span className="chat-not-run">{chatEn.filesStatus}</span>
              </header>
              <ul className="chat-file-list">
                {chatEn.fileEntries.map((file) => (
                  <li key={file.path}>
                    <Icon name="file" />
                    <span className="chat-file-description"><strong>{file.path}</strong><small>{file.detail}</small></span>
                    <span className="chat-example-tag">EXAMPLE</span>
                  </li>
                ))}
              </ul>
              <p className="chat-diff-notice"><Icon name="lock" />{chatEn.diffNotice}</p>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}
