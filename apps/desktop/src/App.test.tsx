import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { createDesktopApi } from "./api/runtime";
import type { DesktopApi } from "./api/types";
import { createDevelopmentFixtureAdapter } from "./dev/fixture-adapter";
import { en } from "./i18n/en";

describe("OneCode production shell", () => {
  it("uses the development fixture adapter under Vite dev mode", async () => {
    const api = await createDesktopApi();
    const result = await api.loadWorkspace();

    expect(result.kind).toBe("development-fixture");
  });

  it("keeps the navigator, center workspace, bottom panel, and companion visible", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);

    expect(await screen.findByRole("navigation", { name: "Navigator" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Editor workspace" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Bottom panel" })).toBeTruthy();
    expect(screen.getByRole("complementary", { name: "Conversation companion" })).toBeTruthy();
    expect(await screen.findAllByText("Development fixture")).toHaveLength(3);
  });

  it("navigates between chat, review, context, models, history, and settings", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    await screen.findByRole("heading", { name: "Editor" });

    for (const [label, heading] of [
      ["Review", "Diff review"],
      ["Context", "Context Inspector"],
      ["Models", "Model library"],
      ["History", "Task history"],
      ["Settings", "Settings"],
      ["Chat", "Editor"],
    ]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(await screen.findByRole("heading", { name: heading })).toBeTruthy();
    }
  });

  it("shows a local-only request preview without sending it", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    const composer = await screen.findByRole("textbox", { name: "Message OneCode" });

    fireEvent.change(composer, { target: { value: "Explain the retry policy" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview request" }));

    expect(await screen.findByText("Explain the retry policy")).toBeTruthy();
    expect(screen.getByText("Local preview only. Nothing was sent, no tools ran, and no files changed.")).toBeTruthy();
  });

  it("announces loading while the workspace API is pending", () => {
    const api: DesktopApi = {
      loadWorkspace: () => new Promise(() => {}),
      previewRequest: async () => ({ kind: "unavailable", message: en.app.runtimeMessage }),
    };
    render(<App api={api} />);

    expect(screen.getByText(en.app.loadingWorkspace)).toBeTruthy();
    expect(screen.getByText(en.companion.loading)).toBeTruthy();
  });

  it("keeps unavailable runtime data explicit instead of showing fixture evidence", async () => {
    const api: DesktopApi = {
      loadWorkspace: async () => ({ kind: "unavailable", message: en.app.runtimeMessage }),
      previewRequest: async () => ({ kind: "unavailable", message: en.app.runtimeMessage }),
    };
    render(<App api={api} />);

    expect(await screen.findAllByText(en.app.runtimeMessage)).toHaveLength(2);
    expect(await screen.findAllByText(en.app.runtimeUnavailable)).toHaveLength(3);
    expect(screen.queryByText(en.app.fixture)).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Evidence" }));
    expect(screen.getByText(en.companion.noEvidence)).toBeTruthy();
  });

  it("announces API failures without substituting fixture data", async () => {
    const api: DesktopApi = {
      loadWorkspace: async () => { throw new Error("Workspace request failed."); },
      previewRequest: async () => ({ kind: "unavailable", message: en.app.runtimeMessage }),
    };
    render(<App api={api} />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Workspace request failed.");
    expect(screen.queryByText(en.app.fixture)).toBeNull();
  });

  it("supports arrow-key navigation between center tabs", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    const editorTab = await screen.findByRole("tab", { name: "Editor" });

    fireEvent.keyDown(editorTab, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Diff" }).getAttribute("aria-selected")).toBe("true");
  });

  it("can collapse and reopen the conversation companion", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    const companion = await screen.findByRole("complementary", { name: "Conversation companion" });
    const toggle = screen.getByRole("button", { name: "Toggle conversation companion" });

    fireEvent.click(toggle);
    expect(companion.hasAttribute("hidden")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);
    expect(companion.hasAttribute("hidden")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("can close mobile drawers from inside the drawer", async () => {
    const matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });

    try {
      render(<App api={createDevelopmentFixtureAdapter()} />);
      fireEvent.click(screen.getByRole("button", { name: en.app.toggleNavigator }));
      const navigator = await screen.findByRole("complementary", { name: "Application navigator" });
      fireEvent.click(screen.getByRole("button", { name: en.app.closeNavigator }));
      expect(navigator.hasAttribute("hidden")).toBe(true);

      fireEvent.click(screen.getByRole("button", { name: en.app.toggleConversation }));
      const companion = await screen.findByRole("complementary", { name: "Conversation companion" });
      fireEvent.click(screen.getByRole("button", { name: en.app.closeConversation }));
      expect(companion.hasAttribute("hidden")).toBe(true);
    } finally {
      if (matchMediaDescriptor) {
        Object.defineProperty(window, "matchMedia", matchMediaDescriptor);
      } else {
        Reflect.deleteProperty(window, "matchMedia");
      }
    }
  });

  it("moves keyboard focus to the workspace from the skip link", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);

    fireEvent.click(await screen.findByRole("link", { name: en.app.skipToWorkspace }));

    expect(document.activeElement).toBe(document.getElementById("workspace"));
  });
});
