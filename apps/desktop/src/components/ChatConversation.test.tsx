import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RequestPreviewResult } from "../api/types";
import { ChatConversation } from "./ChatConversation";
import { chatEn } from "./chat-en";

const unavailable: RequestPreviewResult = { kind: "unavailable", message: "Preview unavailable." };

async function previewRequest(): Promise<RequestPreviewResult> {
  return unavailable;
}

describe("ChatConversation", () => {
  it("shows a labeled illustrative request, plan, checks, and diff summary without success claims", () => {
    render(<ChatConversation onPreview={previewRequest} preview={null} />);

    expect(screen.getByRole("region", { name: chatEn.sampleLabel })).toBeTruthy();
    expect(screen.getByRole("heading", { name: chatEn.taskTitle })).toBeTruthy();
    expect(screen.getByText(chatEn.planStatus)).toBeTruthy();
    expect(screen.getByRole("heading", { name: chatEn.verificationTitle })).toBeTruthy();
    expect(screen.getAllByText(chatEn.verificationStatus).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: chatEn.diffTitle })).toBeTruthy();
    expect(screen.getByText(chatEn.diffNotice)).toBeTruthy();
    expect(screen.queryByText("18 passed")).toBeNull();
  });

  it("reports an unavailable preview as an alert rather than a sent request", () => {
    render(<ChatConversation onPreview={previewRequest} preview={unavailable} />);

    expect(screen.getByRole("alert").textContent).toBe(unavailable.message);
  });

  it("renders a local preview as a sample that was never sent", () => {
    render(
      <ChatConversation
        onPreview={previewRequest}
        preview={{ kind: "local-preview", text: "Explain the retry policy", notice: "Local preview only." }}
      />,
    );

    expect(screen.getByText("LOCAL REQUEST PREVIEW · SAMPLE")).toBeTruthy();
    expect(screen.getByText("Explain the retry policy")).toBeTruthy();
    expect(screen.getByText("Local preview only.")).toBeTruthy();
  });
});
