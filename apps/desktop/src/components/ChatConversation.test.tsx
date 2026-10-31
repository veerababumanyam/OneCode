import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatConversation } from "./ChatConversation";

describe("ChatConversation", () => {
  it("shows a labeled illustrative request, plan, checks, and file summary without success claims", () => {
    render(<ChatConversation />);

    expect(screen.getByRole("heading", { name: "Bounded webhook retries" })).toBeTruthy();
    expect(screen.getByText("Illustrative task conversation")).toBeTruthy();
    expect(screen.getByText("Plan example · not executed")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Verification" })).toBeTruthy();
    expect(screen.getAllByText("Not run").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Illustrative file review" })).toBeTruthy();
    expect(screen.getByText("No files changed")).toBeTruthy();
    expect(screen.getByText("Example file list only · no diff was loaded or applied")).toBeTruthy();
    expect(screen.queryByText("18 passed")).toBeNull();
  });
});
