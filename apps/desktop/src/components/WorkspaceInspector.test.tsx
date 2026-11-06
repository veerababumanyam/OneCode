import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { en } from "../i18n/en";
import { WorkspaceInspector } from "./WorkspaceInspector";

const baseProps = {
  hidden: false,
  mobile: false,
  preview: null,
  onTabChange: () => {},
  onClose: () => {},
};

describe("WorkspaceInspector", () => {
  it("labels the sample file list as illustrative and claims no changes", () => {
    render(<WorkspaceInspector {...baseProps} activeTab="files" />);

    expect(screen.getByRole("complementary", { name: "Workspace inspector" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Sample file tree" })).toBeTruthy();
    expect(screen.getByText("src/webhooks/client.ts")).toBeTruthy();
    expect(screen.getByText("Example paths only · not loaded from a repository")).toBeTruthy();
    expect(screen.getByText("Files are illustrative; none were opened or changed.")).toBeTruthy();
    expect(screen.queryByText("18 passed")).toBeNull();
  });

  it("keeps the changes tab explicit that no diff was applied", () => {
    render(<WorkspaceInspector {...baseProps} activeTab="changes" />);

    expect(screen.getByRole("region", { name: "Sample changes" })).toBeTruthy();
    expect(screen.getByText("No files changed")).toBeTruthy();
    expect(screen.getByText("There is no repository or diff data. This sample does not represent an applied change.")).toBeTruthy();
  });

  it("shows a local preview as a sample request that was never sent", () => {
    render(
      <WorkspaceInspector
        {...baseProps}
        activeTab="preview"
        preview={{ kind: "local-preview", text: "Explain the retry policy", notice: "Local preview only." }}
      />,
    );

    expect(screen.getByRole("region", { name: "Local request preview" })).toBeTruthy();
    expect(screen.getByText("SAMPLE REQUEST · NOT SENT")).toBeTruthy();
    expect(screen.getByText("Explain the retry policy")).toBeTruthy();
  });

  it("states that no preview exists when none was prepared", () => {
    render(<WorkspaceInspector {...baseProps} activeTab="preview" />);

    expect(screen.getByText("No preview prepared. No request or tool was sent.")).toBeTruthy();
  });

  it("folds the runtime panels into the inspector as tabs", () => {
    render(<WorkspaceInspector {...baseProps} activeTab="terminal" />);

    expect(screen.getByRole("tab", { name: en.bottom.terminal })).toBeTruthy();
    expect(screen.getByRole("tab", { name: en.bottom.output })).toBeTruthy();
    expect(screen.getByText(en.bottom.unavailable(en.bottom.terminal))).toBeTruthy();
    expect(screen.getByText(en.bottom.noProcess)).toBeTruthy();
  });
});
