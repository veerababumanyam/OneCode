import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { createDesktopApi } from "./api/runtime";
import type { DesktopApi } from "./api/types";
import { createDevelopmentFixtureAdapter } from "./dev/fixture-adapter";
import { en } from "./i18n/en";

// The shell opens on Mission Control. The editor surface, its tabs, the composer, and the
// inspector toggle exist only on a workspace view, so tests that need them open Chat first.
function openChatView() {
  fireEvent.click(screen.getByRole("button", { name: en.navigation.items.chat }));
}

describe("OneCode production shell", () => {
  it("uses the development fixture adapter under Vite dev mode", async () => {
    const api = await createDesktopApi();
    const result = await api.loadWorkspace();

    expect(result.kind).toBe("development-fixture");
  });

  it("keeps the navigator, mission control, bottom panel, and inspector in the shell", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);

    expect(await screen.findByRole("navigation", { name: en.navigation.ariaLabel })).toBeTruthy();
    expect(screen.getByRole("complementary", { name: en.navigation.applicationNavigator })).toBeTruthy();
    expect(screen.getByRole("region", { name: en.screens.home })).toBeTruthy();
    expect(screen.getByRole("region", { name: en.bottom.ariaLabel })).toBeTruthy();
    expect(screen.getAllByText(en.app.fixture)).toHaveLength(2);

    // Mission Control keeps the inspector out of the accessibility tree.
    expect(screen.queryByRole("complementary", { name: "Workspace inspector" })).toBeNull();

    openChatView();
    expect(await screen.findByRole("region", { name: en.center.workspaceLabel })).toBeTruthy();
    expect(screen.getByRole("complementary", { name: "Workspace inspector" })).toBeTruthy();
  });

  it("navigates between chat, review, context, models, history, and settings", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    await screen.findByRole("heading", { name: en.screens.home });

    for (const [label, heading] of [
      [en.navigation.items.chat, en.screens.chat],
      [en.navigation.items.review, en.screens.review],
      [en.navigation.items.context, en.screens.context],
      [en.navigation.items.models, en.screens.models],
      [en.navigation.items.history, en.screens.history],
      [en.navigation.items.settings, en.screens.settings],
      [en.navigation.items.missionControl, en.screens.home],
    ]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(await screen.findByRole("heading", { name: heading })).toBeTruthy();
    }
  });

  it("shows a local-only request preview without sending it", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    openChatView();
    const composer = await screen.findByRole("textbox", { name: en.companion.messageLabel });

    fireEvent.change(composer, { target: { value: "Explain the retry policy" } });
    fireEvent.click(screen.getByRole("button", { name: en.companion.previewRequest }));

    expect(await screen.findByText("Explain the retry policy")).toBeTruthy();
    expect(screen.getByText(en.companion.localPreviewNotice)).toBeTruthy();
  });

  it("announces loading while the workspace API is pending", () => {
    const api: DesktopApi = {
      loadWorkspace: () => new Promise(() => {}),
      previewRequest: async () => ({ kind: "unavailable", message: en.app.runtimeMessage }),
    };
    render(<App api={api} />);

    expect(screen.getByText("Checking runtime status…")).toBeTruthy();

    openChatView();
    expect(screen.getByText(en.app.loadingWorkspace)).toBeTruthy();
    expect(document.getElementById("center-workspace-panel")?.getAttribute("aria-busy")).toBe("true");
  });

  it("keeps unavailable runtime data explicit instead of showing fixture evidence", async () => {
    const api: DesktopApi = {
      loadWorkspace: async () => ({ kind: "unavailable", message: en.app.runtimeMessage }),
      previewRequest: async () => ({ kind: "unavailable", message: en.app.runtimeMessage }),
    };
    render(<App api={api} />);
    openChatView();

    expect(await screen.findByText(en.app.runtimeMessage)).toBeTruthy();
    expect(screen.getByRole("heading", { name: en.app.runtimeUnavailableTitle })).toBeTruthy();
    expect(screen.getAllByText(en.app.runtimeUnavailable).length).toBeGreaterThan(0);
    expect(screen.queryByText(en.app.fixture)).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Changes" }));
    expect(screen.getByText("No files changed")).toBeTruthy();
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
    openChatView();
    const editorTab = await screen.findByRole("tab", { name: en.center.editor });

    fireEvent.keyDown(editorTab, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: en.center.diff }).getAttribute("aria-selected")).toBe("true");
  });

  it("can collapse and reopen the workspace inspector", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    openChatView();
    const inspector = await screen.findByRole("complementary", { name: "Workspace inspector" });
    const toggle = screen.getByRole("button", { name: en.app.toggleConversation });

    fireEvent.click(toggle);
    expect(inspector.hasAttribute("hidden")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);
    expect(inspector.hasAttribute("hidden")).toBe(false);
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
      const navigator = await screen.findByRole("complementary", { name: en.navigation.applicationNavigator });
      fireEvent.click(screen.getByRole("button", { name: en.app.closeNavigator }));
      expect(navigator.hasAttribute("hidden")).toBe(true);

      // The inspector drawer exists only on a workspace view, so open Chat from the navigator.
      fireEvent.click(screen.getByRole("button", { name: en.app.toggleNavigator }));
      fireEvent.click(screen.getByRole("button", { name: en.navigation.items.chat }));
      const inspector = await screen.findByRole("complementary", { name: "Workspace inspector" });
      fireEvent.click(screen.getByRole("button", { name: en.app.closeConversation }));
      expect(inspector.hasAttribute("hidden")).toBe(true);
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
